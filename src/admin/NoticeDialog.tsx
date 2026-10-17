import React, { useState } from 'react';
import { AdminUser, NoticeSummary } from '@/types';
import { adminApi } from '@/admin/adminApi';
import { workflow } from '@/admin/workflow';
import { ContentIssues } from '@/admin/ChangeViews';
import { checkText, ContentIssue, hasErrors } from '@/admin/contentChecks';

// Notices are dated like "05 October 2026".
const today = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

/**
 * Publishing a notice, tender or vacancy (super admin). Content checks run first (WEB-CMP-6); the notice can be
 * scheduled and given a removal date (WEB-CMS-6).
 */
export const NoticeDialog: React.FC<{
  user: AdminUser;
  initialCategory: NoticeSummary['category'];
  onClose: () => void;
  onPublished: (created: NoticeSummary, message: string) => void;
}> = ({ user, initialCategory, onClose, onPublished }) => {
  const [category, setCategory] = useState<NoticeSummary['category']>(initialCategory);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today);
  const [text, setText] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [expiresOn, setExpiresOn] = useState('');
  const [issues, setIssues] = useState<ContentIssue[]>([]);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return setError('Enter the title and the notice text.');
    const found = [...checkText('Title', title, { required: true, paragraph: false, maxLength: 200 }), ...checkText('Notice text', text, { required: true })];
    setIssues(found);
    if (hasErrors(found)) return setError('Fix the problems marked "must be fixed" first.');
    const publishIso = publishAt ? new Date(publishAt).toISOString() : undefined;
    // "Remove from the website on" a date: the notice leaves the public lists at the start of that day, local time.
    const expiresIso = expiresOn ? new Date(`${expiresOn}T00:00`).toISOString() : undefined;
    if (expiresIso && Date.parse(expiresIso) <= Math.max(Date.now(), publishIso ? Date.parse(publishIso) : 0)) {
      return setError(publishIso ? 'The removal date must be after the publication date.' : 'The removal date must be in the future.');
    }
    setPublishing(true);
    setError('');
    try {
      const input = { title: title.trim(), category, date: date.trim(), excerpt: text.trim(), publish_at: publishIso, expires_at: expiresIso };
      const created = await workflow.publishDirect(
        user,
        { entity: 'notice', action: 'create', summary: `Notice: ${input.title.slice(0, 80)}`, after: input, issues: found },
        () => adminApi.createNotice(input),
      );
      onPublished(created, publishIso ? `Scheduled “${created.title}” for ${new Date(publishIso).toLocaleString('en-IN')}.` : `Published “${created.title}”.`);
    } catch {
      setError('The notice could not be published. Check your connection and try again.');
      setPublishing(false);
    }
  };

  const field = 'w-full p-2 border border-slate-300 rounded-lg font-medium';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="add-notice-title" className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 border border-slate-300 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <h2 id="add-notice-title" className="font-bold text-base font-serif text-ink">Publish new notice / tender</h2>
        <form onSubmit={submit} className="space-y-3 text-xs">
          <div>
            <label htmlFor="notice-category" className="block text-slate-700 font-semibold mb-1">Category *</label>
            <select autoFocus id="notice-category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
              <option value="Tender">Tender & procurement</option>
              <option value="Recruitment">Recruitment / vacancy</option>
              <option value="News & Events">News / academic notice</option>
              <option value="Eligible/Ineligible List">Shortlist / eligible candidates</option>
            </select>
          </div>
          <div>
            <label htmlFor="notice-title" className="block text-slate-700 font-semibold mb-1">Title *</label>
            <input id="notice-title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Tender Notice No. 25 for Supply of OT Equipment" className={field} />
          </div>
          <div>
            <label htmlFor="notice-date" className="block text-slate-700 font-semibold mb-1">Date</label>
            <input id="notice-date" type="text" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="notice-publish-at" className="block text-slate-700 font-semibold mb-1">Publish on (optional)</label>
              <input id="notice-publish-at" type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} aria-describedby="notice-publish-hint" className={`${field} min-h-11`} />
              <p id="notice-publish-hint" className="mt-1 text-slate-600">Leave empty to publish now.</p>
            </div>
            <div>
              <label htmlFor="notice-expires-at" className="block text-slate-700 font-semibold mb-1">Remove from the website on (optional)</label>
              <input id="notice-expires-at" type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} aria-describedby="notice-expires-hint" className={`${field} min-h-11`} />
              <p id="notice-expires-hint" className="mt-1 text-slate-600">For tenders and vacancies: the closing date. The notice then moves to the archive.</p>
            </div>
          </div>
          <div>
            <label htmlFor="notice-text" className="block text-slate-700 font-semibold mb-1">Notice description / text *</label>
            <textarea id="notice-text" required rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Provide circular text, submission deadline, specifications..." className={field} />
          </div>
          <ContentIssues issues={issues} />
          {error && <p role="alert" className="font-semibold text-red-700 bg-red-50 p-2 rounded border border-red-200">{error}</p>}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="min-h-11 px-3 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg">Cancel</button>
            <button type="submit" disabled={publishing} className="min-h-11 px-4 py-2 bg-brand-blue hover:bg-blue-900 disabled:opacity-60 text-white font-bold rounded-lg shadow-sm">
              {publishing ? 'Publishing…' : 'Publish notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
