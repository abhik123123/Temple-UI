import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navigation() {
  const { user, isAdmin, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPage = isAdmin && /(^|\/)admin(\/|$)/.test(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <div className="nav-container">
        <Link to={isAdminPage ? "/home/admin" : "/home"} className="logo">🏛️ Raja Rajeshwara</Link>
        <ul>
          <li><Link to={isAdminPage ? "/home/admin" : "/home"}>{t('nav_home')}</Link></li>
          <li><Link to={isAdminPage ? "/events/admin" : "/events"}>{t('nav_events')}</Link></li>
          <li><Link to={isAdminPage ? "/services/admin" : "/services"}>{t('nav_services')}</Link></li>
          <li><Link to={isAdminPage ? "/staff/admin" : "/staff"}>🧑‍💼 Staff</Link></li>
          <li><Link to={isAdminPage ? "/timings/admin" : "/timings"}>{t('nav_timings')}</Link></li>
          <li><Link to={isAdminPage ? "/board-members/admin" : "/board-members"}>👥 Board</Link></li>
          {isAdmin && !isAdminPage && <li><Link to="/events/admin">📅 Events Manager</Link></li>}
          {isAdmin && !isAdminPage && <li><Link to="/subscriptions/admin">📧 Newsletter</Link></li>}
          {isAdmin && !isAdminPage && <li><Link to="/home/admin">⚙️ Admin</Link></li>}
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Language Selector */}
          <select
            aria-label="Language"
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            style={{
              background: 'rgba(230, 179, 37, 0.15)',
              color: '#E6B325',
              border: '1px solid #E6B325',
              padding: '0.5rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            <option value="en" style={{ color: '#333' }}>English</option>
            <option value="te" style={{ color: '#333' }}>తెలుగు</option>
            <option value="hi" style={{ color: '#333' }}>हिंदी</option>
          </select>

          {user && (
            <>
              <span style={{ color: '#E6B325', fontSize: '0.9rem', fontWeight: '500' }}>
                👤 {user.name || user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'rgba(230, 179, 37, 0.15)',
                  color: '#E6B325',
                  border: '1px solid #E6B325',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#E6B325';
                  e.target.style.color = '#0B1C3F';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(230, 179, 37, 0.15)';
                  e.target.style.color = '#E6B325';
                }}
              >
                {t('nav_logout')}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
