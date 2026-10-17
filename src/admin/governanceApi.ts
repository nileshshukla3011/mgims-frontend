// Admin APIs for the governance features: media library (WEB-CMS-7), data sources (WEB-DYN-6), analytics
// (WEB-RPT-2/4), feedback routing (WEB-ENG-4), surveys and newsletter (WEB-ENG-1/5), accessibility report (WEB-RPT-3)
// and server-side exports (WEB-RPT-5). Demo mode keeps its data in this browser and returns no invented statistics.
import { AdminUser } from '@/types';
import { Survey } from '@/types/services';
import { isMockMode } from '@/services/api';
import { API_BASE_URL, apiFetch, RequestOptions } from '@/services/http';
import { audit } from '@/admin/audit';

// Staff requests on the shared client (session cookie; a 401 returns the console to sign-in).
const call = <T,>(method: RequestOptions['method'], path: string, body?: unknown) => apiFetch<T>(path, { method, body, withSession: true });

const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(`mgims-admin-${key}`);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(`mgims-admin-${key}`, JSON.stringify(value));
    } catch {
      // Storage full: the demo change lasts until reload.
    }
  },
};

// ---------------------------------------------------------------- Media library (WEB-CMS-7)

export interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  title: string;
  kind: 'image' | 'document';
  mimeType: string;
  sizeKb: number;
  /** Text alternative, required for images (WCAG 1.1.1). */
  alt?: string;
  departmentId?: string;
  uploadedBy: string;
  uploadedAt: string;
  /** Pages that use the file; a file in use cannot be deleted. */
  usedOn?: string[];
}

// Demo uploads live in memory only (object URLs), so they disappear on reload.
let demoMedia: MediaItem[] = [];

export const mediaApi = {
  /** Live: `GET /admin/media?departmentId=`. */
  async list(departmentId?: string): Promise<MediaItem[]> {
    if (!isMockMode) return call('GET', `/admin/media${departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : ''}`);
    return demoMedia.filter((m) => !departmentId || m.departmentId === departmentId);
  },
  /** Live: `POST /admin/media` (multipart: file, title, alt, departmentId). The server re-checks type and size and scans the file. */
  async upload(user: AdminUser, file: File, meta: { title: string; alt?: string; departmentId?: string }): Promise<MediaItem> {
    if (!isMockMode) {
      const form = new FormData();
      form.append('file', file);
      form.append('title', meta.title);
      if (meta.alt) form.append('alt', meta.alt);
      if (meta.departmentId) form.append('departmentId', meta.departmentId);
      return call('POST', '/admin/media', form);
    }
    const item: MediaItem = {
      id: `MED-${Date.now().toString(36)}`,
      url: URL.createObjectURL(file),
      fileName: file.name,
      title: meta.title,
      kind: file.type.startsWith('image/') ? 'image' : 'document',
      mimeType: file.type,
      sizeKb: Math.ceil(file.size / 1024),
      alt: meta.alt,
      departmentId: meta.departmentId,
      uploadedBy: user.name,
      uploadedAt: new Date().toISOString(),
      usedOn: [],
    };
    demoMedia = [item, ...demoMedia];
    await audit.record(user, 'Uploaded file', `${item.title} (${item.fileName})`, 'media', item.id);
    return item;
  },
  /** Live: `PATCH /admin/media/:id` `{ title, alt }`. */
  async update(user: AdminUser, item: MediaItem, changes: { title: string; alt?: string }): Promise<MediaItem> {
    if (!isMockMode) return call('PATCH', `/admin/media/${encodeURIComponent(item.id)}`, changes);
    const updated = { ...item, ...changes };
    demoMedia = demoMedia.map((m) => (m.id === item.id ? updated : m));
    await audit.record(user, 'Edited file details', updated.title, 'media', item.id);
    return updated;
  },
  /** Live: `DELETE /admin/media/:id` (409 when the file is still used on a page). */
  async remove(user: AdminUser, item: MediaItem): Promise<void> {
    if (!isMockMode) return call('DELETE', `/admin/media/${encodeURIComponent(item.id)}`);
    demoMedia = demoMedia.filter((m) => m.id !== item.id);
    URL.revokeObjectURL(item.url);
    await audit.record(user, 'Deleted file', item.title, 'media', item.id);
  },
};

// ---------------------------------------------------------------- Data sources (WEB-DYN-1/2/4/6)

