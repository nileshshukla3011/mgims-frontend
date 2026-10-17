import React, { useEffect, useRef, useState } from 'react';
import { adminApi } from '@/admin/adminApi';
import { AdminUser, FacultyMember } from '@/types';
import { workflow } from '@/admin/workflow';
import { canApprove } from '@/admin/access';
import { checkText, ContentIssue, hasErrors } from '@/admin/contentChecks';
import { ContentIssues } from '@/admin/ChangeViews';

interface Props {
  user: AdminUser;
  member: FacultyMember;
  /** The member's department, so the change reaches the right approver queue. */
  departmentId?: string;
  onClose: () => void;
  /** `saved` is set when the edit is live; a department editor's edit waits for approval instead. */
  onDone: (result: { saved?: FacultyMember; message: string }) => void;
}

const toList = (text: string) => text.split(',').map((s) => s.trim()).filter(Boolean);

export const FacultyEditDialog: React.FC<Props> = ({ user, member, departmentId, onClose, onDone }) => {
  const [designation, setDesignation] = useState(member.designation);
  const [phones, setPhones] = useState(member.phones.join(', '));
  const [emails, setEmails] = useState(member.emails.join(', '));
  const [bio, setBio] = useState(member.bio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [issues, setIssues] = useState<ContentIssue[]>([]);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const approver = canApprove(user);

  // UX4G modal guidance: focus moves into the dialog and returns to the opener when it closes; Esc closes it.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => firstFieldRef.current?.focus());
    return () => {
      requestAnimationFrame(() => opener?.focus());
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const after = { designation: designation.trim(), phones: toList(phones), emails: toList(emails), bio: bio.trim() };
    if (!after.designation) return setError('Enter the designation.');
    if (after.emails.some((m) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m))) return setError('Check the email addresses: one of them is not valid.');
    if (after.phones.some((p) => !/^[0-9+()\-\s]{6,20}$/.test(p) && !/ext/i.test(p))) return setError('Check the phone numbers: use digits, spaces, + and -.');
    const found = [...checkText('Designation', after.designation, { paragraph: false, maxLength: 120 }), ...checkText('Short biography', after.bio)];
    setIssues(found);
    if (hasErrors(found)) return setError('Fix the problems marked "must be fixed" first.');
    setSaving(true);
    setError('');
    let saved: FacultyMember | undefined;
    try {
      const live = await workflow.save(
        user,
        {
          entity: 'faculty', action: 'update', entityId: member.id, departmentId, summary: `${member.name}: faculty profile`,
          before: { designation: member.designation, phones: member.phones, emails: member.emails, bio: member.bio }, after, issues: found,
        },
        async () => (saved = await adminApi.updateFaculty(member.id, after)),
      );
      onDone(live ? { saved, message: `Saved and published ${member.name}'s profile.` } : { message: `Sent ${member.name}'s profile for approval.` });
    } catch {
      setError('Could not save. You may not have access to this faculty member, or the server is not reachable.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="faculty-edit-title" className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 border border-slate-300 space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <h2 id="faculty-edit-title" className="font-bold text-base font-serif text-ink">Edit {member.name}</h2>
          <p className="text-xs text-slate-600">{member.department}</p>
        </div>
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label htmlFor="fac-designation" className="block text-slate-700 font-semibold mb-1">Designation</label>
            <input
              ref={firstFieldRef}
              id="fac-designation"
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full min-h-11 p-2 border border-slate-300 rounded-lg font-medium"
            />
          </div>
          <div>
            <label htmlFor="fac-phones" className="block text-slate-700 font-semibold mb-1">Official phones (comma-separated)</label>
            <input
              id="fac-phones"
              type="text"
              inputMode="tel"
              value={phones}
              onChange={(e) => setPhones(e.target.value)}
              className="w-full min-h-11 p-2 border border-slate-300 rounded-lg font-medium"
            />
          </div>
          <div>
            <label htmlFor="fac-emails" className="block text-slate-700 font-semibold mb-1">Official emails (comma-separated)</label>
            <input
              id="fac-emails"
              type="text"
              inputMode="email"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="w-full min-h-11 p-2 border border-slate-300 rounded-lg font-medium"
            />
          </div>
          <div>
            <label htmlFor="fac-bio" className="block text-slate-700 font-semibold mb-1">Short biography</label>
            <textarea
              id="fac-bio"
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg font-medium"
            />
          </div>

          <ContentIssues issues={issues} />
          {error && (
            <p role="alert" className="font-semibold text-red-700 bg-red-50 p-2 rounded border border-red-200">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="min-h-11 px-3 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="min-h-11 px-4 py-2 disabled:opacity-60 bg-brand-blue hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm">
              {saving ? 'Saving…' : approver ? 'Save and publish' : 'Submit for approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
