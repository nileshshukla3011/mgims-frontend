import React from 'react';
import { isChunkLoadError, reportError } from '@/utils/monitoring';

export interface ErrorFallbackProps {
  error: Error;
  /** Clears the error and renders the children again. */
  reset: () => void;
}

interface Props {
  children: React.ReactNode;
  /** Shown instead of the children after an error. */
  fallback: React.ComponentType<ErrorFallbackProps>;
  /** When this value changes (for example the page address), a shown error is cleared. */
  resetKey?: string;
  /** Where the boundary sits, for the error report. */
  name: string;
}

interface State {
  error: Error | null;
  /** The `resetKey` the current error was shown for. */
  resetKey?: string;
}

/**
 * Keeps an error in one part of the interface from blanking the whole page. The error is reported
 * (src/utils/monitoring.ts) and `fallback` is shown until the visitor tries again or goes to another page.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  // A new page address clears the error before rendering, so the new page is shown directly.
  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null;
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportError(error, { boundary: this.props.name, chunk: isChunkLoadError(error), componentStack: info.componentStack?.slice(0, 2000) });
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    const Fallback = this.props.fallback;
    return error ? <Fallback error={error} reset={this.reset} /> : this.props.children;
  }
}
