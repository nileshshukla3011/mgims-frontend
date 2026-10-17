import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Content that could not be traced to the official MGIMS website (hand-written in an earlier design) is kept for MGIMS
 * to confirm, but only shown when the site is built with VITE_SHOW_REVIEW_NOTES=true. Once MGIMS confirms an item,
 * remove its <ReviewContent> wrapper; if MGIMS rejects it, delete the item. See docs/CONTENT_REVIEW.md.
 */
export const SHOW_REVIEW_CONTENT = import.meta.env.VITE_SHOW_REVIEW_NOTES === 'true';

export const ReviewContent: React.FC<{ note?: string; children: React.ReactNode }> = ({ note, children }) => {
  if (!SHOW_REVIEW_CONTENT) return null;
  return (
    <div className="space-y-4">
      <div role="note" className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs sm:text-sm text-slate-800">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-bold">For MGIMS review — hidden on the live site until confirmed</p>
          <p>{note ?? 'This text is not on the official MGIMS website.'}</p>
        </div>
      </div>
      {children}
    </div>
  );
};
