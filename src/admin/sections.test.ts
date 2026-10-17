import { describe, expect, it } from 'vitest';
import { sectionFromPath, sectionPath } from '@/admin/sections';

describe('console section addresses', () => {
  it('maps sections to readable addresses and back', () => {
    expect(sectionPath('dashboard')).toBe('/');
    expect(sectionPath('grievances')).toBe('/inquiries');
    expect(sectionPath('settings')).toBe('/data-sources');
    expect(sectionFromPath('/inquiries')).toBe('grievances');
    expect(sectionFromPath('/approvals/')).toBe('approvals');
    expect(sectionFromPath('/')).toBe('dashboard');
  });
  it('does not know other addresses', () => expect(sectionFromPath('/grievances')).toBeUndefined());
});
