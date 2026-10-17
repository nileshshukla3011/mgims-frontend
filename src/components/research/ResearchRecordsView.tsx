import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { apiService } from '@/services/api';
import { ResearchKind, ResearchRecord } from '@/types';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { formatYear, startYear } from '@/utils/research';

const useResearchRecords = (kind: ResearchKind) => {
  const [records, setRecords] = useState<ResearchRecord[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    apiService
      .getResearchRecords(kind)
      .then((list) => active && setRecords(list))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [kind]);
  return { records, failed };
};

interface Props {
  kind: ResearchKind;
  /** Plural noun for the result count, e.g. "theses". */
  noun: string;
  /** Records are listed under their department or their category (programme). */
  groupBy: 'department' | 'category';
  renderEntry: (record: ResearchRecord) => React.ReactNode;
  /** Extra content for the selected year, shown above the list (student research: committee and notes). */
  yearInfo?: (year: string) => React.ReactNode;
}

/** Research records by year (newest first), grouped by department or programme, with a department filter and search. */
export const ResearchRecordsView: React.FC<Props> = ({ kind, noun, groupBy, renderEntry, yearInfo }) => {
  const { records, failed } = useResearchRecords(kind);
  // A search result links here with ?q= (and ?year=), so the list opens already filtered.
  const [params] = useSearchParams();
  const [chosenYear, setChosenYear] = useState<string | null>(params.get('year'));
  const [department, setDepartment] = useState('');
  const [query, setQuery] = useState(params.get('q') ?? '');

  const years = useMemo(
    () => [...new Set((records ?? []).flatMap((r) => (r.year ? [r.year] : [])))].sort((a, b) => startYear(b) - startYear(a)),
    [records],
  );
  const year = chosenYear ?? years[0] ?? null;
  const inYear = (records ?? []).filter((r) => !year || r.year === year);
  const departments = [...new Set(inYear.flatMap((r) => (r.department ? [r.department] : [])))].sort();
  const q = query.trim().toLowerCase();
  const shown = inYear.filter(
    (r) =>
      (!department || r.department === department) &&
      (!q || [r.title, r.people, r.guide, r.details, r.category].some((v) => v?.toLowerCase().includes(q))),
  );

  const groups = new Map<string, ResearchRecord[]>();
  for (const r of shown) {
    const key = (groupBy === 'department' ? r.department : r.category) || 'Other';
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  const ordered = groupBy === 'department' ? [...groups].sort(([a], [b]) => a.localeCompare(b)) : [...groups];
  const filtered = !!department || !!q;

  if (failed) return <p role="alert" className="text-sm text-red-700">This list could not be loaded. Please try again later.</p>;
  if (!records) return <SkeletonRows count={6} label={`Loading ${noun}`} />;
  if (records.length === 0) return <p className="text-sm text-slate-600">No {noun} have been published yet.</p>;

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        {years.length > 1 && (
          <div role="group" aria-label="Year" className="flex flex-wrap gap-1.5">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                aria-pressed={y === year}
                onClick={() => {
                  setChosenYear(y);
                  setDepartment('');
                }}
                className={`min-h-11 rounded-lg px-3 text-xs font-bold transition ${
                  y === year ? 'bg-brand-blue text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {formatYear(y)}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          {departments.length > 1 && (
            <div className="sm:w-72">
              <label htmlFor={`${kind}-department`} className="mb-1 block text-xs font-semibold text-slate-700">Department</label>
              <select
                id={`${kind}-department`}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm"
              >
                <option value="">All departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex-1">
            <label htmlFor={`${kind}-search`} className="mb-1 block text-xs font-semibold text-slate-700">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" aria-hidden="true" />
              <input
                id={`${kind}-search`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Title, name or keyword"
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm"
              />
            </div>
          </div>
        </div>
        <p aria-live="polite" className="text-xs text-slate-600">
          {shown.length} {noun}
          {year && years.length > 0 ? ` in ${formatYear(year)}` : ''}
          {filtered ? ' match your filters' : ''}
          {filtered && (
            <button
              type="button"
              onClick={() => {
                setDepartment('');
                setQuery('');
              }}
              className="ml-2 font-semibold text-link underline"
            >
              Clear filters
            </button>
          )}
        </p>
      </div>

      {year && yearInfo?.(year)}

      {ordered.map(([group, items]) => (
        <section key={group} aria-label={group} className="space-y-2">
          <h3 className="border-b border-slate-200 pb-1 text-sm font-bold text-ink">
            {group} <span className="font-normal text-slate-600">({items.length})</span>
          </h3>
          <ol className="divide-y divide-slate-100">
            {items.map((r) => (
              <li key={r.id} className="py-3 text-sm leading-relaxed text-slate-700">
                {renderEntry(r)}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
};

/** Detail lines: runs of "Label: value" lines as definition lists, other lines as text, in their original order. */
export const DetailLines: React.FC<{ details?: string }> = ({ details }) => {
  const lines = (details ?? '').split('\n').filter(Boolean);
  if (lines.length === 0) return null;
  // A label is words ("Funding agency", "Funds (INR in lakhs)", "Grant received in 2022-23"), not a citation
  // such as "Ann Ind Psychiat 2019; 3(1): 43.".
  const labelled = (line: string) => {
    const at = line.indexOf(': ');
    const label = line.slice(0, at);
    return at > 0 && /^[A-Z][A-Za-z ()/&.-]*?(?: \d{4}-\d{2})?$/.test(label) ? [label, line.slice(at + 2)] : null;
  };
  const blocks: (string | string[][])[] = [];
  for (const line of lines) {
    const pair = labelled(line);
    const last = blocks[blocks.length - 1];
    if (pair && Array.isArray(last)) last.push(pair);
    else blocks.push(pair ? [pair] : line);
  }
  return (
    <div className="mt-1 space-y-0.5 text-xs text-slate-600">
      {blocks.map((block, i) =>
        typeof block === 'string' ? (
          <p key={i}>{block}</p>
        ) : (
          <dl key={i} className="grid gap-x-3 gap-y-0.5 sm:grid-cols-[max-content_1fr]">
            {block.map(([label, value], j) => (
              <React.Fragment key={j}>
                <dt className="font-semibold text-slate-700">{label}</dt>
                <dd>{value}</dd>
              </React.Fragment>
            ))}
          </dl>
        ),
      )}
    </div>
  );
};
