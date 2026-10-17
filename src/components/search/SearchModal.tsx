import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Building2, User, FileText, ArrowRight, Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { apiService } from '@/services/api';
import { SearchResults } from '@/types';
import { useAccessibility } from '@/context/AccessibilityContext';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ departments: [], faculty: [], notices: [], pages: [] });
  const { language } = useAccessibility();
  const voice = useVoiceSearch(language, setQuery);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const handleClose = useCallback(() => {
    onClose();
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  }, [onClose]);

  useEffect(() => {
    const appRoot = document.getElementById('root');
    const wasInert = appRoot?.inert ?? false;
    if (isOpen) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      if (appRoot) appRoot.inert = true;
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) handleClose();
        else {
          // open search
          const trigger = document.querySelector('[aria-label="Open portal search"]') as HTMLElement;
          trigger?.click();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
      if (e.key === 'Tab' && isOpen && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (appRoot) appRoot.inert = wasInert;
    };
  }, [isOpen, onClose, handleClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ departments: [], faculty: [], notices: [], pages: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiService.searchAll(query);
        setResults(res);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
    requestAnimationFrame(() => document.getElementById('main-content')?.focus());
  };

  const totalResults = results.departments.length + results.faculty.length + results.notices.length + results.pages.length;

  return createPortal((
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs" onMouseDown={(event) => { if (event.target === event.currentTarget) handleClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="search-dialog-title" className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-300 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-link" aria-hidden="true" />
          <h2 id="search-dialog-title" className="sr-only">Search MGIMS</h2>
          <label className="sr-only" htmlFor="portal-search">Search departments, faculty, notices and pages</label>
          <input
            ref={inputRef}
            id="portal-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the whole portal: departments, doctors, services, tenders…"
            className="w-full min-h-11 text-base bg-transparent text-slate-800 focus:outline-hidden placeholder-slate-500 font-medium"
          />
          {voice.supported && (
            <button type="button" onClick={voice.toggle} aria-pressed={voice.listening} aria-label={voice.listening ? 'Stop voice search' : 'Search by voice'}
              className={`min-h-11 min-w-11 inline-flex items-center justify-center rounded ${voice.listening ? 'bg-red-100 text-red-800' : 'text-slate-700 hover:bg-slate-200'}`}>
              {voice.listening ? <MicOff className="w-5 h-5" aria-hidden="true" /> : <Mic className="w-5 h-5" aria-hidden="true" />}
            </button>
          )}
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="min-h-11 min-w-11 inline-flex items-center justify-center rounded text-slate-600 hover:bg-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close search dialog"
            className="min-h-11 min-w-11 text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 px-2 rounded font-medium"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-5 flex-1" aria-live="polite">
          {voice.listening && <p role="status" className="text-sm text-slate-700">Listening… speak your search now.</p>}
          {voice.error && <p role="alert" className="text-sm font-semibold text-red-700">{voice.error}</p>}
          {isSearching && (
            <div className="text-center py-6 text-slate-600 text-sm" role="status">Searching…</div>
          )}
          {!isSearching && totalResults > 0 && (
            <button type="button" onClick={() => handleSelect(`/search?q=${encodeURIComponent(query.trim())}`)}
              className="min-h-11 w-full rounded-lg border border-brand-blue px-3 text-sm font-bold text-link hover:bg-blue-50">
              See all results with filters
            </button>
          )}

          {!isSearching && query.trim() && totalResults === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No results found for <strong className="text-slate-700">"{query}"</strong>. Try checking keywords like "MBBS", "Surgery", "Tender", "Charges", or "Dr."
            </div>
          )}

          {!isSearching && !query.trim() && (
            <div className="py-4 text-xs text-slate-500">
              <p className="font-semibold text-slate-700 mb-2">Suggested quick searches:</p>
              <div className="flex flex-wrap gap-2">
                {['MBBS Admissions', 'Hospital Charges', 'Tenders', 'Pathology', 'Emergency', 'Faculty Vacancies', 'Dr. Sushila Nayar', 'Blood Bank'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-xs transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Departments Results */}
          {results.departments.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-600 tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-link" /> Medical Departments ({results.departments.length})
              </h3>
              <div className="space-y-1.5">
                {results.departments.map((d) => (
                  <button type="button"
                    key={d.id}
                    onClick={() => handleSelect(`/departments/${d.id}`)}
                    className="w-full p-2.5 rounded-lg border border-slate-100 bg-white text-left hover:border-blue-200 hover:bg-blue-50/50 flex items-center justify-between group transition"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-ink group-hover:text-link">{d.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{d.overview}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-link group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Faculty Results */}
          {results.faculty.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-600 tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-link" /> Faculty Members ({results.faculty.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.faculty.map((f) => (
                  <button type="button"
                    key={f.id}
                    onClick={() => handleSelect(`/faculty?select=${f.slug}`)}
                    className="w-full p-2.5 rounded-lg border border-slate-100 bg-white text-left hover:border-blue-200 hover:bg-blue-50/50 group transition"
                  >
                    <h4 className="font-bold text-xs text-ink group-hover:text-link">{f.name}</h4>
                    <p className="text-[11px] text-slate-500">{f.designation} — {f.department}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notices & Tenders Results */}
          {results.notices.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-600 tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-link" /> Notices, Tenders & Recruitment ({results.notices.length})
              </h3>
              <div className="space-y-1.5">
                {results.notices.map((n) => (
                  <button type="button"
                    key={n.id}
                    onClick={() => handleSelect(`/notices/${n.id}`)}
                    className="w-full p-2.5 rounded-lg border border-slate-100 bg-white text-left hover:border-blue-200 hover:bg-blue-50/50 flex items-center justify-between group transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                          {n.category}
                        </span>
                        <span className="text-[11px] text-slate-600">{n.date}</span>
                      </div>
                      <h4 className="font-semibold text-xs text-slate-900 group-hover:text-link line-clamp-1">
                        {n.title}
                      </h4>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-link shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Other Portal Pages */}
          {results.pages.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-600 tracking-wider mb-2">
                Portal Services & Governance ({results.pages.length})
              </h3>
              <div className="space-y-1.5">
                {results.pages.map((p, idx) => (
                  <button type="button"
                    key={idx}
                    onClick={() => handleSelect(p.url)}
                    className="w-full p-2 rounded-lg border border-slate-100 bg-white text-left hover:border-blue-200 hover:bg-blue-50/50 group transition text-xs"
                  >
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium mr-2">
                      {p.category}
                    </span>
                    <span className="font-semibold text-slate-800 group-hover:text-link">{p.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ), document.body);
};
