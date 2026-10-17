// HIS-linked and synced content (WEB-DYN-*): blood stock from e-RaktKosh, regulatory updates (NMC), hospital
// statistics, published results and department notices. Each loader keeps a last-known-good copy (WEB-DYN-5).
import { apiFetch, Fresh, withLastKnownGood } from '@/services/http';
import { BloodAvailability, HospitalStatistics, PublicResult, RegulatoryUpdate } from '@/types/services';
import { NoticeSummary } from '@/types';
import { isNoticeLive } from '@/utils/noticeDates';

// Read here (not imported) so a live build drops the demo branches and their chunks entirely.
const IS_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

const demo = () => import('@/mocks/dynamicMock');

export const dynamicApi = {
  /** Live blood stock by group and component (WEB-DYN-4). `null` when the blood bank is not connected yet. */
  async getBloodAvailability(): Promise<Fresh<BloodAvailability | null>> {
    return withLastKnownGood(
      'blood-availability',
      async () => (IS_MOCK ? (await demo()).bloodAvailability() : apiFetch<BloodAvailability | null>('/blood-availability')),
      (data) => data?.updatedAt,
    );
  },

  /** Regulatory updates pulled on a schedule from authoritative sources such as NMC (WEB-DYN-1). */
  async getRegulatoryUpdates(source?: string): Promise<Fresh<RegulatoryUpdate[]>> {
    const query = source ? `?source=${encodeURIComponent(source)}` : '';
    return withLastKnownGood(`regulatory-updates${query}`, async () =>
      IS_MOCK ? (await demo()).regulatoryUpdates() : apiFetch<RegulatoryUpdate[]>(`/regulatory-updates${query}`),
    );
  },

  /** Hospital statistics (beds, OPD and IPD volume), synced from HIMS (SRS 4.8 "Live hospital statistics"). */
  async getHospitalStatistics(): Promise<Fresh<HospitalStatistics>> {
    return withLastKnownGood(
      'hospital-statistics',
      async () => (IS_MOCK ? (await demo()).hospitalStatistics() : apiFetch<HospitalStatistics>('/hospital/statistics')),
      (data) => data.updatedAt,
    );
  },

  /** Examination results released to the public (WEB-ACD-2); individual marks are in the student portal. */
  async getPublicResults(): Promise<PublicResult[]> {
    return IS_MOCK ? (await demo()).publicResults() : apiFetch<PublicResult[]>('/results/public');
  },

  /** Notices tagged with a department, for its page (WEB-DYN-3); only those inside their publication window (WEB-CMS-6). */
  async getDepartmentNotices(departmentId: string, departmentName: string): Promise<NoticeSummary[]> {
    return IS_MOCK
      ? (await demo()).departmentNotices(departmentId, departmentName)
      : (await apiFetch<NoticeSummary[]>(`/notices?departmentId=${encodeURIComponent(departmentId)}`)).filter(isNoticeLive);
  },
};
