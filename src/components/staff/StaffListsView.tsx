import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { apiService } from '@/services/api';
import { StaffDirectory, StaffGroupId, StaffRecord } from '@/types';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/ListControls';
import { paginate } from '@/utils/paginate';

const PER_PAGE = 50;

// Columns per list, after the name.
const COLUMNS: Record<StaffGroupId, { label: string; value: (r: StaffRecord) => string | undefined }[]> = {
  teaching: [
    { label: 'Designation', value: (r) => r.designation },
    { label: 'Department', value: (r) => r.department },
    { label: 'Joined MGIMS', value: (r) => r.joined },
    { label: 'Last promotion', value: (r) => r.lastPromotion },
  ],
  'non-teaching': [
    { label: 'Designation', value: (r) => r.designation },
    { label: 'Department / unit', value: (r) => r.department },
    { label: 'Status', value: (r) => r.status },
    { label: 'Class', value: (r) => r.staffClass },
  ],
  'senior-resident': [{ label: 'Department', value: (r) => r.department }],
};

/** The official staff lists (teaching staff, non-teaching staff, senior residents) with filters and pages. */
export const StaffListsView: React.FC = () => {
  const [data, setData] = useState<StaffDirectory | null>(null);
  const [failed, setFailed] = useState(false);
  const [chosen, setChosen] = useState<StaffGroupId | null>(null);
  const [unit, setUnit] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    apiService.getStaff().then(setData).catch(() => setFailed(true));
  }, []);

  if (failed) return <p role="alert" className="text-sm text-red-700">The staff lists could not be loaded. Please try again later.</p>;
  if (!data) return <SkeletonRows count={6} label="Loading staff lists" />;
  const group = data.groups.find((g) => g.id === chosen) ?? data.groups[0];
  if (!group) return <p className="text-sm text-slate-600">No staff lists have been published yet.</p>;

  const inGroup = data.records.filter((r) => r.group === group.id);
  const units = [...new Set(inGroup.flatMap((r) => (r.department ? [r.department] : [])))].sort();
  const q = query.trim().toLowerCase();
  const shown = inGroup.filter(
    (r) => (!unit || r.department === unit) && (!q || [r.name, r.designation, r.department].some((v) => v?.toLowerCase().includes(q))),
  );
  const { pageItems, pageCount } = paginate(shown, page, PER_PAGE);
  const columns = COLUMNS[group.id];
  const reset = () => setPage(1);

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div role="group" aria-label="Staff list" className="flex flex-wrap gap-1.5">
          {data.groups.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-pressed={g.id === group.id}
              onClick={() => {
                setChosen(g.id);
                setUnit('');
                reset();
              }}
              className={`min-h-11 rounded-lg px-3 text-xs font-bold ${
                g.id === group.id ? 'bg-brand-blue text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {g.title} ({g.count})
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {units.length > 1 && (
            <div className="sm:w-72">
              <label htmlFor="staff-unit" className="mb-1 block text-xs font-semibold text-slate-700">
                {group.id === 'non-teaching' ? 'Department / unit' : 'Department'}
              </label>
              <select
                id="staff-unit"
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  reset();
                }}
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm"
              >
                <option value="">All</option>
                {units.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex-1">
            <label htmlFor="staff-search" className="mb-1 block text-xs font-semibold text-slate-700">Search by name or designation</label>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" aria-hidden="true" />
              <input
                id="staff-search"
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  reset();
                }}
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm"
              />
            </div>
          </div>
        </div>
        <p aria-live="polite" className="text-xs text-slate-600">
          {shown.length} of {inGroup.length} {group.title.toLowerCase()}
          {group.updated ? ` · list updated ${group.updated}` : ''}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label={`${group.title} table`}>
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{group.title}</caption>
            <thead className="bg-brand-navy text-white">
              <tr>
                <th scope="col" className="p-3 font-semibold">Name</th>
                {columns.map((c) => (
                  <th key={c.label} scope="col" className="p-3 font-semibold">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="p-6 text-center text-slate-600">No one matches. Try a shorter search.</td>
                </tr>
              )}
              {pageItems.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{r.name}</td>
                  {columns.map((c) => (
                    <td key={c.label} className="p-3 text-slate-700">{c.value(r) ?? '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={page} pageCount={pageCount} onChange={setPage} label="Staff list pages" />
    </div>
  );
};