export interface DataSource {
  id: string;
  name: string;
  description: string;
  refreshMinutes: number;
  lastSyncAt?: string;
  lastStatus?: 'OK' | 'Failed' | 'Never run';
  lastMessage?: string;
}

const DEFAULT_SOURCES: DataSource[] = [
  { id: 'nmc', name: 'NMC regulatory updates', description: 'Notices and guidelines from the National Medical Commission (WEB-DYN-1).', refreshMinutes: 1440, lastStatus: 'Never run' },
  { id: 'eraktkosh', name: 'e-RaktKosh blood stock', description: 'Blood availability by group and component (WEB-DYN-4).', refreshMinutes: 15, lastStatus: 'Never run' },
  { id: 'hims-statistics', name: 'HIMS hospital statistics', description: 'Beds, OPD and IPD figures for the home page (SRS 4.8).', refreshMinutes: 1440, lastStatus: 'Never run' },
  { id: 'hr-directory', name: 'HR faculty and staff directory', description: 'Faculty profiles and staff lists (WEB-DYN-2).', refreshMinutes: 360, lastStatus: 'Never run' },
  { id: 'ems', name: 'EMS examination results', description: 'Result notices released to the public (WEB-ACD-2).', refreshMinutes: 60, lastStatus: 'Never run' },
];

export const dataSourcesApi = {
  /** Live: `GET /admin/data-sources`. */
  async list(): Promise<DataSource[]> {
    if (!isMockMode) return call('GET', '/admin/data-sources');
    return store.get('data-sources', DEFAULT_SOURCES);
  },
  /** Live: `PATCH /admin/data-sources/:id` `{ refreshMinutes }`. */
  async setInterval(user: AdminUser, source: DataSource, refreshMinutes: number): Promise<DataSource> {
    if (!isMockMode) return call('PATCH', `/admin/data-sources/${encodeURIComponent(source.id)}`, { refreshMinutes });
    const updated = { ...source, refreshMinutes };
    store.set('data-sources', (await dataSourcesApi.list()).map((s) => (s.id === source.id ? updated : s)));
    await audit.record(user, 'Changed refresh interval', `${source.name}: every ${refreshMinutes} min`, 'data-source', source.id);
    return updated;
  },
  /**
   * Live: `POST /admin/data-sources/:id/sync` starts a sync and answers with the updated source. Demo mode has no
   * upstream system to reach, so the sync is recorded as not connected.
   */
  async syncNow(user: AdminUser, source: DataSource): Promise<DataSource> {
    if (!isMockMode) return call('POST', `/admin/data-sources/${encodeURIComponent(source.id)}/sync`);
    const updated: DataSource = { ...source, lastSyncAt: new Date().toISOString(), lastStatus: 'Failed', lastMessage: 'Demo mode: no upstream system is connected.' };
    store.set('data-sources', (await dataSourcesApi.list()).map((s) => (s.id === source.id ? updated : s)));
    await audit.record(user, 'Started sync', source.name, 'data-source', source.id);
    return updated;
  },
};

// ---------------------------------------------------------------- Analytics and feedback (WEB-RPT-2/4, WEB-ENG-4)

export interface UptakePoint {
  date: string;
  appointments: number;
  reportsDownloaded: number;
  payments: number;
  certificateRequests: number;
}

export interface FeedbackItem {
  id: string;
  at: string;
  rating: number;
  found?: string;
  lookingFor?: string;
  comment?: string;
  page?: string;
  departmentId?: string;
  department?: string;
  status: 'New' | 'Seen' | 'Actioned';
}

export interface FeedbackSummary {
  byDepartment: { departmentId?: string; department: string; responses: number; averageRating: number }[];
  weekly: { week: string; responses: number; averageRating: number }[];
}

export const analyticsApi = {
  /** Live: `GET /admin/analytics/service-uptake?from=&to=` (daily counts). Demo mode has no usage data. */
  async serviceUptake(from: string, to: string): Promise<UptakePoint[]> {
    if (!isMockMode) return call('GET', `/admin/analytics/service-uptake?from=${from}&to=${to}`);
    return [];
  },
  /** Live: `GET /admin/feedback/summary?from=&to=`. */
  async feedbackSummary(from: string, to: string): Promise<FeedbackSummary> {
    if (!isMockMode) return call('GET', `/admin/feedback/summary?from=${from}&to=${to}`);
    return { byDepartment: [], weekly: [] };
  },
  /** Site feedback routed to departments (WEB-ENG-4). Live: `GET /admin/feedback?departmentId=`. */
  async feedback(departmentId?: string): Promise<FeedbackItem[]> {
    if (!isMockMode) return call('GET', `/admin/feedback${departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : ''}`);
    return [];
  },
  /** Live: `PATCH /admin/feedback/:id` `{ status }`. */
  async setFeedbackStatus(item: FeedbackItem, status: FeedbackItem['status']): Promise<FeedbackItem> {
    if (!isMockMode) return call('PATCH', `/admin/feedback/${encodeURIComponent(item.id)}`, { status });
    return { ...item, status };
  },
};

