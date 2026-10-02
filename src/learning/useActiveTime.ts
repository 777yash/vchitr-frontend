import { useEffect, useState, type RefObject } from 'react';
import axios from 'axios';
import { api, extractApiError, TOKEN_KEY } from '../api/client';

/** Sparse, bounded telemetry. Hidden, unfocused and idle windows never count. */
export function useActiveTime<T>(root: RefObject<HTMLElement | null>, path: string | null,
  scope: string, sourceKey?: string): { data?: T; error?: string } {
  const [state, setState] = useState<{ scope: string; data?: T; error?: string }>({ scope: '' });
  useEffect(() => {
    if (!path || !root.current) return;
    let live = true, lastActivity = Date.now(), active = '', seconds = 0, sending = false;
    let retryAt = 0, backoff = 5000, blocked = false;
    const visible = new Map<string, number>();
    const queue: { eventId: string; sourceKey?: string; section?: string; questionId?: string; seconds: number }[] = [];
    const token = localStorage.getItem(TOKEN_KEY);
    function enqueue() {
      if (blocked || !active || !seconds) return;
      if (queue.length < 100) queue.push({ eventId: crypto.randomUUID(), ...(sourceKey ? { sourceKey, section: active } : { questionId: active }), seconds: Math.min(30, seconds) });
      seconds = 0;
    }
    async function send() {
      if (blocked || sending || !queue.length || Date.now() < retryAt) return;
      sending = true;
      try {
        const { data } = await api.post<T>(path!, queue[0]);
        queue.shift();
        backoff = 5000; retryAt = 0;
        if (live) setState({ scope, data });
      } catch (err) {
        if (axios.isAxiosError(err) && [401, 409, 422].includes(err.response?.status ?? 0)) { blocked = true; queue.length = 0; }
        else { retryAt = Date.now() + backoff; backoff = Math.min(30_000, backoff * 2); }
        if (live) setState({ scope, error: extractApiError(err) });
      } finally { sending = false; }
    }
    function flush() { enqueue(); void send(); }
    function activity() { lastActivity = Date.now(); }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.timeId!;
        visible.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
      }
      const next = [...visible].sort((a, b) => b[1] - a[1]).find(item => item[1] > 0)?.[0] ?? '';
      if (next !== active) { flush(); active = next; }
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    root.current.querySelectorAll('[data-time-id]').forEach(element => observer.observe(element));
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible' && document.hasFocus() && Date.now() - lastActivity < 90_000 && active) seconds++;
      if (seconds >= 15 || queue.length) flush();
    }, 1000);
    function visibility() { if (document.visibilityState === 'hidden') flush(); else activity(); }
    // Opening initializes a reading session. No consumed time is claimed here.
    if (sourceKey) {
      const first = root.current.querySelector<HTMLElement>('[data-time-id]')?.dataset.timeId;
      if (first) { queue.push({ eventId: crypto.randomUUID(), sourceKey, section: first, seconds: 0 }); void send(); }
    }
    for (const event of ['pointerdown', 'keydown', 'scroll', 'touchstart']) window.addEventListener(event, activity, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    return () => {
      live = false; clearInterval(interval); observer.disconnect(); enqueue();
      for (const event of ['pointerdown', 'keydown', 'scroll', 'touchstart']) window.removeEventListener(event, activity);
      document.removeEventListener('visibilitychange', visibility);
      // Best effort on navigation; keep the same event IDs so in-flight retries deduplicate.
      if (token && queue.length) for (const body of queue.slice(0, 3)) {
        void fetch(String(api.defaults.baseURL) + path, { method: 'POST', keepalive: true,
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(body) }).catch(() => {});
      }
    };
  }, [root, path, scope, sourceKey]);
  return state.scope === scope ? state : {};
}
