import React, { useMemo, useState } from 'react';
import { ChevronDown, ExternalLink, FileDown } from 'lucide-react';
import { AdminUser, Department, FacultyMember } from '@/types';
import { apiService } from '@/services/api';
import { isSuperAdmin, manageableDepartments, manageableFaculty } from '@/admin/access';
import { checkText, ContentIssue } from '@/admin/contentChecks';
import { ContentIssues } from '@/admin/ChangeViews';
import { reportsApi } from '@/admin/governanceApi';
import { publicSiteUrl } from '@/admin/publicSite';
import { audit } from '@/admin/audit';
import { useAsync } from '@/hooks/useAsync';
import { downloadCsv } from '@/utils/csv';

interface PageResult {
  id: string;
  kind: 'Department' | 'Faculty profile' | 'Notice';
  title: string;
  path: string;
  issues: ContentIssue[];
}

/**
 * Accessibility-conformance report (WEB-CMP-6, WEB-RPT-3): runs the content checks over everything the admin manages,
 * with drill-down to the field and the text that fails, plus the automated page audit when the backend provides one.
 */
export const AccessibilityReport: React.FC<{ user: AdminUser; departments: Department[]; faculty: FacultyMember[] }> = ({ user, departments, faculty }) => {
  const superAdmin = isSuperAdmin(user);
  const notices = useAsync(() => (superAdmin ? apiService.getNotices(undefined, undefined, { includeUnpublished: true }) : Promise.resolve([])), [superAdmin]);
  const pageAudit = useAsync(() => reportsApi.accessibilityAudit(), []);
  const [severity, setSeverity] = useState<'all' | 'error' | 'warning'>('all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const results = useMemo<PageResult[]>(() => {
    const rows: PageResult[] = [];
    for (const d of manageableDepartments(user, departments)) {
      rows.push({
        id: `dept-${d.id}`, kind: 'Department', title: d.name, path: `/departments/${d.id}`,
        issues: [...checkText('Overview', d.overview, { required: true, maxLength: 600 }), ...d.paragraphs.flatMap((p, i) => checkText(`Paragraph ${i + 1}`, p))],
      });
    }
    for (const f of manageableFaculty(user, faculty, departments)) {
      rows.push({ id: `fac-${f.id}`, kind: 'Faculty profile', title: f.name, path: `/faculty?select=${f.slug}`, issues: [...checkText('Designation', f.designation, { paragraph: false, maxLength: 120 }), ...checkText('Biography', f.bio)] });
    }
    for (const n of notices.data ?? []) {
      rows.push({ id: `notice-${n.id}`, kind: 'Notice', title: n.title, path: `/notices/${n.id}`, issues: [...checkText('Title', n.title, { required: true, paragraph: false, maxLength: 200 }), ...checkText('Summary', n.excerpt)] });
    }
    return rows;
  }, [user, departments, faculty, notices.data]);

  const q = query.trim().toLowerCase();
  const withIssues = results
    .map((r) => ({ ...r, issues: r.issues.filter((i) => severity === 'all' || i.severity === severity) }))
    .filter((r) => r.issues.length && (!q || r.title.toLowerCase().includes(q)));
  const errors = results.filter((r) => r.issues.some((i) => i.severity === 'error')).length;
  const warnings = results.filter((r) => r.issues.some((i) => i.severity === 'warning')).length;
  const byGuideline = Object.entries(
    results.flatMap((r) => r.issues).reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.guideline]: (acc[i.guideline] ?? 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1]);

  const exportCsv = () => {
    downloadCsv('content-accessibility-report.csv', [
      ['Page', 'Type', 'Field', 'Severity', 'Problem', 'Text', 'Guideline', 'Link'],
      ...results.flatMap((r) => r.issues.map((i) => [r.title, r.kind, i.field, i.severity, i.message, i.excerpt, i.guideline, publicSiteUrl(r.path)])),
    ]);
    audit.record(user, 'Exported report', 'Content accessibility report (CSV)', 'report', 'accessibility', true);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold text-slate-600">Pages checked</p><p className="font-serif text-3xl font-black text-ink">{results.length}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold text-slate-600">With problems to fix</p><p className="font-serif text-3xl font-black text-red-700">{errors}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold text-slate-600">With points to consider</p><p className="font-serif text-3xl font-black text-amber-800">{warnings}</p></div>
      </div>
      {byGuideline.length > 0 && (
        <section aria-label="Problems by guideline" className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-bold text-ink">By guideline</h2>
          <ul className="grid gap-1 sm:grid-cols-2">{byGuideline.map(([g, n]) => <li key={g}>{g}: <strong>{n}</strong></li>)}</ul>
        </section>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="a11y-search" className="mb-1 block font-semibold text-slate-700">Find a page</label>
          <input id="a11y-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-11 rounded-lg border border-slate-300 px-2" />
        </div>
        <div role="group" aria-label="Severity" className="flex gap-1">
          {(['all', 'error', 'warning'] as const).map((s) => (
            <button key={s} type="button" aria-pressed={severity === s} onClick={() => setSeverity(s)} className={`min-h-11 rounded-lg px-3 font-semibold ${severity === s ? 'bg-brand-blue text-white' : 'border border-slate-300 bg-white text-slate-700'}`}>
              {s === 'all' ? 'All' : s === 'error' ? 'Must fix' : 'Consider'}
            </button>
          ))}
        </div>
        <button type="button" onClick={exportCsv} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 font-semibold text-link">
          <FileDown className="h-4 w-4" aria-hidden="true" /> Export CSV
        </button>
      </div>

      {notices.loading && superAdmin ? <p>Checking notices…</p> : withIssues.length === 0 ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-800">No content problems found{q ? ' for this search' : ''}.</p>
      ) : (
        <ul className="space-y-2">
          {withIssues.slice(0, 200).map((r) => (
            <li key={r.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button type="button" aria-expanded={open === r.id} onClick={() => setOpen(open === r.id ? null : r.id)} className="inline-flex min-h-11 items-center gap-1 text-left font-semibold text-slate-900">
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open === r.id ? 'rotate-180' : ''}`} aria-hidden="true" />
                  {r.kind}: {r.title}
                </button>
                <span className="text-slate-600">
                  {r.issues.filter((i) => i.severity === 'error').length} to fix · {r.issues.filter((i) => i.severity === 'warning').length} to consider
                </span>
              </div>
              {open === r.id && (
                <div className="mt-2 space-y-2">
                  <ContentIssues issues={r.issues} title="Problems on this page" />
                  <a href={publicSiteUrl(r.path)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-link underline">
                    Open the page <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span>
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <section aria-labelledby="page-audit" className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <h2 id="page-audit" className="text-sm font-bold text-ink">Automated page audit</h2>
        {pageAudit.data ? (
          <>
            <p className="text-slate-600">Generated {new Date(pageAudit.data.generatedAt).toLocaleString('en-IN')} · {pageAudit.data.pages.filter((p) => p.violations.length).length} of {pageAudit.data.pages.length} pages with problems.</p>
            <ul className="space-y-2">
              {pageAudit.data.pages.filter((p) => p.violations.length).map((p) => (
                <li key={p.url} className="rounded border border-slate-200 p-2">
                  <p className="font-semibold">{p.title ?? p.url}</p>
                  <ul className="ml-4 list-disc">
                    {p.violations.map((v) => <li key={v.id}><strong>{v.impact}</strong> {v.description} — <span className="font-mono">{v.nodes.map((n) => n.target).join(', ')}</span></li>)}
                  </ul>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-slate-600">
            No page audit is connected yet. The backend or the release pipeline should run an automated checker such as axe-core on every page and
            publish the result at <code>/admin/accessibility/report</code>; it then appears here with the failing element for each problem.
          </p>
        )}
      </section>
    </div>
  );
};
