import axios, { AxiosError } from 'axios';

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://127.0.0.1:8000';

export const TOKEN_KEY = 'vchitr-token';
export const USER_KEY = 'vchitr-current-user';

export const api = axios.create({ baseURL });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    return Promise.reject(err);
  }
);

type ValidationItem = { loc: (string | number)[]; msg: string; type: string };

/**
 * Extract a human-readable error message from a FastAPI error response.
 * Handles both `{detail: string}` and `{detail: ValidationItem[]}` shapes.
 */
export function extractApiError(err: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { detail?: string | ValidationItem[] } | undefined;
    const detail = data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((d) => d.msg).join('; ');
    }
    if (err.code === 'ERR_NETWORK') return 'Cannot reach server.';
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
