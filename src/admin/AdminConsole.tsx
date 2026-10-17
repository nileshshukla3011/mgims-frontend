import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Accessibility, BarChart3, Briefcase, Building2, ClipboardCheck, FileText, IdCard, ImageIcon, LayoutDashboard, LogOut, MessageSquare,
  MessagesSquare, Microscope, Newspaper, Plus, ScrollText, Settings2, Sparkles, Users,
} from 'lucide-react';
import { AdminUser, Department, FacultyMember, InquiryRecord, NoticeSummary } from '@/types';
import { apiService, isMockMode } from '@/services/api';
import { setUnauthorizedHandler } from '@/services/http';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';
import { IdleWarning } from '@/components/ui/IdleWarning';
import { AdminTab, allowedTabs, canApprove, isSuperAdmin, manageableDepartments, manageableFaculty, TAB_GROUPS } from '@/admin/access';
import { sectionFromPath, sectionPath } from '@/admin/sections';
import { adminApi } from '@/admin/adminApi';
import { audit } from '@/admin/audit';
import { workflow } from '@/admin/workflow';
import { useNoticeLists } from '@/admin/useNoticeLists';
import { DepartmentDashboard, SuperAdminDashboard } from '@/admin/AdminDashboard';
import { NoticesPanel } from '@/admin/NoticesPanel';
import { NoticeDialog } from '@/admin/NoticeDialog';
import { InquiriesPanel } from '@/admin/InquiriesPanel';
import { FacultyPanel } from '@/admin/FacultyPanel';
import { ApprovalsPanel } from '@/admin/ApprovalsPanel';
import { DepartmentNewsPanel } from '@/admin/DepartmentNewsPanel';
import { MediaLibrary } from '@/admin/MediaLibrary';
import { AccessibilityReport } from '@/admin/AccessibilityReport';
import { ReportsPanel } from '@/admin/Dashboards';
import { AuditLogPanel, DataSourcesPanel } from '@/admin/OperationsPanels';
import { EngagementPanel } from '@/admin/EngagementPanel';
import { DepartmentEditor } from '@/admin/DepartmentEditor';
import { StaffManager } from '@/admin/StaffManager';
import { ResearchManager } from '@/admin/ResearchManager';

export type SignOutReason = 'idle' | 'expired';

const toast = 'fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 flex items-center gap-3 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-xl';

