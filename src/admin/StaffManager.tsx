import React, { useEffect, useRef, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { apiService } from '@/services/api';
import { AdminUser, Department, StaffDirectory, StaffGroupId, StaffRecord } from '@/types';
import { canApprove, canManageStaff, isSuperAdmin } from '@/admin/access';
import { workflow } from '@/admin/workflow';
import { adminApi } from '@/admin/adminApi';

const SINGULAR: Record<StaffGroupId, string> = {
  teaching: 'teaching staff member',
  'non-teaching': 'non-teaching staff member',
  'senior-resident': 'senior resident',
};
// Dates on the official lists look like 01/07/2019.
const DATE = /^\d{2}\/\d{2}\/\d{4}$/;
// Department select value for staff of a hospital unit that is not a department (e.g. Matron Office).
const OTHER_UNIT = 'other-unit';
const PAGE = 50;

const unique = (values: (string | undefined)[]) => [...new Set(values.filter((v): v is string => !!v))].sort();

// In demo mode the directory is changed in place, so each load takes a fresh copy for React to see the change.
const copy = (d: StaffDirectory): StaffDirectory => ({ groups: d.groups.map((g) => ({ ...g })), records: [...d.records] });

/** Employee records the signed-in admin may manage: their own department's staff, or everyone for the super admin. */
export const StaffManager: React.FC<{ user: AdminUser; departments: Department[] }> = ({ user, departments }) => {
  const superAdmin = isSuperAdmin(user);
  const [directory, setDirectory] = useState<StaffDirectory | null>(null);
  const [failed, setFailed] = useState(false);
  const [group, setGroup] = useState<StaffGroupId>('teaching');
  const [unit, setUnit] = useState('');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [editing, setEditing] = useState<StaffRecord | 'new' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    apiService
      .getStaff()
      .then((d) => active && setDirectory(copy(d)))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, []);

  const reload = () =>
    apiService
      .getStaff()
      .then((d) => setDirectory(copy(d)))
      .catch(() => setFailed(true));

  const records = directory?.records ?? [];
  const mine = records.filter((r) => canManageStaff(user, r));
  const inGroup = mine.filter((r) => r.group === group);
  const units = unique(inGroup.map((r) => r.department));
  const q = query.trim().toLowerCase();
  const shown = inGroup.filter(
    (r) => (!unit || r.department === unit) && (!q || [r.name, r.designation, r.department].some((v) => v?.toLowerCase().includes(q))),
  );
  const groupTitle = directory?.groups.find((g) => g.id === group)?.title ?? 'Staff';
  const ownDepartment = departments.find((d) => d.id === user.departmentId)?.name ?? 'your department';
  const inList = records.filter((r) => r.group === group);

  const switchGroup = (g: StaffGroupId) => {
    setGroup(g);
    setUnit('');
    setLimit(PAGE);
    setConfirmDelete(null);
    setMessage('');
  };

  const handleDone = (text: string) => {
    setEditing(null);
    setMessage(text);
    reload();
  };

  // A department editor's removal goes for approval too (WEB-CMS-4).
  const handleDelete = async (r: StaffRecord) => {
    try {
      const live = await workflow.save(
        user,
        { entity: 'staff', action: 'delete', entityId: r.id, departmentId: r.departmentId, summary: `Remove from ${groupTitle.toLowerCase()}: ${r.name}`, before: { ...r } },
        () => adminApi.deleteStaff(r),
      );
      setMessage(live ? `Removed “${r.name}” from the ${groupTitle.toLowerCase()} list.` : `Removal of “${r.name}” sent for approval.`);
      setConfirmDelete(null);
      reload();
    } catch {
      setMessage('Could not remove. You may not have access to this record, or the server is not reachable.');
    }
  };

  return (
    <div className="space-y-4">
      {directory && (
        <div role="group" aria-label="Staff list" className="flex flex-wrap gap-1.5">
          {directory.groups.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-pressed={g.id === group}
              onClick={() => switchGroup(g.id)}
              className={`min-h-11 rounded-lg px-3 text-xs font-bold ${g.id === group ? 'bg-brand-blue text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}
            >
              {g.title} ({mine.filter((r) => r.group === g.id).length})
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          {units.length > 1 && (
            <div>
              <label htmlFor="staff-admin-unit" className="mb-1 block font-semibold text-slate-700">Department / unit</label>
              <select id="staff-admin-unit" value={unit} onChange={(e) => { setUnit(e.target.value); setLimit(PAGE); }} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 lg:w-64">
                <option value="">All</option>
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          )}
          <div className="flex-1">
            <label htmlFor="staff-admin-search" className="mb-1 block font-semibold text-slate-700">Search by name or designation</label>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" aria-hidden="true" />
              <input id="staff-admin-search" type="search" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3" />
            </div>
          </div>
          <button type="button" onClick={() => setEditing('new')} disabled={!directory} className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-brand-blue px-4 font-bold text-white hover:bg-blue-900 disabled:opacity-60">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add {SINGULAR[group]}
          </button>
        </div>
        <p className="text-slate-600">
          The website keeps only what the public staff lists show. Caste, gender and employee numbers are not stored here.
        </p>
      </div>

      {message && <p role="status" className="rounded border border-emerald-200 bg-emerald-50 p-2 text-xs font-semibold text-emerald-800">{message}</p>}
      {failed && <p role="alert" className="text-xs text-red-700">The staff lists could not be loaded.</p>}
      {!directory && !failed && <p className="text-xs text-slate-600">Loading…</p>}

      {directory && (
        <>
          <p className="text-xs text-slate-600">
            {shown.length} of {inGroup.length} {groupTitle.toLowerCase()}
            {superAdmin ? '' : ` of ${ownDepartment}`}
          </p>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label={`${groupTitle} records`}>
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-navy text-white">
                  <tr>
                    <th scope="col" className="p-3 font-semibold">Name</th>
                    <th scope="col" className="p-3 font-semibold">Designation</th>
                    <th scope="col" className="p-3 font-semibold">Department / unit</th>
                    {group === 'teaching' && (
                      <>
                        <th scope="col" className="p-3 font-semibold">Joined MGIMS</th>
                        <th scope="col" className="p-3 font-semibold">Last promotion</th>
                      </>
                    )}
                    {group === 'non-teaching' && (
                      <>
                        <th scope="col" className="p-3 font-semibold">Status</th>
                        <th scope="col" className="p-3 font-semibold">Class</th>
                      </>
                    )}
                    <th scope="col" className="p-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shown.length === 0 && (
                    <tr>
                      <td colSpan={group === 'senior-resident' ? 4 : 6} className="p-6 text-center text-slate-600">
                        {inGroup.length === 0 ? `No ${groupTitle.toLowerCase()} of ${superAdmin ? 'MGIMS' : ownDepartment} are on this list yet.` : 'No one matches.'}
                      </td>
                    </tr>
                  )}
                  {shown.slice(0, limit).map((r) => (
                    <tr key={r.id} className="align-top hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{r.name}</td>
                      <td className="p-3 text-slate-700">{r.designation ?? '—'}</td>
                      <td className="p-3 text-slate-600">{r.department ?? '—'}</td>
                      {group === 'teaching' && (
                        <>
                          <td className="whitespace-nowrap p-3 font-mono text-slate-600">{r.joined ?? '—'}</td>
                          <td className="whitespace-nowrap p-3 font-mono text-slate-600">{r.lastPromotion ?? '—'}</td>
                        </>
                      )}
                      {group === 'non-teaching' && (
                        <>
                          <td className="p-3 text-slate-600">{r.status ?? '—'}</td>
                          <td className="whitespace-nowrap p-3 text-slate-600">{r.staffClass ?? '—'}</td>
                        </>
                      )}
                      <td className="whitespace-nowrap p-3 text-right">
                        {confirmDelete === r.id ? (
                          <span className="inline-flex items-center gap-1">
                            <button type="button" onClick={() => handleDelete(r)} className="min-h-11 rounded bg-red-700 px-3 font-bold text-white">Confirm remove</button>
                            <button type="button" onClick={() => setConfirmDelete(null)} className="min-h-11 rounded border border-slate-300 px-3 font-semibold">Cancel</button>
                          </span>
                        ) : (
                          <>
                            <button type="button" onClick={() => setEditing(r)} aria-label={`Edit ${r.name}`} title="Edit" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-link hover:bg-blue-50">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(r.id)} aria-label={`Remove ${r.name}`} title="Remove" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-red-700 hover:bg-red-50">
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
        <StaffRecordDialog
          group={group}
          record={editing === 'new' ? null : editing}
          user={user}
          departments={departments}
          designations={unique(inList.map((r) => r.designation))}
          units={unique(records.filter((r) => !r.departmentId).map((r) => r.department))}
          statuses={unique(inList.map((r) => r.status))}
          classes={unique(inList.map((r) => r.staffClass))}
          onClose={() => setEditing(null)}
          onDone={handleDone}
        />
      )}
    </div>
  );
};

interface DialogProps {
  group: StaffGroupId;
  record: StaffRecord | null;
  user: AdminUser;
  departments: Department[];
  /** Values already used on the lists, offered as suggestions or choices. */
  designations: string[];
  units: string[];
  statuses: string[];
  classes: string[];
  onClose: () => void;
  onDone: (message: string) => void;
}

const StaffRecordDialog: React.FC<DialogProps> = ({ group, record, user, departments, designations, units, statuses, classes, onClose, onDone }) => {
  const approver = canApprove(user);
  const superAdmin = isSuperAdmin(user);
  const [form, setForm] = useState({
    name: record?.name ?? '',
    designation: record?.designation ?? (group === 'senior-resident' ? 'Senior Resident' : ''),
    departmentId: superAdmin ? (record ? record.departmentId ?? OTHER_UNIT : '') : user.departmentId ?? '',
    unit: record && !record.departmentId ? record.department ?? '' : '',
    joined: record?.joined ?? '',
    lastPromotion: record?.lastPromotion ?? '',
    status: record?.status ?? '',
    staffClass: record?.staffClass ?? '',
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

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return 'Enter the name.';
    if (!form.designation.trim()) return 'Enter the designation.';
    if (!form.departmentId) return 'Choose the department, or “Other unit” for staff of a unit that is not a department.';
    if (form.departmentId === OTHER_UNIT && !form.unit.trim()) return 'Enter the unit, for example Matron Office.';
    if (group === 'teaching') {
      if (form.joined.trim() && !DATE.test(form.joined.trim())) return 'Enter the joining date as DD/MM/YYYY.';
      if (form.lastPromotion.trim() && !DATE.test(form.lastPromotion.trim())) return 'Enter the last promotion date as DD/MM/YYYY.';
    }
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
    const fields: Omit<StaffRecord, 'id'> = {
      group,
      name: form.name.trim(),
      designation: form.designation.trim(),
      departmentId: dept?.id,
      department: dept?.name ?? (form.unit.trim() || undefined),
      joined: group === 'teaching' ? form.joined.trim() || undefined : undefined,
      lastPromotion: group === 'teaching' ? form.lastPromotion.trim() || undefined : undefined,
      status: group === 'non-teaching' ? form.status || undefined : undefined,
      staffClass: group === 'non-teaching' ? form.staffClass || undefined : undefined,
    };
    setSaving(true);
    setError('');
    try {
      const live = await workflow.save(
        user,
        {
          entity: 'staff', action: record ? 'update' : 'create', entityId: record?.id, departmentId: fields.departmentId,
          summary: `${record ? 'Edit' : 'Add to'} ${SINGULAR[group]} list: ${fields.name}`, before: record ? { ...record } : undefined, after: { ...fields },
        },
        () => (record ? adminApi.updateStaff(record, fields) : adminApi.createStaff(fields)),
      );
      onDone(live ? `${record ? 'Saved' : 'Added'} “${fields.name}”.` : `“${fields.name}” was sent for approval.`);
    } catch {
      setError('Could not save. You may not have access to this department, or the server is not reachable.');
      setSaving(false);
    }
  };

  const input = 'w-full min-h-11 rounded-lg border border-slate-300 p-2 font-medium';
  const optionsWith = (options: string[], current: string) => (current && !options.includes(current) ? [current, ...options] : options);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="staff-dialog-title" className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-xl border border-slate-300 bg-white p-6 shadow-2xl">
        <h2 id="staff-dialog-title" className="font-serif text-base font-bold text-ink">
          {record ? 'Edit' : 'Add'} {SINGULAR[group]}
        </h2>
        <form onSubmit={handleSubmit} noValidate className="space-y-3 text-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="sf-name" className="mb-1 block font-semibold text-slate-700">Name *</label>
              <input ref={firstFieldRef} id="sf-name" value={form.name} onChange={set('name')} aria-describedby="sf-name-hint" className={input} />
              <p id="sf-name-hint" className="mt-1 text-slate-600">With the title, as on the official list (Dr., Mr., Mrs.).</p>
            </div>
            <div>
              <label htmlFor="sf-designation" className="mb-1 block font-semibold text-slate-700">Designation *</label>
              <input id="sf-designation" list="sf-designations" value={form.designation} onChange={set('designation')} className={input} />
              <datalist id="sf-designations">
                {designations.map((d) => <option key={d} value={d} />)}
              </datalist>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="sf-department" className="mb-1 block font-semibold text-slate-700">Department *</label>
              <select id="sf-department" value={form.departmentId} onChange={set('departmentId')} disabled={!superAdmin} className={`${input} bg-white disabled:bg-slate-100`}>
                {superAdmin && <option value="">Choose a department</option>}
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                {superAdmin && <option value={OTHER_UNIT}>Other unit (not a department)</option>}
              </select>
              {!superAdmin && <p className="mt-1 text-slate-600">Department admins manage the staff of their own department.</p>}
            </div>
            {form.departmentId === OTHER_UNIT && (
              <div>
                <label htmlFor="sf-unit" className="mb-1 block font-semibold text-slate-700">Unit *</label>
                <input id="sf-unit" list="sf-units" value={form.unit} onChange={set('unit')} aria-describedby="sf-unit-hint" className={input} />
                <datalist id="sf-units">
                  {units.map((u) => <option key={u} value={u} />)}
                </datalist>
                <p id="sf-unit-hint" className="mt-1 text-slate-600">For example Matron Office, Medical Store, or a visiting consultant's speciality.</p>
              </div>
            )}
          </div>
          {group === 'teaching' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="sf-joined" className="mb-1 block font-semibold text-slate-700">Joined MGIMS</label>
                <input id="sf-joined" value={form.joined} onChange={set('joined')} inputMode="numeric" aria-describedby="sf-joined-hint" className={input} />
                <p id="sf-joined-hint" className="mt-1 text-slate-600">DD/MM/YYYY, e.g. 01/07/2019</p>
              </div>
              <div>
                <label htmlFor="sf-promotion" className="mb-1 block font-semibold text-slate-700">Last promotion</label>
                <input id="sf-promotion" value={form.lastPromotion} onChange={set('lastPromotion')} inputMode="numeric" aria-describedby="sf-promotion-hint" className={input} />
                <p id="sf-promotion-hint" className="mt-1 text-slate-600">DD/MM/YYYY; leave empty if none</p>
              </div>
            </div>
          )}
          {group === 'non-teaching' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="sf-status" className="mb-1 block font-semibold text-slate-700">Status</label>
                <select id="sf-status" value={form.status} onChange={set('status')} className={`${input} bg-white`}>
                  <option value="">—</option>
                  {optionsWith(statuses, form.status).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="sf-class" className="mb-1 block font-semibold text-slate-700">Class</label>
                <select id="sf-class" value={form.staffClass} onChange={set('staffClass')} className={`${input} bg-white`}>
                  <option value="">—</option>
                  {optionsWith(classes, form.staffClass).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}
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
