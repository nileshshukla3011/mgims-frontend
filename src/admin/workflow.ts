// Maker-checker content workflow (WEB-CMS-2/4/5/6, SRS 4.14.2): department editors' changes go Draft → Submitted →
// Approved (optionally scheduled) → Published, with an approver's sign-off, version numbers and rollback.
//
// Live: the backend owns the workflow. It applies a change when it is approved (or at its scheduled time), keeps every
// version, and rejects requests that break the role rules. The console only calls the endpoints below.
// Demo: changes are kept in this browser and applied to the data loaded in the console.
import { AdminUser, NoticeSummary, ResearchRecord, StaffRecord } from '@/types';
import { apiService, isMockMode } from '@/services/api';
import { apiFetch, RequestOptions } from '@/services/http';
import { adminApi } from '@/admin/adminApi';
import { audit } from '@/admin/audit';
import { ContentIssue } from '@/admin/contentChecks';
import { canApproveChange } from '@/admin/access';

export type ChangeEntity = 'department' | 'faculty' | 'research' | 'staff' | 'notice';
export type ChangeAction = 'create' | 'update' | 'delete';
export type ChangeStatus = 'Draft' | 'Submitted' | 'Approved' | 'Published' | 'Rejected' | 'Withdrawn';

export interface ContentChange {
  id: string;
  entity: ChangeEntity;
  action: ChangeAction;
  /** The record changed; set for a created record once it is published. */
  entityId?: string;
  departmentId?: string;
  /** What the change is about, e.g. "Medicine: department profile". */
  summary: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  status: ChangeStatus;
  author: { username: string; name: string };
  createdAt: string;
  submittedAt?: string;
  reviewer?: { username: string; name: string };
  reviewedAt?: string;
  /** The approver's note; required when rejecting. */
  note?: string;
  /** Approved changes are published at this time (scheduled publishing, WEB-CMS-6). */
  publishAt?: string;
  publishedAt?: string;
  /** Version of the record after this change was published. */
  version?: number;
  /** Results of the accessibility and content checks when it was submitted (WEB-CMP-6). */
  issues?: ContentIssue[];
  /** Set when this change restores an earlier version. */
  rollbackOf?: string;
}

export type NewChange = Pick<ContentChange, 'entity' | 'action' | 'entityId' | 'departmentId' | 'summary' | 'before' | 'after' | 'issues'>;

const KEY = 'mgims-admin-workflow';
const read = (): ContentChange[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};
const write = (list: ContentChange[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 1000)));
  } catch {
    // Storage full: older demo history is lost.
  }
};
const person = (u: AdminUser) => ({ username: u.username, name: u.name });

// Staff requests on the shared client (session cookie; a 401 returns the console to sign-in).
const call = <T,>(method: RequestOptions['method'], path: string, body?: unknown) => apiFetch<T>(path, { method, body, withSession: true });

/** Demo only: makes an approved change real in the data loaded in the console. Returns the record id. */
async function applyChange(change: ContentChange, data: Record<string, unknown> | undefined, action: ChangeAction): Promise<string | undefined> {
  const id = change.entityId;
  switch (change.entity) {
    case 'department':
      await adminApi.updateDepartment(id!, data as never);
      return id;
    case 'faculty':
      await adminApi.updateFaculty(id!, data as never);
      return id;
    case 'research': {
      if (action === 'create') return (await adminApi.createResearchRecord(data as Omit<ResearchRecord, 'id'>)).id;
      const kind = (data ?? change.before)?.kind as ResearchRecord['kind'];
      const record = (await apiService.getResearchRecords(kind)).find((r) => r.id === id);
      if (action === 'delete') {
        if (record) await adminApi.deleteResearchRecord(record);
        return id;
      }
      if (record) await adminApi.updateResearchRecord(record, data as Partial<ResearchRecord>);
      else await adminApi.createResearchRecord(data as Omit<ResearchRecord, 'id'>);
      return id;
    }
    case 'staff': {
      if (action === 'create') return (await adminApi.createStaff(data as Omit<StaffRecord, 'id'>)).id;
      const record = (await apiService.getStaff()).records.find((r) => r.id === id);
      if (action === 'delete') {
        if (record) await adminApi.deleteStaff(record);
        return id;
      }
      if (record) await adminApi.updateStaff(record, data as Partial<StaffRecord>);
      else await adminApi.createStaff(data as Omit<StaffRecord, 'id'>);
      return id;
    }
    case 'notice':
      if (action === 'create') return String((await adminApi.createNotice(data as Pick<NoticeSummary, 'title' | 'category' | 'date' | 'excerpt'>)).id);
      if (action === 'delete' && id) await adminApi.deleteNotice(Number(id));
      return id;
  }
}

