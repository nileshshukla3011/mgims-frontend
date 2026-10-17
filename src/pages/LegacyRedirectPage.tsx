import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * Old website addresses (www.mgims.ac.in/index.php/...) open the matching new page (WEB-ENG-3). The map is generated
 * by scripts/generate-legacy-redirects.mjs; the web server should also answer these with 301 redirects
 * (docs/legacy-redirects.nginx.conf) so search engines update their links.
 */
export const LegacyRedirectPage: React.FC = () => {
  const location = useLocation();
  const map = useAsync(() => import('@/data/legacy_redirects.json').then((m) => m.default as Record<string, string>), []);
  if (map.loading && !map.data) return <div className="mx-auto max-w-3xl px-4 py-12"><SkeletonRows count={2} label="Opening the new page" /></div>;
  const path = location.pathname.replace(/\/+$/, '').toLowerCase();
  const search = location.search.toLowerCase();
  const target = map.data?.[`${path}${search}`] ?? map.data?.[path];
  return target ? <Navigate to={target} replace /> : <NotFoundPage />;
};
