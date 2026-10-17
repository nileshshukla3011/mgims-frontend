import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Calendar } from 'lucide-react';
import { apiService } from '@/services/api';
import { NoticeSummary } from '@/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { sortByDate, SortOrder } from '@/utils/noticeDates';
import { Pagination, SortAndReset } from '@/components/ui/ListControls';
import { paginate } from '@/utils/paginate';
import { SkeletonRows } from '@/components/ui/Skeleton';

const PER_PAGE = 20;

export const TendersPage: React.FC = () => {
  usePageMeta('Tenders and quotations', 'Tender and quotation notices of MGIMS Sevagram and Kasturba Hospital.');
  const [tenders, setTenders] = useState<NoticeSummary[]>([]);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState<SortOrder>('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getTenders()
      .then(setTenders)
      .catch((err) => console.error('Error fetching tenders:', err))
      .finally(() => setLoading(false));
  }, []);

  const q = search.toLowerCase();
  const filtered = sortByDate(
    tenders.filter((t) => t.title.toLowerCase().includes(q) || t.excerpt.toLowerCase().includes(q)),
    order,
  );
  const { pageItems, pageCount } = paginate(filtered, page, PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-purple-700 tracking-widest block">e-Procurement and contracts</span>
          <h1 className="text-2xl sm:text-3xl font-black text-ink font-serif">Tenders and quotations</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-prose">
            Procurement notices for medical equipment, pharmaceuticals, hospital consumables and civil works.
          </p>
        </div>
        <div className="bg-purple-50 text-purple-900 border border-purple-200 px-3.5 py-2 rounded-lg text-xs font-semibold">
          Central Store Ext: <span className="font-mono font-bold">242</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3.5" aria-hidden="true" />
          <input
            aria-label="Search tender notices"
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search tender notice by title, item, or number…"
            className="w-full min-h-11 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-blue outline-hidden font-medium"
          />
        </div>
        <SortAndReset order={order} onOrderChange={(o) => { setOrder(o); setPage(1); }} canReset={Boolean(search)} onReset={() => { setSearch(''); setPage(1); }} />
      </div>

      <p className="text-xs text-slate-600 font-medium" role="status" aria-live="polite">
        Showing <strong className="text-slate-800">{filtered.length}</strong> tenders
        {pageCount > 1 && <> — page {page} of {pageCount}</>}
      </p>

      {loading ? (
        <SkeletonRows label="Loading tender notices" />
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="relative overflow-x-auto">
            <table className="w-full text-xs text-left">
              <caption className="sr-only">Tender notices, sorted by date ({order} first)</caption>
              <thead className="bg-brand-navy text-white">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Tender notice</th>
                  <th scope="col" className="p-3 font-semibold" aria-sort={order === 'newest' ? 'descending' : 'ascending'}>Date of notice</th>
                  <th scope="col" className="p-3 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageItems.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold text-slate-900 max-w-md">
                      <Link to={`/notices/${t.id}`} className="hover:text-link hover:underline block leading-snug">{t.title}</Link>
                      {t.excerpt && <p className="text-[11px] text-slate-600 line-clamp-1 font-normal mt-0.5">{t.excerpt}</p>}
                    </td>
                    <td className="p-3 text-slate-700 font-mono whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-600" aria-hidden="true" />
                        {t.date}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Link to={`/notices/${t.id}`} className="inline-flex min-h-11 items-center gap-1 text-link font-bold hover:underline">
                        <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>View notice<span className="sr-only">: {t.title}</span></span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={setPage} label="Tender pages" />
    </div>
  );
};
