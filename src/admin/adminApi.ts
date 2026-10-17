import {
  AdminUser,
  Department,
  DepartmentUpdate,
  FacultyMember,
  FacultyUpdate,
  InquiryRecord,
  NoticeSummary,
  ResearchRecord,
  StaffRecord,
} from '@/types';
import { apiService, isMockMode, mockStore } from '@/services/api';
import { apiFetch, request, RequestOptions } from '@/services/http';

// Staff-only requests of the admin console. They live here, not in services/api.ts, so that none of this code (or the
// demo password) ships with the public website. Public reads (departments, faculty, notices) still use apiService.

/**
 * Maps the backend's sign-in response to an AdminUser. Expected shape:
 * `{ username, name, role: 'super_admin' | 'department_approver' | 'department_admin', departmentId }`.
 * If the backend names these fields differently, change only this function.
 */
const toAdminUser = (value: unknown): AdminUser | null => {
  const raw = (value ?? {}) as { username?: unknown; name?: unknown; role?: unknown; departmentId?: unknown };
  const role = raw.role;
  if (role !== 'super_admin' && role !== 'department_approver' && role !== 'department_admin') return null;
  // A department role without a department could edit nothing, so refuse the sign-in.
  if (role !== 'super_admin' && !raw.departmentId) return null;
  return {
    username: String(raw.username ?? ''),
    name: String(raw.name ?? raw.username ?? ''),
    role,
    departmentId: role === 'super_admin' ? undefined : String(raw.departmentId),
  };
};

// Staff requests carry the session cookie; a 401 returns the console to its sign-in screen (setUnauthorizedHandler).
const staff = <T,>(path: string, method: RequestOptions['method'] = 'GET', body?: unknown) =>
  apiFetch<T>(path, { method, body, withSession: true });

/** The JSON body of a sign-in answer, or an empty object. */
const bodyOf = async (res: Response) => res.json().catch(() => ({}));

/** Result of the first sign-in step (WEB-SEC-1, WEB-SEC-7). */
export type LoginOutcome =
  | { kind: 'signed-in'; user: AdminUser }
  | { kind: 'mfa'; challengeId: string; channel: 'sms' | 'email' | 'totp'; destination?: string; demoCode?: string }
  | { kind: 'invalid'; attemptsLeft?: number }
  | { kind: 'locked'; retryAfterSeconds: number };

// Demo mode: failed sign-ins and the pending MFA challenge are kept for this browser tab only.
const DEMO_LOCK_KEY = 'mgims-admin-demo-lock';
const DEMO_MFA_KEY = 'mgims-admin-demo-mfa';
const demoSession = {
  get<T>(key: string): T | null {
    try {
      return JSON.parse(sessionStorage.getItem(key) || 'null');
    } catch {
      return null;
    }
  },
  set(key: string, value: unknown) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage blocked: the demo lockout is not kept.
    }
  },
};

async function demoUser(username: string): Promise<AdminUser | null> {
  const id = username.trim().toLowerCase();
  if (id === 'superadmin') return { username: id, name: 'Super Administrator', role: 'super_admin' };
  const match = /^(.+)-(admin|approver)$/.exec(id);
  const dept = match && (await apiService.getDepartments()).find((d) => d.id === match[1]);
  if (!dept) return null;
  return match[2] === 'approver'
    ? { username: id, name: `${dept.name} departmental approver`, role: 'department_approver', departmentId: dept.id }
    : { username: id, name: `${dept.name} department admin`, role: 'department_admin', departmentId: dept.id };
}

