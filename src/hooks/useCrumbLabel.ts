import { useEffect, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';

// The breadcrumb names each part of the address from the address itself ("/alumni/kk" → "Kk"). A page whose address
// ends in an id or slug can give its own name for the last part instead, e.g. the person's name.
let current: { path: string; label: string } | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Names the current page in the breadcrumb (src/components/layout/Breadcrumbs.tsx) while it is shown. */
export function useCrumbLabel(label: string | undefined) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!label) return;
    current = { path: pathname, label };
    notify();
    return () => {
      current = null;
      notify();
    };
  }, [label, pathname]);
}

/** The name the page at `pathname` gave itself, if any. */
export function useCurrentCrumbLabel(pathname: string) {
  const entry = useSyncExternalStore(subscribe, () => current);
  return entry?.path === pathname ? entry.label : undefined;
}
