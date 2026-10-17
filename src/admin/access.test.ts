import { describe, expect, it } from 'vitest';
import { allowedTabs, canApprove, canApproveChange, canManageStaff, isSuperAdmin } from '@/admin/access';
import type { AdminUser, StaffRecord } from '@/types';

const superAdmin: AdminUser = { username: 'superadmin', name: 'Super', role: 'super_admin' };
const approver: AdminUser = { username: 'medicine-approver', name: 'HOD', role: 'department_approver', departmentId: 'medicine' };
const editor: AdminUser = { username: 'medicine-admin', name: 'Editor', role: 'department_admin', departmentId: 'medicine' };

describe('console roles (FRS §6, WEB-CMS-3)', () => {
  it('gives the super admin every section and department roles their own', () => {
    expect(allowedTabs(superAdmin)).toHaveLength(16);
    expect(allowedTabs(editor)).toHaveLength(10);
    expect(allowedTabs(approver)).toEqual(allowedTabs(editor));
    expect(allowedTabs(editor)).not.toContain('reports');
  });
  it('lets only approvers approve', () => {
    expect([superAdmin, approver, editor].map(canApprove)).toEqual([true, true, false]);
    expect(isSuperAdmin(approver)).toBe(false);
  });
  it('limits a departmental approver to their own department', () => {
    expect(canApproveChange(approver, { departmentId: 'medicine' })).toBe(true);
    expect(canApproveChange(approver, { departmentId: 'surgery' })).toBe(false);
    expect(canApproveChange(approver, {})).toBe(false);
    expect(canApproveChange(superAdmin, { departmentId: 'surgery' })).toBe(true);
    expect(canApproveChange(editor, { departmentId: 'medicine' })).toBe(false);
  });
  it('keeps staff without a department with the super admin', () => {
    const unit = { id: 's1', group: 'non-teaching', name: 'A', departmentId: undefined } as unknown as StaffRecord;
    expect(canManageStaff(editor, unit)).toBe(false);
    expect(canManageStaff(superAdmin, unit)).toBe(true);
  });
});
