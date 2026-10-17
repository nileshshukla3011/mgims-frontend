import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Send } from 'lucide-react';
import { apiService, isMockMode } from '@/services/api';
import { InquiryInput, InquiryRecord } from '@/types';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';

type Field = keyof InquiryInput | 'consent';
const EMPTY: InquiryInput = { name: '', email: '', phone: '', category: 'General Enquiry', message: '' };

// Field-level checks shown next to the field (UX4G 6.8.4: concise errors near the field, with the fix).
const validate = (data: InquiryInput, consent: boolean): Partial<Record<Field, string>> => {
  const errors: Partial<Record<Field, string>> = {};
  if (data.name.trim().length < 2) errors.name = 'Enter your full name.';
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter an email like name@example.com, or leave it blank.';
  if (!/^[6-9]\d{9}$/.test(data.phone)) errors.phone = 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.';
  if (data.message.trim().length < 10) errors.message = 'Describe your query in at least 10 characters.';
  if (!consent) errors.consent = 'Tick the box to let MGIMS use these details to reply.';
  return errors;
};

const inputClass = (invalid: boolean) =>
  `w-full min-h-11 p-2 border rounded-lg focus:ring-1 focus:ring-brand-blue outline-hidden font-medium ${invalid ? 'border-red-700' : 'border-slate-300'}`;

export const InquiryForm: React.FC = () => {
  const [data, setData] = useState<InquiryInput>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [record, setRecord] = useState<InquiryRecord | null>(null);

  const errors = validate(data, consent);
  const show = (f: Field) => (touched[f] ? errors[f] : undefined);
  const set = (f: keyof InquiryInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setData((d) => ({ ...d, [f]: f === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value }));
  const blur = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, message: true, consent: true });
    if (Object.keys(errors).length) {
      document.getElementById(`inquiry-${Object.keys(errors)[0]}`)?.focus();
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      setRecord(await apiService.submitInquiry({ ...data, name: data.name.trim(), message: data.message.trim() }));
    } catch {
      setSubmitError('Your inquiry could not be sent. Please try again, or call 07152-284341.');
    } finally {
      setSubmitting(false);
    }
  };

  if (record) {
    return (
      <div className="space-y-4">
        <div role="status" className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-sm space-y-2">
          <p className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" /> Inquiry received
          </p>
          <p>
            Your ticket number is <strong className="font-mono">{record.ticketId}</strong>. Keep it, with your mobile number, to
            check progress.
          </p>
          <Link to={`/contact/track?ticket=${encodeURIComponent(record.ticketId)}`} className="inline-flex min-h-11 items-center font-bold text-link hover:underline">
            Track this inquiry
          </Link>
        </div>
        <FeedbackWidget page="Contact — inquiry submitted" prompt="How easy was it to send your inquiry?" />
        <button
          type="button"
          onClick={() => { setRecord(null); setData(EMPTY); setConsent(false); setTouched({}); }}
          className="min-h-11 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  const err = (f: Field) => show(f) && (
    <p id={`inquiry-${f}-error`} className="mt-1 text-[12px] font-semibold text-red-700">{show(f)}</p>
  );
  const describedBy = (f: Field, hint?: string) => [hint, show(f) ? `inquiry-${f}-error` : ''].filter(Boolean).join(' ') || undefined;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3 text-xs">
      {isMockMode && (
        <p className="rounded border border-slate-200 bg-slate-50 p-2 text-[12px] text-slate-700">
          Demo mode: inquiries are kept in this browser only until the backend is connected.
        </p>
      )}

      <div>
        <label htmlFor="inquiry-name" className="block text-slate-700 font-semibold mb-1">Full name *</label>
        <input id="inquiry-name" type="text" autoComplete="name" value={data.name} onChange={set('name')} onBlur={blur('name')}
          aria-invalid={Boolean(show('name'))} aria-describedby={describedBy('name')} className={inputClass(Boolean(show('name')))} />
        {err('name')}
      </div>

      <div>
        <label htmlFor="inquiry-email" className="block text-slate-700 font-semibold mb-1">Email address (optional)</label>
        <input id="inquiry-email" type="email" autoComplete="email" value={data.email} onChange={set('email')} onBlur={blur('email')}
          placeholder="name@example.com" aria-invalid={Boolean(show('email'))} aria-describedby={describedBy('email')} className={inputClass(Boolean(show('email')))} />
        {err('email')}
      </div>

      <div>
        <label htmlFor="inquiry-phone" className="block text-slate-700 font-semibold mb-1">Mobile number *</label>
        <input id="inquiry-phone" type="tel" inputMode="numeric" autoComplete="tel-national" value={data.phone} onChange={set('phone')} onBlur={blur('phone')}
          placeholder="10-digit mobile number" aria-invalid={Boolean(show('phone'))} aria-describedby={describedBy('phone', 'inquiry-phone-hint')} className={inputClass(Boolean(show('phone')))} />
        <p id="inquiry-phone-hint" className="mt-1 text-[12px] text-slate-600">10 digits, without +91 or a leading 0.</p>
        {err('phone')}
      </div>

      <div>
        <label htmlFor="inquiry-category" className="block text-slate-700 font-semibold mb-1">Category of inquiry</label>
        <select id="inquiry-category" value={data.category} onChange={set('category')} className={`${inputClass(false)} bg-white`}>
          <option value="General Enquiry">General hospital enquiry</option>
          <option value="MBBS Admissions">MBBS admissions</option>
          <option value="Hospital Charges">Hospital charges / tariff</option>
          <option value="Tenders">Tenders and vendor query</option>
          <option value="Recruitment">Careers and recruitment</option>
          <option value="Grievance">Patient grievance</option>
        </select>
      </div>

      <div>
        <label htmlFor="inquiry-message" className="block text-slate-700 font-semibold mb-1">Message *</label>
        <textarea id="inquiry-message" rows={4} value={data.message} onChange={set('message')} onBlur={blur('message')}
          placeholder="Describe your query" aria-invalid={Boolean(show('message'))} aria-describedby={describedBy('message')} className={inputClass(Boolean(show('message')))} />
        {err('message')}
      </div>

      <div>
        <div className="flex items-start gap-2">
          <input id="inquiry-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} onBlur={blur('consent')}
            aria-invalid={Boolean(show('consent'))} aria-describedby={describedBy('consent')} className="mt-0.5 h-5 w-5 shrink-0" />
          <label htmlFor="inquiry-consent" className="text-slate-700">
            I agree that MGIMS may use the details above to respond to this inquiry, as described in the{' '}
            <Link to="/policies/privacy-policy" className="font-semibold text-link hover:underline">Privacy Policy</Link>. *
          </label>
        </div>
        {err('consent')}
      </div>

      {submitError && <p role="alert" className="rounded border border-red-200 bg-red-50 p-2 font-semibold text-red-700">{submitError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full min-h-11 py-2.5 bg-brand-blue hover:bg-blue-900 text-white font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-60"
      >
        <Send className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{submitting ? 'Sending…' : 'Submit inquiry'}</span>
      </button>

      <p className="text-[12px] text-slate-600">
        Already sent an inquiry? <Link to="/contact/track" className="font-semibold text-link hover:underline">Track its status</Link>.
      </p>
    </form>
  );
};
