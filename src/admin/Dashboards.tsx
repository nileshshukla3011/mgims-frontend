import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import { AdminUser, Department, ResearchKind } from '@/types';
import { apiService, isMockMode } from '@/services/api';
import { workflow, ContentChange } from '@/admin/workflow';
import { adminApi } from '@/admin/adminApi';
import { analyticsApi, reportsApi, UptakePoint } from '@/admin/governanceApi';
import { audit } from '@/admin/audit';
import { BarChart } from '@/admin/BarChart';
import { useAsync } from '@/hooks/useAsync';
import { formatDateTime, todayIso } from '@/utils/format';
import { downloadCsv } from '@/utils/csv';

const dayKey = (iso: string) => iso.slice(0, 10);
const daysAgoIso = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const lastDays = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });

const Stat: React.FC<{ label: string; value: number | string; tone?: string; note?: string }> = ({ label, value, tone = 'text-ink', note }) => (
  <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
    <p className="text-xs font-semibold text-slate-600">{label}</p>
    <p className={`font-serif text-3xl font-black ${tone}`}>{value}</p>
    {note && <p className="text-[11px] text-slate-600">{note}</p>}
  </div>
);

/**
 * Governance dashboard (WEB-RPT-1): publication activity, pending approvals and authoring per department, from the
 * content workflow. Live, the same numbers come from `GET /content-changes` (or a summary endpoint for large volumes).
 */
