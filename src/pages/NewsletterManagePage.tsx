import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { engagementApi } from '@/services/engagementApi';
import { NewsletterSegment, NewsletterSubscription } from '@/types/services';
import { Language } from '@/types';
import { useAsync } from '@/hooks/useAsync';
import { useAccessibility } from '@/context/AccessibilityContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ChoiceGroup, SelectField } from '@/components/forms/Field';
import { ErrorState, StatusBadge } from '@/components/ui/Status';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { errorMessage, errorStatus } from '@/utils/errors';

const ManageForm: React.FC<{ token: string; initial: NewsletterSubscription; allSegments: NewsletterSegment[]; onRemoved: () => void }> = ({ token, initial, allSegments, onRemoved }) => {
  const { t } = useAccessibility();
  const [subscription, setSubscription] = useState(initial);
  const [segments, setSegments] = useState<string[]>(initial.segments);
  const [language, setLanguage] = useState<Language>(initial.language);
  const [message, setMessage] = useState('');
  const [confirming, setConfirming] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubscription(await engagementApi.updateSubscription(token, { segments, language }));
      setMessage(segments.length ? t('news.saved') : t('news.paused'));
    } catch (err) {
      setMessage(errorMessage(err, t('common.service_error')));
    }
  };

  const unsubscribe = async () => {
    try {
      await engagementApi.unsubscribe(token);
      onRemoved();
    } catch (err) {
      setMessage(errorMessage(err, t('common.service_error')));
      setConfirming(false);
    }
  };

  return (
    <>
      <p className="flex flex-wrap items-center gap-2 text-sm text-slate-700">{subscription.email} <StatusBadge status={subscription.status} label={t(`news.status.${subscription.status}`)} /></p>
      {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</p>}
      <form onSubmit={save} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <ChoiceGroup id="manage-topics" legend={t('news.topics')} type="checkbox" value={segments} onChange={(v) => setSegments(v as string[])}
          options={allSegments.map((s) => ({ value: s.id, label: `${s.title} — ${s.description}` }))} />
        <SelectField id="manage-language" label={t('news.language')} value={language} onChange={(v) => setLanguage(v as Language)}
          options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'हिन्दी' }, { value: 'mr', label: 'मराठी' }]} />
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="min-h-11 rounded-lg bg-brand-blue px-5 text-sm font-bold text-white">{t('news.save')}</button>
          <button type="button" onClick={() => setConfirming(true)} className="min-h-11 rounded-lg border border-red-300 px-4 text-sm font-semibold text-red-700">{t('news.unsubscribe_all')}</button>
        </div>
      </form>
      {confirming && (
        <Modal title={t('news.unsubscribe_all')} onClose={() => setConfirming(false)}>
          <p className="text-sm text-slate-800">{t('news.unsubscribe_body', { email: subscription.email })}</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setConfirming(false)} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold">{t('common.cancel')}</button>
            <button type="button" onClick={unsubscribe} className="min-h-11 rounded-lg bg-red-700 px-4 text-sm font-bold text-white">{t('news.unsubscribe_confirm')}</button>
          </div>
        </Modal>
      )}
    </>
  );
};

/** Change newsletter topics or unsubscribe from the link in any newsletter email (WEB-ENG-5, DPDP withdrawal). */
export const NewsletterManagePage: React.FC = () => {
  const { t } = useAccessibility();
  usePageMeta(t('news.manage_title'));
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const data = useAsync(() => (token ? Promise.all([engagementApi.getSubscription(token), engagementApi.getNewsletterSegments()]) : Promise.reject(new Error('no token'))), [token]);
  const [removed, setRemoved] = useState(false);

  let body: React.ReactNode;
  if (!token) body = <ErrorState message={t('news.no_token')} />;
  else if (removed) body = <p role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-sm font-semibold text-emerald-900">{t('news.removed')}</p>;
  else if (data.error) body = <ErrorState message={errorStatus(data.error) === 404 ? t('news.not_found') : undefined} onRetry={data.reload} />;
  else if (!data.data) body = <SkeletonRows count={3} />;
  else body = <ManageForm key={token} token={token} initial={data.data[0]} allSegments={data.data[1]} onRemoved={() => setRemoved(true)} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-serif text-2xl font-black text-ink">{t('news.manage_title')}</h1>
      </div>
      {body}
    </div>
  );
};
