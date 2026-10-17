import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { apiService, isMockMode } from '@/services/api';
import { InquiryRecord } from '@/types';
import { usePageMeta } from '@/hooks/usePageMeta';

const statusClass: Record<InquiryRecord['status'], string> = {
  Received: 'bg-amber-100 text-amber-900',
  'In Progress': 'bg-blue-100 text-blue-900',
  Resolved: 'bg-emerald-100 text-emerald-900',
};

/** Track an inquiry or grievance by ticket number (UX4G 5.1.8). */
export const TrackInquiryPage: React.FC = () => {
  usePageMeta('Track your inquiry', 'Check the status of an inquiry or grievance sent to MGIMS Sevagram.');
  const [params] = useSearchParams();
  const [ticket, setTicket] = useState(params.get('ticket') ?? '');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<InquiryRecord | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const lookUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setResult((await apiService.getInquiryStatus(ticket, phone)) ?? null);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-bold text-amber-800 tracking-widest block">Citizen support</span>
        <h1 className="text-2xl sm:text-3xl font-black text-ink font-serif">Track your inquiry</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-prose">
          Enter the ticket number you received and the mobile number you used. You will see the current status and every update.
        </p>
      </div>

      <form onSubmit={lookUp} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <div>
          <label htmlFor="track-ticket" className="block font-semibold text-slate-700 mb-1">Ticket number</label>
          <input id="track-ticket" required value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="MGIMS-2026-00001"
            className="w-full min-h-11 rounded-lg border border-slate-300 px-3 font-mono" />
        </div>
        <div>
          <label htmlFor="track-phone" className="block font-semibold text-slate-700 mb-1">Mobile number</label>
          <input id="track-phone" required type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="w-full min-h-11 rounded-lg border border-slate-300 px-3" />
        </div>
        <button type="submit" disabled={loading} className="min-h-11 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-blue px-4 font-bold text-white hover:bg-blue-900 disabled:opacity-60">
          <Search className="h-4 w-4" aria-hidden="true" /> {loading ? 'Checking…' : 'Check status'}
        </button>
      </form>

      <div aria-live="polite">
        {result === null && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            No inquiry matches that ticket and mobile number. Check both and try again.
            {isMockMode && ' In demo mode, only inquiries sent from this browser can be found.'}
          </p>
        )}
        {result && (
          <section aria-label={`Inquiry ${result.ticketId}`} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-mono text-base font-bold text-ink">{result.ticketId}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[result.status]}`}>{result.status}</span>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div><dt className="font-semibold text-slate-600">Category</dt><dd>{result.category}</dd></div>
              <div><dt className="font-semibold text-slate-600">Submitted</dt><dd>{new Date(result.createdAt).toLocaleString('en-IN')}</dd></div>
            </dl>
            <div>
              <h3 className="text-sm font-bold text-ink mb-2">Updates</h3>
              <ol className="space-y-2 border-l-2 border-slate-200 pl-4 text-sm">
                {result.updates.map((u, i) => (
                  <li key={i}>
                    <p className="text-slate-800">{u.note}</p>
                    <p className="text-[12px] text-slate-600">{new Date(u.at).toLocaleString('en-IN')}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}
      </div>

      <p className="text-sm text-slate-600">
        Need to send a new inquiry? <Link to="/contact" className="font-semibold text-link hover:underline">Go to Contact</Link>.
      </p>
    </div>
  );
};
