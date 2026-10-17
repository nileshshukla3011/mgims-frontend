import React, { useState } from 'react';
import { ArrowDown, ArrowUp, BarChart3, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminUser, Department } from '@/types';
import { Survey, SurveyQuestion } from '@/types/services';
import { analyticsApi, engagementAdminApi, FeedbackItem, reportsApi, SurveyResults } from '@/admin/governanceApi';
import { isSuperAdmin } from '@/admin/access';
import { audit } from '@/admin/audit';
import { checkText, hasErrors } from '@/admin/contentChecks';
import { useAsync } from '@/hooks/useAsync';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Status';
import { isMockMode } from '@/services/api';
import { formatDateTime } from '@/utils/format';

const QUESTION_TYPES: [SurveyQuestion['type'], string][] = [
  ['rating', 'Rating 1 to 5'],
  ['single', 'One choice'],
  ['multiple', 'Several choices'],
  ['text', 'Short answer'],
  ['longtext', 'Long answer'],
];

/** Feedback inbox (WEB-ENG-4), surveys (WEB-ENG-1) and newsletter segments (WEB-ENG-5). */
export const EngagementPanel: React.FC<{ user: AdminUser; departments: Department[] }> = ({ user, departments }) => {
  const superAdmin = isSuperAdmin(user);
  const feedback = useAsync(() => analyticsApi.feedback(superAdmin ? undefined : user.departmentId), [user.username]);
  const surveys = useAsync(() => engagementAdminApi.surveys(), []);
  const segments = useAsync(() => (superAdmin ? engagementAdminApi.newsletterSegments() : Promise.resolve([])), [superAdmin]);
  const [editing, setEditing] = useState<Survey | null>(null);
  const [results, setResults] = useState<{ survey: Survey; data: SurveyResults } | null>(null);
  const [message, setMessage] = useState('');
  const mine = (surveys.data ?? []).filter((s) => superAdmin || s.departmentId === user.departmentId);
  const deptName = (id?: string) => (id ? departments.find((d) => d.id === id)?.name ?? id : 'Institute-wide');

  const setStatus = async (item: FeedbackItem, status: FeedbackItem['status']) => {
    await analyticsApi.setFeedbackStatus(item, status);
    await audit.record(user, 'Updated feedback', `${item.id}: ${status}`, 'feedback', item.id);
    feedback.reload();
  };

  const newSurvey = (): Survey => ({ id: `new-${Date.now()}`, title: '', description: '', departmentId: superAdmin ? undefined : user.departmentId, status: 'Draft', anonymous: true, questions: [] });

  return (
    <div className="space-y-8 text-xs">
      {message && <p role="status" className="rounded border border-emerald-200 bg-emerald-50 p-2 font-semibold text-emerald-800">{message}</p>}

      <section aria-labelledby="inbox-title" className="space-y-3">
        <h2 id="inbox-title" className="text-sm font-bold text-ink">Feedback inbox{superAdmin ? '' : `: ${deptName(user.departmentId)}`}</h2>
        <p className="text-slate-600">Site feedback that names a department is routed to that department; the rest comes to the web team.</p>
        {feedback.error ? <p role="alert" className="text-red-700">Feedback could not be loaded.</p> : !feedback.data ? <p>Loading…</p> : feedback.data.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-700">No feedback yet{isMockMode ? '. In demo mode, feedback stays in the public website’s browser and does not reach the console.' : '.'}</p>
        ) : (
          <ul className="space-y-2">
            {feedback.data.map((f) => (
              <li key={f.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                <div>
                  <p className="font-semibold">{f.rating}/5 · {formatDateTime(f.at)} · {f.department ?? deptName(f.departmentId)}{f.page ? ` · ${f.page}` : ''}</p>
                  {f.lookingFor && <p>Looking for: {f.lookingFor} ({f.found ?? '—'})</p>}
                  {f.comment && <p className="text-slate-800">“{f.comment}”</p>}
                </div>
                <div>
                  <label htmlFor={`fb-status-${f.id}`} className="sr-only">Status of feedback {f.id}</label>
                  <select id={`fb-status-${f.id}`} value={f.status} onChange={(e) => setStatus(f, e.target.value as FeedbackItem['status'])} className="min-h-11 rounded-lg border border-slate-300 bg-white px-2">
                    {['New', 'Seen', 'Actioned'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="surveys-title" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="surveys-title" className="text-sm font-bold text-ink">Surveys</h2>
          <button type="button" onClick={() => setEditing(newSurvey())} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-brand-blue px-3 font-bold text-white">
            <Plus className="h-4 w-4" aria-hidden="true" /> New survey
          </button>
        </div>
        {!superAdmin && <p className="text-slate-600">You can prepare surveys for your department; the web team opens them on the website.</p>}
        {surveys.error ? <p role="alert" className="text-red-700">Surveys could not be loaded.</p> : !surveys.data ? <p>Loading…</p> : mine.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-700">No surveys yet.</p>
        ) : (
          <ul className="space-y-2">
            {mine.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                  <p className="text-slate-600">{deptName(s.departmentId)} · {s.questions.length} questions{s.closesOn ? ` · closes ${s.closesOn}` : ''}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={s.status} />
                  <button type="button" onClick={() => setEditing(s)} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-slate-300 px-2 font-semibold text-link">
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Edit<span className="sr-only"> {s.title}</span>
                  </button>
                  <button type="button" onClick={async () => setResults({ survey: s, data: await engagementAdminApi.results(s) })} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-slate-300 px-2 font-semibold text-link">
                    <BarChart3 className="h-4 w-4" aria-hidden="true" /> Results<span className="sr-only"> of {s.title}</span>
                  </button>
                  {superAdmin && s.status !== 'Open' && (
                    <button type="button" onClick={async () => { await engagementAdminApi.setStatus(user, s, 'Open'); setMessage(`“${s.title}” is open on the feedback page.`); surveys.reload(); }} className="min-h-11 rounded-lg bg-emerald-700 px-3 font-semibold text-white">
                      Open<span className="sr-only"> {s.title}</span>
                    </button>
                  )}
                  {superAdmin && s.status === 'Open' && (
                    <button type="button" onClick={async () => { await engagementAdminApi.setStatus(user, s, 'Closed'); setMessage(`“${s.title}” is closed.`); surveys.reload(); }} className="min-h-11 rounded-lg border border-red-300 px-3 font-semibold text-red-700">
                      Close<span className="sr-only"> {s.title}</span>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {isMockMode && <p className="text-slate-600">Demo mode: surveys made here are kept in this browser; the public website shows its own demo survey.</p>}
      </section>

      {superAdmin && (
        <section aria-labelledby="newsletter-title" className="space-y-3">
          <h2 id="newsletter-title" className="text-sm font-bold text-ink">Newsletter</h2>
          <p className="text-slate-600">Subscribers choose topics (segments) and confirm by email; every newsletter carries a one-click unsubscribe link that deletes the address. Newsletters are sent by the backend mail service.</p>
          {segments.data && segments.data.length > 0 ? (
            <>
              <ul className="grid gap-2 sm:grid-cols-2">{segments.data.map((s) => <li key={s.id} className="rounded-lg border border-slate-200 bg-white p-3"><strong>{s.title}</strong>: {s.subscribers.toLocaleString('en-IN')} subscribers</li>)}</ul>
              <a href={reportsApi.exportUrl('newsletter-subscribers')} className="inline-flex min-h-11 items-center font-semibold text-link underline">Export subscribers (CSV)</a>
            </>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-700">No subscriber figures{isMockMode ? ' in demo mode' : ' yet'}.</p>
          )}
        </section>
      )}

      {editing && (
        <SurveyBuilder
          user={user}
          departments={departments}
          survey={editing}
          onClose={() => setEditing(null)}
          onSaved={(s) => { setEditing(null); setMessage(`Saved “${s.title}”.`); surveys.reload(); }}
        />
      )}
      {results && (
        <Modal title={`Results: ${results.survey.title}`} onClose={() => setResults(null)} size="lg">
          <p className="text-sm text-slate-800">{results.data.responses} responses</p>
          <ul className="space-y-3 text-xs">
            {results.data.questions.map((q) => (
              <li key={q.id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-semibold text-slate-900">{q.text}</p>
                {q.average !== undefined && <p>Average: {q.average.toFixed(1)} / 5</p>}
                {q.counts && <ul className="ml-4 list-disc">{Object.entries(q.counts).map(([option, n]) => <li key={option}>{option}: {n}</li>)}</ul>}
                {q.texts && q.texts.length > 0 && <ul className="ml-4 list-disc">{q.texts.slice(0, 20).map((t, i) => <li key={i}>{t}</li>)}</ul>}
                {!q.counts && q.average === undefined && !q.texts?.length && <p className="text-slate-600">No answers yet.</p>}
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
};

const SurveyBuilder: React.FC<{ user: AdminUser; departments: Department[]; survey: Survey; onClose: () => void; onSaved: (s: Survey) => void }> = ({ user, departments, survey, onClose, onSaved }) => {
  const superAdmin = isSuperAdmin(user);
  const [draft, setDraft] = useState<Survey>(survey);
  const [optionsText, setOptionsText] = useState<Record<string, string>>(() => Object.fromEntries(survey.questions.map((q) => [q.id, (q.options ?? []).join('\n')])));
  const [error, setError] = useState('');

  const update = (id: string, change: Partial<SurveyQuestion>) => setDraft((d) => ({ ...d, questions: d.questions.map((q) => (q.id === id ? { ...q, ...change } : q)) }));
  const move = (index: number, by: number) =>
    setDraft((d) => {
      const qs = [...d.questions];
      const [q] = qs.splice(index, 1);
      qs.splice(index + by, 0, q);
      return { ...d, questions: qs };
    });

  const save = async () => {
    const questions = draft.questions.map((q) => ({
      ...q,
      text: q.text.trim(),
      options: q.type === 'single' || q.type === 'multiple' ? (optionsText[q.id] ?? '').split('\n').map((o) => o.trim()).filter(Boolean) : undefined,
    }));
    const issues = [...checkText('Survey title', draft.title, { required: true, paragraph: false, maxLength: 150 }), ...questions.flatMap((q, i) => checkText(`Question ${i + 1}`, q.text, { required: true, paragraph: false }))];
    if (questions.length === 0) return setError('Add at least one question.');
    if (hasErrors(issues)) return setError(issues.filter((i) => i.severity === 'error').map((i) => `${i.field}: ${i.message}`).join(' '));
    const bad = questions.find((q) => (q.type === 'single' || q.type === 'multiple') && (q.options?.length ?? 0) < 2);
    if (bad) return setError(`“${bad.text}” needs at least two choices, one per line.`);
    try {
      onSaved(await engagementAdminApi.saveSurvey(user, { ...draft, title: draft.title.trim(), description: draft.description?.trim(), questions }));
    } catch {
      setError('The survey could not be saved.');
    }
  };

  const input = 'min-h-11 w-full rounded-lg border border-slate-300 px-2';
  return (
    <Modal title={survey.id.startsWith('new-') ? 'New survey' : 'Edit survey'} onClose={onClose} size="lg">
      <div className="space-y-3 text-xs">
        <div>
          <label htmlFor="sv-title" className="mb-1 block font-semibold text-slate-700">Title *</label>
          <input id="sv-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={input} />
        </div>
        <div>
          <label htmlFor="sv-desc" className="mb-1 block font-semibold text-slate-700">Introduction</label>
          <textarea id="sv-desc" rows={2} value={draft.description ?? ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="w-full rounded-lg border border-slate-300 p-2" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="sv-dept" className="mb-1 block font-semibold text-slate-700">Department</label>
            <select id="sv-dept" value={draft.departmentId ?? ''} disabled={!superAdmin} onChange={(e) => setDraft({ ...draft, departmentId: e.target.value || undefined })} className={`${input} bg-white disabled:bg-slate-100`}>
              <option value="">Institute-wide</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sv-closes" className="mb-1 block font-semibold text-slate-700">Closes on</label>
            <input id="sv-closes" type="date" value={draft.closesOn ?? ''} onChange={(e) => setDraft({ ...draft, closesOn: e.target.value || undefined })} className={input} />
          </div>
          <label htmlFor="sv-anon" className="flex min-h-11 items-center gap-2 self-end font-semibold text-slate-800">
            <input id="sv-anon" type="checkbox" checked={draft.anonymous} onChange={(e) => setDraft({ ...draft, anonymous: e.target.checked })} className="h-5 w-5" /> Anonymous answers
          </label>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-bold text-ink">Questions</legend>
          {draft.questions.map((q, i) => (
            <div key={q.id} className="space-y-2 rounded-lg border border-slate-200 p-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_12rem]">
                <div>
                  <label htmlFor={`q-text-${q.id}`} className="mb-1 block font-semibold text-slate-700">Question {i + 1} *</label>
                  <input id={`q-text-${q.id}`} value={q.text} onChange={(e) => update(q.id, { text: e.target.value })} className={input} />
                </div>
                <div>
                  <label htmlFor={`q-type-${q.id}`} className="mb-1 block font-semibold text-slate-700">Answer type</label>
                  <select id={`q-type-${q.id}`} value={q.type} onChange={(e) => update(q.id, { type: e.target.value as SurveyQuestion['type'] })} className={`${input} bg-white`}>
                    {QUESTION_TYPES.map(([type, label]) => <option key={type} value={type}>{label}</option>)}
                  </select>
                </div>
              </div>
              {(q.type === 'single' || q.type === 'multiple') && (
                <div>
                  <label htmlFor={`q-options-${q.id}`} className="mb-1 block font-semibold text-slate-700">Choices (one per line)</label>
                  <textarea id={`q-options-${q.id}`} rows={3} value={optionsText[q.id] ?? ''} onChange={(e) => setOptionsText((o) => ({ ...o, [q.id]: e.target.value }))} className="w-full rounded-lg border border-slate-300 p-2" />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor={`q-req-${q.id}`} className="flex min-h-11 items-center gap-2">
                  <input id={`q-req-${q.id}`} type="checkbox" checked={q.required} onChange={(e) => update(q.id, { required: e.target.checked })} className="h-5 w-5" /> Required
                </label>
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move question ${i + 1} up`} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-slate-300 disabled:opacity-40"><ArrowUp className="h-4 w-4" aria-hidden="true" /></button>
                <button type="button" disabled={i === draft.questions.length - 1} onClick={() => move(i, 1)} aria-label={`Move question ${i + 1} down`} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-slate-300 disabled:opacity-40"><ArrowDown className="h-4 w-4" aria-hidden="true" /></button>
                <button type="button" onClick={() => setDraft((d) => ({ ...d, questions: d.questions.filter((x) => x.id !== q.id) }))} aria-label={`Remove question ${i + 1}`} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-red-300 text-red-700"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setDraft((d) => ({ ...d, questions: [...d.questions, { id: `q${Date.now()}`, text: '', type: 'rating', required: false }] }))} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 font-semibold text-link">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add a question
          </button>
        </fieldset>
        {error && <p role="alert" className="font-semibold text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold">Cancel</button>
          <button type="button" onClick={save} className="min-h-11 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white">Save survey</button>
        </div>
      </div>
    </Modal>
  );
};
