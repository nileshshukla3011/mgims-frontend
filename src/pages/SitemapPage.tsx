import React from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { useAccessibility } from '@/context/AccessibilityContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/Status';

interface SiteMapData {
  groups: { title: string; links: { path: string; title: string }[] }[];
}

/**
 * Human-readable sitemap (GIGW 3.0). Built by scripts/generate-sitemap.mjs from the same page configs as sitemap.xml,
 * so it always matches the menus.
 */
export const SitemapPage: React.FC = () => {
  const { t } = useAccessibility();
  usePageMeta(t('sitemap.title'), t('sitemap.intro'));
  const data = useAsync(() => import('@/data/site_map.json').then((m) => m.default as SiteMapData), []);
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-serif text-2xl font-black text-ink sm:text-3xl">{t('sitemap.title')}</h1>
        <p className="mt-1 text-sm text-slate-600">{t('sitemap.intro')}</p>
      </div>
      {data.error ? <ErrorState onRetry={data.reload} /> : !data.data ? <SkeletonRows count={6} /> : (
        <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
          {data.data.groups.map((g) => (
            <section key={g.title} aria-labelledby={`map-${g.title}`} className="mb-6 break-inside-avoid">
              <h2 id={`map-${g.title}`} className="mb-2 border-b border-slate-200 pb-1 text-base font-bold text-ink">{g.title}</h2>
              <ul className="space-y-1 text-sm">
                {g.links.map((l) => (
                  <li key={l.path}>
                    <Link to={l.path} className="inline-flex min-h-8 items-center text-link hover:underline">{l.title}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
