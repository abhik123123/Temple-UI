import httpClient, { ApiError, AUTH_EXPIRED_EVENT, resolveAssetUrl } from './httpClient';
import { setToken } from './tokenStorage';

const adapterReturning = (status, data) => (config) =>
  status < 400
    ? Promise.resolve({ status, data, headers: {}, config, statusText: 'OK' })
    : Promise.reject(Object.assign(new Error(`HTTP ${status}`), { config, response: { status, data, headers: {}, config } }));

describe('httpClient', () => {
  it('attaches the bearer token when present', async () => {
    setToken('tok123');
    let seen;
    await httpClient.get('/x', {
      adapter: (config) => {
        seen = config.headers.Authorization;
        return adapterReturning(200, {})(config);
      },
    });
    expect(seen).toBe('Bearer tok123');
  });

  it('normalises problem-detail errors into ApiError', async () => {
    const err = await httpClient
      .get('/x', { adapter: adapterReturning(400, { detail: 'Title is required', errors: { title: 'must not be blank' } }) })
      .catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.message).toBe('Title is required');
    expect(err.fieldErrors).toEqual({ title: 'must not be blank' });
  });

  it('reports network failures with a friendly message', async () => {
    const err = await httpClient
      .get('/x', { adapter: (config) => Promise.reject(Object.assign(new Error('Network Error'), { config })) })
      .catch((e) => e);
    expect(err.status).toBe(0);
    expect(err.message).toMatch(/unable to reach the server/i);
  });

  it('broadcasts auth expiry on 401 only for authenticated requests', async () => {
    const listener = jest.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, listener);

    await httpClient.get('/x', { adapter: adapterReturning(401, {}) }).catch(() => {});
    expect(listener).not.toHaveBeenCalled();

    setToken('tok');
    await httpClient.get('/x', { adapter: adapterReturning(401, {}) }).catch(() => {});
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener(AUTH_EXPIRED_EVENT, listener);
  });
});

describe('resolveAssetUrl', () => {
  it('passes absolute and data URLs through', () => {
    expect(resolveAssetUrl('https://cdn.example.org/a.jpg')).toBe('https://cdn.example.org/a.jpg');
    expect(resolveAssetUrl('data:image/png;base64,AAA')).toBe('data:image/png;base64,AAA');
  });

  it('keeps server-relative paths same-origin by default', () => {
    expect(resolveAssetUrl('/api/files/events/a.jpg')).toBe('/api/files/events/a.jpg');
    expect(resolveAssetUrl('api/files/a.jpg')).toBe('/api/files/a.jpg');
  });

  it('returns null for empty input', () => {
    expect(resolveAssetUrl('')).toBeNull();
    expect(resolveAssetUrl(undefined)).toBeNull();
  });
});
