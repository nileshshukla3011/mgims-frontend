import React, { useEffect, useRef, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { apiService } from '@/services/api';
import { AdminUser, Department, ResearchKind, ResearchRecord } from '@/types';
import { canApprove, canManageResearchRecord, isSuperAdmin } from '@/admin/access';
import { workflow } from '@/admin/workflow';
import { checkText, ContentIssue, hasErrors } from '@/admin/contentChecks';
import { ContentIssues } from '@/admin/ChangeViews';
import { adminApi } from '@/admin/adminApi';
import { formatYear } from '@/utils/research';

interface KindConfig {
  kind: ResearchKind;
  label: string;
  singular: string;
  people: string;
  guide?: string;
  title: string;
  details: string;
  detailsHint: string;
  /** Year format; presentations have no year. */
  year?: { pattern: RegExp; hint: string };
  category?: boolean;
}

const ACADEMIC_YEAR = { pattern: /^\d{4}-\d{2}$/, hint: 'Academic year, e.g. 2022-23' };
const KINDS: KindConfig[] = [
  { kind: 'thesis', label: 'Theses', singular: 'thesis', people: 'Student', guide: 'Guide', title: 'Thesis title', details: 'Degree', detailsHint: 'Leave empty for MD / MS; e.g. PhD', year: { pattern: /^\d{4}$/, hint: 'Year, e.g. 2021' } },
  { kind: 'student-research', label: 'Student research', singular: 'student research entry', people: 'Student(s)', guide: 'Guide(s)', title: 'Project title', details: 'Details', detailsHint: 'Venue, award or reference ID, one per line', year: ACADEMIC_YEAR, category: true },
  { kind: 'publication', label: 'Publications', singular: 'publication', people: 'Authors', title: 'Article title', details: 'Journal citation', detailsHint: 'e.g. J Clin Diagn Res. 2022; 16(6): 1-5', year: ACADEMIC_YEAR },
  { kind: 'funded-project', label: 'Funded research', singular: 'funded project', people: 'Investigators', title: 'Project title', details: 'Funding details', detailsHint: 'One per line, e.g. Funding agency: ICMR, New Delhi', year: ACADEMIC_YEAR },
  { kind: 'presentation', label: 'Presentations', singular: 'presentation', people: 'Presenter(s)', title: 'Presentation', details: 'Venue and date', detailsHint: '' },
];

const PAGE = 50;

/** Research records the signed-in admin may manage: their own department's, or all for the super admin. */
export const ResearchManager: React.FC<{ user: AdminUser; departments: Department[] }> = ({ user, departments }) => {
  const superAdmin = isSuperAdmin(user);
  const [kind, setKind] = useState<ResearchKind>('thesis');
  const config = KINDS.find((k) => k.kind === kind)!;
  const [records, setRecords] = useState<ResearchRecord[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [year, setYear] = useState('');
  const [department, setDepartment] = useState('');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [editing, setEditing] = useState<ResearchRecord | 'new' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const reload = (k: ResearchKind) =>
    apiService
      .getResearchRecords(k)
      .then((list) => setRecords([...list]))
      .catch(() => setFailed(true));

  useEffect(() => {
    let active = true;
    apiService
      .getResearchRecords(kind)
      .then((list) => active && setRecords([...list]))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [kind]);

  const mine = (records ?? []).filter((r) => canManageResearchRecord(user, r));
  const years = [...new Set(mine.flatMap((r) => (r.year ? [r.year] : [])))].sort((a, b) => b.localeCompare(a));
  const q = query.trim().toLowerCase();
  const shown = mine.filter(
    (r) =>
      (!year || r.year === year) &&
      (!department || r.departmentId === department) &&
      (!q || [r.title, r.people, r.guide, r.details].some((v) => v?.toLowerCase().includes(q))),
  );

  const switchKind = (k: ResearchKind) => {
    setKind(k);
    setRecords(null);
    setYear('');
    setLimit(PAGE);
    setConfirmDelete(null);
    setMessage('');
  };

  const handleDone = (text: string) => {
    setEditing(null);
    setMessage(text);
    reload(kind);
  };

  // A department editor's removal is a request for approval too (WEB-CMS-4).
  const handleDelete = async (r: ResearchRecord) => {
    try {
      const live = await workflow.save(
        user,
        { entity: 'research', action: 'delete', entityId: r.id, departmentId: r.departmentId, summary: `Remove ${config.singular}: ${r.title.slice(0, 80)}`, before: { ...r } },
        () => adminApi.deleteResearchRecord(r),
      );
      setMessage(live ? `Deleted “${r.title}”.` : `Removal of “${r.title}” sent for approval.`);
      setConfirmDelete(null);
      reload(kind);
    } catch {
      setMessage('Could not delete. You may not have access to this record, or the server is not reachable.');
    }
  };

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Type of research record" className="flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k.kind}
            type="button"
            aria-pressed={k.kind === kind}
            onClick={() => switchKind(k.kind)}
            className={`min-h-11 rounded-lg px-3 text-xs font-bold ${k.kind === kind ? 'bg-brand-blue text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs lg:flex-row lg:items-end">
        {years.length > 0 && (
          <div>
            <label htmlFor="research-year" className="mb-1 block font-semibold text-slate-700">Year</label>
            <select id="research-year" value={year} onChange={(e) => { setYear(e.target.value); setLimit(PAGE); }} className="min-h-11 rounded-lg border border-slate-300 bg-white px-2">
              <option value="">All years</option>
              {years.map((y) => <option key={y} value={y}>{formatYear(y)}</option>)}
            </select>
          </div>
        )}
        {superAdmin && (
          <div>
            <label htmlFor="research-department" className="mb-1 block font-semibold text-slate-700">Department</label>
            <select id="research-department" value={department} onChange={(e) => { setDepartment(e.target.value); setLimit(PAGE); }} className="min-h-11 rounded-lg border border-slate-300 bg-white px-2">
              <option value="">All departments</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        )}
        <div className="flex-1">
          <label htmlFor="research-search" className="mb-1 block font-semibold text-slate-700">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" aria-hidden="true" />
            <input id="research-search" type="search" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3" />
          </div>
        </div>
        <button type="button" onClick={() => setEditing('new')} className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-brand-blue px-4 font-bold text-white hover:bg-blue-900">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add {config.singular}
        </button>
      </div>

      {message && <p role="status" className="rounded border border-emerald-200 bg-emerald-50 p-2 text-xs font-semibold text-emerald-800">{message}</p>}
      {failed && <p role="alert" className="text-xs text-red-700">The records could not be loaded.</p>}
      {!records && !failed && <p className="text-xs text-slate-600">Loading…</p>}

      {records && (
        <>
          <p className="text-xs text-slate-600">
            {shown.length} of {mine.length} {config.label.toLowerCase()}
            {superAdmin ? '' : ` of ${departments.find((d) => d.id === user.departmentId)?.name ?? 'your department'}`}
          </p>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label={`${config.label} records`}>
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-navy text-white">
                  <tr>
                    <th scope="col" className="p-3 font-semibold">Year</th>
                    <th scope="col" className="p-3 font-semibold">Department</th>
                    <th scope="col" className="p-3 font-semibold">Entry</th>
                    <th scope="col" className="p-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shown.length === 0 && (
                    <tr><td colSpan={4} className="p-6 text-center text-slate-600">No records match.</td></tr>
                  )}
                  {shown.slice(0, limit).map((r) => (
                    <tr key={r.id} className="align-top hover:bg-slate-50">
                      <td className="whitespace-nowrap p-3 font-mono text-slate-600">{r.year ? formatYear(r.year) : '—'}</td>
                      <td className="p-3 text-slate-600">{r.department ?? '—'}</td>
                      <td className="max-w-xl p-3">
                        <p className="font-semibold text-slate-900">{r.title}</p>
                        <p className="text-slate-600">{[r.people, r.guide && `Guide: ${r.guide}`].filter(Boolean).join(' · ')}</p>
                      </td>
                      <td className="whitespace-nowrap p-3 text-right">
                        {confirmDelete === r.id ? (
                          <span className="inline-flex items-center gap-1">
                            <button type="button" onClick={() => handleDelete(r)} className="min-h-11 rounded bg-red-700 px-3 font-bold text-white">Confirm delete</button>
                            <button type="button" onClick={() => setConfirmDelete(null)} className="min-h-11 rounded border border-slate-300 px-3 font-semibold">Cancel</button>
                          </span>
                        ) : (
                          <>
                            <button type="button" onClick={() => setEditing(r)} aria-label={`Edit ${r.title}`} title="Edit" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-link hover:bg-blue-50">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(r.id)} aria-label={`Delete ${r.title}`} title="Delete" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-red-700 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {shown.length > limit && (
            <button type="button" onClick={() => setLimit((n) => n + PAGE)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-link hover:bg-slate-50">
              Show more ({shown.length - limit} more)
            </button>
          )}
        </>
      )}

      {editing && (
        <ResearchRecordDialog
          config={config}
          record={editing === 'new' ? null : editing}
          user={user}
          departments={departments}
          categories={[...new Set((records ?? []).flatMap((r) => (r.category ? [r.category] : [])))]}
          onClose={() => setEditing(null)}
          onDone={handleDone}
        />
      )}
    </div>
  );
};

interface DialogProps {
  config: KindConfig;
  record: ResearchRecord | null;
  user: AdminUser;
  departments: Department[];
  categories: string[];
  onClose: () => void;
  onDone: (message: string) => void;
}

const ResearchRecordDialog: React.FC<DialogProps> = ({ config, record, user, departments, categories, onClose, onDone }) => {
  const [issues, setIssues] = useState<ContentIssue[]>([]);
  const approver = canApprove(user);
  const superAdmin = isSuperAdmin(user);
  const [form, setForm] = useState({
    year: record?.year ?? '',
    departmentId: record?.departmentId ?? (superAdmin ? '' : user.departmentId ?? ''),
    category: record?.category ?? '',
    people: record?.people ?? '',
    guide: record?.guide ?? '',
    title: record?.title ?? '',
    details: record?.details ?? '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // UX4G modal guidance: focus moves into the dialog and returns to the opener when it closes; Esc closes it.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => firstFieldRef.current?.focus());
    return () => {
      requestAnimationFrame(() => opener?.focus());
    };
  }, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (config.year && !config.year.pattern.test(form.year.trim())) return `Enter the year as shown: ${config.year.hint}.`;
    if (!form.departmentId && config.kind !== 'student-research') return 'Choose the department.';
    if (!form.title.trim()) return `Enter the ${config.title.toLowerCase()}.`;
    if (config.kind !== 'publication' && config.kind !== 'funded-project' && !form.people.trim()) return `Enter the ${config.people.toLowerCase()}.`;
    if (config.kind === 'thesis' && !form.guide.trim()) return 'Enter the guide.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    const dept = departments.find((d) => d.id === form.departmentId);
    const fields: Omit<ResearchRecord, 'id'> = {
      kind: config.kind,
      year: form.year.trim() || undefined,
      departmentId: dept?.id,
      department: dept?.name ?? (form.departmentId ? undefined : record?.department),
      category: config.category ? form.category.trim() || undefined : record?.category,
      people: form.people.trim() || undefined,
      guide: config.guide ? form.guide.trim() || undefined : undefined,
      title: form.title.trim(),
      details: form.details.trim() || undefined,
    };
    const found = [...checkText(config.title, fields.title, { required: true, paragraph: false, maxLength: 400 }), ...checkText(config.details, fields.details)];
    setIssues(found);
    if (hasErrors(found)) {
      setError('Fix the problems marked "must be fixed" first.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const live = await workflow.save(
        user,
        {
          entity: 'research', action: record ? 'update' : 'create', entityId: record?.id, departmentId: fields.departmentId,
          summary: `${record ? 'Edit' : 'New'} ${config.singular}: ${fields.title.slice(0, 80)}`, before: record ? { ...record } : undefined, after: { ...fields }, issues: found,
        },
        () => (record ? adminApi.updateResearchRecord(record, fields) : adminApi.createResearchRecord(fields)),
      );
      onDone(live ? `${record ? 'Saved' : 'Added'} “${fields.title}”.` : `“${fields.title}” was sent for approval.`);
    } catch {
      setError('Could not save. You may not have access to this department, or the server is not reachable.');
      setSaving(false);
    }
  };

  const input = 'w-full min-h-11 rounded-lg border border-slate-300 p-2 font-medium';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="research-dialog-title" className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-xl border border-slate-300 bg-white p-6 shadow-2xl">
        <h2 id="research-dialog-title" className="font-serif text-base font-bold text-ink">
          {record ? 'Edit' : 'Add'} {config.singular}
        </h2>
        <form onSubmit={handleSubmit} noValidate className="space-y-3 text-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="rr-year" className="mb-1 block font-semibold text-slate-700">Year{config.year ? ' *' : ''}</label>
              <input ref={firstFieldRef} id="rr-year" value={form.year} onChange={set('year')} aria-describedby="rr-year-hint" className={input} />
              <p id="rr-year-hint" className="mt-1 text-slate-600">{config.year?.hint ?? 'Optional, e.g. 2020-21'}</p>
            </div>
            <div>
              <label htmlFor="rr-department" className="mb-1 block font-semibold text-slate-700">Department{config.kind === 'student-research' ? '' : ' *'}</label>
              <select id="rr-department" value={form.departmentId} onChange={set('departmentId')} disabled={!superAdmin} className={`${input} bg-white disabled:bg-slate-100`}>
                <option value="">{superAdmin ? 'Choose a department' : '—'}</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {!superAdmin && <p className="mt-1 text-slate-600">Department admins add records to their own department.</p>}
            </div>
          </div>
          {config.category && (
            <div>
              <label htmlFor="rr-category" className="mb-1 block font-semibold text-slate-700">Programme</label>
              <input id="rr-category" list="rr-categories" value={form.category} onChange={set('category')} className={input} />
              <datalist id="rr-categories">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
          )}
          <div className={`grid gap-3 ${config.guide ? 'sm:grid-cols-2' : ''}`}>
            <div>
              <label htmlFor="rr-people" className="mb-1 block font-semibold text-slate-700">
                {config.people}{config.kind === 'publication' || config.kind === 'funded-project' ? '' : ' *'}
              </label>
              <input id="rr-people" value={form.people} onChange={set('people')} className={input} />
            </div>
            {config.guide && (
              <div>
                <label htmlFor="rr-guide" className="mb-1 block font-semibold text-slate-700">{config.guide}{config.kind === 'thesis' ? ' *' : ''}</label>
                <input id="rr-guide" value={form.guide} onChange={set('guide')} className={input} />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="rr-title" className="mb-1 block font-semibold text-slate-700">{config.title} *</label>
            <textarea id="rr-title" rows={3} value={form.title} onChange={set('title')} className="w-full rounded-lg border border-slate-300 p-2 font-medium" />
          </div>
          <div>
            <label htmlFor="rr-details" className="mb-1 block font-semibold text-slate-700">{config.details}</label>
            <textarea id="rr-details" rows={3} value={form.details} onChange={set('details')} aria-describedby={config.detailsHint ? 'rr-details-hint' : undefined} className="w-full rounded-lg border border-slate-300 p-2 font-medium" />
            {config.detailsHint && <p id="rr-details-hint" className="mt-1 text-slate-600">{config.detailsHint}</p>}
          </div>
          <ContentIssues issues={issues} />
          {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-2 font-semibold text-red-700">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="min-h-11 rounded-lg bg-slate-200 px-3 font-bold text-slate-700">Cancel</button>
            <button type="submit" disabled={saving} className="min-h-11 rounded-lg bg-brand-blue px-4 font-bold text-white hover:bg-blue-900 disabled:opacity-60">
              {saving ? 'Saving…' : approver ? 'Save' : 'Submit for approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
