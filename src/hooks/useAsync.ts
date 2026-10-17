import { DependencyList, useCallback, useEffect, useState } from 'react';

export interface AsyncState<T> {
  data?: T;
  error?: unknown;
  loading: boolean;
  /** Loads again, e.g. from a Retry button. */
  reload: () => void;
}

/** Loads data when `deps` change, with loading and error states and a reload function. */
export function useAsync<T>(load: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [state, setState] = useState<{ data?: T; error?: unknown; loading: boolean }>({ loading: true });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    load().then(
      (data) => active && setState({ data, loading: false }),
      (error) => active && setState({ error, loading: false }),
    );
    return () => {
      active = false;
    };
    // `load` is a new function on each render; `deps` say when to load again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);
  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: undefined }));
    setAttempt((n) => n + 1);
  }, []);
  return { ...state, reload };
}
