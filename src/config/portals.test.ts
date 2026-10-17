import { describe, expect, it } from 'vitest';
import { PORTAL_LIST } from '@/config/portals';
import { PERSONAS } from '@/config/personas';

describe('portal entry points', () => {
  it('each have their own route and related pages on this site', () => {
    const paths = PORTAL_LIST.map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const portal of PORTAL_LIST) {
      expect(portal.path).toMatch(/^\/[a-z-]+$/);
      for (const link of portal.related) expect(link.to.startsWith('/')).toBe(true);
    }
  });
  it('are where the patient and student cards lead', () => {
    expect(PERSONAS.find((p) => p.id === 'patients')?.portal).toBe('patient');
    expect(PERSONAS.find((p) => p.id === 'students')?.portal).toBe('student');
  });
});
