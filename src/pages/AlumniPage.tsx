import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronDown, Search } from 'lucide-react';
import { engagementApi } from '@/services/engagementApi';
import { apiService } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { useAccessibility } from '@/context/AccessibilityContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { OfficialContent } from '@/components/content/OfficialContent';
import { BarList, DistinguishedCard, formatCount, SplitBar } from '@/components/alumni/AlumniParts';
import { CheckboxField, TextField } from '@/components/forms/Field';
import { ErrorSummary } from '@/components/forms/ErrorSummary';
import { DemoBanner, EmptyState, ErrorState } from '@/components/ui/Status';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { errorMessage } from '@/utils/errors';
import alumniBanner from '@/assets/images/alumni-banner.jpg';

type Errors = Record<string, string | undefined>;

// The group photo at the top of the official alumni page; it is this page's banner, so it is left out of the photos below.
const BANNER_PHOTO = 'alumnidisplay.jpg';
// Specialities shown before "Show all".
const TOP_SPECIALTIES = 12;
// Room for the sticky main menu when a link on this page scrolls to a section.
const SECTION = 'scroll-mt-20';

/**
 * Alumni engagement (WEB-ACD-6): the official alumni page (its figures, distinguished alumni and full text), a
 * directory of alumni who chose to be listed, and registration.
 */
