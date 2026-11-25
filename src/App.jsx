import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import UserHome from './pages/UserHome';
import './styles/App.css';

// Public landing page ships in the main bundle; everything else is code-split.
const Login = lazy(() => import('./pages/Login'));
const EventsUser = lazy(() => import('./pages/EventsUser'));
const Services = lazy(() => import('./pages/Services'));
const Staff = lazy(() => import('./pages/Staff'));
const Timings = lazy(() => import('./pages/Timings'));
const Donors = lazy(() => import('./pages/Donors'));
const BoardMembers = lazy(() => import('./pages/BoardMembers'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminHome = lazy(() => import('./pages/AdminHome'));
const EventsAdmin = lazy(() => import('./pages/EventsAdmin'));
const ServicesAdmin = lazy(() => import('./pages/ServicesAdmin'));
const StaffAdmin = lazy(() => import('./pages/StaffAdmin'));
const TimingsAdmin = lazy(() => import('./pages/TimingsAdmin'));
const BoardMembersAdmin = lazy(() => import('./pages/BoardMembersAdmin'));
const SubscriptionAdmin = lazy(() => import('./components/SubscriptionAdmin'));

const PageLoader = () => (
  <div role="status" aria-live="polite" style={{ padding: '4rem 1rem', textAlign: 'center', color: '#666', minHeight: '50vh' }}>
    Loading…
  </div>
);

export const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

const admin = (element) => <ProtectedRoute requireAdmin>{element}</ProtectedRoute>;

export function AppRoutes() {
  return (
    <>
      <Navigation />
      <main id="main-content">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<UserHome />} />
              <Route path="/events" element={<EventsUser />} />
              <Route path="/services" element={<Services />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/timings" element={<Timings />} />
              <Route path="/donors" element={<Donors />} />
              <Route path="/board-members" element={<BoardMembers />} />

              <Route path="/admin" element={<Navigate to="/home/admin" replace />} />
              <Route path="/admin/dashboard" element={<Navigate to="/home/admin" replace />} />
              <Route path="/home/admin" element={admin(<AdminHome />)} />
              <Route path="/events/admin" element={admin(<EventsAdmin />)} />
              <Route path="/services/admin" element={admin(<ServicesAdmin />)} />
              <Route path="/staff/admin" element={admin(<StaffAdmin />)} />
              <Route path="/timings/admin" element={admin(<TimingsAdmin />)} />
              <Route path="/board-members/admin" element={admin(<BoardMembersAdmin />)} />
              <Route path="/subscriptions/admin" element={admin(<SubscriptionAdmin />)} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={ROUTER_FUTURE}>
        <LanguageProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
