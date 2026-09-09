import { useEffect, useState, useSyncExternalStore } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken, me } from '../api/auth';
import { extractApiError, SESSION_CHANGED } from '../api/client';
import '../pages/Auth.css';

function subscribe(onChange: () => void) {
  window.addEventListener(SESSION_CHANGED, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(SESSION_CHANGED, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export default function RequireAuth() {
  const token = useSyncExternalStore(subscribe, getToken);
  const location = useLocation();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    token: string; attempt: number; error?: string;
  } | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    me().then(
      () => { if (!cancelled) setResult({ token, attempt }); },
      (err) => {
        if (!cancelled) setResult({ token, attempt, error: extractApiError(err) });
      },
    );
    return () => { cancelled = true; };
  }, [token, attempt]);

  if (!token) {
    return <Navigate to="/login" replace state={{
      from: location.pathname + location.search + location.hash,
    }} />;
  }

  const current = result?.token === token && result.attempt === attempt ? result : null;
  if (current && !current.error) return <Outlet key={token} />;

  return (
    <div className="auth-container">
      <div className="auth-card">
        {current?.error ? (
          <>
            <p role="alert">{current.error}</p>
            <button className="btn btn-primary" onClick={() => setAttempt((n) => n + 1)}>
              Retry
            </button>
          </>
        ) : <p role="status">Checking your session…</p>}
      </div>
    </div>
  );
}
