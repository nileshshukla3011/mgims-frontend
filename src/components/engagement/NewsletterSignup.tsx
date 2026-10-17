import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { engagementApi } from '@/services/engagementApi';
import { NewsletterSubscription } from '@/types/services';
import { useAsync } from '@/hooks/useAsync';
import { useAccessibility } from '@/context/AccessibilityContext';
import { IS_MOCK } from '@/services/http';
import { errorMessage } from '@/utils/errors';

/**
 * Newsletter sign-up in the footer (WEB-ENG-1, WEB-ENG-5): topics (segments), language, and explicit consent.
 * Double opt-in: nothing is sent until the address is confirmed from the email.
 */
export const NewsletterSignup: React.FC = () => {
  const { t, language } = useAccessibility();
  const [open, setOpen] = useState(false);
  const segments = useAsync(() => (open ? engagementApi.getNewsletterSegments() : Promise.resolve([])), [open]);
  const [email, setEmail] = useState('');
  const [chosen, setChosen] = useState<string[]>(['notices']);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<NewsletterSubscription | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError(t('form.error.email'));
    if (!chosen.length) return setError(t('news.error.topics'));
    if (!consent) return setError(t('news.error.consent'));
    setBusy(true);
    setError('');
    try {
      setDone(await engagementApi.subscribe({ email: email.trim(), segments: chosen, language }));
    } catch (err) {
      setError(errorMessage(err, t('common.service_error')));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div role="status" className="space-y-1 rounded border border-slate-600 bg-slate-800/80 p-3 text-xs text-slate-200">
        <p className="font-bold text-white">{t('news.check_email')}</p>
        <p>{t('news.check_email_body', { email: done.email })}</p>
        {IS_MOCK && <Link to={`/newsletter/manage?token=${encodeURIComponent(done.token)}`} className="inline-flex min-h-11 items-center font-semibold text-amber-300 underline">{t('news.demo_link')}</Link>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="flex items-center gap-2 border-b border-slate-700 pb-2 text-sm font-bold text-white"><Mail className="h-4 w-4 text-amber-400" aria-hidden="true" /> {t('news.title')}</h2>
      <p className="text-[11px] text-slate-300">{t('news.intro')}</p>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} aria-expanded={false} className="min-h-11 rounded border border-slate-500 bg-slate-800 px-3 text-xs font-semibold text-white hover:bg-slate-700">{t('news.subscribe')}</button>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-2 text-xs text-slate-200">
          <label htmlFor="news-email" className="block font-semibold">{t('form.email')}</label>
          <input id="news-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-describedby={error ? 'news-error' : undefined}
            className="min-h-11 w-full rounded border border-slate-500 bg-slate-900 px-2 text-sm text-white" />
          <fieldset>
            <legend className="font-semibold">{t('news.topics')}</legend>
            {(segments.data ?? []).map((s) => (
              <label key={s.id} htmlFor={`news-${s.id}`} className="flex min-h-9 items-center gap-2">
                <input id={`news-${s.id}`} type="checkbox" checked={chosen.includes(s.id)} onChange={() => setChosen((c) => (c.includes(s.id) ? c.filter((x) => x !== s.id) : [...c, s.id]))} className="h-4 w-4" />
                {s.title}
              </label>
            ))}
          </fieldset>
          <label htmlFor="news-consent" className="flex items-start gap-2">
            <input id="news-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{t('news.consent')} <Link to="/policies/privacy-policy" className="font-semibold text-amber-300 underline">{t('common.privacy_policy')}</Link>.</span>
          </label>
          {error && <p id="news-error" role="alert" className="font-semibold text-amber-300">{error}</p>}
          <button type="submit" disabled={busy} className="min-h-11 rounded bg-amber-500 px-4 text-xs font-bold text-slate-900 hover:bg-amber-400 disabled:opacity-60">{busy ? t('common.please_wait') : t('news.subscribe')}</button>
        </form>
      )}
    </div>
  );
};
