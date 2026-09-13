// Memory only. Token changes invalidate both cached and in-flight verification.
export function createSessionCache<T>(readToken: () => string | null, load: (token: string) => Promise<T>, ttl = 60_000, now = Date.now) {
  let token: string | null = null;
  let generation = 0;
  let saved: { value: T; expires: number } | undefined;
  let pending: Promise<T> | undefined;
  function sync() {
    const current = readToken();
    if (current !== token) {
      token = current; generation++; saved = undefined; pending = undefined;
    }
    return current;
  }
  function peek() {
    return sync() && saved && now() < saved.expires ? saved.value : undefined;
  }
  function get(force = false): Promise<T> {
    const current = sync();
    if (!current) return Promise.reject(new Error('Please sign in.'));
    if (pending) return pending;
    const cached = peek();
    if (!force && cached !== undefined) return Promise.resolve(cached);
    const version = generation;
    pending = load(current).then((value) => {
      sync();
      if (version !== generation) throw new Error('Session changed. Please retry.');
      saved = { value, expires: now() + ttl };
      return value;
    }).finally(() => { if (version === generation) pending = undefined; });
    return pending;
  }
  return { get, peek, sync };
}
