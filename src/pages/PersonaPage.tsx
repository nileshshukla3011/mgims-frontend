import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, CreditCard, PhoneCall } from 'lucide-react';
import { PERSONAS, PersonaId } from '@/config/personas';
import { apiService } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { useAccessibility } from '@/context/AccessibilityContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { sortByDate } from '@/utils/noticeDates';
import { RegulatoryUpdates } from '@/components/dynamic/RegulatoryUpdates';
import { PortalLink } from '@/components/navigation/PortalLink';

/** Latest notices of one category, for a persona page (WEB-DYN-3: notices placed on the relevant zones). */
const LatestNotices: React.FC<{ category: string }> = ({ category }) => {
  const { t } = useAccessibility();
  const notices = useAsync(() => apiService.getNotices(category).then((n) => sortByDate(n, 'newest').slice(0, 5)), [category]);
  if (!notices.data?.length) return null;
  return (
    <section aria-labelledby="hub-notices" className="space-y-2 rounded-xl border border-slate-200 bg-white p-5">
      <h2 id="hub-notices" className="font-serif text-lg font-bold text-ink">{t('hub.latest', { category })}</h2>
      <ul className="divide-y divide-slate-100 text-sm">
        {notices.data.map((n) => (
          <li key={n.id} className="py-2">
            <Link to={`/notices/${n.id}`} className="font-semibold text-link hover:underline">{n.title}</Link>
            <span className="block text-xs text-slate-600">{n.date}</span>
          </li>
        ))}
      </ul>
      <Link to="/news" className="inline-flex min-h-11 items-center text-sm font-semibold text-link underline">{t('hub.all_notices')}</Link>
    </section>
  );
};

/** A landing page for one kind of visitor, with the tasks they come for (WEB-IA-3, SRS 4.7). */
export const PersonaPage: React.FC<{ persona: PersonaId }> = ({ persona }) => {
  const { t } = useAccessibility();
  const config = PERSONAS.find((p) => p.id === persona);
  usePageMeta(t(`hub.${persona}.title`), t(`hub.${persona}.intro`));
  if (!config) return <Navigate to="/" replace />;
  const Icon = config.icon;
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <div className="flex items-start gap-4 border-b border-slate-200 pb-5">
        <span aria-hidden="true" className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-link sm:flex">
          <Icon className="h-7 w-7" />
        </span>
        <div>
          <p className="text-xs font-bold tracking-widest text-amber-800">{t('hub.eyebrow')}</p>
          <h1 className="font-serif text-2xl font-black text-ink sm:text-3xl">{t(`hub.${persona}.title`)}</h1>
          <p className="mt-1 max-w-prose text-sm text-slate-700">{t(`hub.${persona}.intro`)}</p>
        </div>
      </div>

      {config.emergency && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-900">{t('hub.emergency')}</p>
          <a href="tel:07152284341" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-bold text-white hover:bg-red-800">
            <PhoneCall className="h-4 w-4" aria-hidden="true" /> 07152-284341
          </a>
        </div>
      )}

      <section aria-labelledby="hub-tasks">
        <h2 id="hub-tasks" className="mb-3 font-serif text-lg font-bold text-ink">{t('hub.what_to_do')}</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {config.tasks.map(({ to, key, icon: TaskIcon }) => (
            <li key={to}>
              <Link to={to} className="group flex min-h-16 h-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-blue hover:shadow-md">
                <TaskIcon className="h-5 w-5 shrink-0 text-link" aria-hidden="true" />
                <span className="flex-1 text-sm font-semibold text-ink">{t(`hub.task.${key}`)}</span>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {config.regulatory && <RegulatoryUpdates source="NMC" />}
      {config.noticeCategory && <LatestNotices category={config.noticeCategory} />}

      <nav aria-label={t('hub.other')} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="mb-2 text-sm font-bold text-ink">{t('hub.other')}</h2>
        <ul className="flex flex-wrap gap-2">
          {PERSONAS.filter((p) => p.id !== persona).map((p) => (
            <li key={p.id}>
              <Link to={`/${p.id}`} className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-link hover:bg-slate-50">{t(`hub.${p.id}.short`)}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

const CARD = 'flex h-full min-h-24 flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-blue hover:shadow-md';

/**
 * "I am a…" strip on the home page. Patients and students go straight to their portal, everyone else to their persona
 * page. The Fee Portal has its own button, so fee payment can be handed to the fee module (src/config/portals.ts).
 */
export const PersonaSelector: React.FC = () => {
  const { t } = useAccessibility();
  return (
    <section aria-labelledby="persona-heading" className="mx-auto max-w-7xl px-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="persona-heading" className="font-serif text-xl font-black text-ink sm:text-2xl">{t('hub.i_am')}</h2>
        <PortalLink portal="fee" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-bold text-slate-900 shadow-md transition hover:bg-amber-600">
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          {t('hub.task.fee_portal')}
        </PortalLink>
      </div>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {PERSONAS.map(({ id, icon: Icon, portal }) => {
          const content = (
            <>
              <Icon className="h-6 w-6 text-link" aria-hidden="true" />
              <span className="text-sm font-bold text-ink">{t(`hub.${id}.short`)}</span>
              <span className="text-xs text-slate-600">{t(`hub.${id}.teaser`)}</span>
              {portal && (
                <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-link">
                  {t(`portal.${portal}.title`)} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              )}
            </>
          );
          return (
            <li key={id}>
              {portal ? <PortalLink portal={portal} className={CARD}>{content}</PortalLink> : <Link to={`/${id}`} className={CARD}>{content}</Link>}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
