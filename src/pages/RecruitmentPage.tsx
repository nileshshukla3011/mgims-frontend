import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, Search, Calendar } from 'lucide-react';
import { apiService } from '@/services/api';
import { NoticeSummary } from '@/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { sortByDate, SortOrder } from '@/utils/noticeDates';
import { Pagination, SortAndReset } from '@/components/ui/ListControls';
import { paginate } from '@/utils/paginate';
import { SkeletonRows } from '@/components/ui/Skeleton';

type Tab = 'all' | 'faculty' | 'staff' | 'lists';
const PER_PAGE = 20;
const tabs: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All vacancies' },
  { id: 'faculty', label: 'Faculty positions' },
  { id: 'staff', label: 'Hospital and staff posts' },
  { id: 'lists', label: 'Eligible / ineligible lists' },
];

const kind = (title: string): Tab => {
  const t = title.toLowerCase();
  if (t.includes('eligible') || t.includes('shortlist') || t.includes('list of candidate') || t.includes('selected list')) return 'lists';
  if (t.includes('faculty') || t.includes('professor') || t.includes('dean')) return 'faculty';
  return 'staff';
};

export const RecruitmentPage: React.FC = () => {
  usePageMeta('Recruitment and vacancies', 'Faculty and staff vacancies, interview notices and candidate lists at MGIMS Sevagram.');
  const [recruitmentList, setRecruitmentList] = useState<NoticeSummary[]>([]);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(searchParams.get('tab') === 'lists' ? 'lists' : 'all');
  const [order, setOrder] = useState<SortOrder>('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Shortlists are filed under their own category; show them alongside vacancies.
    Promise.all([apiService.getRecruitment(), apiService.getNotices('Eligible/Ineligible List')])
      .then(([jobs, lists]) => setRecruitmentList([...jobs, ...lists]))
      .catch((err) => console.error('Error fetching recruitment:', err))
      .finally(() => setLoading(false));
  }, []);

  const q = search.toLowerCase();
  const filtered = sortByDate(
    recruitmentList.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(q) || item.excerpt.toLowerCase().includes(q);
      return matchesSearch && (activeTab === 'all' || kind(item.title) === activeTab);
    }),
    order,
  );
  const { pageItems, pageCount } = paginate(filtered, page, PER_PAGE);
  const reset = () => { setSearch(''); setActiveTab('all'); setPage(1); };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-700 tracking-widest block">Careers and employment</span>
          <h1 className="text-2xl sm:text-3xl font-black text-ink font-serif">Faculty and staff recruitment</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-prose">
            Employment notices, walk-in interviews, and lists of eligible and shortlisted candidates.
          </p>
        </div>
        <div className="bg-teal-50 text-teal-900 border border-teal-200 px-3.5 py-2 rounded-lg text-xs font-semibold">
          Dean Office Ext: <span className="font-mono font-bold">207</span>
        </div>
      </div>

      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by type">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={activeTab === tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`min-h-11 px-3 rounded-lg text-xs font-semibold transition ${
                activeTab === tab.id ? 'bg-brand-blue text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3.5" aria-hidden="true" />
            <input
              aria-label="Search recruitment notices"
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search job opening by title or department…"
              className="w-full min-h-11 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-blue outline-hidden font-medium"
            />
          </div>
          <SortAndReset order={order} onOrderChange={(o) => { setOrder(o); setPage(1); }} canReset={Boolean(search) || activeTab !== 'all'} onReset={reset} />
        </div>
      </div>

      <p className="text-xs text-slate-600 font-medium" role="status" aria-live="polite">
        Showing <strong className="text-slate-800">{filtered.length}</strong> recruitment notices
        {pageCount > 1 && <> — page {page} of {pageCount}</>}
      </p>

      {loading ? (
        <SkeletonRows label="Loading recruitment notices" />
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="relative overflow-x-auto">
            <table className="w-full text-xs text-left">
              <caption className="sr-only">Recruitment notices, sorted by date ({order} first)</caption>
              <thead className="bg-brand-navy text-white">
                <tr>
                  <th scope="col" className="p-3 font-semibold">Post / advertisement</th>
                  <th scope="col" className="p-3 font-semibold" aria-sort={order === 'newest' ? 'descending' : 'ascending'}>Notification date</th>
                  <th scope="col" className="p-3 font-semibold">Category</th>
                  <th scope="col" className="p-3 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold text-slate-900 max-w-md">
                      <Link to={`/notices/${item.id}`} className="hover:text-link hover:underline block leading-snug">{item.title}</Link>
                      {item.excerpt && <p className="text-[11px] text-slate-600 line-clamp-1 font-normal mt-0.5">{item.excerpt}</p>}
                    </td>
                    <td className="p-3 text-slate-700 font-mono whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-600" aria-hidden="true" />
                        {item.date}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">{item.category}</span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Link to={`/notices/${item.id}`} className="inline-flex min-h-11 items-center gap-1 text-link font-bold hover:underline">
                        <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>View notice<span className="sr-only">: {item.title}</span></span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={setPage} label="Recruitment pages" />
    </div>
  );
};
