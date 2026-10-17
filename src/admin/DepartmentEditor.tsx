import React, { useState } from 'react';
import { ExternalLink, FileText, Save, Send } from 'lucide-react';
import { AdminUser, Department } from '@/types';
import { publicSiteUrl } from '@/admin/publicSite';
import { adminApi } from '@/admin/adminApi';
import { workflow } from '@/admin/workflow';
import { canApprove } from '@/admin/access';
import { checkText, ContentIssue, hasErrors } from '@/admin/contentChecks';
import { ContentIssues } from '@/admin/ChangeViews';

interface Props {
  user: AdminUser;
  /** Departments the signed-in admin may edit; a department admin gets exactly one. */
  departments: Department[];
  onSaved: (dept: Department) => void;
}

// Paragraphs are edited as one text box, separated by blank lines.
const toText = (paragraphs: string[]) => paragraphs.join('\n\n');
const toParagraphs = (text: string) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export const DepartmentEditor: React.FC<Props> = ({ user, departments, onSaved }) => {
  const [selectedId, setSelectedId] = useState('');
  const dept = departments.find((d) => d.id === selectedId) ?? departments[0];

  if (!dept) {
    return <p className="text-xs text-slate-600">No department is assigned to your account. Contact the super administrator.</p>;
  }

  // Keyed by department so the form starts fresh when another department is chosen.
  return <DepartmentForm key={dept.id} user={user} dept={dept} departments={departments} onSelect={setSelectedId} onSaved={onSaved} />;
};

const DepartmentForm: React.FC<Props & { dept: Department; onSelect: (id: string) => void }> = ({ user, dept, departments, onSelect, onSaved }) => {
  const [overview, setOverview] = useState(dept.overview);
  const [body, setBody] = useState(toText(dept.paragraphs));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [issues, setIssues] = useState<ContentIssue[]>([]);
  const approver = canApprove(user);

  // Checks run before anything is saved; errors block it (WEB-CMP-6). Approvers publish at once; department editors
  // submit for approval or keep a draft (WEB-CMS-4).
  const save = async (mode: 'submit' | 'draft') => {
    const found = [...checkText('Overview', overview, { required: true, maxLength: 600 }), ...checkText('About the department', body, { required: true })];
    setIssues(found);
    if (mode === 'submit' && hasErrors(found)) {
      setMessage({ ok: false, text: 'Fix the problems marked "must be fixed" first.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    const after = { overview: overview.trim(), paragraphs: toParagraphs(body) };
    try {
      const live = await workflow.save(
        user,
        { entity: 'department', action: 'update', entityId: dept.id, departmentId: dept.id, summary: `${dept.name}: department profile`, before: { overview: dept.overview, paragraphs: dept.paragraphs }, after, issues: found },
        async () => onSaved(await adminApi.updateDepartment(dept.id, after)),
        mode,
      );
      setMessage({ ok: true, text: live ? `${dept.name} saved and published.` : mode === 'draft' ? 'Saved as a draft. Submit it from Approvals when it is ready.' : 'Sent for approval. It will appear on the website once it is approved.' });
    } catch {
      setMessage({ ok: false, text: 'Could not save. You may not have access to this department, or the server is not reachable.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    save('submit');
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 text-xs bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      {departments.length > 1 ? (
        <div>
          <label htmlFor="dept-select" className="block text-slate-700 font-semibold mb-1">Department</label>
          <select
            id="dept-select"
            value={dept.id}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full sm:w-96 min-h-11 p-2 border border-slate-300 rounded-lg bg-white font-medium"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      ) : (
        <h2 className="font-bold text-sm text-ink">Department of {dept.name}</h2>
      )}

      <div>
        <label htmlFor="dept-overview" className="block text-slate-700 font-semibold mb-1">Overview</label>
        <p id="dept-overview-hint" className="text-[11px] text-slate-600 mb-1">Short summary shown on the departments list.</p>
        <textarea
          id="dept-overview"
          aria-describedby="dept-overview-hint"
          rows={3}
          value={overview}
          onChange={(e) => setOverview(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded-lg font-medium"
        />
      </div>

      <div>
        <label htmlFor="dept-body" className="block text-slate-700 font-semibold mb-1">About the department</label>
        <p id="dept-body-hint" className="text-[11px] text-slate-600 mb-1">Leave a blank line between paragraphs.</p>
        <textarea
          id="dept-body"
          aria-describedby="dept-body-hint"
          rows={16}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded-lg font-medium leading-relaxed"
        />
      </div>

      <ContentIssues issues={issues} />

      {message && (
        <p
          role={message.ok ? 'status' : 'alert'}
          className={`font-semibold p-2 rounded border ${message.ok ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-red-700 bg-red-50 border-red-200'}`}
        >
          {message.text}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <a
          href={publicSiteUrl(`/departments/${dept.id}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-link font-bold"
        >
          View public page <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <div className="flex flex-wrap gap-2">
          {!approver && (
            <button type="button" disabled={saving} onClick={() => save('draft')} className="min-h-11 px-4 py-2 disabled:opacity-60 border border-brand-blue text-link bg-white font-bold rounded-lg flex items-center gap-1.5">
              <FileText className="w-4 h-4" aria-hidden="true" /> Save as draft
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="min-h-11 px-4 py-2 disabled:opacity-60 bg-brand-blue hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
          >
            {approver ? <Save className="w-4 h-4" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
            {saving ? 'Saving…' : approver ? 'Save and publish' : 'Submit for approval'}
          </button>
        </div>
      </div>
    </form>
  );
};
