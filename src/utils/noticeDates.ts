const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** Parses scraped notice dates such as "20 February 2016" or "12th Mar 2015"; unknown dates sort last. */
export const noticeTime = (date: string): number => {
  const m = date.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/);
  if (!m) return 0;
  const month = MONTHS.indexOf(m[2].toLowerCase());
  return month < 0 ? 0 : Date.UTC(Number(m[3]), month, Number(m[1]));
};

/**
 * Where a notice is in its publication window (WEB-CMS-6): `scheduled` before `publish_at`, `expired` after
 * `expires_at`, otherwise `live`. Notices without these dates are always live.
 */
export const noticeWindow = (n: { publish_at?: string; expires_at?: string }, now = Date.now()): 'scheduled' | 'live' | 'expired' => {
  if (n.publish_at && windowTime(n.publish_at) > now) return 'scheduled';
  if (n.expires_at && windowTime(n.expires_at) <= now) return 'expired';
  return 'live';
};

// A date without a time ("2026-10-20") means the start of that day in local time, not midnight UTC.
const windowTime = (value: string) => Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00` : value);

/** Public lists show only live notices; the backend should filter the same way, this is a second guard. */
export const isNoticeLive = (n: { publish_at?: string; expires_at?: string }) => noticeWindow(n) === 'live';

export type SortOrder = 'newest' | 'oldest';

export const sortByDate = <T extends { date: string }>(items: T[], order: SortOrder): T[] =>
  [...items].sort((a, b) => {
    const ta = noticeTime(a.date);
    const tb = noticeTime(b.date);
    if (!ta || !tb) return ta ? -1 : tb ? 1 : 0; // undated notices always last
    return order === 'newest' ? tb - ta : ta - tb;
  });
