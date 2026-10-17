import { describe, expect, it } from 'vitest';
import alumni from '@/data/alumni_distinguished.json';
import faculty from '@/data/faculty.json';

describe('distinguished alumni', () => {
  it('are the 17 of the official alumni page, each with a role and a photo', () => {
    expect(alumni).toHaveLength(17);
    for (const a of alumni) {
      expect(a.name.trim()).not.toBe('');
      expect(a.role.trim()).not.toBe('');
      expect(a.photo).toMatch(/^https:\/\//);
    }
  });
  it('each have a profile text (kept with the faculty records, as on the official site) and their own address', () => {
    const profiles = new Map(faculty.map((f) => [f.slug, f]));
    for (const a of alumni) expect(profiles.get(a.slug)?.paragraphs.length, a.name).toBeGreaterThan(0);
    expect(new Set(alumni.map((a) => a.slug)).size).toBe(alumni.length);
  });
});
