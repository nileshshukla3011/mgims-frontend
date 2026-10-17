import React from 'react';
import { AlertTriangle, CheckCircle2, FlaskConical, Info, RefreshCw } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { IS_MOCK } from '@/services/http';
import { formatDateTime } from '@/utils/format';

const TONES: Record<string, string> = {
  good: 'bg-emerald-100 text-emerald-800',
  warn: 'bg-amber-100 text-amber-900',
  bad: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-slate-100 text-slate-700',
};

// Status words used across the portals, mapped to a colour. The word itself is always shown, so colour is never the
// only signal (WCAG 1.4.1).
const toneOf = (status: string) => {
  const s = status.toLowerCase();
  if (/(success|paid|issued|ready|approved|published|active|confirmed|verified|completed|collected|disbursed|granted|open|available|checked in)/.test(s)) return 'good';
  if (/(fail|reject|declin|cancel|withdrawn|not eligible|revoked|missed|refused|closed|unsubscribed|expired)/.test(s)) return 'bad';
  if (/(pending|due|part|query|review|verification|scheduled|submitted|requested|invited|draft|booked|created|refund)/.test(s)) return 'warn';
  return 'neutral';
};

export const StatusBadge: React.FC<{ status: string; label?: string }> = ({ status, label }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${TONES[toneOf(status)]}`}>{label ?? status}</span>
);

export const EmptyState: React.FC<{ title: string; children?: React.ReactNode; icon?: React.ElementType }> = ({ title, children, icon: Icon = Info }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
    <Icon className="mx-auto mb-2 h-6 w-6 text-slate-500" aria-hidden="true" />
    <p className="text-sm font-semibold text-slate-800">{title}</p>
    {children && <div className="mt-1 text-xs text-slate-600">{children}</div>}
  </div>
);

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({ message, onRetry }) => {
  const { t } = useAccessibility();
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="flex-1">{message ?? t('common.load_error')}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 font-semibold text-red-800 hover:bg-red-50">
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> {t('common.retry')}
        </button>
      )}
    </div>
  );
};

/** Shown on every demo-mode portal page, so demo records are never mistaken for real ones. */
export const DemoBanner: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { t } = useAccessibility();
  if (!IS_MOCK) return null;
  return (
    <div role="note" className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-slate-800">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" aria-hidden="true" />
      <p>
        <strong>{t('demo.title')}</strong> {children ?? t('demo.body')}
      </p>
    </div>
  );
};

/** WEB-DYN-5: when the data was synced, and a warning when the live source failed and an older copy is shown. */
export const FreshnessBadge: React.FC<{ fetchedAt: string; stale: boolean; source?: string }> = ({ fetchedAt, stale, source }) => {
  const { t } = useAccessibility();
  return stale ? (
    <p role="status" className="inline-flex flex-wrap items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
      {t('fresh.stale', { time: formatDateTime(fetchedAt) })}
    </p>
  ) : (
    <p className="inline-flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
      {source ? t('fresh.updated_from', { time: formatDateTime(fetchedAt), source }) : t('fresh.updated', { time: formatDateTime(fetchedAt) })}
    </p>
  );
};
