// The one HTTP client of the website and the admin console. All calls go to the backend middleware (WEB-SEC-4); the
// browser never talks to a database directly. Every request sends the reader's language, has a timeout, and fails with
// an ApiError. Public reads are shared while in flight and reused for a short time; requests with the staff session
// are never cached, and any change (POST, PUT, PATCH, DELETE) clears the cache.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const IS_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

let requestLanguage = 'en';
/** Set by AccessibilityContext, so the backend can answer in the reader's language (WEB-MLS-1, WEB-MLS-3). */
export const setRequestLanguage = (language: string) => {
  requestLanguage = language;
};
export const getRequestLanguage = () => requestLanguage;

/** A failed request. `status` is the HTTP status (0 when the server could not be reached). */
export class ApiError extends Error {
  status: number;
  body: unknown;
  /** From a Retry-After header (423 or 429). */
  retryAfterSeconds?: number;
  constructor(status: number, message: string, body?: unknown, retryAfterSeconds?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** JSON-serialisable body, or FormData for file uploads. */
  body?: unknown;
  /** Staff requests carry the session cookie (also when the console runs on another origin than the API). */
  withSession?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Milliseconds before the request is abandoned (default 30 s). */
  timeoutMs?: number;
}

// ---- Session: a 401 on a staff request means the session has ended on the server (timed out, or signed out
// elsewhere). The console registers what to do; sign-in requests use `request()` and are not reported.
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

const DEFAULT_TIMEOUT = 30_000;

/** Combines the caller's signal (if any) with a timeout. */
const withTimeout = (signal: AbortSignal | undefined, ms: number): AbortSignal | undefined => {
  if (typeof AbortSignal === 'undefined' || !('timeout' in AbortSignal)) return signal;
  const timeout = AbortSignal.timeout(ms);
  return signal && 'any' in AbortSignal ? AbortSignal.any([signal, timeout]) : signal ?? timeout;
};

/**
 * The raw request, for callers that read the status themselves (sign-in answers 202, 401, 423…). It throws an
 * ApiError with status 0 only when the server cannot be reached.
 */
export async function request(path: string, options: RequestOptions = {}): Promise<Response> {
  const { method = 'GET', body, withSession = false, headers = {}, signal, timeoutMs = DEFAULT_TIMEOUT } = options;
  const allHeaders: Record<string, string> = { Accept: 'application/json', 'Accept-Language': requestLanguage, ...headers };
  let payload: BodyInit | undefined;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) {
    // In an update (PUT, PATCH), an optional field the user emptied is sent as null, so the server clears it.
    const clearEmptied = method === 'PUT' || method === 'PATCH';
    payload = JSON.stringify(body, (_key, value) => (clearEmptied && value === undefined ? null : value));
    allHeaders['Content-Type'] = 'application/json';
  }
  const send = () =>
    fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: allHeaders,
      body: payload,
      credentials: withSession ? 'include' : 'same-origin',
      signal: withTimeout(signal, timeoutMs),
    });
  try {
    return await send();
  } catch (error) {
    if (signal?.aborted) throw error;
    // One more try for a read that failed to reach the server (a dropped connection); never for a change.
    if (method === 'GET') {
      try {
        return await send();
      } catch {
        // Reported below.
      }
    }
    throw new ApiError(0, `${method} ${path}: the server could not be reached`, undefined);
  }
}

/** Reads a failed response into an ApiError: its JSON `message` (if any) and Retry-After. */
export async function toApiError(res: Response, method: string, path: string): Promise<ApiError> {
  let errorBody: unknown;
  try {
    errorBody = await res.json();
  } catch {
    errorBody = undefined;
  }
  const retryAfter = Number(res.headers.get('Retry-After')) || undefined;
  const message = (errorBody as { message?: string } | undefined)?.message ?? `${method} ${path} failed: ${res.status}`;
  return new ApiError(res.status, message, errorBody, retryAfter);
}

// ---- Cache for public reads: identical requests share one answer for CACHE_MS.
const CACHE_MS = 30_000;
const cache = new Map<string, { at: number; value: Promise<unknown> }>();
/** Forgets cached public reads (after a change, or when a page must show the newest data). */
export const clearRequestCache = () => cache.clear();

/** A JSON request. Throws an ApiError for any answer that is not 2xx; resolves to undefined for 204. */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const cacheable = method === 'GET' && !options.withSession && !options.signal;
  if (method !== 'GET') clearRequestCache();
  const key = `${requestLanguage} ${path}`;
  if (cacheable) {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.value as Promise<T>;
  }
  const value = (async () => {
    const res = await request(path, options);
    if (!res.ok) {
      if (res.status === 401 && options.withSession) onUnauthorized?.();
      throw await toApiError(res, method, path);
    }
    if (res.status === 204) return undefined as T;
    const type = res.headers.get('Content-Type') ?? '';
    return (type.includes('json') ? res.json() : res.text()) as Promise<T>;
  })();
  if (cacheable) {
    cache.set(key, { at: Date.now(), value });
    value.catch(() => cache.delete(key)); // a failure is not remembered
  }
  return value;
}

// --- WEB-DYN-5: last-known-good copies ---------------------------------------------------------------------------
// Dynamic data (blood stock, regulatory updates, hospital statistics) is kept in this browser after each successful
// load. If the source is unavailable later, the saved copy is shown with its age instead of an error.

export interface Fresh<T> {
  data: T;
  /** When the data was fetched (or synced by the backend, if it says so). */
  fetchedAt: string;
  /** True when the live source failed and this is the last copy that loaded. */
  stale: boolean;
}

const CACHE_PREFIX = 'mgims-cache:';

export async function withLastKnownGood<T>(key: string, load: () => Promise<T>, syncedAt?: (data: T) => string | undefined): Promise<Fresh<T>> {
  try {
    const data = await load();
    const fetchedAt = syncedAt?.(data) ?? new Date().toISOString();
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, fetchedAt }));
    } catch {
      // Storage full or blocked: the live copy is still shown.
    }
    return { data, fetchedAt, stale: false };
  } catch (error) {
    try {
      const saved = localStorage.getItem(CACHE_PREFIX + key);
      if (saved) {
        const { data, fetchedAt } = JSON.parse(saved) as { data: T; fetchedAt: string };
        return { data, fetchedAt, stale: true };
      }
    } catch {
      // Unreadable copy: fall through to the original error.
    }
    throw error;
  }
}
