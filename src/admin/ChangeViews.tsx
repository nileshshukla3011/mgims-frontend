import React from 'react';
import { AlertTriangle, OctagonX } from 'lucide-react';
import { ContentIssue } from '@/admin/contentChecks';
import { ContentChange } from '@/admin/workflow';

const FIELD_LABELS: Record<string, string> = {
  overview: 'Overview', paragraphs: 'About the department', designation: 'Designation', phones: 'Phones', emails: 'Emails', bio: 'Profile',
  title: 'Title', people: 'People', guide: 'Guide', year: 'Year', details: 'Details', category: 'Category', name: 'Name',
  department: 'Department', departmentId: 'Department id', joined: 'Joined MGIMS', lastPromotion: 'Last promotion', status: 'Status',
  staffClass: 'Class', excerpt: 'Notice text', date: 'Date', departmentIds: 'Departments', publish_at: 'Publish on', expires_at: 'Expires on',
  kind: 'Type', group: 'List',
};

const show = (value: unknown) =>
  value === undefined || value === null || value === '' ? '—' : Array.isArray(value) ? value.join('\n\n') : typeof value === 'object' ? JSON.stringify(value) : String(value);

/** Field-by-field comparison of what a change does (only the fields that differ). */
export const ChangeDiff: React.FC<{ change: ContentChange }> = ({ change }) => {
  const keys = [...new Set([...Object.keys(change.before ?? {}), ...Object.keys(change.after ?? {})])].filter(
    (k) => show(change.before?.[k]) !== show(change.after?.[k]),
  );
  if (change.action === 'delete') return <p className="text-xs text-slate-700">Removes this record from the website.</p>;
  if (keys.length === 0) return <p className="text-xs text-slate-700">No field changes.</p>;
  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={`Changes in ${change.summary}`}>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-slate-600">
            <th scope="col" className="py-1 pr-3 font-semibold">Field</th>
            {change.action === 'update' && <th scope="col" className="py-1 pr-3 font-semibold">Before</th>}
            <th scope="col" className="py-1 font-semibold">{change.action === 'create' ? 'New record' : 'After'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 align-top">
          {keys.map((k) => (
            <tr key={k}>
              <th scope="row" className="py-1.5 pr-3 text-left font-semibold text-slate-800">{FIELD_LABELS[k] ?? k}</th>
              {change.action === 'update' && <td className="max-w-md whitespace-pre-line py-1.5 pr-3 text-slate-600 line-through decoration-red-400">{show(change.before?.[k]).slice(0, 1500)}</td>}
              <td className="max-w-md whitespace-pre-line py-1.5 text-slate-900">{show(change.after?.[k]).slice(0, 1500)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/** Results of the content and accessibility checks (WEB-CMP-6). */
export const ContentIssues: React.FC<{ issues: ContentIssue[]; title?: string }> = ({ issues, title = 'Content and accessibility checks' }) => {
  if (issues.length === 0) return null;
  const errors = issues.filter((i) => i.severity === 'error').length;
  return (
    <div role={errors ? 'alert' : 'status'} className={`space-y-2 rounded-lg border p-3 text-xs ${errors ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`}>
      <p className="font-bold text-slate-900">
        {title}: {errors ? `${errors} must be fixed` : 'nothing blocks publication'}
        {issues.length - errors ? `, ${issues.length - errors} to consider` : ''}
      </p>
      <ul className="space-y-1.5">
        {issues.map((i, index) => (
          <li key={`${i.rule}-${i.field}-${index}`} className="flex gap-2">
            {i.severity === 'error' ? <OctagonX className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-label="Must fix" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" aria-label="Consider" />}
            <span>
              <strong>{i.field}:</strong> {i.message}
              {i.excerpt && <span className="block font-mono text-[11px] text-slate-700">“{i.excerpt}”</span>}
              <span className="block text-[11px] text-slate-600">{i.guideline}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