export const AlumniPage: React.FC = () => {
  const { t } = useAccessibility();
  usePageMeta(t('alumni.title'), t('alumni.intro'));
  const official = useAsync(() => apiService.getAcademics().then((a) => a.alumni), []);
  const overview = useAsync(() => apiService.getAlumniOverview(), []);
  const distinguished = useAsync(() => apiService.getDistinguishedAlumni(), []);
  const [allSpecialties, setAllSpecialties] = useState(false);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const directory = useAsync(() => engagementApi.getAlumni(submittedQuery || undefined), [submittedQuery]);
  const [form, setForm] = useState({ name: '', batch: '', email: '', phone: '', currentRole: '', organisation: '', city: '', specialty: '', showInDirectory: true, consent: false });
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const [reference, setReference] = useState('');
  const set = (key: keyof typeof form) => (value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    const problems: Errors = {};
    if (form.name.trim().length < 2) problems['al-name'] = t('form.error.name');
    if (!/^(19[6-9]\d|20\d{2})$/.test(form.batch)) problems['al-batch'] = t('alumni.error.batch');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) problems['al-email'] = t('form.error.email');
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) problems['al-phone'] = t('form.error.mobile');
    if (!form.consent) problems['al-consent'] = t('alumni.error.consent');
    setErrors(problems);
    if (Object.keys(problems).length) return setAttempt((n) => n + 1);
    try {
      const { reference: ref } = await engagementApi.registerAlumnus({
        name: form.name.trim(), batch: form.batch, email: form.email.trim(), phone: form.phone || undefined,
        currentRole: form.currentRole.trim() || undefined, organisation: form.organisation.trim() || undefined,
        city: form.city.trim() || undefined, specialty: form.specialty.trim() || undefined, showInDirectory: form.showInDirectory,
      });
      setReference(ref);
      directory.reload();
    } catch (err) {
      setErrors({ 'al-name': errorMessage(err, t('common.service_error')) });
      setAttempt((n) => n + 1);
    }
  };

  // The official page's photos are the banner and the distinguished alumni's portraits, both shown on their own.
  const portraits = new Set((distinguished.data ?? []).map((a) => a.photo));
  const officialPage = official.data && {
    ...official.data,
    images: official.data.images.filter((im) => !im.url.endsWith(BANNER_PHOTO) && !portraits.has(im.url)),
  };
  const o = overview.data;
  const specialties = o ? (allSpecialties ? o.specialties : o.specialties.slice(0, TOP_SPECIALTIES)) : [];
  const onThisPage: [string, string][] = [
    ['alumni-distinguished', t('alumni.distinguished')],
    ['alumni-careers', t('alumni.careers')],
    ['alumni-world', t('alumni.world')],
    ['alumni-connect', t('alumni.connect')],
  ];
  const loading = (error: unknown, reload: () => void, rows = 3) => (error ? <ErrorState onRetry={reload} /> : <SkeletonRows count={rows} />);

  return (
    <div className="pb-12">
      {/* Banner: the alumni group photo, darker on the left where the text is. */}
      <section aria-labelledby="alumni-title" className="relative isolate overflow-hidden border-b-4 border-amber-500 bg-brand-navy text-white">
        <img src={alumniBanner} alt="" width={1557} height={739} fetchPriority="high" className="absolute inset-0 -z-10 h-full w-full object-cover object-[center_40%]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-brand-navy/80 sm:bg-transparent sm:bg-gradient-to-r sm:from-brand-navy/95 sm:via-brand-navy/70 sm:to-brand-navy/20" />
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20 lg:py-24">
          <div className="max-w-xl space-y-4">
            <p className="text-xs font-bold tracking-widest text-amber-300">{t('alumni.eyebrow')}</p>
            <h1 id="alumni-title" className="font-serif text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">{t('alumni.title')}</h1>
            <p className="text-sm leading-relaxed text-slate-100 sm:text-base">{t('alumni.intro')}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href="#alumni-distinguished" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-amber-500 px-4 text-sm font-bold text-slate-900 hover:bg-amber-400">
                {t('alumni.distinguished')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="#alumni-register" className="inline-flex min-h-11 items-center rounded-lg border border-white/40 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20">
                {t('alumni.register')}
              </a>
            </div>
          </div>
          {o && (
            <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-3 sm:gap-4">
              {([
                [formatCount(o.enrolled.total), t('alumni.stat.enrolled'), t('alumni.men_women', { men: formatCount(o.enrolled.men), women: formatCount(o.enrolled.women) })],
                [formatCount(o.graduated.total), t('alumni.stat.graduated'), t('alumni.men_women', { men: formatCount(o.graduated.men), women: formatCount(o.graduated.women) })],
                [String(o.firstBatch), t('alumni.stat.first_batch'), ''],
              ] as const).map(([value, label, detail]) => (
                <div key={label} className="flex flex-col-reverse justify-end rounded-xl border border-white/20 bg-brand-navy/60 p-3 backdrop-blur-sm sm:p-4">
                  <dt className="text-xs text-slate-100 sm:text-sm">{label}{detail && <span className="mt-0.5 hidden text-xs text-slate-200 sm:block">{detail}</span>}</dt>
                  <dd className="font-serif text-2xl font-black tabular-nums text-white sm:text-3xl">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <nav aria-label={t('alumni.on_this_page')} className="border-b border-slate-200 bg-white">
        <ul className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 py-3">
          {onThisPage.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="inline-flex min-h-11 items-center rounded-full border border-slate-300 px-4 text-sm font-semibold text-ink hover:border-brand-blue hover:bg-blue-50">{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto max-w-7xl space-y-16 px-4 pt-10">
        {/* Overview: the official page's opening, students today and where they did their post-graduation. */}
        <section aria-labelledby="alumni-official" className={`grid grid-cols-1 gap-8 lg:grid-cols-12 ${SECTION}`}>
          <div className="space-y-4 lg:col-span-7">
            <h2 id="alumni-official" className="font-serif text-2xl font-bold text-ink sm:text-3xl">{t('alumni.mgims_alumni')}</h2>
            {o ? <p className="max-w-prose text-base leading-relaxed text-slate-700 sm:text-lg">{o.lede}</p> : loading(overview.error, overview.reload, 4)}
          </div>
          {o && (
            <div className="space-y-3 self-start rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-5">
              <h3 className="font-serif text-lg font-bold text-ink">{t('alumni.studying')}</h3>
              <ul className="divide-y divide-slate-100 text-sm">
                {o.studying.map((s) => (
                  <li key={s.label} className="flex items-baseline justify-between gap-3 py-2">
                    <span className="text-slate-800">{s.label}</span>
                    <span className="font-bold tabular-nums text-ink">{formatCount(s.count)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section id="alumni-distinguished" aria-labelledby="alumni-distinguished-title" className={`space-y-6 ${SECTION}`}>
          <div className="max-w-3xl space-y-2">
            <h2 id="alumni-distinguished-title" className="font-serif text-2xl font-bold text-ink sm:text-3xl">{t('alumni.distinguished')}</h2>
            <p className="font-semibold text-amber-800">{t('alumni.distinguished_intro')}</p>
            {o && <p className="text-sm leading-relaxed text-slate-700">{o.closing}</p>}
          </div>
          {distinguished.data ? (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {distinguished.data.map((a) => <li key={a.name}><DistinguishedCard alumnus={a} /></li>)}
            </ul>
          ) : loading(distinguished.error, distinguished.reload)}
        </section>

        <section id="alumni-careers" aria-labelledby="alumni-careers-title" className={`grid grid-cols-1 gap-8 lg:grid-cols-12 ${SECTION}`}>
          <div className="space-y-4 lg:col-span-7">
            <div>
              <h2 id="alumni-careers-title" className="font-serif text-2xl font-bold text-ink sm:text-3xl">{t('alumni.careers')}</h2>
              <p className="mt-1 text-sm text-slate-700">{t('alumni.careers_intro')}</p>
            </div>
            {o ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div id="alumni-specialties"><BarList items={specialties} /></div>
                {o.specialties.length > TOP_SPECIALTIES && (
                  <button type="button" aria-expanded={allSpecialties} aria-controls="alumni-specialties" onClick={() => setAllSpecialties((v) => !v)}
                    className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-link underline">
                    {allSpecialties ? t('alumni.show_fewer') : t('alumni.show_all', { count: o.specialties.length })}
                    <ChevronDown className={`h-4 w-4 ${allSpecialties ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                )}
              </div>
            ) : loading(overview.error, overview.reload)}
          </div>
          {o && (
            <div className="space-y-6 lg:col-span-5 lg:pt-16">
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="font-serif text-lg font-bold text-ink">{t('alumni.pg', { from: o.postgraduation.fromClass, to: o.postgraduation.toClass })}</h3>
                <SplitBar parts={[
                  { label: t('alumni.pg.at'), value: o.postgraduation.atMgims, className: 'bg-brand-blue' },
                  { label: t('alumni.pg.elsewhere'), value: o.postgraduation.elsewhere, className: 'bg-amber-500' },
                  { label: t('alumni.pg.none'), value: o.postgraduation.notPursued, className: 'bg-slate-400' },
                ]} />
              </div>
              <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
                <h3 className="font-serif text-lg font-bold text-ink">{t('alumni.other_paths')}</h3>
                <ul className="flex flex-wrap gap-2">
                  {o.otherPaths.map((path) => <li key={path} className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-sm text-slate-800">{path}</li>)}
                </ul>
              </div>
            </div>
          )}
        </section>

        <section id="alumni-world" aria-labelledby="alumni-world-title" className={`space-y-6 ${SECTION}`}>
          <h2 id="alumni-world-title" className="font-serif text-2xl font-bold text-ink sm:text-3xl">{t('alumni.world')}</h2>
          {o ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="font-serif text-lg font-bold text-ink">{t('alumni.countries')}</h3>
                <BarList items={o.countries} />
                {o.countriesNote && <p className="text-sm text-slate-700">{o.countriesNote}</p>}
              </div>
              <div className="space-y-4 self-start rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="font-serif text-lg font-bold text-ink">{t('alumni.states')}</h3>
                <BarList items={o.states} barClass="bg-amber-500" />
              </div>
            </div>
          ) : loading(overview.error, overview.reload)}
          <div className="space-y-3">
            {o && <p className="text-xs text-slate-600">{t('alumni.source')}</p>}
            {officialPage && (
              <details className="group rounded-xl border border-slate-200 bg-slate-50">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-sm font-semibold text-ink">
                  {t('alumni.full_text')}
                  <ChevronDown className="h-4 w-4 shrink-0 group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="border-t border-slate-200 bg-white p-4 sm:p-6">
                  <div className="max-w-prose"><OfficialContent page={officialPage} showHeading={false} /></div>
                </div>
              </details>
            )}
          </div>
        </section>

        <section id="alumni-connect" aria-labelledby="alumni-connect-title" className={`space-y-6 ${SECTION}`}>
          <div>
            <h2 id="alumni-connect-title" className="font-serif text-2xl font-bold text-ink sm:text-3xl">{t('alumni.connect')}</h2>
            <p className="mt-1 text-sm text-slate-700">{t('alumni.connect_intro')}</p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <section aria-labelledby="alumni-directory" className="space-y-4 self-start rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7">
              <h3 id="alumni-directory" className="font-serif text-lg font-bold text-ink">{t('alumni.directory')}</h3>
              <DemoBanner>{t('alumni.demo')}</DemoBanner>
              <form role="search" onSubmit={(e) => { e.preventDefault(); setSubmittedQuery(query.trim()); }} className="flex flex-wrap gap-2">
                <label htmlFor="alumni-search" className="sr-only">{t('alumni.search')}</label>
                <input id="alumni-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('alumni.search_hint')} className="min-h-11 min-w-[12rem] flex-1 rounded-lg border border-slate-300 px-3 text-sm" />
                <button type="submit" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white"><Search className="h-4 w-4" aria-hidden="true" /> {t('alumni.search')}</button>
              </form>
              {directory.error ? <ErrorState onRetry={directory.reload} /> : !directory.data ? <SkeletonRows count={3} /> : directory.data.length === 0 ? (
                <EmptyState title={submittedQuery ? t('alumni.no_match') : t('alumni.empty')}>{t('alumni.empty_body')}</EmptyState>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {directory.data.map((a) => (
                    <li key={a.id} className="rounded-lg border border-slate-200 p-4 text-sm">
                      <p className="font-semibold text-slate-900">{a.name}</p>
                      <p className="text-xs text-slate-600">{t('alumni.batch_of', { batch: a.batch })}{a.specialty ? ` · ${a.specialty}` : ''}</p>
                      {(a.currentRole || a.organisation || a.city) && <p className="text-xs text-slate-700">{[a.currentRole, a.organisation, a.city].filter(Boolean).join(', ')}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section aria-labelledby="alumni-register" className={`space-y-4 rounded-2xl border-2 border-brand-blue/30 bg-white p-5 sm:p-6 lg:col-span-5 ${SECTION}`}>
              <h3 id="alumni-register" className="font-serif text-lg font-bold text-ink">{t('alumni.register')}</h3>
              {reference ? (
                <p role="status" className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> {t('alumni.registered', { ref: reference })}
                </p>
              ) : (
                <form onSubmit={register} noValidate className="space-y-4">
                  <ErrorSummary errors={errors} focusKey={attempt} title={t('common.fix_errors')} />
                  <TextField id="al-name" label={t('form.name')} value={form.name} onChange={set('name')} required autoComplete="name" error={errors['al-name']} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField id="al-batch" label={t('alumni.batch')} value={form.batch} onChange={(v) => set('batch')(v.replace(/\D/g, '').slice(0, 4))} required inputMode="numeric" error={errors['al-batch']} hint={t('alumni.batch_hint')} />
                    <TextField id="al-specialty" label={t('alumni.specialty')} value={form.specialty} onChange={set('specialty')} />
                  </div>
                  <TextField id="al-email" type="email" label={t('form.email')} value={form.email} onChange={set('email')} required autoComplete="email" error={errors['al-email']} />
                  <TextField id="al-phone" type="tel" label={t('alumni.phone')} value={form.phone} onChange={(v) => set('phone')(v.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" error={errors['al-phone']} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField id="al-role" label={t('alumni.role')} value={form.currentRole} onChange={set('currentRole')} />
                    <TextField id="al-org" label={t('alumni.organisation')} value={form.organisation} onChange={set('organisation')} />
                  </div>
                  <TextField id="al-city" label={t('alumni.city')} value={form.city} onChange={set('city')} autoComplete="address-level2" />
                  <CheckboxField id="al-show" checked={form.showInDirectory} onChange={(v) => set('showInDirectory')(v)} label={t('alumni.show')} hint={t('alumni.show_hint')} />
                  <CheckboxField id="al-consent" checked={form.consent} onChange={(v) => set('consent')(v)} required error={errors['al-consent']}
                    label={<>{t('alumni.consent')} <Link to="/policies/privacy-policy" className="font-semibold text-link underline">{t('common.privacy_policy')}</Link>.</>} />
                  <button type="submit" className="min-h-11 w-full rounded-lg bg-brand-blue px-6 text-sm font-bold text-white sm:w-auto">{t('alumni.submit')}</button>
                </form>
              )}
            </section>
          </div>
        </section>
      </div>
    </div>
  );
};
