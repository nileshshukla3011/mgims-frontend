import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, History, RotateCcw, Send, Undo2, XCircle } from 'lucide-react';
import { AdminUser, Department } from '@/types';
import { ContentChange, workflow } from '@/admin/workflow';
import { canApprove, isSuperAdmin } from '@/admin/access';
import { ChangeDiff, ContentIssues } from '@/admin/ChangeViews';
import { useAsync } from '@/hooks/useAsync';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Status';
import { formatDateTime } from '@/utils/format';

const ACTION_LABEL = { create: 'New', update: 'Edit', delete: 'Removal' } as const;

const ChangeCard: React.FC<{ change: ContentChange; departmentName?: string; actions?: React.ReactNode }> = ({ change, departmentName, actions }) => {
  const [open, setOpen] = useState(false);
  return (
    <li className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 text-xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{change.summary}</p>
          <p className="text-slate-600">
            {ACTION_LABEL[change.action]} · {change.entity}
            {departmentName ? ` · ${departmentName}` : ''} · by {change.author.name}
            {change.submittedAt ? ` · submitted ${formatDateTime(change.submittedAt)}` : ` · saved ${formatDateTime(change.createdAt)}`}
            {change.version ? ` · version ${change.version}` : ''}
          </p>
          {change.publishAt && change.status === 'Approved' && <p className="font-semibold text-slate-800">Scheduled for {formatDateTime(change.publishAt)}</p>}
          {change.note && <p className="text-slate-800"><strong>Reviewer:</strong> {change.note}</p>}
        </div>
        <StatusBadge status={change.status === 'Approved' ? 'Scheduled' : change.status} label={change.status === 'Approved' ? 'Approved, scheduled' : change.status} />
      </div>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="inline-flex min-h-11 items-center gap-1 font-semibold text-link">
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" /> {open ? 'Hide changes' : 'Show changes'}
      </button>
      {open && (
        <div className="space-y-2">
          <ChangeDiff change={change} />
          {change.issues && <ContentIssues issues={change.issues} title="Checks when submitted" />}
        </div>
      )}
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </li>
  );
};

/**
 * Maker-checker queue (WEB-CMS-4): approvers decide (a departmental approver sees only their department's changes);
 * authors follow their drafts and submissions.
 */
