import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';
import type { ErrorFallbackProps } from '@/components/ErrorBoundary';
import { isChunkLoadError } from '@/utils/monitoring';

const button = 'inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold';

/** Shown in place of a page that failed; the header, menus and footer keep working. */
export const PageErrorFallback: React.FC<ErrorFallbackProps> = ({ error, reset }) => {
  const { t } = useAccessibility();
  const updated = isChunkLoadError(error);
  return (
    <div role="alert" className="mx-auto max-w-2xl space-y-4 px-4 py-16 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-amber-600" aria-hidden="true" />
      <h1 className="font-serif text-2xl font-black text-ink">{t(updated ? 'error.updated_title' : 'error.title')}</h1>
      <p className="text-sm text-slate-700">{t(updated ? 'error.updated_body' : 'error.body')}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {!updated && (
          <button type="button" onClick={reset} className={`${button} bg-brand-blue text-white`}>
            {t('error.retry')}
          </button>
        )}
        <button type="button" onClick={() => location.reload()} className={`${button} border border-slate-300 bg-white text-link`}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> {t('error.reload')}
        </button>
        <Link to="/" onClick={reset} className={`${button} border border-slate-300 bg-white text-link`}>
          {t('error.home')}
        </Link>
      </div>
    </div>
  );
};

/**
 * Last resort when the site's own frame (header, menus, footer) fails. It uses no context or translations, since
 * those may be what failed.
 */
export const AppErrorFallback: React.FC<ErrorFallbackProps> = () => (
  <div role="alert" style={{ maxWidth: 640, margin: '64px auto', padding: 16, fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
    <h1 style={{ fontSize: 24, color: '#0a2540' }}>Something went wrong</h1>
    <p style={{ color: '#334155' }}>The page could not be shown. Please reload it. If the problem continues, call 07152-284341.</p>
    <button type="button" onClick={() => location.reload()} style={{ minHeight: 44, padding: '0 16px', borderRadius: 8, background: '#004080', color: '#fff', border: 0, fontWeight: 600 }}>
      Reload the page
    </button>
  </div>
);
