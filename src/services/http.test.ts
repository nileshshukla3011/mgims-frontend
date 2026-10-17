import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch, clearRequestCache, request, setRequestLanguage, setUnauthorizedHandler } from '@/services/http';

const reply = (body: unknown, status = 200) => () =>
  Promise.resolve(status === 204 ? new Response(null, { status }) : new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

describe('the HTTP client', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    clearRequestCache();
    setRequestLanguage('en');
    setUnauthorizedHandler(null);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("sends the reader's language on every request", async () => {
    fetchMock.mockImplementation(reply({}));
    setRequestLanguage('hi');
    await apiFetch('/notices');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/notices');
    expect(init.headers['Accept-Language']).toBe('hi');
    expect(init.credentials).toBe('same-origin');
  });

  it('shares identical public reads and reuses them briefly', async () => {
    fetchMock.mockImplementation(reply([1]));
    await Promise.all([apiFetch('/departments'), apiFetch('/departments')]);
    await apiFetch('/departments');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('never caches staff requests, and any change clears the cache', async () => {
    fetchMock.mockImplementation(reply([]));
    await apiFetch('/inquiries', { withSession: true });
    await apiFetch('/inquiries', { withSession: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1].credentials).toBe('include');
    await apiFetch('/faculty');
    await apiFetch('/faculty/1', { method: 'PATCH', body: {}, withSession: true });
    await apiFetch('/faculty');
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it('sends null for an emptied field in an update, and leaves it out of a new record', async () => {
    fetchMock.mockImplementation(reply({}));
    await apiFetch('/staff/1', { method: 'PATCH', body: { status: undefined, name: 'A' } });
    await apiFetch('/staff', { method: 'POST', body: { status: undefined, name: 'A' } });
    expect(fetchMock.mock.calls[0][1].body).toBe('{"status":null,"name":"A"}');
    expect(fetchMock.mock.calls[1][1].body).toBe('{"name":"A"}');
  });

  it('reports a 401 on a staff request (session ended) and fails with ApiError', async () => {
    const ended = vi.fn();
    setUnauthorizedHandler(ended);
    fetchMock.mockImplementation(reply({ message: 'Signed out' }, 401));
    await expect(apiFetch('/content-changes', { withSession: true })).rejects.toMatchObject({ status: 401, message: 'Signed out' });
    expect(ended).toHaveBeenCalledTimes(1);
    await expect(apiFetch('/public', {})).rejects.toBeInstanceOf(ApiError);
    expect(ended).toHaveBeenCalledTimes(1); // a public 401 is not a session ending
  });

  it('returns nothing for 204', async () => {
    fetchMock.mockImplementation(reply(null, 204));
    await expect(apiFetch('/notices/1', { method: 'DELETE', withSession: true })).resolves.toBeUndefined();
  });

  it('tries a read once more when the server cannot be reached, but never a change', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('network')).mockImplementation(reply({ ok: true }));
    await expect(apiFetch('/site-info')).resolves.toEqual({ ok: true });
    fetchMock.mockReset();
    fetchMock.mockRejectedValue(new TypeError('network'));
    await expect(apiFetch('/feedback', { method: 'POST', body: {} })).rejects.toMatchObject({ status: 0 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('leaves the status to the caller for sign-in requests', async () => {
    fetchMock.mockImplementation(reply({ mfaRequired: true }, 202));
    const res = await request('/auth/login', { method: 'POST', body: { username: 'a', password: 'b' }, withSession: true });
    expect(res.status).toBe(202);
  });
});
