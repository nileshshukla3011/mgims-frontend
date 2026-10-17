import React from 'react';
import { ExternalLink } from 'lucide-react';
import { dynamicApi } from '@/services/dynamicApi';
import { useAsync } from '@/hooks/useAsync';
import { useAccessibility } from '@/context/AccessibilityContext';
import { EmptyState, FreshnessBadge } from '@/components/ui/Status';
import { SkeletonRows } from '@/components/ui/Skeleton';

/**
 * Regulatory updates pulled on a schedule from authoritative sources such as NMC (WEB-DYN-1), with the time of the
 * last successful sync and a warning when an older copy is shown (WEB-DYN-5).
 */
export const RegulatoryUpdates: React.FC<{ source?: string }> = ({ source }) => {
  const { t } = useAccessibility();
  const updates = useAsync(() => dynamicApi.getRegulatoryUpdates(source), [source]);
  return (
    <section aria-labelledby="reg-updates" className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <h2 id="reg-updates" className="font-serif text-lg font-bold text-ink">{t('regup.title', { source: source ?? '' })}</h2>
      {updates.error ? (
        <EmptyState title={t('regup.unavailable')}>
          <a href="https://www.nmc.org.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-link underline">{t('regup.official')}</a>
        </EmptyState>
      ) : !updates.data ? (
        <SkeletonRows count={3} />
      ) : updates.data.data.length === 0 ? (
        <EmptyState title={t('regup.none')}>
          {t('regup.none_body')}{' '}
          <a href="https://www.nmc.org.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-link underline">
            {t('regup.official')} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> {t('common.new_tab')}</span>
          </a>
        </EmptyState>
      ) : (
        <>
          <FreshnessBadge fetchedAt={updates.data.fetchedAt} stale={updates.data.stale} source={source} />
          <ul className="divide-y divide-slate-100 text-sm">
            {updates.data.data.map((u) => (
              <li key={u.id} className="py-2">
                <a href={u.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1 font-semibold text-link hover:underline">
                  {u.title} <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="sr-only"> {t('common.new_tab')}</span>
                </a>
                <span className="block text-xs text-slate-600">{u.source} · {u.date}{u.category ? ` · ${u.category}` : ''}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};
