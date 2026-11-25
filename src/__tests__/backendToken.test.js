import crypto from 'crypto';
import { decodeToken, isTokenExpired } from '../services/tokenStorage';

/**
 * Builds a token exactly as temple-backend's JwtService does (Nimbus, HS256):
 * header {"alg":"HS256"}, claims iss/iat/exp/sub/name/roles, base64url without padding.
 */
const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
const backendToken = (claims, secret = crypto.randomBytes(48)) => {
  const header = b64url(JSON.stringify({ alg: 'HS256' }));
  const payload = b64url(JSON.stringify(claims));
  const sig = b64url(crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${sig}`;
};

describe('tokens issued by temple-backend', () => {
  const now = Math.floor(Date.now() / 1000);

  it('decodes subject, display name and ADMIN role', () => {
    const token = backendToken({
      iss: 'temple-backend', iat: now, exp: now + 8 * 3600,
      sub: 'admin', name: 'Temple Admin – శ్రీ', roles: ['ADMIN'],
    });
    const claims = decodeToken(token);
    expect(claims.sub).toBe('admin');
    expect(claims.name).toBe('Temple Admin – శ్రీ');
    expect(claims.roles).toEqual(['ADMIN']);
    expect(isTokenExpired(token)).toBe(false);
  });

  it('treats an 8h token issued 9h ago as expired', () => {
    const token = backendToken({ iss: 'temple-backend', iat: now - 9 * 3600, exp: now - 3600, sub: 'admin', roles: ['ADMIN'] });
    expect(isTokenExpired(token)).toBe(true);
  });
});
