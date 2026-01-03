import React, { createContext, useState, useCallback, useEffect } from 'react';
import config from '../config/environment';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  // Restore token and auth state on mount
  useEffect(() => {
    if (config.useJWT) {
      const savedToken = localStorage.getItem(config.tokenStorageKey);
      if (savedToken) {
        setToken(savedToken);
        setIsAuthenticated(true);
        setUser({ username: 'Authenticated', role: 'admin' });
      }
    }
    // Don't auto-authenticate on mount - require explicit login
  }, []);

  const login = useCallback(async (username, password) => {
    // Local environment - validate credentials locally
    if (!config.requireAuth && config.authType === 'basic') {
      // Check if credentials match the default admin credentials
      console.log('Login attempt:', { username, password, defaultUsername: config.defaultUsername, defaultPassword: config.defaultPassword });
      if (username === config.defaultUsername && password === config.defaultPassword) {
        console.log('Login SUCCESS');
        setUser({ username, name: username?.split('@')[0] || 'admin', role: 'admin' });
        setIsAuthenticated(true);
        return { success: true, message: 'Login successful' };
      } else {
        console.log('Login FAILED - Invalid credentials');
        return { success: false, message: 'Invalid credentials' };
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.backendUrl}${config.loginEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (config.useJWT && data.token) {
          // Store JWT token
          localStorage.setItem(config.tokenStorageKey, data.token);
          if (data.expiresIn) {
            localStorage.setItem(config.tokenExpiryKey, Date.now() + data.expiresIn);
          }
          setToken(data.token);
        }
        
        setUser({ 
          username: data.username || username, 
          name: data.name || username, 
          role: 'admin' 
        });
        setIsAuthenticated(true);
        return { success: true, message: 'Login successful' };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          message: errorData.message || 'Invalid credentials' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(config.tokenStorageKey);
    localStorage.removeItem(config.tokenExpiryKey);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const getAuthHeader = useCallback(() => {
    if (config.useJWT && token) {
      return { 'Authorization': `Bearer ${token}` };
    } else if (config.authType === 'basic') {
      // For local dev - can be used if needed
      const credentials = btoa(`${config.defaultUsername}:${config.defaultPassword}`);
      return { 'Authorization': `Basic ${credentials}` };
    }
    return {};
  }, [token]);

  const isTokenValid = useCallback(() => {
    if (!config.useJWT) return true;
    const expiry = localStorage.getItem(config.tokenExpiryKey);
    if (!expiry) return !!token;
    return Date.now() < parseInt(expiry);
  }, [token]);

  const value = {
    user,
    isAuthenticated,
    loading,
    token,
    login,
    logout,
    getAuthHeader,
    isTokenValid,
    requireAuth: config.requireAuth,
    useJWT: config.useJWT,
    authType: config.authType,
    environment: config.env,
    backendUrl: config.backendUrl,
    description: config.description
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