// ---------------------------------------------------------------- Surveys and newsletter (WEB-ENG-1/5)

export interface SurveyResults {
  responses: number;
  questions: { id: string; text: string; type: string; counts?: Record<string, number>; average?: number; texts?: string[] }[];
}

export const engagementAdminApi = {
  /** Live: `GET /admin/surveys`. */
  async surveys(): Promise<(Survey & { responses?: number })[]> {
    if (!isMockMode) return call('GET', '/admin/surveys');
    return store.get('surveys', []);
  },
  /** Live: `POST /admin/surveys` (new) or `PUT /admin/surveys/:id`. */
  async saveSurvey(user: AdminUser, survey: Survey): Promise<Survey> {
    if (!isMockMode) return survey.id.startsWith('new-') ? call('POST', '/admin/surveys', { ...survey, id: undefined }) : call('PUT', `/admin/surveys/${encodeURIComponent(survey.id)}`, survey);
    const list = await engagementAdminApi.surveys();
    const saved = survey.id.startsWith('new-') ? { ...survey, id: `SRV-${Date.now().toString(36)}` } : survey;
    store.set('surveys', [saved, ...list.filter((s) => s.id !== saved.id)]);
    await audit.record(user, survey.id.startsWith('new-') ? 'Created survey' : 'Edited survey', saved.title, 'survey', saved.id);
    return saved;
  },
  /** Live: `POST /admin/surveys/:id/status` `{ status }` (Open publishes it on the feedback page; Closed stops answers). */
  async setStatus(user: AdminUser, survey: Survey, status: Survey['status']): Promise<Survey> {
    if (!isMockMode) return call('POST', `/admin/surveys/${encodeURIComponent(survey.id)}/status`, { status });
    const updated = { ...survey, status };
    store.set('surveys', (await engagementAdminApi.surveys()).map((s) => (s.id === survey.id ? updated : s)));
    await audit.record(user, status === 'Open' ? 'Opened survey' : 'Closed survey', survey.title, 'survey', survey.id);
    return updated;
  },
  /** Live: `GET /admin/surveys/:id/results`. Demo answers are kept by the public site's own browser storage. */
  async results(survey: Survey): Promise<SurveyResults> {
    if (!isMockMode) return call('GET', `/admin/surveys/${encodeURIComponent(survey.id)}/results`);
    return { responses: 0, questions: survey.questions.map((q) => ({ id: q.id, text: q.text, type: q.type })) };
  },
  /** Segments with subscriber counts. Live: `GET /admin/newsletter/segments`. */
  async newsletterSegments(): Promise<{ id: string; title: string; subscribers: number }[]> {
    if (!isMockMode) return call('GET', '/admin/newsletter/segments');
    return [];
  },
};

// ---------------------------------------------------------------- Accessibility report and exports (WEB-RPT-3/5)

export interface AccessibilityAuditPage {
  url: string;
  title?: string;
  violations: { id: string; impact: 'minor' | 'moderate' | 'serious' | 'critical'; description: string; nodes: { target: string; html?: string }[]; helpUrl?: string }[];
}

export const reportsApi = {
  /**
   * Latest automated page audit (axe-core, run by the backend or CI against every page). Live:
   * `GET /admin/accessibility/report` → `{ generatedAt, pages: AccessibilityAuditPage[] }`. Demo: none.
   */
  async accessibilityAudit(): Promise<{ generatedAt: string; pages: AccessibilityAuditPage[] } | null> {
    if (!isMockMode) return call('GET', '/admin/accessibility/report');
    return null;
  },
  /** Live: the server builds the file (and records the export in the audit ledger): `GET /admin/exports/:report.csv`. */
  exportUrl: (report: string) => `${API_BASE_URL}/admin/exports/${encodeURIComponent(report)}.csv`,
};
