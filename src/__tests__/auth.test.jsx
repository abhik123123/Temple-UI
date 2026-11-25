import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import { authAPI } from '../services/api';
import { AUTH_EXPIRED_EVENT } from '../services/httpClient';
import { getToken, setToken } from '../services/tokenStorage';
import { inSeconds, makeToken } from '../test-utils';

jest.mock('../services/api', () => ({ authAPI: { login: jest.fn() } }));

const AdminArea = () => {
  const { user } = useAuth();
  return <p>Welcome {user.name}</p>;
};

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<p>Public home</p>} />
            <Route
              path="/home/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminArea />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </MemoryRouter>
  );

const adminToken = (exp = inSeconds(3600)) => makeToken({ sub: 'admin', name: 'Temple Admin', roles: ['ADMIN'], exp });

describe('authentication flow', () => {
  afterEach(() => jest.clearAllMocks());

  it('redirects anonymous visitors from admin pages to login', async () => {
    renderAt('/home/admin');
    expect(await screen.findByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.queryByText(/admin123/)).not.toBeInTheDocument();
  });

  it('logs in against the backend and returns to the requested page', async () => {
    authAPI.login.mockResolvedValue({ token: adminToken() });
    renderAt('/home/admin');

    await userEvent.type(await screen.findByLabelText(/username/i), ' admin ');
    await userEvent.type(screen.getByLabelText(/password/i), 's3cret');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Welcome Temple Admin')).toBeInTheDocument();
    expect(authAPI.login).toHaveBeenCalledWith({ username: 'admin', password: 's3cret' });
    expect(getToken()).toBeTruthy();
  });

  it('shows a clear message on bad credentials', async () => {
    authAPI.login.mockRejectedValue(Object.assign(new Error('Unauthorized'), { status: 401 }));
    renderAt('/login');

    await userEvent.type(await screen.findByLabelText(/username/i), 'admin');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid username or password/i);
    expect(getToken()).toBeNull();
  });

  it('restores a valid session and ignores an expired one', async () => {
    setToken(adminToken());
    const { unmount } = renderAt('/home/admin');
    expect(await screen.findByText('Welcome Temple Admin')).toBeInTheDocument();
    unmount();

    setToken(adminToken(inSeconds(-60)));
    renderAt('/home/admin');
    expect(await screen.findByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(getToken()).toBeNull();
  });

  it('keeps non-admin users out of admin pages', async () => {
    setToken(makeToken({ sub: 'vol', roles: ['USER'], exp: inSeconds(3600) }));
    renderAt('/home/admin');
    expect(await screen.findByText('Public home')).toBeInTheDocument();
  });

  it('logs out when the backend reports the token is no longer valid', async () => {
    setToken(adminToken());
    renderAt('/home/admin');
    expect(await screen.findByText('Welcome Temple Admin')).toBeInTheDocument();

    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    await waitFor(() => expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument());
    expect(getToken()).toBeNull();
  });
});