export const GovernanceDashboard: React.FC<{ departments: Department[]; onOpenApprovals: () => void }> = ({ departments, onOpenApprovals }) => {
  const changes = useAsync(() => workflow.list(), []);
  if (changes.error) return <p role="alert" className="text-xs text-red-700">The governance figures could not be loaded.</p>;
  if (!changes.data) return <p className="text-xs text-slate-600">Loading governance figures…</p>;
  const list = changes.data;
  const since = daysAgoIso(30);
  const recent = (c: ContentChange) => (c.publishedAt ?? c.reviewedAt ?? c.submittedAt ?? c.createdAt) >= since;
  const days = lastDays(30);
  const perDay = days.map((d) => ({ label: d.slice(5), value: list.filter((c) => c.status === 'Published' && c.publishedAt && dayKey(c.publishedAt) === d).length }));
  const byDept = new Map<string, { submitted: number; published: number; rejected: number; pending: number }>();
  for (const c of list) {
    const key = c.departmentId ?? 'institute';
    const row = byDept.get(key) ?? { submitted: 0, published: 0, rejected: 0, pending: 0 };
    if (c.status !== 'Draft' && c.author.username !== c.reviewer?.username) row.submitted += 1;
    if (c.status === 'Published') row.published += 1;
    if (c.status === 'Rejected') row.rejected += 1;
    if (c.status === 'Submitted') row.pending += 1;
    byDept.set(key, row);
  }
  const name = (id: string) => (id === 'institute' ? 'Institute-wide' : departments.find((d) => d.id === id)?.name ?? id);
  const pending = list.filter((c) => c.status === 'Submitted').length;

  return (
    <section aria-labelledby="governance-title" className="space-y-4">
      <h2 id="governance-title" className="text-sm font-bold text-ink">Content governance (last 30 days)</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Waiting for approval" value={pending} tone={pending ? 'text-amber-800' : 'text-ink'} />
        <Stat label="Scheduled to publish" value={list.filter((c) => c.status === 'Approved').length} />
        <Stat label="Published" value={list.filter((c) => c.status === 'Published' && recent(c)).length} tone="text-emerald-700" />
        <Stat label="Rejected" value={list.filter((c) => c.status === 'Rejected' && recent(c)).length} tone="text-red-700" />
      </div>
      {pending > 0 && (
        <button type="button" onClick={onOpenApprovals} className="min-h-11 rounded-lg bg-brand-blue px-4 text-xs font-bold text-white">Review {pending} waiting change{pending > 1 ? 's' : ''}</button>
      )}
      <BarChart title="Changes published per day" data={perDay} />
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white" tabIndex={0} role="region" aria-label="Authoring by department">
        <table className="w-full text-left text-xs">
          <caption className="p-3 text-left text-sm font-bold text-ink">Authoring by department</caption>
          <thead className="bg-brand-navy text-white">
            <tr>
              <th scope="col" className="p-2.5 font-semibold">Department</th>
              <th scope="col" className="p-2.5 text-right font-semibold">Submitted</th>
              <th scope="col" className="p-2.5 text-right font-semibold">Waiting</th>
              <th scope="col" className="p-2.5 text-right font-semibold">Published</th>
              <th scope="col" className="p-2.5 text-right font-semibold">Rejected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {byDept.size === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-600">No content changes yet.</td></tr>}
            {[...byDept.entries()].sort((a, b) => b[1].submitted - a[1].submitted).map(([id, r]) => (
              <tr key={id}>
                <th scope="row" className="p-2.5 text-left font-semibold">{name(id)}</th>
                <td className="p-2.5 text-right">{r.submitted}</td>
                <td className="p-2.5 text-right">{r.pending}</td>
                <td className="p-2.5 text-right">{r.published}</td>
                <td className="p-2.5 text-right">{r.rejected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length > 0 && (
        <section aria-label="Latest content activity" className="rounded-xl border border-slate-200 bg-white p-4 text-xs">
          <h3 className="mb-2 text-sm font-bold text-ink">Latest activity</h3>
          <ul className="space-y-1">
            {list.slice(0, 8).map((c) => <li key={c.id}>{formatDateTime(c.publishedAt ?? c.reviewedAt ?? c.submittedAt ?? c.createdAt)} · <strong>{c.status}</strong> · {c.summary} · {c.author.name}</li>)}
          </ul>
        </section>
      )}
    </section>
  );
};

// Sample figures only for checking the layout in demo mode; clearly labelled and never stored.
const sampleUptake = (days: string[]): UptakePoint[] =>
  days.map((date, i) => ({ date, appointments: 40 + ((i * 13) % 25), reportsDownloaded: 60 + ((i * 7) % 30), payments: 15 + ((i * 5) % 12), certificateRequests: (i * 3) % 6 }));

/** Service uptake (WEB-RPT-2), feedback analytics (WEB-RPT-4) and exports (WEB-RPT-5). */
export const ReportsPanel: React.FC<{ user: AdminUser }> = ({ user }) => {
  const [from, setFrom] = useState(() => lastDays(30)[0]);
  const [to, setTo] = useState(() => lastDays(1)[0]);
  const uptake = useAsync(() => analyticsApi.serviceUptake(from, to), [from, to]);
  const feedback = useAsync(() => analyticsApi.feedbackSummary(from, to), [from, to]);
  const [sample, setSample] = useState(false);
  const [message, setMessage] = useState('');

  const points = uptake.data?.length ? uptake.data : sample ? sampleUptake(lastDays(30)) : [];
  const series: [keyof Omit<UptakePoint, 'date'>, string, string][] = [
    ['appointments', 'Appointments booked', '#004080'],
    ['reportsDownloaded', 'Reports downloaded', '#0f766e'],
    ['payments', 'Payments processed', '#7c3aed'],
    ['certificateRequests', 'Certificate requests', '#b45309'],
  ];

  const exportReport = async (report: string, label: string) => {
    if (!isMockMode) {
      // The server builds the file from its own data and records the export in the audit ledger.
      window.location.assign(reportsApi.exportUrl(report));
      return;
    }
    let rows: (string | number | undefined)[][] = [];
    if (report === 'inquiries') rows = [['Ticket', 'Date', 'Name', 'Category', 'Status'], ...(await adminApi.listInquiries()).map((r) => [r.ticketId, r.createdAt, r.name, r.category, r.status])];
    if (report === 'staff') rows = [['List', 'Name', 'Designation', 'Department / unit', 'Status', 'Class'], ...(await apiService.getStaff()).records.map((r) => [r.group, r.name, r.designation, r.department, r.status, r.staffClass])];
    if (report === 'research') {
      const kinds: ResearchKind[] = ['thesis', 'student-research', 'publication', 'funded-project', 'presentation'];
      const all = (await Promise.all(kinds.map((k) => apiService.getResearchRecords(k)))).flat();
      rows = [['Type', 'Year', 'Department', 'Title', 'People'], ...all.map((r) => [r.kind, r.year, r.department, r.title, r.people])];
    }
    if (report === 'workflow') rows = [['Change', 'Status', 'Author', 'Submitted', 'Reviewer', 'Published'], ...(await workflow.list()).map((c) => [c.summary, c.status, c.author.name, c.submittedAt, c.reviewer?.name, c.publishedAt])];
    if (report === 'audit') rows = [['Time', 'User', 'Role', 'Action', 'Summary'], ...(await audit.list()).map((e) => [e.at, e.actorName, e.role, e.action, e.summary])];
    downloadCsv(`${report}-${todayIso()}.csv`, rows);
    await audit.record(user, 'Exported report', `${label} (CSV, ${Math.max(0, rows.length - 1)} rows)`, 'report', report, true);
    setMessage(`${label} exported.`);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="rep-from" className="mb-1 block font-semibold text-slate-700">From</label>
          <input id="rep-from" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="min-h-11 rounded-lg border border-slate-300 px-2" />
        </div>
        <div>
          <label htmlFor="rep-to" className="mb-1 block font-semibold text-slate-700">To</label>
          <input id="rep-to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="min-h-11 rounded-lg border border-slate-300 px-2" />
        </div>
      </div>

      <section aria-labelledby="uptake-title" className="space-y-3">
        <h2 id="uptake-title" className="text-sm font-bold text-ink">Service uptake</h2>
        {uptake.error ? <p role="alert" className="text-red-700">Usage figures could not be loaded.</p> : points.length === 0 ? (
          <div className="space-y-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-700">
            <p>No usage figures yet. They come from the backend once the patient and student portals are live{isMockMode ? '; demo mode has none' : ''}.</p>
            {isMockMode && <button type="button" onClick={() => setSample(true)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 font-semibold text-link">Show sample figures to check the layout</button>}
          </div>
        ) : (
          <>
            {sample && !uptake.data?.length && <p role="note" className="rounded border border-amber-300 bg-amber-50 p-2 font-semibold text-amber-900">Sample figures for checking the layout. These are not real usage numbers.</p>}
            <div className="grid gap-4 lg:grid-cols-2">
              {series.map(([key, label, color]) => <BarChart key={key} title={label} color={color} data={points.map((p) => ({ label: p.date.slice(5), value: p[key] }))} />)}
            </div>
          </>
        )}
      </section>

      <section aria-labelledby="fb-title" className="space-y-3">
        <h2 id="fb-title" className="text-sm font-bold text-ink">Feedback and survey satisfaction</h2>
        {feedback.data && feedback.data.byDepartment.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white" tabIndex={0} role="region" aria-label="Satisfaction by department">
              <table className="w-full text-left">
                <thead className="bg-brand-navy text-white"><tr><th scope="col" className="p-2.5">Department</th><th scope="col" className="p-2.5 text-right">Responses</th><th scope="col" className="p-2.5 text-right">Average rating</th><th scope="col" className="p-2.5">Flag</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {feedback.data.byDepartment.map((r) => (
                    <tr key={r.department}>
                      <th scope="row" className="p-2.5 text-left">{r.department}</th>
                      <td className="p-2.5 text-right">{r.responses}</td>
                      <td className="p-2.5 text-right">{r.averageRating.toFixed(1)} / 5</td>
                      <td className="p-2.5">{r.responses >= 5 && r.averageRating < 3 ? <strong className="text-red-700">Needs attention</strong> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {feedback.data.weekly.length > 0 && <BarChart title="Responses per week" data={feedback.data.weekly.map((w) => ({ label: w.week, value: w.responses }))} />}
          </>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-700">No feedback figures for this period{isMockMode ? ' (in demo mode, feedback stays in the public website’s browser)' : ''}.</p>
        )}
      </section>

      <section aria-labelledby="exports-title" className="space-y-3">
        <h2 id="exports-title" className="text-sm font-bold text-ink">Exports</h2>
        <p className="text-slate-600">Every export is recorded in the audit log.</p>
        {message && <p role="status" className="font-semibold text-emerald-800">{message}</p>}
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            ['inquiries', 'Citizen inquiries'],
            ['staff', 'Staff lists'],
            ['research', 'Research records'],
            ['workflow', 'Content approvals'],
            ['audit', 'Audit log'],
          ].map(([report, label]) => (
            <li key={report}>
              <button type="button" onClick={() => exportReport(report, label)} className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 font-semibold text-link hover:bg-slate-50">
                <FileDown className="h-4 w-4" aria-hidden="true" /> {label} (CSV)
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
