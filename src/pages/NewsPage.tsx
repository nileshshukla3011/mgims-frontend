import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Calendar, ChevronRight, Eye } from 'lucide-react';
import { apiService } from '@/services/api';
import { NoticeSummary } from '@/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { sortByDate, SortOrder } from '@/utils/noticeDates';
import { Pagination, SortAndReset } from '@/components/ui/ListControls';
import { paginate } from '@/utils/paginate';
import { SkeletonCards } from '@/components/ui/Skeleton';

const PER_PAGE = 24;
const categories = ['all', 'CME & Academic Events', 'Awards & Honors', 'News & Events'];

export const NewsPage: React.FC = () => {
  usePageMeta('News, CMEs and conferences', 'News, continuing medical education programmes, awards and events at MGIMS Sevagram.');
  const [newsList, setNewsList] = useState<NoticeSummary[]>([]);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    catParam === 'cme' ? 'CME & Academic Events' : catParam === 'awards' ? 'Awards & Honors' : 'all',
  );
  const [order, setOrder] = useState<SortOrder>('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getNotices()
      .then((data) => setNewsList(data.filter((d) => categories.includes(d.category))))
      .catch((err) => console.error('Error fetching news:', err))
      .finally(() => setLoading(false));
  }, []);

  const q = search.toLowerCase();
  const filtered = sortByDate(
    newsList.filter((item) =>
      (selectedCategory === 'all' || item.category === selectedCategory) &&
      (item.title.toLowerCase().includes(q) || item.excerpt.toLowerCase().includes(q)),
    ),
    order,
  );
  const { pageItems, pageCount } = paginate(filtered, page, PER_PAGE);
  const reset = () => { setSearch(''); setSelectedCategory('all'); setPage(1); };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-amber-800 tracking-widest block">Campus chronicle and events</span>
        <h1 className="text-2xl sm:text-3xl font-black text-ink font-serif">News, CMEs and academic conferences</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-prose">
          Continuing medical education programmes, workshops, research milestones and campus achievements.
        </p>
      </div>

      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={selectedCategory === cat}
              onClick={() => { setSelectedCategory(cat); setPage(1); }}
              className={`min-h-11 px-3 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat ? 'bg-brand-blue text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'All updates' : cat}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-3.5" aria-hidden="true" />
            <input
              aria-label="Search news and events"
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search news or workshop topic…"
              className="w-full min-h-11 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-blue outline-hidden font-medium"
            />
          </div>
          <SortAndReset order={order} onOrderChange={(o) => { setOrder(o); setPage(1); }} canReset={Boolean(search) || selectedCategory !== 'all'} onReset={reset} />
        </div>
      </div>

      <p className="text-xs text-slate-600 font-medium" role="status" aria-live="polite">
        Showing <strong className="text-slate-800">{filtered.length}</strong> updates
        {pageCount > 1 && <> — page {page} of {pageCount}</>}
      </p>

      {loading ? (
        <SkeletonCards label="Loading news" />
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageItems.map((item) => (
            <li key={item.id}>
              <Link
                to={`/notices/${item.id}`}
                className="h-full bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-blue hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3 text-xs">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      item.category === 'Awards & Honors' ? 'bg-amber-100 text-amber-900' :
                      item.category === 'CME & Academic Events' ? 'bg-purple-100 text-purple-900' :
                      'bg-blue-100 text-blue-900'
                    }`}>
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-600 font-mono inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" aria-hidden="true" /> {item.date}
                    </span>
                  </div>
                  <h2 className="font-bold text-sm text-ink group-hover:text-link mb-2 leading-snug">{item.title}</h2>
                  {item.excerpt && <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">{item.excerpt}</p>}
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  {item.hits ? (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                      <Eye className="w-3 h-3" aria-hidden="true" /> {item.hits} views
                    </span>
                  ) : <span />}
                  <span className="text-link font-bold group-hover:underline inline-flex items-center gap-1">
                    Read article <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={page} pageCount={pageCount} onChange={setPage} label="News pages" />
    </div>
  );
};
