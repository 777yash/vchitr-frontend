export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GsiIdConfig {
  client_id: string;
  callback: (res: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GsiButtonOptions {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
}

interface GsiId {
  initialize: (cfg: GsiIdConfig) => void;
  renderButton: (parent: HTMLElement, opts: GsiButtonOptions) => void;
  prompt: () => void;
  disableAutoSelect: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GsiId;
      };
    };
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client';
let loadPromise: Promise<void> | null = null;

/**
 * Load Google Identity Services v3 script once. Returns same promise on repeat calls.
 */
export function loadGoogleScript(): Promise<void> {
  if (loadPromise) return loadPromise;
  if (window.google?.accounts?.id) {
    loadPromise = Promise.resolve();
    return loadPromise;
  }
  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load GSI script')));
      return;
    }
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load GSI script'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export function getGoogleClientId(): string {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || '';
}
