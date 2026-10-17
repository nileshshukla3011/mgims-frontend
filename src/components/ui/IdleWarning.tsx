import React from 'react';
import { Modal } from '@/components/ui/Modal';

/** "You will be signed out" warning for the idle timeout (WEB-SEC-7). */
export const IdleWarning: React.FC<{ secondsLeft: number; onStay: () => void; onSignOut: () => void; labels?: { title: string; body: string; stay: string; signOut: string } }> = ({
  secondsLeft,
  onStay,
  onSignOut,
  labels = {
    title: 'Are you still there?',
    body: 'For your security, you will be signed out in {s} seconds.',
    stay: 'Stay signed in',
    signOut: 'Sign out now',
  },
}) => (
  <Modal title={labels.title} onClose={onStay}>
    <p role="timer" aria-live="polite" className="text-sm text-slate-800">{labels.body.replace('{s}', String(secondsLeft))}</p>
    <div className="flex flex-wrap justify-end gap-2">
      <button type="button" onClick={onSignOut} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">
        {labels.signOut}
      </button>
      <button type="button" onClick={onStay} className="min-h-11 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white hover:bg-blue-900">
        {labels.stay}
      </button>
    </div>
  </Modal>
);