export const adminApi = {
  // Admin authentication and the admin's role are decided by the server. In mock mode there is no server,
  // so the console only opens when a demo password is configured at build time (never a hard-coded default).
  // Demo user IDs: `superadmin`; `<department-id>-admin` (e.g. `medicine-admin`) for a department admin;
  // `<department-id>-approver` (e.g. `medicine-approver`) for that department's approver.
  //
  // Live contract: POST /auth/login answers 200 with the user (no second factor needed), 202
  // `{ mfaRequired: true, challengeId, channel, destination }`, 401 `{ attemptsLeft }`, or 423 / 429 with Retry-After.
  async login(username: string, password: string): Promise<LoginOutcome> {
    if (!isMockMode) {
      const res = await request('/auth/login', { method: 'POST', body: { username, password }, withSession: true });
      const body = await bodyOf(res);
      if (res.status === 423 || res.status === 429) return { kind: 'locked', retryAfterSeconds: Number(res.headers.get('Retry-After')) || 60 };
      if (res.status === 202 || body?.mfaRequired) return { kind: 'mfa', challengeId: String(body.challengeId), channel: body.channel ?? 'sms', destination: body.destination };
      const user = res.ok ? toAdminUser(body) : null;
      return user ? { kind: 'signed-in', user } : { kind: 'invalid', attemptsLeft: body?.attemptsLeft };
    }
    const lock = demoSession.get<{ failures: number; until?: number }>(DEMO_LOCK_KEY) ?? { failures: 0 };
    if (lock.until && lock.until > Date.now()) return { kind: 'locked', retryAfterSeconds: Math.ceil((lock.until - Date.now()) / 1000) };
    const demo = import.meta.env.VITE_ADMIN_DEMO_PASSWORD;
    const user = demo && password === demo ? await demoUser(username) : null;
    if (!user) {
      const failures = lock.until ? 1 : lock.failures + 1;
      // Five wrong attempts lock sign-in for a minute (the backend sets its own limits).
      demoSession.set(DEMO_LOCK_KEY, failures >= 5 ? { failures: 0, until: Date.now() + 60_000 } : { failures });
      return failures >= 5 ? { kind: 'locked', retryAfterSeconds: 60 } : { kind: 'invalid', attemptsLeft: 5 - failures };
    }
    demoSession.set(DEMO_LOCK_KEY, { failures: 0 });
    // Every admin sign-in needs a second factor (WEB-SEC-1). Demo mode shows the code instead of sending an SMS.
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const challengeId = `MFA-${Date.now().toString(36)}`;
    demoSession.set(DEMO_MFA_KEY, { challengeId, code, username: user.username, tries: 0, at: Date.now() });
    return { kind: 'mfa', challengeId, channel: 'sms', destination: 'the registered mobile number', demoCode: code };
  },

  /** Second step. Live: POST /auth/mfa/verify `{ challengeId, code }` → 200 with the user, 401 `{ attemptsLeft }`, 410 expired. */
  async verifyMfa(challengeId: string, code: string): Promise<{ user: AdminUser } | { error: 'wrong' | 'expired'; attemptsLeft?: number }> {
    if (!isMockMode) {
      const res = await request('/auth/mfa/verify', { method: 'POST', body: { challengeId, code }, withSession: true });
      const body = await bodyOf(res);
      const user = res.ok ? toAdminUser(body) : null;
      if (user) return { user };
      return { error: res.status === 410 ? 'expired' : 'wrong', attemptsLeft: body?.attemptsLeft };
    }
    const pending = demoSession.get<{ challengeId: string; code: string; username: string; tries: number; at: number }>(DEMO_MFA_KEY);
    if (!pending || pending.challengeId !== challengeId || Date.now() - pending.at > 300_000 || pending.tries >= 3) return { error: 'expired' };
    if (pending.code !== code) {
      demoSession.set(DEMO_MFA_KEY, { ...pending, tries: pending.tries + 1 });
      return { error: 'wrong', attemptsLeft: 2 - pending.tries };
    }
    demoSession.set(DEMO_MFA_KEY, null);
    const user = await demoUser(pending.username);
    return user ? { user } : { error: 'expired' };
  },

  /** Live: POST /auth/mfa/resend `{ challengeId }` (rate-limited by the server). */
  async resendMfa(challengeId: string): Promise<{ demoCode?: string }> {
    if (!isMockMode) {
      await request('/auth/mfa/resend', { method: 'POST', body: { challengeId }, withSession: true }).catch(() => undefined);
      return {};
    }
    const pending = demoSession.get<{ challengeId: string; username: string }>(DEMO_MFA_KEY);
    if (!pending || pending.challengeId !== challengeId) return {};
    const code = String(Math.floor(100000 + Math.random() * 900000));
    demoSession.set(DEMO_MFA_KEY, { ...pending, code, tries: 0, at: Date.now() });
    return { demoCode: code };
  },

  /** The signed-in admin from the session cookie, so a reload keeps the console open. Demo sign-ins are not kept. */
  async currentUser(): Promise<AdminUser | null> {
    if (isMockMode) return null;
    const res = await request('/auth/me', { withSession: true });
    return res.ok ? toAdminUser(await bodyOf(res)) : null;
  },

  /** Ends the session on the server; the console clears itself either way. */
  async logout(): Promise<void> {
    if (isMockMode) return;
    await request('/auth/logout', { method: 'POST', withSession: true }).catch(() => undefined);
  },

  // Notices (tenders, vacancies, news). In mock mode they change the notice list loaded in this app.
  async createNotice(input: Pick<NoticeSummary, 'title' | 'category' | 'date' | 'excerpt' | 'departmentIds' | 'publish_at' | 'expires_at'>): Promise<NoticeSummary> {
    if (!isMockMode) return staff('/notices', 'POST', input);
    const list = await apiService.getNotices(undefined, undefined, { includeUnpublished: true });
    const id = Math.max(0, ...list.map((n) => n.id)) + 1;
    const created: NoticeSummary = { ...input, id, hits: '', url: `/notices/${id}`, is_active: true };
    list.unshift(created);
    return created;
  },

  async deleteNotice(id: number): Promise<void> {
    if (!isMockMode) {
      return staff(`/notices/${id}`, 'DELETE');
    }
    const list = await apiService.getNotices(undefined, undefined, { includeUnpublished: true });
    const index = list.findIndex((n) => n.id === id);
    if (index >= 0) list.splice(index, 1);
  },

  // Citizen inquiries. In mock mode they are read from this app's browser storage, which the public site
  // (another origin) cannot write to, so the list stays empty until the backend is connected.
  async listInquiries(): Promise<InquiryRecord[]> {
    if (!isMockMode) return staff('/inquiries');
    return mockStore.read<InquiryRecord>(mockStore.keys.inquiries);
  },

  async updateInquiryStatus(ticketId: string, status: InquiryRecord['status'], note: string): Promise<void> {
    if (!isMockMode) {
      await staff(`/inquiries/${encodeURIComponent(ticketId)}`, 'PATCH', { status, note });
      return;
    }
    const all = mockStore.read<InquiryRecord>(mockStore.keys.inquiries).map((r) =>
      r.ticketId === ticketId ? { ...r, status, updates: [...r.updates, { at: new Date().toISOString(), note }] } : r,
    );
    mockStore.write(mockStore.keys.inquiries, all);
  },

  // Edits. The backend must check the signed-in admin's role and department and answer 403 otherwise.
  // Mock mode changes the data loaded in this app until it is reloaded; the public site does not see it.
  async updateDepartment(id: string, update: DepartmentUpdate): Promise<Department> {
    if (!isMockMode) return staff(`/departments/${encodeURIComponent(id)}`, 'PATCH', update);
    const dept = (await apiService.getDepartments()).find((d) => d.id === id);
    if (!dept) throw new Error(`Department ${id} not found`);
    return Object.assign(dept, update);
  },

  async updateFaculty(id: string, update: FacultyUpdate): Promise<FacultyMember> {
    if (!isMockMode) return staff(`/faculty/${encodeURIComponent(id)}`, 'PATCH', update);
    const member = (await apiService.getFacultyList()).find((f) => f.id === id);
    if (!member) throw new Error(`Faculty member ${id} not found`);
    return Object.assign(member, update);
  },

  // Employee records. The backend checks that a department admin only creates, edits or deletes staff of their own
  // department (and cannot move a record to another department).
  async createStaff(record: Omit<StaffRecord, 'id'>): Promise<StaffRecord> {
    if (!isMockMode) return staff('/staff', 'POST', record);
    const directory = await apiService.getStaff();
    const created = { ...record, id: `staff-${record.group}-new-${Date.now()}` };
    directory.records.unshift(created);
    const group = directory.groups.find((g) => g.id === record.group);
    if (group) group.count += 1;
    return created;
  },

  async updateStaff(record: StaffRecord, update: Partial<StaffRecord>): Promise<StaffRecord> {
    if (!isMockMode) return staff(`/staff/${encodeURIComponent(record.id)}`, 'PATCH', update);
    const found = (await apiService.getStaff()).records.find((r) => r.id === record.id);
    if (!found) throw new Error(`Staff record ${record.id} not found`);
    return Object.assign(found, update);
  },

  async deleteStaff(record: StaffRecord): Promise<void> {
    if (!isMockMode) {
      return staff(`/staff/${encodeURIComponent(record.id)}`, 'DELETE');
    }
    const directory = await apiService.getStaff();
    const index = directory.records.findIndex((r) => r.id === record.id);
    if (index >= 0) directory.records.splice(index, 1);
    const group = directory.groups.find((g) => g.id === record.group);
    if (group && index >= 0) group.count -= 1;
  },

  // Research records. The backend checks that a department admin only creates, edits or deletes records of their
  // own department (and cannot move a record to another department).
  async createResearchRecord(record: Omit<ResearchRecord, 'id'>): Promise<ResearchRecord> {
    if (!isMockMode) return staff('/research-records', 'POST', record);
    const created = { ...record, id: `${record.kind}-new-${Date.now()}` };
    (await apiService.getResearchRecords(record.kind)).unshift(created);
    return created;
  },

  async updateResearchRecord(record: ResearchRecord, update: Partial<ResearchRecord>): Promise<ResearchRecord> {
    if (!isMockMode) return staff(`/research-records/${encodeURIComponent(record.id)}`, 'PATCH', update);
    const found = (await apiService.getResearchRecords(record.kind)).find((r) => r.id === record.id);
    if (!found) throw new Error(`Research record ${record.id} not found`);
    return Object.assign(found, update);
  },

  async deleteResearchRecord(record: ResearchRecord): Promise<void> {
    if (!isMockMode) {
      return staff(`/research-records/${encodeURIComponent(record.id)}`, 'DELETE');
    }
    const list = await apiService.getResearchRecords(record.kind);
    const index = list.findIndex((r) => r.id === record.id);
    if (index >= 0) list.splice(index, 1);
  },
};
