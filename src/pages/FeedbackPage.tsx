import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, ClipboardList } from 'lucide-react';
import { engagementApi } from '@/services/engagementApi';
import { apiService } from '@/services/api';
import { SurveyAnswers } from '@/types/services';
import { useAsync } from '@/hooks/useAsync';
import { useAccessibility } from '@/context/AccessibilityContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { CheckboxField, ChoiceGroup, SelectField, TextAreaField, TextField } from '@/components/forms/Field';
import { ErrorSummary } from '@/components/forms/ErrorSummary';
import { EmptyState, ErrorState } from '@/components/ui/Status';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { errorMessage, errorStatus } from '@/utils/errors';

type Errors = Record<string, string | undefined>;

/** Site feedback, routed to a department when one is chosen (WEB-ENG-1, WEB-ENG-4), and open surveys. */
export const FeedbackPage: React.FC = () => {
  const { t } = useAccessibility();
  usePageMeta(t('fb.title'), t('fb.intro'));
  const departments = useAsync(() => apiService.getDepartments(), []);
  const surveys = useAsync(() => engagementApi.getOpenSurveys(), []);
  const [rating, setRating] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [found, setFound] = useState('');
  const [comment, setComment] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problems: Errors = {};
    if (!rating) problems['fb-rating'] = t('fb.error.rating');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems['fb-email'] = t('form.error.email');
    if (email && !consent) problems['fb-consent'] = t('fb.error.consent');
    setErrors(problems);
    if (Object.keys(problems).length) return setAttempt((n) => n + 1);
    setBusy(true);
    try {
      const result = await engagementApi.submitSiteFeedback({
        rating: Number(rating),
        lookingFor: lookingFor.trim() || undefined,
        found: (found || undefined) as 'Yes' | 'Partly' | 'No' | undefined,
        comment: comment.trim() || undefined,
        departmentId: departmentId || undefined,
        page: document.referrer && new URL(document.referrer).origin === window.location.origin ? new URL(document.referrer).pathname : undefined,
        email: email.trim() || undefined,
      });
      setReference(result.reference);
    } catch (err) {
      setErrors({ 'fb-rating': errorMessage(err, t('common.service_error')) });
      setAttempt((n) => n + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-serif text-2xl font-black text-ink sm:text-3xl">{t('fb.title')}</h1>
        <p className="mt-1 text-sm text-slate-600">{t('fb.intro')}</p>
      </div>
      {reference ? (
        <div role="status" className="space-y-2 rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-sm">
          <p className="flex items-center gap-2 text-base font-bold text-emerald-900"><CheckCircle2 className="h-5 w-5" aria-hidden="true" /> {t('fb.thanks')}</p>
          <p>{t('fb.reference', { ref: reference })}</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
          <ErrorSummary errors={errors} focusKey={attempt} title={t('common.fix_errors')} />
          <ChoiceGroup id="fb-rating" legend={t('fb.rating')} type="radio" required value={rating} onChange={(v) => setRating(v as string)} error={errors['fb-rating']}
            options={([1, 2, 3, 4, 5] as const).map((n) => ({ value: String(n), label: t(`fb.rating.${n}`) }))} />
          <TextField id="fb-looking" label={t('fb.looking_for')} value={lookingFor} onChange={setLookingFor} maxLength={200} />
          <ChoiceGroup id="fb-found" legend={t('fb.found')} type="radio" inline value={found} onChange={(v) => setFound(v as string)}
            options={[{ value: 'Yes', label: t('common.yes') }, { value: 'Partly', label: t('fb.partly') }, { value: 'No', label: t('common.no') }]} />
          <TextAreaField id="fb-comment" label={t('fb.comment')} value={comment} onChange={setComment} rows={4} maxLength={1000} hint={t('fb.comment_hint')} />
          <SelectField id="fb-department" label={t('fb.department')} value={departmentId} onChange={setDepartmentId} placeholder={t('fb.department_any')}
            options={(departments.data ?? []).map((d) => ({ value: d.id, label: d.name }))} hint={t('fb.department_hint')} />
          <TextField id="fb-email" type="email" label={t('fb.email')} value={email} onChange={setEmail} autoComplete="email" error={errors['fb-email']} hint={t('fb.email_hint')} />
          {email && (
            <CheckboxField id="fb-consent" checked={consent} onChange={setConsent} error={errors['fb-consent']}
              label={<>{t('fb.consent')} <Link to="/policies/privacy-policy" className="font-semibold text-link underline">{t('common.privacy_policy')}</Link>.</>} />
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy} className="min-h-11 rounded-lg bg-brand-blue px-6 text-sm font-bold text-white disabled:opacity-60">{busy ? t('common.please_wait') : t('fb.submit')}</button>
            <p className="text-xs text-slate-600">{t('fb.reply_hint')} <Link to="/contact" className="font-semibold text-link underline">{t('contact')}</Link></p>
          </div>
        </form>
      )}
      <section aria-labelledby="open-surveys" className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
        <h2 id="open-surveys" className="font-serif text-lg font-bold text-ink">{t('survey.open')}</h2>
        {surveys.error ? <ErrorState onRetry={surveys.reload} /> : !surveys.data ? <SkeletonRows count={2} /> : surveys.data.length === 0 ? <EmptyState title={t('survey.none')} /> : (
          <ul className="space-y-2">
            {surveys.data.map((s) => (
              <li key={s.id}>
                <Link to={`/feedback/surveys/${s.id}`} className="flex min-h-11 items-start gap-2 rounded-lg border border-slate-200 p-3 hover:border-brand-blue">
                  <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-link" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-semibold text-ink">{s.title}</span>
                    {s.description && <span className="block text-xs text-slate-600">{s.description}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

/** One survey, rendered from its question definitions (WEB-ENG-1). */
export const SurveyPage: React.FC = () => {
  const { id = '' } = useParams();
  const { t } = useAccessibility();
  const survey = useAsync(() => engagementApi.getSurvey(id), [id]);
  usePageMeta(survey.data?.title ?? t('survey.title'));
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  if (survey.error) return <div className="mx-auto max-w-3xl px-4 py-8"><ErrorState message={errorStatus(survey.error) === 404 ? t('survey.not_found') : undefined} onRetry={survey.reload} /></div>;
  if (!survey.data) return <div className="mx-auto max-w-3xl px-4 py-8"><SkeletonRows count={4} /></div>;
  const s = survey.data;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problems: Errors = {};
    s.questions.forEach((q) => {
      const v = answers[q.id];
      if (q.required && (!v || (Array.isArray(v) && v.length === 0) || (typeof v === 'string' && !v.trim()))) problems[`q-${q.id}`] = t('survey.required', { q: q.text });
    });
    setErrors(problems);
    if (Object.keys(problems).length) return setAttempt((n) => n + 1);
    setBusy(true);
    try {
      await engagementApi.submitSurvey(s.id, answers);
      setDone(true);
    } catch (err) {
      setErrors({ [`q-${s.questions[0]?.id}`]: errorMessage(err, t('common.service_error')) });
      setAttempt((n) => n + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-xs font-bold tracking-widest text-amber-800">{t('survey.title')}</p>
        <h1 className="font-serif text-2xl font-black text-ink">{s.title}</h1>
        {s.description && <p className="mt-1 text-sm text-slate-600">{s.description}</p>}
        {s.anonymous && <p className="mt-1 text-xs text-slate-600">{t('survey.anonymous')}</p>}
      </div>
      {s.status !== 'Open' ? (
        <EmptyState title={t('survey.closed')} />
      ) : done ? (
        <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-base font-bold text-emerald-900">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> {t('survey.thanks')}
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
          <ErrorSummary errors={errors} focusKey={attempt} title={t('common.fix_errors')} />
          {s.questions.map((q) => {
            const qid = `q-${q.id}`;
            const set = (v: string | string[]) => setAnswers((a) => ({ ...a, [q.id]: v }));
            if (q.type === 'rating')
              return <ChoiceGroup key={q.id} id={qid} legend={q.text} type="radio" inline required={q.required} value={(answers[q.id] as string) ?? ''} onChange={set} error={errors[qid]}
                options={([1, 2, 3, 4, 5] as const).map((n) => ({ value: String(n), label: t(`fb.rating.${n}`) }))} />;
            if (q.type === 'single' || q.type === 'multiple')
              return <ChoiceGroup key={q.id} id={qid} legend={q.text} type={q.type === 'single' ? 'radio' : 'checkbox'} required={q.required} value={answers[q.id] ?? (q.type === 'multiple' ? [] : '')} onChange={set} error={errors[qid]}
                options={(q.options ?? []).map((o) => ({ value: o, label: o }))} />;
            if (q.type === 'longtext')
              return <TextAreaField key={q.id} id={qid} label={q.text} required={q.required} value={(answers[q.id] as string) ?? ''} onChange={set} error={errors[qid]} rows={4} maxLength={1500} />;
            return <TextField key={q.id} id={qid} label={q.text} required={q.required} value={(answers[q.id] as string) ?? ''} onChange={set} error={errors[qid]} maxLength={300} />;
          })}
          <button type="submit" disabled={busy} className="min-h-11 rounded-lg bg-brand-blue px-6 text-sm font-bold text-white disabled:opacity-60">{busy ? t('common.please_wait') : t('survey.submit')}</button>
        </form>
      )}
    </div>
  );
};
