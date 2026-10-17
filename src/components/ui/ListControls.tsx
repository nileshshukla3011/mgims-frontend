import React from 'react';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { SortOrder } from '@/utils/noticeDates';

/** Date sort toggle + "clear filters" for content-heavy lists (UX4G 6.7.2–6.7.3). */
export const SortAndReset: React.FC<{
  order: SortOrder;
  onOrderChange: (order: SortOrder) => void;
  canReset: boolean;
  onReset: () => void;
}> = ({ order, onOrderChange, canReset, onReset }) => (
  <div className="flex flex-wrap items-center gap-2">
    <button
      type="button"
      onClick={() => onOrderChange(order === 'newest' ? 'oldest' : 'newest')}
      aria-label={`Sorted by date, ${order} first. Change to ${order === 'newest' ? 'oldest' : 'newest'} first`}
      className="min-h-11 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50"
    >
      {order === 'newest' ? <ArrowDownWideNarrow className="h-4 w-4" aria-hidden="true" /> : <ArrowUpNarrowWide className="h-4 w-4" aria-hidden="true" />}
      <span>Date: {order === 'newest' ? 'Newest first' : 'Oldest first'}</span>
    </button>
    {canReset && (
      <button
        type="button"
        onClick={onReset}
        className="min-h-11 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        <span>Clear filters</span>
      </button>
    )}
  </div>
);

/** Page-by-page navigation so large lists are not rendered all at once (UX4G 6.7.1, Design System: Pagination). */
export const Pagination: React.FC<{ page: number; pageCount: number; onChange: (page: number) => void; label: string }> = ({ page, pageCount, onChange, label }) => {
  if (pageCount <= 1) return null;
  const go = (p: number) => {
    onChange(p);
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const pages = Array.from(new Set([1, page - 1, page, page + 1, pageCount])).filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const btn = 'min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg border px-3 text-xs font-semibold';
  return (
    <nav aria-label={label} className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
      <button type="button" onClick={() => go(1)} disabled={page === 1} className={`${btn} border-slate-300 bg-white text-slate-800 disabled:opacity-40`}>First</button>
      <button type="button" onClick={() => go(page - 1)} disabled={page === 1} aria-label="Previous page" className={`${btn} border-slate-300 bg-white text-slate-800 disabled:opacity-40`}>
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      {pages.map((p, i) => (
        <React.Fragment key={p}>
          {i > 0 && p - pages[i - 1] > 1 && <span aria-hidden="true" className="px-1 text-slate-500">…</span>}
          <button
            type="button"
            onClick={() => go(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p}`}
            className={`${btn} ${p === page ? 'border-brand-blue bg-brand-blue text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'}`}
          >
            {p}
          </button>
        </React.Fragment>
      ))}
      <button type="button" onClick={() => go(page + 1)} disabled={page === pageCount} aria-label="Next page" className={`${btn} border-slate-300 bg-white text-slate-800 disabled:opacity-40`}>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" onClick={() => go(pageCount)} disabled={page === pageCount} className={`${btn} border-slate-300 bg-white text-slate-800 disabled:opacity-40`}>Last</button>
    </nav>
  );
};
