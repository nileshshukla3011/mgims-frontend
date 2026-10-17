// Audit ledger (WEB-SEC-5, WEB-CMS-5, WEB-RPT-5): who did what, when. The backend writes the authoritative,
// append-only ledger for every staff request; the console only adds events the server cannot see (e.g. a CSV export
// built in the browser). In demo mode the console keeps its own ledger in this browser so the views can be tried.
import { AdminUser } from '@/types';
import { isMockMode } from '@/services/api';
import { apiFetch } from '@/services/http';

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  actorName: string;
  role: AdminUser['role'] | 'system';
  action: string;
  summary: string;
  entity?: string;
  entityId?: string;
}

export interface AuditQuery {
  actor?: string;
  action?: string;
  from?: string;
  to?: string;
}

const KEY = 'mgims-admin-audit';
const MAX = 2000;

const read = (): AuditEvent[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};

export const audit = {
  /** Records an event. Live: only client-side events are posted; the server logs every API call itself. */
  async record(user: Pick<AdminUser, 'username' | 'name' | 'role'> | null, action: string, summary: string, entity?: string, entityId?: string, clientOnly = false) {
    const event: AuditEvent = {
      id: `AUD-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`,
      at: new Date().toISOString(),
      actor: user?.username ?? 'anonymous',
      actorName: user?.name ?? 'Not signed in',
      role: user?.role ?? 'system',
      action,
      summary,
      entity,
      entityId,
    };
    if (!isMockMode) {
      if (clientOnly) {
        await apiFetch('/audit-log/events', { method: 'POST', body: { action, summary, entity, entityId }, withSession: true }).catch(() => undefined);
      }
      return;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify([event, ...read()].slice(0, MAX)));
    } catch {
      // Storage full: the demo ledger stops growing.
    }
  },

  /** Newest first. Live: `GET /audit-log?actor=&action=&from=&to=` (server-side, append-only). */
  async list(query: AuditQuery = {}): Promise<AuditEvent[]> {
    if (!isMockMode) {
      const params = new URLSearchParams(Object.entries(query).filter(([, v]) => v) as [string, string][]);
      return apiFetch<AuditEvent[]>(`/audit-log?${params}`, { withSession: true });
    }
    return read().filter(
      (e) =>
        (!query.actor || e.actor === query.actor) &&
        (!query.action || e.action === query.action) &&
        (!query.from || e.at >= query.from) &&
        (!query.to || e.at <= `${query.to}T23:59:59`),
    );
  },
};
