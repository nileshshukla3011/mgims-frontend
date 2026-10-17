import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ExternalLink, MessageSquare } from 'lucide-react';
import { AdminUser, Department, InquiryRecord } from '@/types';
import { isMockMode } from '@/services/api';
import { canApprove } from '@/admin/access';
import { sectionPath } from '@/admin/sections';
import { publicSiteUrl } from '@/admin/publicSite';
import { GovernanceDashboard } from '@/admin/Dashboards';
import { NO_INQUIRIES, STATUS_STYLE } from '@/admin/inquiries';

const card = 'bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1';
const cardLabel = 'text-xs font-semibold text-slate-500 tracking-wider';
const cardLink = 'text-[11px] text-link font-bold underline';

/** A department admin's or approver's start page: their work in progress and their department at a glance. */
export const DepartmentDashboard: React.FC<{ user: AdminUser; pendingCount: number; department?: Department; facultyCount: number }> = ({ user, pendingCount, department, facultyCount }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
    <div className={card}>
      <span className={cardLabel}>{canApprove(user) ? 'Waiting for your approval' : 'Drafts and submissions'}</span>
      <p className="text-3xl font-black text-amber-800 font-serif">{pendingCount}</p>
      <Link to={sectionPath('approvals')} className={cardLink}>{canApprove(user) ? 'Review submissions →' : 'See approval status →'}</Link>
    </div>
    <div className={card}>
      <span className={cardLabel}>Department</span>
      <p className="text-xl font-black text-link font-serif">{department?.name ?? '—'}</p>
      <p className="text-[11px] text-slate-500">{department?.category}</p>
    </div>
    <div className={card}>
      <span className={cardLabel}>Faculty profiles</span>
      <p className="text-3xl font-black text-teal-700 font-serif">{facultyCount}</p>
      <Link to={sectionPath('faculty')} className={cardLink}>Edit faculty →</Link>
    </div>
    <div className={card}>
      <span className={cardLabel}>About paragraphs</span>
      <p className="text-3xl font-black text-ink font-serif">{department?.paragraphs.length ?? 0}</p>
      <Link to={sectionPath('departments')} className={cardLink}>Edit department profile →</Link>
    </div>
  </div>
);

/** The super admin's start page: notices, inquiries, content governance (WEB-RPT-1) and the console's status. */
export const SuperAdminDashboard: React.FC<{
  departments: Department[];
  noticeCount: number;
  tenderCount: number;
  jobCount: number;
  facultyCount: number;
  inquiries: InquiryRecord[];
}> = ({ departments, noticeCount, tenderCount, jobCount, facultyCount, inquiries }) => {
  const navigate = useNavigate();
  const awaiting = inquiries.filter((g) => g.status === 'Received').length;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={card}>
          <span className={cardLabel}>Active tenders</span>
          <p className="text-3xl font-black text-link font-serif">{tenderCount}</p>
          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" aria-hidden="true" /> Procurement active</p>
        </div>
        <div className={card}>
          <span className={cardLabel}>Job vacancies</span>
          <p className="text-3xl font-black text-teal-700 font-serif">{jobCount}</p>
          <p className="text-[11px] text-slate-500">Faculty & hospital staff posts</p>
        </div>
        <div className={card}>
          <span className={cardLabel}>Archived notices</span>
          <p className="text-3xl font-black text-ink font-serif">{noticeCount}</p>
          <p className="text-[11px] text-slate-500">All categories</p>
        </div>
        <div className={card}>
          <span className={cardLabel}>Citizen grievances</span>
          <p className="text-3xl font-black text-amber-800 font-serif">{inquiries.length}</p>
          <p className="text-[11px] text-amber-700 font-semibold">{awaiting} awaiting action</p>
        </div>
      </div>

      <GovernanceDashboard departments={departments} onOpenApprovals={() => navigate(sectionPath('approvals'))} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm text-ink flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-link" aria-hidden="true" />
              Recent patient inquiries & citizen grievances
            </h2>
            <Link to={sectionPath('grievances')} className="text-xs text-link font-bold hover:underline">Manage all →</Link>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {inquiries.length === 0 && <p className="py-3 text-slate-600">{NO_INQUIRIES}</p>}
            {inquiries.slice(0, 3).map((g) => (
              <div key={g.ticketId} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{g.name}</span>
                    <span className="text-slate-600">({g.phone})</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">{g.category}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-1">{g.message}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[g.status]}`}>{g.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3">
          <h2 className="font-bold text-sm text-ink">Portal status</h2>
          <ul className="text-xs space-y-2 text-slate-700">
            <li className="flex items-center justify-between"><span>Data source:</span><span className="font-bold text-slate-900">{isMockMode ? 'Bundled demo data' : 'Backend API'}</span></li>
            <li className="flex items-center justify-between"><span>Notices:</span><span className="font-bold text-slate-900">{noticeCount}</span></li>
            <li className="flex items-center justify-between"><span>Faculty profiles:</span><span className="font-bold text-slate-900">{facultyCount}</span></li>
            <li className="flex items-center justify-between"><span>Open inquiries:</span><span className="font-bold text-slate-900">{inquiries.filter((g) => g.status !== 'Resolved').length}</span></li>
          </ul>
          <div className="pt-2">
            {/* A new tab keeps this session: the console signs out when its page is left or reloaded. */}
            <a
              href={publicSiteUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full min-h-11 py-2 bg-brand-blue hover:bg-blue-900 text-white font-bold text-xs rounded-lg transition"
            >
              View public website <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
