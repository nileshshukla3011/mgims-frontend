import React from 'react';
import { Link } from 'react-router-dom';
import { PortalLink } from '@/components/navigation/PortalLink';
import { dynamicApi } from '@/services/dynamicApi';
import { useAsync } from '@/hooks/useAsync';
import { useAccessibility } from '@/context/AccessibilityContext';
import { EmptyState, ErrorState } from '@/components/ui/Status';
import { SkeletonRows } from '@/components/ui/Skeleton';

/** Results released to the public; students see their own marks in the Student Portal (WEB-ACD-2). */
export const PublicResults: React.FC = () => {
  const { t } = useAccessibility();
  const results = useAsync(() => dynamicApi.getPublicResults(), []);
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700">
        {t('pubres.intro')} <PortalLink portal="student" className="font-semibold text-link underline">{t('pubres.portal')}</PortalLink>
      </p>
      {results.error ? <ErrorState onRetry={results.reload} /> : !results.data ? <SkeletonRows count={3} /> : results.data.length === 0 ? <EmptyState title={t('pubres.none')} /> : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
          {results.data.map((r) => (
            <li key={r.id} className="p-3">
              {r.url.startsWith('/') ? <Link to={r.url} className="font-semibold text-link hover:underline">{r.title}</Link> : <a href={r.url} className="font-semibold text-link hover:underline">{r.title}</a>}
              <span className="block text-xs text-slate-600">{r.date}{r.programme ? ` · ${r.programme}` : ''}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
