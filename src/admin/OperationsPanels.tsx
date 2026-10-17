import React, { useState } from 'react';
import { FileDown, RefreshCw } from 'lucide-react';
import { AdminUser } from '@/types';
import { audit, AuditEvent } from '@/admin/audit';
import { DataSource, dataSourcesApi } from '@/admin/governanceApi';
import { useAsync } from '@/hooks/useAsync';
import { Pagination } from '@/components/ui/ListControls';
import { StatusBadge } from '@/components/ui/Status';
import { paginate } from '@/utils/paginate';
import { formatDateTime, todayIso } from '@/utils/format';
import { downloadCsv } from '@/utils/csv';

/** Audit ledger viewer (WEB-SEC-5, WEB-CMS-5): every administrative action, who did it and when. */
export const AuditLogPanel: React.FC<{ user: AdminUser }> = ({ user }) => {
  const [actor, setActor] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const events = useAsync(() => audit.list({ actor: actor || undefined, action: action || undefined, from: from || undefined, to: to || undefined }), [actor, action, from, to]);
  const all = useAsync(() => audit.list(), []);
  const actors = [...new Set((all.data ?? []).map((e) => e.actor))].sort();
  const actions = [...new Set((all.data ?? []).map((e) => e.action))].sort();
  const { pageItems, pageCount } = paginate<AuditEvent>(events.data ?? [], page, 50);

  const exportCsv = async () => {
    downloadCsv(`audit-log-${todayIso()}.csv`, [
      ['Time', 'User', 'Name', 'Role', 'Action', 'Summary', 'Record'],
      ...(events.data ?? []).map((e) => [e.at, e.actor, e.actorName, e.role, e.action, e.summary, e.entity ? `${e.entity} ${e.entityId ?? ''}` : '']),
    ]);
    await audit.record(user, 'Exported report', 'Audit log (CSV)', 'report', 'audit', true);
  };

  return (
    <div className="space-y-4 text-xs">
      <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
        The ledger is append-only: entries cannot be edited or deleted from the console. The server records every sign-in, change, approval, consent update and export.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="audit-actor" className="mb-1 block font-semibold text-slate-700">User</label>
          <select id="audit-actor" value={actor} onChange={(e) => { setActor(e.target.value); setPage(1); }} className="min-h-11 rounded-lg border border-slate-300 bg-white px-2">
            <option value="">Everyone</option>
            {actors.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="audit-action" className="mb-1 block font-semibold text-slate-700">Action</label>
          <select id="audit-action" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className="min-h-11 rounded-lg border border-slate-300 bg-white px-2">
            <option value="">All actions</option>
            {actions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="audit-from" className="mb-1 block font-semibold text-slate-700">From</label>
          <input id="audit-from" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="min-h-11 rounded-lg border border-slate-300 px-2" />
        </div>
        <div>
          <label htmlFor="audit-to" className="mb-1 block font-semibold text-slate-700">To</label>
          <input id="audit-to" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="min-h-11 rounded-lg border border-slate-300 px-2" />
        </div>
        <button type="button" onClick={exportCsv} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 font-semibold text-link">
          <FileDown className="h-4 w-4" aria-hidden="true" /> Export CSV
        </button>
      </div>
      {events.error ? <p role="alert" className="text-red-700">The audit log could not be loaded.</p> : !events.data ? <p>Loading…</p> : (
        <>
          <p className="text-slate-600">{events.data.length} entries</p>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white" tabIndex={0} role="region" aria-label="Audit log entries">
            <table className="w-full text-left">
              <thead className="bg-brand-navy text-white">
                <tr>
                  <th scope="col" className="p-2.5 font-semibold">Time</th>
                  <th scope="col" className="p-2.5 font-semibold">User</th>
                  <th scope="col" className="p-2.5 font-semibold">Action</th>
                  <th scope="col" className="p-2.5 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageItems.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-600">No entries match.</td></tr>}
                {pageItems.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap p-2.5 font-mono">{formatDateTime(e.at)}</td>
                    <td className="p-2.5">{e.actorName}<span className="block text-slate-600">{e.actor} · {e.role.replace('_', ' ')}</span></td>
                    <td className="p-2.5 font-semibold">{e.action}</td>
                    <td className="p-2.5">{e.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageCount={pageCount} onChange={setPage} label="Audit log pages" />
        </>
      )}
    </div>
  );
};

const INTERVALS: [number, string][] = [
  [1, 'Every minute'],
  [5, 'Every 5 minutes'],
  [15, 'Every 15 minutes'],
  [30, 'Every 30 minutes'],
  [60, 'Every hour'],
  [360, 'Every 6 hours'],
  [1440, 'Once a day'],
];

/** Refresh interval and last sync of each external data source (WEB-DYN-6), set by the web-governance administrator. */
export const DataSourcesPanel: React.FC<{ user: AdminUser }> = ({ user }) => {
  const sources = useAsync(() => dataSourcesApi.list(), []);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const change = async (source: DataSource, minutes: number) => {
    await dataSourcesApi.setInterval(user, source, minutes);
    setMessage(`${source.name} now refreshes ${INTERVALS.find(([m]) => m === minutes)?.[1].toLowerCase()}.`);
    sources.reload();
  };
  const sync = async (source: DataSource) => {
    setBusy(source.id);
    try {
      const result = await dataSourcesApi.syncNow(user, source);
      setMessage(result.lastStatus === 'OK' ? `${source.name} synced.` : `${source.name}: ${result.lastMessage ?? 'the sync failed.'}`);
      sources.reload();
    } catch {
      setMessage(`${source.name} could not be synced.`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
        How often the website refreshes data from each system. When a source fails, the website keeps showing the last copy that loaded, with its date (WEB-DYN-5).
      </p>
      {message && <p role="status" className="rounded border border-emerald-200 bg-emerald-50 p-2 font-semibold text-emerald-800">{message}</p>}
      {sources.error ? <p role="alert" className="text-red-700">The data sources could not be loaded.</p> : !sources.data ? <p>Loading…</p> : (
        <ul className="space-y-3">
          {sources.data.map((s) => (
            <li key={s.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div>
                <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                <p className="text-slate-600">{s.description}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-slate-700">
                  Last sync: {s.lastSyncAt ? formatDateTime(s.lastSyncAt) : 'never'} <StatusBadge status={s.lastStatus ?? 'Never run'} />
                  {s.lastMessage && <span className="text-slate-600">{s.lastMessage}</span>}
                </p>
              </div>
              <div>
                <label htmlFor={`interval-${s.id}`} className="mb-1 block font-semibold text-slate-700">Refresh</label>
                <select id={`interval-${s.id}`} value={s.refreshMinutes} onChange={(e) => change(s, Number(e.target.value))} className="min-h-11 rounded-lg border border-slate-300 bg-white px-2">
                  {INTERVALS.map(([m, label]) => <option key={m} value={m}>{label}</option>)}
                </select>
              </div>
              <button type="button" disabled={busy === s.id} onClick={() => sync(s)} className="inline-flex min-h-11 items-center gap-1.5 self-end rounded-lg border border-slate-300 bg-white px-3 font-semibold text-link disabled:opacity-60">
                <RefreshCw className={`h-4 w-4 ${busy === s.id ? 'animate-spin' : ''}`} aria-hidden="true" /> Sync now<span className="sr-only"> {s.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
