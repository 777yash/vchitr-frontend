import { api, TOKEN_KEY, USER_KEY } from './client';

export interface UserOut {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: 'bearer';
}

export async function signup(
  email: string,
  username: string,
  password: string
): Promise<UserOut> {
  const { data } = await api.post<UserOut>('/auth/signup', { email, username, password });
  return data;
}

export async function login(email: string, password: string): Promise<string> {
  const body = new URLSearchParams();
  body.append('username', email);
  body.append('password', password);
  const { data } = await api.post<Token>('/auth/login', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data.access_token;
}

export async function googleLogin(credential: string): Promise<string> {
  const { data } = await api.post<Token>('/auth/google', { credential });
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data.access_token;
}

export async function me(): Promise<UserOut> {
  const { data } = await api.get<UserOut>('/auth/me');
  localStorage.setItem(USER_KEY, JSON.stringify({ username: data.username, email: data.email }));
  return data;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): { username: string; email: string } | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
