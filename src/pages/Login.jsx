import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Gopuram } from '../components/Ornaments';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/home/admin';

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(username, password);
    if (result.success) {
      navigate(redirectTo, { replace: true });
    } else {
      setError(result.message);
      setPassword('');
    }
  };

  const isSubmitDisabled = loading || !username.trim() || !password;

  return (
    <div className="login-shell">
      <div
        style={{
          background: '#fffaf0',
          padding: '2.25rem 2rem 2rem',
          borderRadius: '8px',
          border: '2px solid #c98e1b',
          boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
          maxWidth: '400px',
          width: '100%'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', color: '#c98e1b', marginBottom: '0.75rem' }}>
          <Gopuram className="login-gopuram" />
        </div>
        <h1 style={{ textAlign: 'center', fontSize: '1.6rem', marginBottom: '0.25rem' }}>{t('home_title')}</h1>
        <p style={{ textAlign: 'center', color: '#5b4636', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
          Sign in to manage the temple website.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="login-username" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              {t('login_username')}
            </label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              autoFocus
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="login-password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              {t('login_password')}
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          {error && (
            <div
              role="alert"
              style={{
                background: '#ffebee',
                color: '#c62828',
                padding: '0.75rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#a3171c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
              opacity: isSubmitDisabled ? 0.6 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
