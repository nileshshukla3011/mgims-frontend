import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Building2, User, FileText, Mic, MicOff, LayoutList, Microscope } from 'lucide-react';
import { apiService } from '@/services/api';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { useAccessibility } from '@/context/AccessibilityContext';
import { SearchResults } from '@/types';
import { SkeletonRows } from '@/components/ui/Skeleton';

type Filter = 'all' | 'pages' | 'departments' | 'faculty' | 'research' | 'notices';
const EMPTY: SearchResults = { departments: [], faculty: [], notices: [], pages: [], research: [] };
const RESEARCH_KIND: Record<string, string> = {
  thesis: 'Thesis',
  'student-research': 'Student research',
  publication: 'Publication',
  'funded-project': 'Funded project',
  presentation: 'Presentation',
};

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const filter = (searchParams.get('type') as Filter) || 'all';
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const { language } = useAccessibility();
  const navigate = useNavigate();
  usePageMeta(q ? `Search results for “${q}”` : 'Search', 'Search pages, departments, faculty, research and notices of MGIMS Sevagram.');

  // Suggestions while typing (WEB-MLS-2), as an ARIA combobox.
  const [suggestions, setSuggestions] = useState<{ title: string; url: string; type: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [active, setActive] = useState(-1);
  const typedRef = useRef(false);

  const runSearch = useCallback((text: string) => {
    setShowSuggestions(false);
    setSearchParams(text.trim() ? { q: text.trim() } : {});
  }, [setSearchParams]);
  const voice = useVoiceSearch(language, (text) => { setQuery(text); runSearch(text); });

  useEffect(() => {
    setQuery(q);
    if (!q.trim()) { setResults(EMPTY); return; }
    setLoading(true);
    apiService.searchAll(q)
      .then(setResults)
      .catch((err) => console.error('Search error:', err))
      .finally(() => setLoading(false));
  }, [q]);

  useEffect(() => {
    if (!typedRef.current || query.trim().length < 2 || query.trim() === q) return;
    const timer = window.setTimeout(() => {
      apiService.suggest(query).then((list) => {
        setSuggestions(list);
        setActive(-1);
        setShowSuggestions(list.length > 0);
      }).catch(() => setSuggestions([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, q]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % suggestions.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1)); }
    else if (e.key === 'Escape') { setShowSuggestions(false); setActive(-1); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); setShowSuggestions(false); navigate(suggestions[active].url); }
  };

  const research = results.research ?? [];
  const counts: Record<Filter, number> = {
    all: results.departments.length + results.faculty.length + results.notices.length + results.pages.length + research.length,
    pages: results.pages.length,
    departments: results.departments.length,
    faculty: results.faculty.length,
    research: research.length,
    notices: results.notices.length,
  };
  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All results' },
    { id: 'pages', label: 'Pages' },
    { id: 'departments', label: 'Departments' },
    { id: 'faculty', label: 'Faculty' },
    { id: 'research', label: 'Research' },
    { id: 'notices', label: 'Notices' },
  ];
  const showType = (t: Filter) => (filter === 'all' || filter === t) && counts[t] > 0;
  const setFilter = (t: Filter) => setSearchParams(t === 'all' ? { q } : { q, type: t });
  const listOpen = showSuggestions && suggestions.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-amber-800 tracking-widest block">Search the whole portal</span>
        <h1 className="text-2xl sm:text-3xl font-black text-ink font-serif">{q ? <>Search results for “{q}”</> : 'Search'}</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-prose">
          Searches every section: hospital, about, academics, research and community pages, departments, faculty, theses and
          publications, and notices. Results are ranked by relevance.
        </p>
      </div>

      <form role="search" onSubmit={(e) => { e.preventDefault(); runSearch(query); }} className="flex flex-wrap gap-2 max-w-2xl">
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" aria-hidden="true" />
          <input
            aria-label="Search the portal"
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={listOpen}
            aria-controls="search-suggestions"
            aria-activedescendant={listOpen && active >= 0 ? `suggestion-${active}` : undefined}
            autoComplete="off"
            value={query}
            onChange={(e) => { typedRef.current = true; setQuery(e.target.value); }}
            onKeyDown={onKeyDown}
            onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search departments, doctors, services, theses, tenders…"
            className="w-full min-h-11 pl-10 pr-4 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-brand-blue outline-hidden font-medium"
          />
          <ul
            id="search-suggestions"
            role="listbox"
            aria-label="Suggestions"
            hidden={!listOpen}
            className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-lg border border-slate-300 bg-white py-1 shadow-xl"
          >
            {suggestions.map((s, i) => (
              <li
                key={`${s.url}-${i}`}
                id={`suggestion-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => { e.preventDefault(); setShowSuggestions(false); navigate(s.url); }}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm ${i === active ? 'bg-blue-50 text-ink' : 'text-slate-800 hover:bg-slate-50'}`}
              >
                <span className="line-clamp-1">{s.title}</span>
                <span className="shrink-0 text-[11px] font-semibold text-slate-600">{s.type}</span>
              </li>
            ))}
          </ul>
        </div>
        {voice.supported && (
          <button
            type="button"
            onClick={voice.toggle}
            aria-pressed={voice.listening}
            aria-label={voice.listening ? 'Stop voice search' : 'Search by voice'}
            className={`min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg border ${voice.listening ? 'border-red-700 bg-red-50 text-red-800' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'}`}
          >
            {voice.listening ? <MicOff className="h-5 w-5" aria-hidden="true" /> : <Mic className="h-5 w-5" aria-hidden="true" />}
          </button>
        )}
        <button type="submit" className="min-h-11 bg-brand-blue hover:bg-blue-900 text-white font-bold text-sm px-5 rounded-lg transition">
          Search
        </button>
      </form>
      {listOpen && <p className="sr-only" role="status">{suggestions.length} suggestions. Use the up and down arrow keys to choose one.</p>}
      {voice.listening && <p role="status" className="text-sm text-slate-700">Listening… speak your search now.</p>}
      {voice.error && <p role="alert" className="text-sm font-semibold text-red-700">{voice.error}</p>}

      {q && !loading && counts.all > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter results by type">
          {filters.filter((f) => f.id === 'all' || counts[f.id] > 0).map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`min-h-11 px-3 rounded-lg text-xs font-semibold ${filter === f.id ? 'bg-brand-blue text-white' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'}`}
            >
              {f.label} ({counts[f.id]})
            </button>
          ))}
        </div>
      )}

      <div aria-live="polite">
        {loading && <SkeletonRows label="Searching" />}
        {!loading && q && counts.all === 0 && (
          <p className="text-center py-12 text-slate-600 text-sm">
            No results for “{q}”. Try a shorter word, such as a department name, “tender” or “charges”.
          </p>
        )}
        {!loading && counts.all > 0 && (
          <p className="text-xs text-slate-600 font-medium mb-6">{counts[filter]} results</p>
        )}
      </div>

      {!loading && (
        <div className="space-y-8">
          {showType('pages') && (
            <section aria-labelledby="results-pages" className="space-y-3">
              <h2 id="results-pages" className="text-sm font-bold text-ink flex items-center gap-1.5">
                <LayoutList className="w-4 h-4 text-link" aria-hidden="true" /> Pages ({counts.pages})
              </h2>
              <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                {results.pages.map((p) => (
                  <li key={p.url}>
                    <Link to={p.url} className="p-3.5 hover:bg-slate-50 block transition">
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 mr-2">{p.category}</span>
                      <span className="font-bold text-sm text-slate-900">{p.title}</span>
                      {p.snippet && <span className="block text-slate-600 line-clamp-1 mt-1">{p.snippet}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {showType('departments') && (
            <section aria-labelledby="results-departments" className="space-y-3">
              <h2 id="results-departments" className="text-sm font-bold text-ink flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-link" aria-hidden="true" /> Departments ({counts.departments})
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.departments.map((d) => (
                  <li key={d.id}>
                    <Link to={`/departments/${d.id}`} className="p-4 rounded-xl border border-slate-200 hover:border-brand-blue transition bg-white block h-full">
                      <h3 className="font-bold text-sm text-ink">{d.name}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">{d.overview}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {showType('faculty') && (
            <section aria-labelledby="results-faculty" className="space-y-3">
              <h2 id="results-faculty" className="text-sm font-bold text-ink flex items-center gap-1.5">
                <User className="w-4 h-4 text-link" aria-hidden="true" /> Faculty ({counts.faculty})
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.faculty.map((f) => (
                  <li key={f.id}>
                    <Link to={`/faculty?select=${f.slug}`} className="p-4 rounded-xl border border-slate-200 hover:border-brand-blue transition bg-white block h-full">
                      <h3 className="font-bold text-sm text-ink">{f.name}</h3>
                      <p className="text-xs text-slate-600">{f.designation} — {f.department}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {showType('research') && (
            <section aria-labelledby="results-research" className="space-y-3">
              <h2 id="results-research" className="text-sm font-bold text-ink flex items-center gap-1.5">
                <Microscope className="w-4 h-4 text-link" aria-hidden="true" /> Research ({counts.research})
              </h2>
              <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                {research.map((r) => (
                  <li key={r.id}>
                    <Link to={r.url} className="p-3.5 hover:bg-slate-50 block transition">
                      <span className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800">{RESEARCH_KIND[r.kind] ?? r.kind}</span>
                        <span className="text-slate-600 text-[11px]">{[r.year, r.department].filter(Boolean).join(' · ')}</span>
                      </span>
                      <span className="font-bold text-sm text-slate-900">{r.title}</span>
                      {r.people && <span className="block text-slate-600 line-clamp-1 mt-1">{r.people}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {showType('notices') && (
            <section aria-labelledby="results-notices" className="space-y-3">
              <h2 id="results-notices" className="text-sm font-bold text-ink flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-link" aria-hidden="true" /> Notices ({counts.notices})
              </h2>
              <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                {results.notices.map((n) => (
                  <li key={n.id}>
                    <Link to={`/notices/${n.id}`} className="p-3.5 hover:bg-slate-50 block transition">
                      <span className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">{n.category}</span>
                        <span className="text-slate-600 font-mono text-[11px]">{n.date}</span>
                      </span>
                      <span className="font-bold text-sm text-slate-900">{n.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