export const ApprovalsPanel: React.FC<{ user: AdminUser; departments: Department[]; onChanged?: () => void }> = ({ user, departments, onChanged }) => {
  const approver = canApprove(user);
  const scope = isSuperAdmin(user) ? {} : { departmentId: user.departmentId };
  const changes = useAsync(() => workflow.list(approver ? scope : { author: user.username }), [user.username]);
  const [deciding, setDeciding] = useState<{ change: ContentChange; mode: 'approve' | 'reject' } | null>(null);
  const [rollingBack, setRollingBack] = useState<ContentChange | null>(null);
  const [history, setHistory] = useState<ContentChange[] | null>(null);
  const [message, setMessage] = useState('');
  const deptName = (id?: string) => departments.find((d) => d.id === id)?.name;

  const done = (text: string) => {
    setMessage(text);
    changes.reload();
    onChanged?.();
  };
  const list = changes.data ?? [];
  const btn = 'inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 font-semibold';

  const section = (title: string, items: ContentChange[], empty: string, actions?: (c: ContentChange) => React.ReactNode) => (
    <section aria-label={title} className="space-y-2">
      <h3 className="text-sm font-bold text-ink">{title} ({items.length})</h3>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-600">{empty}</p>
      ) : (
        <ul className="space-y-2">{items.map((c) => <ChangeCard key={c.id} change={c} departmentName={deptName(c.departmentId)} actions={actions?.(c)} />)}</ul>
      )}
    </section>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
        {approver
          ? `${isSuperAdmin(user) ? 'Department editors’' : `${deptName(user.departmentId) ?? 'Your department'} editors’`} changes wait here for your sign-off. Approve to publish now or at a set time, or reject with a reason the author will see. Your own edits are published at once and kept as versions you can roll back.`
          : 'Your edits are sent for approval, by your department’s approver or by the Dean’s office or IT head, before they appear on the website. You can withdraw a submission until it is decided.'}
      </div>
      {message && <p role="status" className="rounded border border-emerald-200 bg-emerald-50 p-2 text-xs font-semibold text-emerald-800">{message}</p>}
      {changes.error ? <p role="alert" className="text-xs text-red-700">The workflow could not be loaded.</p> : null}
      {!changes.data && !changes.error && <p className="text-xs text-slate-600">Loading…</p>}

      {changes.data && approver && (
        <>
          {section('Waiting for approval', list.filter((c) => c.status === 'Submitted'), 'Nothing is waiting for approval.', (c) => (
            <>
              <button type="button" onClick={() => setDeciding({ change: c, mode: 'approve' })} className={`${btn} bg-emerald-700 text-white`}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Approve<span className="sr-only"> {c.summary}</span>
              </button>
              <button type="button" onClick={() => setDeciding({ change: c, mode: 'reject' })} className={`${btn} border border-red-300 text-red-700`}>
                <XCircle className="h-4 w-4" aria-hidden="true" /> Reject<span className="sr-only"> {c.summary}</span>
              </button>
            </>
          ))}
          {section('Approved and scheduled', list.filter((c) => c.status === 'Approved'), 'Nothing is scheduled.')}
          {section('Recently published', list.filter((c) => c.status === 'Published').slice(0, 15), 'Nothing has been published through the console yet.', (c) => (
            <>
              {c.entityId && (
                <button type="button" onClick={async () => setHistory(await workflow.history(c.entity, c.entityId!))} className={`${btn} border border-slate-300 text-link`}>
                  <History className="h-4 w-4" aria-hidden="true" /> Versions<span className="sr-only"> of {c.summary}</span>
                </button>
              )}
              {!c.rollbackOf && (
                <button type="button" onClick={() => setRollingBack(c)} className={`${btn} border border-slate-300 text-slate-800`}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" /> Roll back<span className="sr-only"> {c.summary}</span>
                </button>
              )}
            </>
          ))}
          {section('Recently rejected', list.filter((c) => c.status === 'Rejected').slice(0, 10), 'No rejected changes.')}
        </>
      )}

      {changes.data && !approver && (
        <>
          {section('Drafts', list.filter((c) => c.status === 'Draft'), 'No drafts.', (c) => (
            <>
              <button type="button" onClick={async () => { await workflow.submit(user, c); done(`Submitted “${c.summary}” for approval.`); }} className={`${btn} bg-brand-blue text-white`}>
                <Send className="h-4 w-4" aria-hidden="true" /> Submit for approval<span className="sr-only"> {c.summary}</span>
              </button>
              <button type="button" onClick={async () => { await workflow.withdraw(user, c); done(`Discarded the draft “${c.summary}”.`); }} className={`${btn} border border-slate-300 text-slate-800`}>
                Discard<span className="sr-only"> {c.summary}</span>
              </button>
            </>
          ))}
          {section('Waiting for approval', list.filter((c) => c.status === 'Submitted'), 'Nothing of yours is waiting for approval.', (c) => (
            <button type="button" onClick={async () => { await workflow.withdraw(user, c); done(`Withdrew “${c.summary}”.`); }} className={`${btn} border border-slate-300 text-slate-800`}>
              <Undo2 className="h-4 w-4" aria-hidden="true" /> Withdraw<span className="sr-only"> {c.summary}</span>
            </button>
          ))}
          {section('Decided', list.filter((c) => ['Approved', 'Published', 'Rejected'].includes(c.status)).slice(0, 20), 'No decisions yet.')}
        </>
      )}

      {deciding && <DecisionDialog user={user} {...deciding} onClose={() => setDeciding(null)} onDone={(text) => { setDeciding(null); done(text); }} />}
      {rollingBack && (
        <Modal title="Roll back this change?" onClose={() => setRollingBack(null)}>
          <p className="text-sm text-slate-800">“{rollingBack.summary}” will be reversed and the earlier content published again as a new version. The rollback is recorded in the audit log.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRollingBack(null)} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold">Cancel</button>
            <button
              type="button"
              onClick={async () => {
                const target = rollingBack;
                setRollingBack(null);
                try {
                  await workflow.rollback(user, target);
                  done(`Rolled back “${target.summary}”.`);
                } catch {
                  setMessage('The rollback failed. The content was not changed.');
                }
              }}
              className="min-h-11 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white"
            >
              Roll back
            </button>
          </div>
        </Modal>
      )}
      {history && (
        <Modal title="Published versions" onClose={() => setHistory(null)} size="lg">
          <ol className="space-y-2 text-xs">
            {history.map((h) => (
              <li key={h.id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-semibold text-slate-900">Version {h.version} · {formatDateTime(h.publishedAt)} · {h.author.name}{h.reviewer && h.reviewer.username !== h.author.username ? `, approved by ${h.reviewer.name}` : ''}</p>
                <p className="text-slate-700">{h.summary}</p>
              </li>
            ))}
          </ol>
        </Modal>
      )}
    </div>
  );
};

