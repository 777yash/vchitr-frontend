import { useEffect, useState } from 'react';
import { api, extractApiError } from '../api/client';
import type { Lesson } from '../learning/course';

interface GenerationState { status: 'pending' | 'awaiting-review' | 'available' | 'failed' | 'unavailable'; generationId: string | null }

export default function AutomaticExplanation({ courseId, lesson, reload }: { courseId: string; lesson: Lesson; reload: () => void }) {
  const [state, setState] = useState<GenerationState | null>(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const variant = lesson.contentVariant;
  const enabled = !!variant?.automaticGenerationEnabled && variant.status === 'unavailable';
  const path = '/learning/courses/' + courseId + '/chapters/' + lesson.id + '/explanation';
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    // The server reserves a durable identity before inference. StrictMode/remounts reuse it.
    void api.post<GenerationState>(path, {}, { signal: controller.signal, timeout: 120_000 })
      .then(({ data }) => { setState(data); if (data.status === 'available') reload(); })
      .catch(err => { if (!controller.signal.aborted) setError(extractApiError(err)); });
    return () => controller.abort();
  }, [enabled, path, reload]);
  async function check() {
    setChecking(true); setError('');
    try { const { data } = await api.get<GenerationState>(path); setState(data); if (data.status === 'available') reload(); }
    catch (err) { setError(extractApiError(err)); }
    finally { setChecking(false); }
  }
  if (!enabled) return null;
  const message = error ? 'Adapted explanation unavailable. Continue with the original lesson.'
    : state?.status === 'awaiting-review' ? 'Your adapted explanation is being reviewed. Original lesson below.'
    : state?.status === 'failed' || state?.status === 'unavailable' ? 'Original lesson available while we prepare your adapted explanation.'
    : 'Preparing an explanation for your learning level. You can keep reading.';
  return <div className="generation-status" role="status"><span className="generation-dot" aria-hidden="true" /><p>{message}</p><button className="course-text-button" disabled={checking} onClick={() => void check()}>{checking ? 'Checking…' : 'Check status'}</button></div>;
}
