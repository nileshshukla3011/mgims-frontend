import React from 'react';
import { InquiryRecord } from '@/types';
import { NO_INQUIRIES, STATUS_STYLE } from '@/admin/inquiries';

/** Citizen inquiries and grievances from the Contact page (UX4G 5.1.8), with their status. */
export const InquiriesPanel: React.FC<{ inquiries: InquiryRecord[]; onStatusChange: (ticketId: string, status: InquiryRecord['status']) => void }> = ({ inquiries, onStatusChange }) => (
  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
    <div className="relative overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead className="bg-brand-navy text-white">
          <tr>
            <th className="p-3 font-semibold">ID</th>
            <th className="p-3 font-semibold">Citizen / patient</th>
            <th className="p-3 font-semibold">Category</th>
            <th className="p-3 font-semibold">Inquiry message</th>
            <th className="p-3 font-semibold">Date</th>
            <th className="p-3 font-semibold">Status</th>
            <th className="p-3 font-semibold text-right">Update status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {inquiries.length === 0 && (
            <tr>
              <td colSpan={7} className="p-6 text-center text-slate-600">{NO_INQUIRIES}</td>
            </tr>
          )}
          {inquiries.map((g) => (
            <tr key={g.ticketId} className="hover:bg-slate-50">
              <td className="p-3 font-mono text-slate-600">{g.ticketId}</td>
              <td className="p-3 font-bold text-slate-900">
                <div>{g.name}</div>
                <div className="text-[11px] font-normal text-slate-500 font-mono">{g.phone}</div>
              </td>
              <td className="p-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{g.category}</span>
              </td>
              <td className="p-3 text-slate-700 max-w-sm">{g.message}</td>
              <td className="p-3 font-mono text-slate-500">{new Date(g.createdAt).toLocaleDateString('en-IN')}</td>
              <td className="p-3">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_STYLE[g.status]}`}>{g.status}</span>
              </td>
              <td className="p-3 text-right">
                <select
                  value={g.status}
                  onChange={(e) => onStatusChange(g.ticketId, e.target.value as InquiryRecord['status'])}
                  aria-label={`Status for inquiry ${g.ticketId}`}
                  className="p-1 border border-slate-300 rounded text-xs bg-white font-medium"
                >
                  <option value="Received">Received</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
