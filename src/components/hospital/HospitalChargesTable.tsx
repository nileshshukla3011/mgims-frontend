import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { apiService } from '@/services/api';
import { HospitalCharges } from '@/types';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/ListControls';
import { paginate } from '@/utils/paginate';

const PER_PAGE = 50;
const rupees = (n?: number) => (n === undefined ? '—' : n.toLocaleString('en-IN'));
// "Investigation Charges" -> "Investigation charges" (sentence case, as elsewhere on the portal).
const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

// The tariff spells abbreviations with spaces ("C T Fistulogram", "A B G") and hyphens ("X-Ray"). Search joins those
// letters and matches each search word at the start of a word, so "ct" finds "C T …" but not "Cataract".
const searchable = (s: string) => s.replace(/\b([A-Za-z])\s(?=[A-Za-z]\b)/g, '$1').replace(/-/g, '').toLowerCase();
const matches = (name: string, words: string[]) => {
  const text = searchable(name);
  return words.every((w) => new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(text));
};

/** The official hospital tariff, by section, with search and pages. */
export const HospitalChargesTable: React.FC = () => {
  const [data, setData] = useState<HospitalCharges | null>(null);
  const [failed, setFailed] = useState(false);
  const [chosenSection, setChosenSection] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    apiService.getHospitalCharges().then(setData).catch(() => setFailed(true));
  }, []);

  if (failed) return <p role="alert" className="text-sm text-red-700">The hospital charges could not be loaded. Please try again later.</p>;
  if (!data) return <SkeletonRows count={6} label="Loading hospital charges" />;

  const section = data.sections.find((s) => s.title === chosenSection) ?? data.sections[0];
  if (!section) return <p className="text-sm text-slate-600">No hospital charges have been published yet.</p>;
  const q = query.trim().toLowerCase();
  const words = searchable(q).split(/\s+/).filter(Boolean);
  const items = data.items.filter((i) => i.section === section.title && (words.length === 0 || matches(i.name, words)));
  const { pageItems, pageCount } = paginate(items, page, PER_PAGE);
  const count = (title: string) => data.items.filter((i) => i.section === title).length;

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div role="group" aria-label="Type of charge" className="flex flex-wrap gap-1.5">
          {data.sections.map((s) => (
            <button
              key={s.title}
              type="button"
              aria-pressed={s.title === section.title}
              onClick={() => {
                setChosenSection(s.title);
                setPage(1);
              }}
              className={`min-h-11 rounded-lg px-3 text-xs font-bold ${
                s.title === section.title ? 'bg-brand-blue text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {sentence(s.title)} ({count(s.title)})
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="charges-search" className="mb-1 block text-xs font-semibold text-slate-700">Search {sentence(section.title).toLowerCase()}</label>
          <div className="relative sm:w-96">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input
              id="charges-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. X-Ray, Haemogram, ECG"
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm"
            />
          </div>
        </div>
        <p aria-live="polite" className="text-xs text-slate-600">
          {items.length} {items.length === 1 ? 'item' : 'items'}
          {q ? ` match “${query.trim()}”` : ''}. Rates in rupees, as published by Kasturba Hospital.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label={`${sentence(section.title)} table`}>
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{sentence(section.title)}, rates in rupees</caption>
            <thead className="bg-brand-navy text-white">
              <tr>
                <th scope="col" className="p-3 font-semibold">Service</th>
                {section.columns.map((c) => (
                  <th key={c} scope="col" className="p-3 text-right font-semibold">{c} (₹)</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={section.columns.length + 1} className="p-6 text-center text-slate-600">
                    No item matches “{query.trim()}”. Try a shorter search term.
                  </td>
                </tr>
              )}
              {pageItems.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-900">{i.name}</td>
                  {section.columns.map((c) => (
                    <td key={c} className="p-3 text-right font-mono text-slate-800">
                      {rupees(i[c.toLowerCase() as 'insured' | 'general' | 'private'])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} pageCount={pageCount} onChange={setPage} label="Hospital charges pages" />
    </div>
  );
};
