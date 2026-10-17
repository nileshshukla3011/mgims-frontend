import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { AdminUser, Department } from '@/types';
import { dynamicApi } from '@/services/dynamicApi';
import { workflow } from '@/admin/workflow';
import { adminApi } from '@/admin/adminApi';
import { canApproveChange } from '@/admin/access';
import { checkText, ContentIssue, hasErrors } from '@/admin/contentChecks';
import { ContentIssues } from '@/admin/ChangeViews';
import { useAsync } from '@/hooks/useAsync';
import { formatDate, todayIso } from '@/utils/format';

const CATEGORIES = ['News & Events', 'CME & Academic Events', 'Awards & Honors'];

/**
 * Department news (SRS 4.14.1): a department editor proposes a notice for their unit; it is published after approval
 * (a departmental approver publishes directly), on the department's page and in the news list (WEB-DYN-3), from the
 * scheduled date until it expires (WEB-CMS-6).
 */
export const DepartmentNewsPanel: React.FC<{ user: AdminUser; department?: Department; onSubmitted: () => void }> = ({ user, department, onSubmitted }) => {
  const notices = useAsync(() => (department ? dynamicApi.getDepartmentNotices(department.id, department.name) : Promise.resolve([])), [department?.id]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [text, setText] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [issues, setIssues] = useState<ContentIssue[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!department) return <p className="text-xs text-slate-600">No department is assigned to your account.</p>;
  const approver = canApproveChange(user, { departmentId: department.id });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = [...checkText('Title', title, { required: true, paragraph: false, maxLength: 200 }), ...checkText('Notice text', text, { required: true })];
    setIssues(found);
    if (hasErrors(found)) return setError('Fix the problems marked "must be fixed" first.');
    // A date means the start of that day, local time; both are sent as ISO date-times.
    const startOf = (day: string) => (day ? new Date(`${day}T00:00`).toISOString() : undefined);
    const publishIso = startOf(publishAt);
    const expiresIso = startOf(expiresAt);
    if (expiresIso && Date.parse(expiresIso) <= Math.max(Date.now(), publishIso ? Date.parse(publishIso) : 0)) {
      return setError(publishIso ? 'The removal date must be after the publication date.' : 'The removal date must be in the future.');
    }
    setError('');
    const date = new Date(publishAt || todayIso()).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const after = { title: title.trim(), category, date, excerpt: text.trim(), departmentIds: [department.id], publish_at: publishIso, expires_at: expiresIso };
    let live: boolean;
    try {
      live = await workflow.save(
        user,
        { entity: 'notice', action: 'create', departmentId: department.id, summary: `${department.name} news: ${title.trim().slice(0, 80)}`, after, issues: found },
        () => adminApi.createNotice(after),
      );
    } catch {
      return setError('The news could not be saved. Check your connection and try again.');
    }
    setMessage(
      !live
        ? 'Sent for approval. It will appear on the department page and in the news once it is approved.'
        : publishIso && Date.parse(publishIso) > Date.now()
          ? `Published for ${formatDate(publishIso)}: it appears on the department page and in the news from that day.`
          : 'Published. It appears on the department page and in the news.',
    );
    if (live) notices.reload();
    setTitle('');
    setText('');
    setPublishAt('');
    setExpiresAt('');
    setIssues([]);
    onSubmitted();
  };

  const input = 'min-h-11 w-full rounded-lg border border-slate-300 px-2';
  return (
    <div className="space-y-6 text-xs">
      <form onSubmit={submit} noValidate className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-ink">{approver ? 'Publish' : 'Propose'} news for {department.name}</h2>
        <div>
          <label htmlFor="news-title" className="mb-1 block font-semibold text-slate-700">Title *</label>
          <input id="news-title" value={title} onChange={(e) => setTitle(e.target.value)} className={input} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="news-category" className="mb-1 block font-semibold text-slate-700">Category</label>
            <select id="news-category" value={category} onChange={(e) => setCategory(e.target.value)} className={`${input} bg-white`}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="news-publish" className="mb-1 block font-semibold text-slate-700">Publish on</label>
            <input id="news-publish" type="date" min={todayIso()} value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className={input} aria-describedby="news-publish-hint" />
            <p id="news-publish-hint" className="mt-1 text-slate-600">Leave empty to publish once approved.</p>
          </div>
          <div>
            <label htmlFor="news-expires" className="mb-1 block font-semibold text-slate-700">Remove from the website on</label>
            <input id="news-expires" type="date" min={publishAt || todayIso()} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={input} />
          </div>
        </div>
        <div>
          <label htmlFor="news-text" className="mb-1 block font-semibold text-slate-700">Notice text *</label>
          <textarea id="news-text" rows={6} value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2" />
        </div>
        <ContentIssues issues={issues} />
        {error && <p role="alert" className="font-semibold text-red-700">{error}</p>}
        {message && <p role="status" className="font-semibold text-emerald-800">{message}</p>}
        <button type="submit" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-brand-blue px-4 font-bold text-white">
          <Send className="h-4 w-4" aria-hidden="true" /> {approver ? 'Publish' : 'Submit for approval'}
        </button>
      </form>
      <section aria-labelledby="dept-notices-title" className="space-y-2">
        <h2 id="dept-notices-title" className="text-sm font-bold text-ink">Published notices of {department.name}</h2>
        {notices.error ? <p role="alert" className="text-red-700">Notices could not be loaded.</p> : !notices.data ? <p>Loading…</p> : notices.data.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-700">No notices found for this department.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {notices.data.slice(0, 30).map((n) => <li key={n.id} className="p-3"><strong>{n.title}</strong><span className="block text-slate-600">{n.category} · {n.date}</span></li>)}
          </ul>
        )}
      </section>
    </div>
  );
};