const nextVersion = (list: ContentChange[], change: ContentChange, entityId?: string) =>
  1 + list.filter((c) => c.status === 'Published' && c.entity === change.entity && c.entityId === (entityId ?? change.entityId)).length;

async function publish(change: ContentChange, user: AdminUser | null): Promise<ContentChange> {
  const entityId = await applyChange(change, change.after, change.action);
  const list = read();
  const published: ContentChange = { ...change, entityId: entityId ?? change.entityId, status: 'Published', publishedAt: new Date().toISOString(), version: nextVersion(list, change, entityId) };
  write(list.map((c) => (c.id === change.id ? published : c)));
  await audit.record(user ?? { username: 'scheduler', name: 'Scheduled publishing', role: 'super_admin' }, 'Published', change.summary, change.entity, published.entityId);
  return published;
}

export const workflow = {
  /** Live: `GET /content-changes?status=&departmentId=&author=`. */
  async list(filter: { status?: ChangeStatus; departmentId?: string; author?: string } = {}): Promise<ContentChange[]> {
    if (!isMockMode) {
      const params = new URLSearchParams(Object.entries(filter).filter(([, v]) => v) as [string, string][]);
      return call('GET', `/content-changes?${params}`);
    }
    return read()
      .filter((c) => (!filter.status || c.status === filter.status) && (!filter.departmentId || c.departmentId === filter.departmentId) && (!filter.author || c.author.username === filter.author))
      .sort((a, b) => (b.submittedAt ?? b.createdAt).localeCompare(a.submittedAt ?? a.createdAt));
  },

  /** A department editor's change: saved as a draft or submitted for approval. Live: `POST /content-changes`. */
  async create(user: AdminUser, input: NewChange, submit: boolean): Promise<ContentChange> {
    if (!isMockMode) return call('POST', '/content-changes', { ...input, submit });
    const now = new Date().toISOString();
    const change: ContentChange = { ...input, id: `CHG-${Date.now().toString(36).toUpperCase()}`, status: submit ? 'Submitted' : 'Draft', author: person(user), createdAt: now, submittedAt: submit ? now : undefined };
    write([change, ...read()]);
    await audit.record(user, submit ? 'Submitted for approval' : 'Saved draft', input.summary, input.entity, input.entityId);
    return change;
  },

  /** Draft → Submitted. Live: `POST /content-changes/:id/submit`. */
  async submit(user: AdminUser, change: ContentChange): Promise<ContentChange> {
    if (!isMockMode) return call('POST', `/content-changes/${encodeURIComponent(change.id)}/submit`);
    const updated: ContentChange = { ...change, status: 'Submitted', submittedAt: new Date().toISOString() };
    write(read().map((c) => (c.id === change.id ? updated : c)));
    await audit.record(user, 'Submitted for approval', change.summary, change.entity, change.entityId);
    return updated;
  },

  /** The author takes back a draft or a submission. Live: `POST /content-changes/:id/withdraw`. */
  async withdraw(user: AdminUser, change: ContentChange): Promise<void> {
    if (!isMockMode) return call('POST', `/content-changes/${encodeURIComponent(change.id)}/withdraw`);
    write(read().map((c) => (c.id === change.id ? { ...c, status: 'Withdrawn' } : c)));
    await audit.record(user, 'Withdrew change', change.summary, change.entity, change.entityId);
  },

  /**
   * Approver's sign-off: publishes now, or at `publishAt` (WEB-CMS-6). Live: `POST /content-changes/:id/approve`
   * with `{ publishAt?, note? }`; the backend applies the change.
   */
  async approve(user: AdminUser, change: ContentChange, options: { publishAt?: string; note?: string } = {}): Promise<ContentChange> {
    if (!canApproveChange(user, change)) throw new Error('Only an approver for this department can approve this change.');
    if (!isMockMode) return call('POST', `/content-changes/${encodeURIComponent(change.id)}/approve`, options);
    const reviewed: ContentChange = { ...change, status: 'Approved', reviewer: person(user), reviewedAt: new Date().toISOString(), note: options.note, publishAt: options.publishAt };
    write(read().map((c) => (c.id === change.id ? reviewed : c)));
    await audit.record(user, options.publishAt ? 'Approved and scheduled' : 'Approved', change.summary, change.entity, change.entityId);
    return options.publishAt && new Date(options.publishAt) > new Date() ? reviewed : publish(reviewed, user);
  },

  /** Live: `POST /content-changes/:id/reject` with `{ note }` (required). */
  async reject(user: AdminUser, change: ContentChange, note: string): Promise<ContentChange> {
    if (!canApproveChange(user, change)) throw new Error('Only an approver for this department can reject this change.');
    if (!isMockMode) return call('POST', `/content-changes/${encodeURIComponent(change.id)}/reject`, { note });
    const rejected: ContentChange = { ...change, status: 'Rejected', reviewer: person(user), reviewedAt: new Date().toISOString(), note };
    write(read().map((c) => (c.id === change.id ? rejected : c)));
    await audit.record(user, 'Rejected', `${change.summary}: ${note}`, change.entity, change.entityId);
    return rejected;
  },

  /**
   * An approver's own edit: applied at once (`apply` calls the usual endpoint, which versions and audits it on the
   * server, and checks that the approver may publish for that department). In demo mode it is also recorded here so the history and rollback can be tried.
   */
  async publishDirect<T>(user: AdminUser, input: NewChange, apply: () => Promise<T>): Promise<T> {
    const result = await apply();
    if (!isMockMode) return result;
    const list = read();
    const createdId = (result as { id?: string | number } | undefined)?.id;
    const change: ContentChange = {
      ...input,
      entityId: input.entityId ?? (createdId !== undefined ? String(createdId) : undefined),
      id: `CHG-${Date.now().toString(36).toUpperCase()}`,
      status: 'Published',
      author: person(user),
      reviewer: person(user),
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };
    change.version = nextVersion(list, change);
    write([change, ...list]);
    await audit.record(user, 'Published directly', input.summary, input.entity, change.entityId);
    return result;
  },

  /** Published versions of one record, newest first. Live: `GET /content-changes?entity=&entityId=&status=Published`. */
  async history(entity: ChangeEntity, entityId: string): Promise<ContentChange[]> {
    if (!isMockMode) return call('GET', `/content-changes?entity=${entity}&entityId=${encodeURIComponent(entityId)}&status=Published`);
    return read().filter((c) => c.status === 'Published' && c.entity === entity && c.entityId === entityId).sort((a, b) => (b.version ?? 0) - (a.version ?? 0));
  },

  /**
   * Restores the state before a published change, as a new published version (WEB-CMS-5).
   * Live: `POST /content-changes/:id/rollback`.
   */
  async rollback(user: AdminUser, change: ContentChange): Promise<ContentChange> {
    if (!canApproveChange(user, change)) throw new Error('Only an approver for this department can roll back this change.');
    if (!isMockMode) return call('POST', `/content-changes/${encodeURIComponent(change.id)}/rollback`);
    const reverse: ChangeAction = change.action === 'create' ? 'delete' : change.action === 'delete' ? 'create' : 'update';
    const restoring: ContentChange = {
      ...change,
      id: `CHG-${Date.now().toString(36).toUpperCase()}`,
      action: reverse,
      summary: `Rollback: ${change.summary}`,
      before: change.after,
      after: change.before,
      status: 'Approved',
      author: person(user),
      reviewer: person(user),
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      publishAt: undefined,
      rollbackOf: change.id,
      issues: undefined,
    };
    write([restoring, ...read()]);
    await audit.record(user, 'Rolled back', change.summary, change.entity, change.entityId);
    return publish(restoring, user);
  },

  /**
   * One rule for every editor: an edit by someone who may approve it (a super administrator, or the department's
   * approver) is published at once and versioned; anyone else's becomes a draft or a submission for approval.
   * Returns true when the change is already live.
   */
  async save<T>(user: AdminUser, input: NewChange, apply: () => Promise<T>, mode: 'submit' | 'draft' = 'submit'): Promise<boolean> {
    if (canApproveChange(user, input)) {
      await workflow.publishDirect(user, input, apply);
      return true;
    }
    await workflow.create(user, input, mode === 'submit');
    return false;
  },

  /** Demo only: publishes approved changes whose scheduled time has come (the backend runs this on a schedule). */
  async publishDue(): Promise<number> {
    if (!isMockMode) return 0;
    const due = read().filter((c) => c.status === 'Approved' && c.publishAt && new Date(c.publishAt) <= new Date());
    for (const change of due) await publish(change, null);
    return due.length;
  },
};
