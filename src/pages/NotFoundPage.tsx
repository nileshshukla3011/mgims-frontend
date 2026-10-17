import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PORTALS } from '@/config/portals';
import { Search } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { usePageMeta } from '@/hooks/usePageMeta';

/**
 * Custom "page not found" page (GIGW 3.0): says plainly that the address does not exist, offers search with the
 * address words already filled in, and the most-used destinations. Unknown routes no longer jump to the home page.
 */
export const NotFoundPage: React.FC = () => {
  const { t } = useAccessibility();
  const location = useLocation();
  const navigate = useNavigate();
  usePageMeta(t('nf.title'), undefined, { noindex: true });
  // Words from the old address are a good first search ("/hospital/hospital-charges" → "hospital charges").
  const guess = decodeURIComponent(location.pathname)
    .replace(/index\.php/gi, ' ')
    .split(/[/\-_.?=&]+/)
    .filter((w) => w.length > 2 && !/^\d+$/.test(w))
    .slice(-3)
    .join(' ');
  const [query, setQuery] = useState(guess);
  const links = [
    { to: '/', label: t('home') },
    { to: '/hospital/opd', label: t('nf.opd') },
    { to: PORTALS.patient.path, label: t('portal.patient.title') },
    { to: '/academics/admissions', label: t('nf.admissions') },
    { to: '/tenders', label: t('tenders') },
    { to: '/recruitment', label: t('recruitment') },
    { to: '/contact', label: t('contact') },
    { to: '/sitemap', label: t('sitemap.title') },
  ];
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <div className="space-y-2">
        <p className="text-xs font-bold tracking-widest text-amber-800">{t('nf.code')}</p>
        <h1 className="font-serif text-3xl font-black text-ink">{t('nf.title')}</h1>
        <p className="text-sm text-slate-700">{t('nf.body')}</p>
        <p className="break-all font-mono text-xs text-slate-600">{location.pathname}</p>
      </div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }}
        className="flex flex-wrap gap-2"
      >
        <label htmlFor="nf-search" className="sr-only">{t('search')}</label>
        <input id="nf-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-11 min-w-[12rem] flex-1 rounded-lg border border-slate-300 px-3 text-sm" />
        <button type="submit" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-brand-blue px-5 text-sm font-bold text-white">
          <Search className="h-4 w-4" aria-hidden="true" /> {t('search')}
        </button>
      </form>
      <nav aria-label={t('nf.popular')}>
        <h2 className="mb-2 text-sm font-bold text-ink">{t('nf.popular')}</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {links.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="flex min-h-11 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-link hover:bg-slate-50">{l.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
