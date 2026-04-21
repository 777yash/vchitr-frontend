import { api } from './client';

export type Gender = 'Female' | 'Male' | 'Nonbinary' | 'Prefer not to say' | 'Other';

export const GENDER_OPTIONS: Gender[] = [
  'Female',
  'Male',
  'Nonbinary',
  'Prefer not to say',
  'Other',
];

export interface CountryCode {
  name: string;
  iso: string;
  dial_code: string;
}

export interface ProfileOut {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  date_of_birth: string | null;
  age: number | null;
  gender: Gender | null;
  bio: string | null;
  phone_country_code: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  initials: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingIn {
  full_name: string;
  date_of_birth: string;
  gender: Gender;
  bio?: string;
  phone_country_code?: string;
  phone_number?: string;
}

export interface ProfileUpdate {
  username?: string;
  full_name?: string;
  date_of_birth?: string;
  gender?: Gender;
  bio?: string;
  phone_country_code?: string;
  phone_number?: string;
}

export async function getProfile(): Promise<ProfileOut> {
  const { data } = await api.get<ProfileOut>('/profile/me');
  return data;
}

export async function submitOnboarding(payload: OnboardingIn): Promise<ProfileOut> {
  const { data } = await api.post<ProfileOut>('/profile/onboarding', payload);
  return data;
}

export async function patchProfile(patch: ProfileUpdate): Promise<ProfileOut> {
  const { data } = await api.patch<ProfileOut>('/profile/me', patch);
  return data;
}

export async function uploadAvatar(file: File): Promise<ProfileOut> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post<ProfileOut>('/profile/me/avatar', form);
  return data;
}

export async function deleteAvatar(): Promise<ProfileOut> {
  const { data } = await api.delete<ProfileOut>('/profile/me/avatar');
  return data;
}

let countryCodesPromise: Promise<CountryCode[]> | null = null;

/**
 * Fetch static country-code list. Memoized in-module so repeated callers share one fetch.
 */
export function getCountryCodes(): Promise<CountryCode[]> {
  if (countryCodesPromise) return countryCodesPromise;
  countryCodesPromise = api
    .get<CountryCode[]>('/profile/country-codes')
    .then((r) => r.data)
    .catch((err) => {
      countryCodesPromise = null;
      throw err;
    });
  return countryCodesPromise;
}

/**
 * Resolve a `ProfileOut.avatar_url` (relative) to an absolute URL, or null if unset.
 */
export function avatarSrc(profile: ProfileOut | null | undefined): string | null {
  if (!profile?.avatar_url) return null;
  const base =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://127.0.0.1:8000';
  return `${base}${profile.avatar_url}`;
}
