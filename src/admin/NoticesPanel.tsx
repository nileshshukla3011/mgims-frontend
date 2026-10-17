import React, { useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { NoticeSummary } from '@/types';
import { noticeWindow } from '@/utils/noticeDates';
import { formatDateTime } from '@/utils/format';

const pill = 'text-[10px] px-2 py-0.5 rounded-full';

/** Where a notice stands: scheduled, removed from the website (expired), active or archived (WEB-CMS-6). */
const NoticeStatus: React.FC<{ notice: NoticeSummary }> = ({ notice }) => {
  const state = noticeWindow(notice);
  if (state === 'scheduled') return <span className={`${pill} font-bold bg-amber-100 text-amber-900`}>Scheduled · {formatDateTime(notice.publish_at)}</span>;
  if (state === 'expired') return <span className={`${pill} font-semibold bg-slate-100 text-slate-600`}>Removed from website</span>;
  return notice.is_active
    ? <span className={`${pill} font-bold bg-emerald-100 text-emerald-800`}>Active</span>
    : <span className={`${pill} font-semibold bg-slate-100 text-slate-600`}>Archived</span>;
};

/** Notices, tenders or vacancies: filter, add and delete. */
export const NoticesPanel: React.FC<{ items: NoticeSummary[]; onAdd: () => void; onDelete: (id: number) => void }> = ({ items, onAdd, onDelete }) => {
  const [filter, setFilter] = useState('');
  const shown = items.filter((n) => n.title.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" aria-hidden="true" />
          <input
            aria-label="Filter entries"
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter entries..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-blue outline-hidden font-medium"
          />
        </div>
        <button onClick={onAdd} className="bg-brand-blue hover:bg-blue-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition">
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Add new entry</span>
        </button>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
        <div className="relative overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-navy text-white">
              <tr>
                <th className="p-3 font-semibold">Title</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.slice(0, 50).map((n) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 max-w-md">{n.title}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{n.category}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-600">{n.date}</td>
                  <td className="p-3"><NoticeStatus notice={n} /></td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onDelete(n.id)}
                      aria-label={`Delete ${n.title}`}
                      className="min-h-11 min-w-11 inline-flex items-center justify-center text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