const DecisionDialog: React.FC<{ user: AdminUser; change: ContentChange; mode: 'approve' | 'reject'; onClose: () => void; onDone: (message: string) => void }> = ({ user, change, mode, onClose, onDone }) => {
  const [note, setNote] = useState('');
  const [schedule, setSchedule] = useState(false);
  const [publishAt, setPublishAt] = useState('');
  const [error, setError] = useState('');
  const errors = change.issues?.filter((i) => i.severity === 'error').length ?? 0;

  const confirm = async () => {
    if (mode === 'reject' && note.trim().length < 5) return setError('Give the author a reason (at least 5 characters).');
    if (mode === 'approve' && schedule && (!publishAt || new Date(publishAt) <= new Date())) return setError('Choose a publication time in the future.');
    try {
      if (mode === 'approve') {
        await workflow.approve(user, change, { note: note.trim() || undefined, publishAt: schedule ? new Date(publishAt).toISOString() : undefined });
        onDone(schedule ? `Approved “${change.summary}”; it will be published ${new Date(publishAt).toLocaleString('en-IN')}.` : `Approved and published “${change.summary}”.`);
      } else {
        await workflow.reject(user, change, note.trim());
        onDone(`Rejected “${change.summary}”.`);
      }
    } catch {
      setError('The decision could not be saved. Please try again.');
    }
  };

  return (
    <Modal title={mode === 'approve' ? 'Approve change' : 'Reject change'} onClose={onClose} size="lg">
      <p className="text-sm font-semibold text-slate-900">{change.summary}</p>
      <ChangeDiff change={change} />
      {mode === 'approve' && errors > 0 && <p className="text-xs font-semibold text-red-700">This change failed {errors} content check{errors > 1 ? 's' : ''} when it was submitted.</p>}
      {mode === 'approve' && (
        <div className="space-y-2 text-xs">
          <label htmlFor="decision-schedule" className="flex min-h-11 items-center gap-2 font-semibold text-slate-800">
            <input id="decision-schedule" type="checkbox" checked={schedule} onChange={(e) => setSchedule(e.target.checked)} className="h-5 w-5" />
            Publish later (scheduled publishing)
          </label>
          {schedule && (
            <div>
              <label htmlFor="decision-at" className="mb-1 block font-semibold text-slate-700">Publish on</label>
              <input id="decision-at" type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className="min-h-11 rounded-lg border border-slate-300 px-2" />
            </div>
          )}
        </div>
      )}
      <div className="text-xs">
        <label htmlFor="decision-note" className="mb-1 block font-semibold text-slate-700">{mode === 'reject' ? 'Reason for the author *' : 'Note for the author (optional)'}</label>
        <textarea id="decision-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className="w-full rounded-lg border border-slate-300 p-2" />
      </div>
      {error && <p role="alert" className="text-xs font-semibold text-red-700">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold">Cancel</button>
        <button type="button" onClick={confirm} className={`min-h-11 rounded-lg px-4 text-sm font-bold text-white ${mode === 'approve' ? 'bg-emerald-700' : 'bg-red-700'}`}>
          {mode === 'approve' ? (schedule ? 'Approve and schedule' : 'Approve and publish') : 'Reject'}
        </button>
      </div>
    </Modal>
  );
};
