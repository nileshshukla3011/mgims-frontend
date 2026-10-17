import React from 'react';
import { Droplet, PhoneCall } from 'lucide-react';
import { dynamicApi } from '@/services/dynamicApi';
import { useAsync } from '@/hooks/useAsync';
import { useAccessibility } from '@/context/AccessibilityContext';
import { EmptyState, FreshnessBadge } from '@/components/ui/Status';
import { SkeletonRows } from '@/components/ui/Skeleton';

/**
 * Blood stock by group and component, synced from e-RaktKosh (WEB-DYN-4). Until the feed is connected, the blood
 * bank's telephone extension from the official directory is shown instead of figures.
 */
export const BloodAvailability: React.FC = () => {
  const { t } = useAccessibility();
  const stock = useAsync(() => dynamicApi.getBloodAvailability(), []);
  const contact = (
    <p className="flex flex-wrap items-center gap-2 text-sm text-slate-800">
      <PhoneCall className="h-4 w-4 text-link" aria-hidden="true" />
      {t('blood.call')} <a href="tel:07152284341" className="font-semibold text-link underline">07152-284341</a> ({t('blood.extension', { ext: '273' })})
    </p>
  );
  if (stock.loading && !stock.data) return <SkeletonRows count={3} label={t('blood.loading')} />;
  const data = stock.data?.data;
  if (stock.error || !data) {
    return (
      <div className="space-y-3">
        <EmptyState title={t('blood.not_connected')} icon={Droplet}>{t('blood.not_connected_body')}</EmptyState>
        {contact}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <FreshnessBadge fetchedAt={stock.data!.fetchedAt} stale={stock.data!.stale} source={data.source} />
      <div className="overflow-x-auto rounded-xl border border-slate-200" tabIndex={0} role="region" aria-label={t('blood.table', { bank: data.bankName })}>
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{t('blood.table', { bank: data.bankName })}</caption>
          <thead className="bg-brand-navy text-white">
            <tr>
              <th scope="col" className="p-3 font-semibold">{t('blood.group')}</th>
              {data.components.map((c) => <th key={c} scope="col" className="p-3 text-right font-semibold">{c}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.stock.map((row) => (
              <tr key={row.group}>
                <th scope="row" className="p-3 text-left font-bold">{row.group}</th>
                {data.components.map((c) => {
                  const units = row.units[c] ?? 0;
                  return <td key={c} className={`p-3 text-right font-mono ${units === 0 ? 'text-red-700' : ''}`}>{units === 0 ? t('blood.none') : units}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-600">{t('blood.note')}</p>
      {contact}
    </div>
  );
};
