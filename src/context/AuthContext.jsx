import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI } from '../services/api';
import { AUTH_EXPIRED_EVENT } from '../services/httpClient';
import { clearToken, decodeToken, getToken, isTokenExpired, setToken } from '../services/tokenStorage';

export const AuthContext = createContext(null);

/** Builds the UI user object from JWT claims issued by the backend. */
const userFromToken = (token) => {
  const claims = decodeToken(token);
  if (!claims) return null;
  const roles = Array.isArray(claims.roles) ? claims.roles : [];
  return {
    username: claims.sub,
    name: claims.name || claims.sub,
    roles,
    role: roles.includes('ADMIN') ? 'admin' : 'user',
  };
};

const restoreSession = () => {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    clearToken();
    return null;
  }
  return userFromToken(token);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(restoreSession);
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // Backend rejected our token (expired, revoked, signing key rotated...).
  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, logout);
  }, [logout]);

  // Log out exactly when the token expires instead of waiting for a failed request.
  useEffect(() => {
    if (!user) return undefined;
    const exp = decodeToken(getToken())?.exp;
    if (!exp) return undefined;
    const ms = exp * 1000 - Date.now();
    if (ms <= 0) {
      logout();
      return undefined;
    }
    // setTimeout overflows above ~24.8 days; tokens are far shorter but guard anyway.
    const timer = setTimeout(logout, Math.min(ms, 2 ** 31 - 1));
    return () => clearTimeout(timer);
  }, [user, logout]);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const { token } = await authAPI.login({ username: username.trim(), password });
      const nextUser = userFromToken(token);
      if (!nextUser) {
        return { success: false, message: 'Unexpected response from server.' };
      }
      setToken(token);
      setUser(nextUser);
      return { success: true };
    } catch (error) {
      const message =
        error.status === 401
          ? 'Invalid username or password.'
          : error.status === 429
          ? 'Too many login attempts. Please wait a few minutes and try again.'
          : error.message;
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