/** The signed-in console: header, section menu and the section at the current address. */
export const AdminConsole: React.FC<{ user: AdminUser; onSignedOut: (reason?: SignOutReason) => void }> = ({ user, onSignedOut }) => {
  usePageMeta('Administration console');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const superAdmin = isSuperAdmin(user);
  const tabs = allowedTabs(user);
  // The address decides the section; one this role may not open (or an unknown address) shows the dashboard.
  const requested = sectionFromPath(pathname);
  const activeTab: AdminTab = requested && tabs.includes(requested) ? requested : 'dashboard';
  useEffect(() => {
    if (pathname !== sectionPath(activeTab)) navigate(sectionPath(activeTab), { replace: true });
  }, [activeTab, navigate, pathname]);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [message, setMessage] = useState('');
  const [noticeDialog, setNoticeDialog] = useState<NoticeSummary['category'] | null>(null);
  const notices = useNoticeLists(superAdmin, setMessage);

  useEffect(() => {
    Promise.all([apiService.getDepartments(), apiService.getFacultyList()])
      .then(([deptList, facList]) => {
        setDepartments(deptList);
        setFaculty(facList);
      })
      .catch((err) => console.error('Error loading admin data:', err));
    // Citizen inquiries are institute-wide: only the super admin loads them.
    if (superAdmin) adminApi.listInquiries().then(setInquiries).catch((err) => console.error('Error loading inquiries:', err));
  }, [superAdmin]);

  const signOut = async (reason?: SignOutReason) => {
    setUnauthorizedHandler(null);
    notices.flushPendingDelete();
    await audit.record(user, reason === 'idle' ? 'Signed out after inactivity' : reason === 'expired' ? 'Session ended by the server' : 'Signed out', user.name);
    await adminApi.logout();
    navigate('/');
    onSignedOut(reason);
  };

  // Signs out after inactivity (WEB-SEC-7). VITE_ADMIN_IDLE_MINUTES sets the limit (default 15 minutes).
  const idle = useIdleTimeout({ enabled: true, idleMinutes: Number(import.meta.env.VITE_ADMIN_IDLE_MINUTES) || 15, onTimeout: () => signOut('idle') });

  // When the server ends the session (a 401 on a staff request), return to the sign-in screen and say why (WEB-SEC-7).
  const signOutRef = useRef(signOut);
  useEffect(() => {
    signOutRef.current = signOut;
  });
  useEffect(() => {
    setUnauthorizedHandler(() => signOutRef.current('expired'));
    return () => setUnauthorizedHandler(null);
  }, []);

  // Approved changes publish at their scheduled time; the backend does this itself, demo mode while the console is open.
  useEffect(() => {
    const run = () => workflow.publishDue().then((n) => n && setMessage(`${n} scheduled change${n > 1 ? 's were' : ' was'} published.`));
    void run();
    const timer = window.setInterval(run, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  // Number on the Approvals section: waiting changes for an approver (a departmental approver: their department's
  // only); own drafts and submissions for an editor.
  const refreshPending = useCallback(() => {
    const approver = canApprove(user);
    workflow
      .list(approver ? { status: 'Submitted', departmentId: superAdmin ? undefined : user.departmentId } : { author: user.username })
      .then((list) => setPendingCount(approver ? list.length : list.filter((c) => c.status === 'Submitted' || c.status === 'Draft').length))
      .catch(() => undefined);
  }, [user, superAdmin]);
  useEffect(() => {
    refreshPending();
  }, [refreshPending, activeTab]);

  const changeInquiryStatus = async (ticketId: string, status: InquiryRecord['status']) => {
    const note = `Status changed to ${status} by the help desk.`;
    await adminApi.updateInquiryStatus(ticketId, status, note);
    setInquiries((list) => list.map((g) => (g.ticketId === ticketId ? { ...g, status, updates: [...g.updates, { at: new Date().toISOString(), note }] } : g)));
  };

  const myDepartments = manageableDepartments(user, departments);
  const myFaculty = manageableFaculty(user, faculty, departments);
  const ownDepartment = superAdmin ? undefined : myDepartments[0];

  const tabLabels: Record<AdminTab, { icon: React.ElementType; label: string }> = {
    dashboard: { icon: LayoutDashboard, label: 'Dashboard overview' },
    tenders: { icon: FileText, label: `Tenders & Procurement (${notices.tenders.length})` },
    recruitment: { icon: Briefcase, label: `Job Vacancies (${notices.jobs.length})` },
    notices: { icon: Sparkles, label: `All Notices & CMEs (${notices.notices.length})` },
    grievances: { icon: MessageSquare, label: `Citizen Inquiries (${inquiries.length})` },
    departments: { icon: Building2, label: superAdmin ? `Departments (${myDepartments.length})` : 'Department profile' },
    faculty: { icon: Users, label: `${superAdmin ? 'Faculty Directory' : 'Department faculty'} (${myFaculty.length})` },
    staff: { icon: IdCard, label: superAdmin ? 'Staff records' : 'Department staff' },
    research: { icon: Microscope, label: superAdmin ? 'Research' : 'Department research' },
    approvals: { icon: ClipboardCheck, label: `${canApprove(user) ? 'Approvals' : 'My submissions'}${pendingCount ? ` (${pendingCount})` : ''}` },
    news: { icon: Newspaper, label: 'Department news' },
    media: { icon: ImageIcon, label: 'Media library' },
    accessibility: { icon: Accessibility, label: 'Accessibility checks' },
    engagement: { icon: MessagesSquare, label: superAdmin ? 'Feedback, surveys & newsletter' : 'Feedback & surveys' },
    reports: { icon: BarChart3, label: 'Reports & exports' },
    audit: { icon: ScrollText, label: 'Audit log' },
    settings: { icon: Settings2, label: 'Data sources' },
  };

  const noticesFor = (items: NoticeSummary[], category: NoticeSummary['category']) => (
    <NoticesPanel key={activeTab} items={items} onAdd={() => setNoticeDialog(category)} onDelete={notices.remove} />
  );

  const section = (() => {
    switch (activeTab) {
      case 'dashboard':
        return superAdmin ? (
          <SuperAdminDashboard
            departments={departments}
            noticeCount={notices.notices.length}
            tenderCount={notices.tenders.length}
            jobCount={notices.jobs.length}
            facultyCount={faculty.length}
            inquiries={inquiries}
          />
        ) : (
          <DepartmentDashboard user={user} pendingCount={pendingCount} department={ownDepartment} facultyCount={myFaculty.length} />
        );
      case 'tenders': return noticesFor(notices.tenders, 'Tender');
      case 'recruitment': return noticesFor(notices.jobs, 'Recruitment');
      case 'notices': return noticesFor(notices.notices, 'News & Events');
      case 'grievances': return <InquiriesPanel inquiries={inquiries} onStatusChange={changeInquiryStatus} />;
      case 'approvals': return <ApprovalsPanel user={user} departments={departments} onChanged={refreshPending} />;
      case 'news': return <DepartmentNewsPanel user={user} department={ownDepartment} onSubmitted={refreshPending} />;
      case 'media': return <MediaLibrary user={user} departments={departments} />;
      case 'accessibility': return <AccessibilityReport user={user} departments={departments} faculty={faculty} />;
      case 'engagement': return <EngagementPanel user={user} departments={departments} />;
      case 'reports': return <ReportsPanel user={user} />;
      case 'audit': return <AuditLogPanel user={user} />;
      case 'settings': return <DataSourcesPanel user={user} />;
      case 'departments':
        return <DepartmentEditor user={user} departments={myDepartments} onSaved={(saved) => setDepartments((list) => list.map((d) => (d.id === saved.id ? saved : d)))} />;
      case 'staff': return <StaffManager user={user} departments={departments} />;
      case 'research': return <ResearchManager user={user} departments={departments} />;
      case 'faculty':
        return (
          <FacultyPanel
            user={user}
            faculty={myFaculty}
            departments={departments}
            onDone={({ saved, message: text }) => {
              if (saved) setFaculty((list) => list.map((f) => (f.id === saved.id ? saved : f)));
              setMessage(text);
            }}
          />
        );
    }
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-brand-navy text-white p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <LayoutDashboard className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-serif text-white flex items-center gap-2">
              <span>MGIMS administration console</span>
              <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-sans font-bold border border-emerald-400/30">
                {isMockMode ? 'Demo data' : 'Live'}
              </span>
            </h1>
            <p className="text-xs text-slate-300">
              Signed in as: <strong className="text-amber-300">{user.name}</strong>
              {' · '}
              {superAdmin
                ? 'Super administrator (all departments)'
                : `${canApprove(user) ? 'Departmental approver' : 'Department administrator'}${ownDepartment ? ` · ${ownDepartment.name}` : ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {superAdmin && (
            <button
              onClick={() => setNoticeDialog('Tender')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Publish new notice / tender</span>
            </button>
          )}
          <button onClick={() => signOut()} className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition">
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[16rem_1fr]">
        {/* Console sections, grouped; only the ones this role may open. Each has its own address. */}
        <nav aria-label="Console sections" className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold lg:sticky lg:top-4">
          {TAB_GROUPS.map((group) => {
            const groupTabs = group.tabs.filter((t) => tabs.includes(t));
            if (!groupTabs.length) return null;
            return (
              <div key={group.label} className="space-y-1">
                <p className="px-2 text-[11px] font-bold tracking-wider text-slate-600">{group.label}</p>
                <div className="flex flex-wrap gap-1 lg:flex-col">
                  {groupTabs.map((tab) => {
                    const { icon: Icon, label } = tabLabels[tab];
                    const current = activeTab === tab;
                    return (
                      <Link
                        key={tab}
                        to={sectionPath(tab)}
                        aria-current={current ? 'page' : undefined}
                        className={`min-h-11 px-3 py-2 rounded-lg transition flex items-center gap-1.5 text-left ${current ? 'bg-brand-blue text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200/70'}`}
                      >
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="min-w-0 space-y-8">{section}</div>
      </div>

      {idle.secondsLeft !== null && <IdleWarning secondsLeft={idle.secondsLeft} onStay={idle.stayActive} onSignOut={() => signOut()} />}

      {message && !notices.undoPending && (
        <div role="status" className={toast}>
          <span>{message}</span>
          <button type="button" onClick={() => setMessage('')} className="min-h-11 rounded px-3 font-bold text-amber-300 underline hover:text-amber-200">Dismiss</button>
        </div>
      )}
      {notices.undoPending && (
        <div role="status" className={toast}>
          <span>Notice deleted.</span>
          <button type="button" onClick={notices.undoDelete} className="min-h-11 rounded px-3 font-bold text-amber-300 underline hover:text-amber-200">Undo</button>
        </div>
      )}

      {noticeDialog && superAdmin && (
        <NoticeDialog
          user={user}
          initialCategory={noticeDialog}
          onClose={() => setNoticeDialog(null)}
          onPublished={(created, text) => {
            notices.add(created);
            setNoticeDialog(null);
            setMessage(text);
          }}
        />
      )}
    </div>
  );
};
