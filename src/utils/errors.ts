// Turns a failed request (ApiError from the backend, or DemoError in demo mode) into something to show the user.

export const errorStatus = (error: unknown): number | undefined =>
  typeof error === 'object' && error !== null && 'status' in error ? Number((error as { status: unknown }).status) : undefined;

export const retryAfter = (error: unknown): number | undefined =>
  typeof error === 'object' && error !== null && 'retryAfterSeconds' in error ? Number((error as { retryAfterSeconds?: number }).retryAfterSeconds) || undefined : undefined;

/**
 * The server's own message for 4xx answers (e.g. "That code is not correct."), otherwise `fallback`. Messages that
 * only repeat the URL and status ("POST /x failed: 500") are never shown.
 */
export const errorMessage = (error: unknown, fallback: string): string => {
  const status = errorStatus(error);
  const message = error instanceof Error ? error.message : '';
  if (status && status >= 400 && status < 500 && message && !/ failed: \d{3}$/.test(message)) return message;
  return fallback;
};
