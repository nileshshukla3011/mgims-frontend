import React, { lazy, Suspense, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PORTAL_LIST, PORTALS, PortalConfig, PortalId, PortalModuleProps } from '@/config/portals';
import { useAccessibility } from '@/context/AccessibilityContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SkeletonRows } from '@/components/ui/Skeleton';

// In-app portal modules, each loaded only when its portal is opened.
const modules: Partial<Record<PortalId, React.LazyExoticComponent<React.ComponentType<PortalModuleProps>>>> = Object.fromEntries(
  PORTAL_LIST.flatMap((p) => (p.module ? [[p.id, lazy(p.module)]] : [])),
);

/** Forwards to a portal that runs as a separate application, keeping the rest of the address. */
const ExternalPortal: React.FC<{ portal: PortalConfig; name: string }> = ({ portal, name }) => {
  const { t } = useAccessibility();
  const { pathname, search, hash } = useLocation();
  const target = `${portal.externalUrl}${pathname.slice(portal.path.length)}${search}${hash}`;
  useEffect(() => {
    window.location.replace(target);
  }, [target]);
  return (
    <div className="mx-auto max-w-3xl space-y-3 px-4 py-12 text-center">
      <p role="status" className="text-sm font-semibold text-slate-800">{t('portal.opening', { portal: name })}</p>
      <a href={target} className="inline-flex min-h-11 items-center font-semibold text-link underline">{t('portal.open_link', { portal: name })}</a>
    </div>
  );
};

/** Shown until the portal is connected: what it is for, and related pages that already exist. */
const PortalPlaceholder: React.FC<{ portal: PortalConfig; name: string }> = ({ portal, name }) => {
  const { t } = useAccessibility();
  const Icon = portal.icon;
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-link sm:flex">
          <Icon className="h-7 w-7" />
        </span>
        <div>
          <h1 className="font-serif text-2xl font-black text-ink sm:text-3xl">{name}</h1>
          <p className="mt-1 text-sm text-slate-700">{t(`portal.${portal.id}.intro`)}</p>
        </div>
      </div>
      <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">{t('portal.coming', { portal: name })}</p>
      <section aria-labelledby="portal-meanwhile">
        <h2 id="portal-meanwhile" className="mb-3 font-serif text-lg font-bold text-ink">{t('portal.meanwhile')}</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {portal.related.map(({ to, task }) => (
            <li key={to}>
              <Link to={to} className="group flex min-h-14 h-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-blue hover:shadow-md">
                <span className="flex-1 text-sm font-semibold text-ink">{t(`hub.task.${task}`)}</span>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

/**
 * The route of a portal (src/config/portals.ts): renders its in-app module, forwards to its separate application,
 * or shows a placeholder until it is connected.
 */
export const PortalGateway: React.FC<{ portal: PortalId }> = ({ portal: id }) => {
  const { t } = useAccessibility();
  const portal = PORTALS[id];
  const name = t(`portal.${id}.title`);
  usePageMeta(name, t(`portal.${id}.intro`));
  const Module = modules[id];
  if (Module) {
    return (
      <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-12"><SkeletonRows count={4} label={t('portal.loading', { portal: name })} /></div>}>
        <Module basePath={portal.path} />
      </Suspense>
    );
  }
  if (portal.externalUrl) return <ExternalPortal portal={portal} name={name} />;
  return <PortalPlaceholder portal={portal} name={name} />;
};
