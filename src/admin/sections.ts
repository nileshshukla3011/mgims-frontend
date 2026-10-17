// Every console section has its own address, so it can be bookmarked, reloaded and reached with the Back button.
import { AdminTab, TAB_GROUPS } from '@/admin/access';

const ALL_SECTIONS: AdminTab[] = TAB_GROUPS.flatMap((group) => group.tabs);

// Readable addresses where the internal name is not one.
const SLUGS: Partial<Record<AdminTab, string>> = { dashboard: '', grievances: 'inquiries', settings: 'data-sources' };

/** The address of a section, e.g. /approvals; the dashboard is /. */
export const sectionPath = (tab: AdminTab) => `/${SLUGS[tab] ?? tab}`;

/** The section an address shows, or undefined for an unknown address. */
export const sectionFromPath = (pathname: string): AdminTab | undefined => {
  const slug = pathname.split('/').filter(Boolean)[0] ?? '';
  return ALL_SECTIONS.find((tab) => (SLUGS[tab] ?? tab) === slug);
};
