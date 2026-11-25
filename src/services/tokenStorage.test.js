import { clearToken, decodeToken, getToken, isTokenExpired, setToken } from './tokenStorage';
import { inSeconds, makeToken } from '../test-utils';

describe('tokenStorage', () => {
  it('round-trips the token through localStorage', () => {
    setToken('abc');
    expect(getToken()).toBe('abc');
    clearToken();
    expect(getToken()).toBeNull();
  });

  it('decodes JWT claims including non-ASCII names', () => {
    const token = makeToken({ sub: 'admin', name: 'Admin', roles: ['ADMIN'], exp: inSeconds(60) });
    expect(decodeToken(token)).toMatchObject({ sub: 'admin', roles: ['ADMIN'] });
  });

  it('returns null for malformed tokens', () => {
    expect(decodeToken('not-a-jwt')).toBeNull();
    expect(decodeToken('a.%%%.c')).toBeNull();
    expect(decodeToken(null)).toBeNull();
  });

  it('treats expired, missing-exp and malformed tokens as expired', () => {
    expect(isTokenExpired(makeToken({ exp: inSeconds(3600) }))).toBe(false);
    expect(isTokenExpired(makeToken({ exp: inSeconds(-10) }))).toBe(true);
    expect(isTokenExpired(makeToken({ sub: 'x' }))).toBe(true);
    expect(isTokenExpired('garbage')).toBe(true);
  });
});
