import { afterEach, describe, expect, it, vi } from 'vitest';

describe('old-site photo addresses', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('are unchanged while no media address is set', async () => {
    const { mediaUrl } = await import('@/utils/media');
    expect(mediaUrl('https://www.mgims.ac.in/images/a.jpg')).toBe('https://www.mgims.ac.in/images/a.jpg');
  });

  it('load from the new hosting when VITE_MEDIA_BASE_URL is set, keeping the path', async () => {
    vi.stubEnv('VITE_MEDIA_BASE_URL', 'https://media.example.org/old/');
    const { mediaUrl } = await import('@/utils/media');
    expect(mediaUrl('https://mgims.ac.in/images/mp/a.jpg')).toBe('https://media.example.org/old/images/mp/a.jpg');
    expect(mediaUrl('https://other.example.org/x.jpg')).toBe('https://other.example.org/x.jpg');
  });
});
