// Demo-mode answers for dynamic content. Where the scraped official website has the data (hospital statistics,
// result notices, department notices) it is used; live feeds that do not exist yet (blood stock, NMC sync) return
// nothing, so the page shows how to get the information instead of invented figures.
import { apiService } from '@/services/api';
import { BloodAvailability, HospitalStatistics, PublicResult, RegulatoryUpdate } from '@/types/services';
import { NoticeSummary } from '@/types';
import { sortByDate } from '@/utils/noticeDates';
import { delay } from '@/mocks/demoStore';

export async function bloodAvailability(): Promise<BloodAvailability | null> {
  await delay();
  return null;
}

export async function regulatoryUpdates(): Promise<RegulatoryUpdate[]> {
  await delay();
  return [];
}

const STAT_ROWS: [string, string][] = [
  ['Beds', 'Hospital beds'],
  ['Outpatient Visits', 'Outpatient visits'],
  ['Inpatient Admissions', 'Inpatient admissions'],
  ['Babies delivered', 'Babies delivered'],
];

const lakh = (n: number) => (n >= 100000 ? `${(n / 100000).toFixed(2)} lakh` : n.toLocaleString('en-IN'));

/** The latest year of the official "Hospital in Numbers" table. */
export async function hospitalStatistics(): Promise<HospitalStatistics> {
  const page = await apiService.getHospitalServiceBySlug('hospital-in-numbers');
  const table = page?.tables?.[0] as { headers: string[]; rows: string[][] } | undefined;
  if (!table) throw new Error('Hospital in Numbers table not found');
  const col = table.headers.length - 1;
  return {
    period: table.headers[col],
    source: 'Hospital in Numbers, official MGIMS website',
    items: STAT_ROWS.flatMap(([row, label]) => {
      const value = Number(table.rows.find((r) => r[0] === row)?.[col]);
      return Number.isFinite(value) && value > 0 ? [{ id: row.toLowerCase().replace(/\s+/g, '-'), label, value: lakh(value) }] : [];
    }),
  };
}

/** Result notices published on the official website. */
export async function publicResults(): Promise<PublicResult[]> {
  const notices = await apiService.getNotices();
  return sortByDate(notices.filter((n) => /\bresults?\b/i.test(n.title)), 'newest').map((n) => ({
    id: String(n.id),
    title: n.title,
    date: n.date,
    url: `/notices/${n.id}`,
  }));
}

/**
 * Notices that name the department ("Department of Microbiology"). The backend should tag notices with department
 * ids instead; demo mode matches the department's name, which finds most but not all of them.
 */
export async function departmentNotices(departmentId: string, departmentName: string): Promise<NoticeSummary[]> {
  const notices = (await apiService.getNotices()) as (NoticeSummary & { departmentIds?: string[] })[];
  const name = departmentName.replace(/\s*\(.*\)$/, '');
  const pattern = new RegExp(`\\b(department|dept\\.?) of ${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  return sortByDate(
    notices.filter((n) => n.departmentIds?.includes(departmentId) || pattern.test(`${n.title} ${n.excerpt}`)),
    'newest',
  );
}
