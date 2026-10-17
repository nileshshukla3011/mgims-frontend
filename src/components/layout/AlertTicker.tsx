import React, { useEffect, useState } from 'react';
import { Bell, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '@/services/api';
import { NoticeSummary } from '@/types';
import { sortByDate } from '@/utils/noticeDates';

const DISMISS_KEY = 'mgims-ticker-dismissed';

/** "Latest notices" strip built from the newest official notices — never hand-written alerts (UX4G 6.10.9). */
export const AlertTicker: React.FC = () => {
  const [latest, setLatest] = useState<NoticeSummary[]>([]);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    apiService.getNotices()
      .then((all) => setLatest(sortByDate(all, 'newest').slice(0, 5)))
      .catch((err) => console.error('Error loading latest notices:', err));
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Hidden for this page view only.
    }
  };

  if (dismissed || latest.length === 0) return null;

  return (
    <section aria-label="Latest notices" className="bg-amber-500 text-slate-900 border-y border-amber-600/40 text-xs py-1 px-4 font-medium">
      <div className="max-w-7xl mx-auto w-full flex items-center gap-3">
        <Link to="/news" className="flex items-center gap-1.5 bg-brand-navy text-white px-2 py-1 rounded text-[11px] font-bold shrink-0 tracking-wide">
          <Bell className="w-3 h-3 text-amber-400" aria-hidden="true" />
          <span>Latest notices</span>
        </Link>

        <ul className="flex-1 overflow-x-auto whitespace-nowrap flex items-center gap-6">
          {latest.map((n) => (
            <li key={n.id}>
              <Link to={`/notices/${n.id}`} className="inline-flex min-h-11 items-center gap-1 text-slate-900 hover:text-black font-semibold hover:underline">
                <span>{n.title}</span>
                <span className="font-normal">({n.date})</span>
                <ChevronRight className="w-3 h-3 text-slate-800" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide latest notices"
          className="shrink-0 inline-flex min-h-11 min-w-11 items-center justify-center rounded text-slate-900 hover:bg-amber-600/30"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
