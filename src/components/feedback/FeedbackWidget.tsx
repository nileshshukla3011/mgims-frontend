import React, { useState } from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { apiService } from '@/services/api';

/** Optional page feedback with Cancel/Submit (UX4G Design System: Feedback Widget; 5.1.9). */
export const FeedbackWidget: React.FC<{ page: string; prompt?: string }> = ({ page, prompt = 'Was this page helpful?' }) => {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (helpful === null) return;
    setState('sending');
    try {
      await apiService.submitFeedback({ page, helpful, comment: comment.trim() || undefined });
      setState('sent');
    } catch {
      setState('error');
    }
  };

  if (state === 'sent') {
    return <p role="status" className="text-sm font-semibold text-emerald-800">Thank you — your feedback has been recorded.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-3" aria-labelledby="feedback-prompt">
      <div className="flex flex-wrap items-center gap-2">
        <p id="feedback-prompt" className="text-sm font-semibold text-slate-800">{prompt}</p>
        <button type="button" aria-pressed={helpful === true} onClick={() => setHelpful(true)}
          className={`min-h-11 inline-flex items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold ${helpful === true ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'}`}>
          <ThumbsUp className="h-4 w-4" aria-hidden="true" /> Yes
        </button>
        <button type="button" aria-pressed={helpful === false} onClick={() => setHelpful(false)}
          className={`min-h-11 inline-flex items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold ${helpful === false ? 'border-red-700 bg-red-50 text-red-900' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'}`}>
          <ThumbsDown className="h-4 w-4" aria-hidden="true" /> No
        </button>
      </div>

      {helpful !== null && (
        <div className="space-y-2">
          <label htmlFor={`feedback-comment-${page}`} className="block text-xs font-semibold text-slate-700">
            {helpful ? 'Anything we could improve? (optional)' : 'What was missing or wrong? (optional)'}
          </label>
          <textarea id={`feedback-comment-${page}`} rows={2} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500}
            className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
          {state === 'error' && <p role="alert" className="text-xs font-semibold text-red-700">Feedback could not be sent. Please try again.</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={state === 'sending'} className="min-h-11 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white hover:bg-blue-900 disabled:opacity-60">
              {state === 'sending' ? 'Sending…' : 'Submit'}
            </button>
            <button type="button" onClick={() => { setHelpful(null); setComment(''); }} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      )}
    </form>
  );
};
