import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { CountItem, DistinguishedAlumnus } from '@/types';
import { useAccessibility } from '@/context/AccessibilityContext';
import { mediaUrl } from '@/utils/media';

/** Indian digit grouping (1,792), the same in every language of the site. */
export const formatCount = (n: number) => n.toLocaleString('en-IN');

/** Labelled counts with a bar each, longest first. The numbers are text; the bars are decoration. */
export const BarList: React.FC<{ items: CountItem[]; barClass?: string }> = ({ items, barClass = 'bg-brand-blue' }) => {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-slate-800">{item.label}</span>
            <span className="font-bold tabular-nums text-ink">{formatCount(item.count)}</span>
          </div>
          <div aria-hidden="true" className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${barClass}`} style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

/** One bar split into parts, with a legend that carries the numbers (colour is never the only signal). */
export const SplitBar: React.FC<{ parts: { label: string; value: number; className: string }[] }> = ({ parts }) => {
  const total = parts.reduce((sum, p) => sum + p.value, 0) || 1;
  return (
    <div>
      <div aria-hidden="true" className="flex h-3 overflow-hidden rounded-full bg-slate-100">
        {parts.map((p) => <div key={p.label} className={p.className} style={{ width: `${(p.value / total) * 100}%` }} />)}
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-800"><span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${p.className}`} />{p.label}</span>
            <span className="font-bold tabular-nums text-ink">{formatCount(p.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** A distinguished alumnus: the whole card opens their profile page. */
export const DistinguishedCard: React.FC<{ alumnus: DistinguishedAlumnus }> = ({ alumnus: a }) => {
  const { t } = useAccessibility();
  return (
    <Link
      to={`/alumni/${encodeURIComponent(a.slug)}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-brand-blue hover:shadow-lg motion-safe:transition motion-safe:hover:-translate-y-0.5"
    >
      <div className="aspect-[4/5] overflow-hidden bg-slate-100">
        {/* The name is right below, so the portrait needs no text alternative of its own. */}
        {a.photo && <img src={mediaUrl(a.photo)} alt="" width={280} height={350} loading="lazy" className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105" />}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="font-serif text-sm font-bold text-ink group-hover:text-link">{a.name}</h3>
        <p className="text-xs leading-snug text-slate-600">{a.role}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold text-link">
          {t('alumni.read_profile')} <ArrowRight className="h-3.5 w-3.5 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
};
