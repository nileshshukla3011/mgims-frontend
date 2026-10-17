// Error and performance reporting, without a vendor library. With VITE_MONITORING_URL set, reports are sent as small
// JSON beacons to that address (for example a collector of the backend, or an error-tracking service's ingest URL);
// without it, errors are only logged to the browser console. Reports never include form contents or personal data.

const ENDPOINT = import.meta.env.VITE_MONITORING_URL as string | undefined;

type Report =
  | { type: 'error'; message: string; stack?: string; context?: Record<string, unknown> }
  | { type: 'metric'; name: string; value: number };

function send(report: Report) {
  if (!ENDPOINT) return;
  const body = JSON.stringify({ ...report, page: location.pathname, release: import.meta.env.VITE_RELEASE ?? 'dev', at: new Date().toISOString() });
  try {
    if (!navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'application/json' }))) {
      void fetch(ENDPOINT, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => undefined);
    }
  } catch {
    // Reporting must never break the page.
  }
}

/** Records an error, for example from an error boundary. */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(err);
  send({ type: 'error', message: err.message.slice(0, 500), stack: err.stack?.slice(0, 4000), context });
}

/** True for a failed download of a page's code, typically after a new version was deployed. */
export const isChunkLoadError = (error: unknown) =>
  error instanceof Error && /dynamically imported module|Importing a module script failed|Failed to fetch dynamically|error loading dynamically/i.test(error.message);

let started = false;

/** Catches errors outside React and measures Core Web Vitals (LCP, CLS, FCP, TTFB). Call once at start-up. */
export function startMonitoring() {
  if (started || typeof window === 'undefined') return;
  started = true;
  window.addEventListener('error', (e) => reportError(e.error ?? e.message, { source: 'window' }));
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason, { source: 'promise' }));
  if (!ENDPOINT || typeof PerformanceObserver === 'undefined') return;

  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (nav) send({ type: 'metric', name: 'TTFB', value: Math.round(nav.responseStart) });
  let lcp = 0;
  let cls = 0;
  const observe = (type: string, onEntry: (entry: PerformanceEntry & { value?: number; hadRecentInput?: boolean }) => void) => {
    try {
      new PerformanceObserver((list) => list.getEntries().forEach((entry) => onEntry(entry))).observe({ type, buffered: true });
    } catch {
      // Not supported by this browser.
    }
  };
  observe('paint', (e) => e.name === 'first-contentful-paint' && send({ type: 'metric', name: 'FCP', value: Math.round(e.startTime) }));
  observe('largest-contentful-paint', (e) => (lcp = e.startTime));
  observe('layout-shift', (e) => {
    if (!e.hadRecentInput) cls += e.value ?? 0;
  });
  // LCP and CLS are final when the page is hidden (tab switched, navigated away or closed).
  addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden') return;
    if (lcp) send({ type: 'metric', name: 'LCP', value: Math.round(lcp) });
    send({ type: 'metric', name: 'CLS', value: Math.round(cls * 1000) / 1000 });
  }, { once: true });
}
