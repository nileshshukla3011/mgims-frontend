import React from 'react';

/** Placeholder blocks shown while content loads (UX4G 6.11.1 skeleton screens). */
export const SkeletonCards: React.FC<{ count?: number; label?: string }> = ({ count = 6, label = 'Loading content' }) => (
  <div role="status" aria-live="polite" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <span className="sr-only">{label}…</span>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} aria-hidden="true" className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <div className="h-3 w-1/3 rounded bg-slate-200" />
        <div className="h-4 w-4/5 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-2/3 rounded bg-slate-100" />
      </div>
    ))}
  </div>
);

export const SkeletonRows: React.FC<{ count?: number; label?: string }> = ({ count = 8, label = 'Loading content' }) => (
  <div role="status" aria-live="polite" className="space-y-2">
    <span className="sr-only">{label}…</span>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} aria-hidden="true" className="animate-pulse h-12 rounded-lg border border-slate-200 bg-slate-100" />
    ))}
  </div>
);
