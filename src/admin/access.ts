import { AdminUser, Department, FacultyMember, ResearchRecord, StaffRecord } from '@/types';
import { isFacultyInDepartment } from '@/utils/departments';

// These checks only decide what the console shows. The backend must enforce the same rules on every request.

export type AdminTab =
  | 'dashboard'
  | 'approvals'
  | 'tenders'
  | 'recruitment'
  | 'notices'
  | 'news'
  | 'grievances'
  | 'departments'
  | 'faculty'
  | 'staff'
  | 'research'
  | 'media'
  | 'accessibility'
  | 'engagement'
  | 'reports'
  | 'audit'
  | 'settings';

const SUPER_ADMIN_TABS: AdminTab[] = [
  'dashboard', 'approvals', 'notices', 'tenders', 'recruitment', 'departments', 'faculty', 'staff', 'research', 'media',
  'accessibility', 'grievances', 'engagement', 'reports', 'audit', 'settings',
];
// Department admins and departmental approvers author their unit's content (SRS 4.14.1), including department news;
// an admin's changes are published after approval.
const DEPARTMENT_ADMIN_TABS: AdminTab[] = ['dashboard', 'approvals', 'departments', 'faculty', 'staff', 'research', 'news', 'media', 'accessibility', 'engagement'];

/** How the console groups its sections in the side menu. */
export const TAB_GROUPS: { label: string; tabs: AdminTab[] }[] = [
  { label: 'Overview', tabs: ['dashboard', 'approvals'] },
  { label: 'Content', tabs: ['notices', 'tenders', 'recruitment', 'news', 'departments', 'faculty', 'staff', 'research', 'media'] },
  { label: 'Quality and governance', tabs: ['accessibility', 'audit'] },
  { label: 'Citizens and engagement', tabs: ['grievances', 'engagement'] },
  { label: 'Reports and settings', tabs: ['reports', 'settings'] },
];

/**
 * Who signs off departmental content before it goes live (WEB-CMS-4). Super administrators (the Dean's office or IT
 * head, SRS 4.14.2) approve for every department; a departmental approver (a head of department, FRS §6) for their own.
 * True for both: they review submissions, and their own edits are published without a second sign-off.
 */
export const canApprove = (user: AdminUser) => isSuperAdmin(user) || user.role === 'department_approver';

/** Whether the user may approve or reject this change, or publish it directly: a departmental approver only their department's. */
export const canApproveChange = (user: AdminUser, change: { departmentId?: string }) =>
  isSuperAdmin(user) || (user.role === 'department_approver' && !!change.departmentId && change.departmentId === user.departmentId);

export const isSuperAdmin = (user: AdminUser) => user.role === 'super_admin';

export const allowedTabs = (user: AdminUser): AdminTab[] => (isSuperAdmin(user) ? SUPER_ADMIN_TABS : DEPARTMENT_ADMIN_TABS);

export const canManageDepartment = (user: AdminUser, departmentId: string) =>
  isSuperAdmin(user) || user.departmentId === departmentId;

/**
 * Research records the user may manage: all for a super admin; for a department admin, only records of their own
 * department. Records without a department (e.g. student publications with no guide) are the super admin's.
 */
export const canManageResearchRecord = (user: AdminUser, record: ResearchRecord) =>
  isSuperAdmin(user) || (!!record.departmentId && record.departmentId === user.departmentId);

/**
 * Employee records the user may manage: all for a super admin; for a department admin, only staff of their own
 * department. Staff of hospital units without a department (e.g. Matron Office) are the super admin's.
 */
export const canManageStaff = (user: AdminUser, record: StaffRecord) =>
  isSuperAdmin(user) || (!!record.departmentId && record.departmentId === user.departmentId);

/** Departments the user may edit. */
export const manageableDepartments = (user: AdminUser, departments: Department[]) =>
  departments.filter((d) => canManageDepartment(user, d.id));

/** Faculty the user may edit: everyone for a super admin, otherwise only their department's faculty. */
export const manageableFaculty = (user: AdminUser, faculty: FacultyMember[], departments: Department[]) => {
  if (isSuperAdmin(user)) return faculty;
  const own = departments.find((d) => d.id === user.departmentId);
  return own ? faculty.filter((f) => isFacultyInDepartment(f, own)) : [];
};
