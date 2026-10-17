// Demo mode only (VITE_USE_MOCK_API=true): stands in for the backend so every portal flow can be tried and tested.
// Everything here is clearly fictional demo data kept in this browser; none of it ships when the backend is used,
// because the services import these modules only on the mock path.

const PREFIX = 'mgims-demo:';

export const demoStore = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Storage full or blocked: the change lasts until the page is reloaded.
    }
  },
  /** Session-only values (portal sign-in), cleared when the tab is closed. */
  session: {
    get<T>(key: string): T | null {
      try {
        const raw = sessionStorage.getItem(PREFIX + key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch {
        return null;
      }
    },
    set(key: string, value: unknown) {
      try {
        if (value === null) sessionStorage.removeItem(PREFIX + key);
        else sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
      } catch {
        // Blocked storage: the demo session ends on reload.
      }
    },
  },
};

/** Simulated network time, so loading states are visible in demo mode. */
export const delay = (ms = 250) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const demoId = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;

/** A demo-mode error with an HTTP-like status, so the UI's error handling can be exercised. */
export class DemoError extends Error {
  status: number;
  retryAfterSeconds?: number;
  constructor(status: number, message: string, retryAfterSeconds?: number) {
    super(message);
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
