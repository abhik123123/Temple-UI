/**
 * Single place that knows where the JWT lives.
 *
 * Previously three different keys ("token", "authToken", "temple_jwt_token")
 * were used by different modules, so the token saved at login was never sent
 * on admin requests. Everything now goes through this module.
 */

const TOKEN_KEY = 'temple.auth.token';

const safeStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null; // storage disabled (private mode, sandboxed iframe, etc.)
  }
};

export const getToken = () => safeStorage()?.getItem(TOKEN_KEY) || null;

export const setToken = (token) => {
  const storage = safeStorage();
  if (!storage) return;
  if (token) storage.setItem(TOKEN_KEY, token);
  else storage.removeItem(TOKEN_KEY);
};

export const clearToken = () => setToken(null);

/**
 * Decodes the (unverified) JWT payload so the UI can read expiry and roles.
 * The backend remains the authority: it verifies the signature on every call.
 */
export const decodeToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/** Returns true when the token is missing, malformed or past its `exp`. */
export const isTokenExpired = (token, skewSeconds = 30) => {
  const payload = decodeToken(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
};
