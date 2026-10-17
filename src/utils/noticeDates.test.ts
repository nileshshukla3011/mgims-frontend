import { describe, expect, it } from 'vitest';
import { noticeTime, noticeWindow, sortByDate } from '@/utils/noticeDates';

const day = 86_400_000;
const now = Date.parse('2026-10-15T12:00:00Z');
const iso = (t: number) => new Date(t).toISOString();

describe('noticeWindow (WEB-CMS-6)', () => {
  it('treats a notice without dates as live', () => expect(noticeWindow({}, now)).toBe('live'));
  it('hides a notice before its publication time', () => expect(noticeWindow({ publish_at: iso(now + day) }, now)).toBe('scheduled'));
  it('shows it once the time has passed', () => expect(noticeWindow({ publish_at: iso(now - day) }, now)).toBe('live'));
  it('removes it from lists after expiry', () => expect(noticeWindow({ expires_at: iso(now - 1) }, now)).toBe('expired'));
  it('reads a date without a time as the start of that day, local time', () => {
    const local = new Date(now);
    const today = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`;
    expect(noticeWindow({ expires_at: today }, now)).toBe('expired');
  });
});

describe('notice dates as published', () => {
  it('parses "20 February 2016" and "12th Mar 2015"', () => {
    expect(noticeTime('20 February 2016')).toBe(Date.UTC(2016, 1, 20));
    expect(noticeTime('12th Mar 2015')).toBe(Date.UTC(2015, 2, 12));
  });
  it('sorts newest first, undated last', () => {
    const sorted = sortByDate([{ date: '' }, { date: '1 Jan 2020' }, { date: '1 Jan 2024' }], 'newest').map((n) => n.date);
    expect(sorted).toEqual(['1 Jan 2024', '1 Jan 2020', '']);
  });
});
