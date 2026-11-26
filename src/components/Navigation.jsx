import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Gopuram, Kaavi } from './Ornaments';
import IndiaTime from './IndiaTime';

export default function Navigation() {
  const { user, isAdmin, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdminPage = isAdmin && /(^|\/)admin(\/|$)/.test(location.pathname);

  // Close the mobile menu after navigating.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: isAdminPage ? '/home/admin' : '/home', label: t('nav_home') },
    { to: isAdminPage ? '/events/admin' : '/events', label: t('nav_events') },
    { to: isAdminPage ? '/services/admin' : '/services', label: t('nav_services') },
    { to: isAdminPage ? '/timings/admin' : '/timings', label: t('nav_timings') },
    { to: isAdminPage ? '/staff/admin' : '/staff', label: 'Priests & staff' },
    { to: isAdminPage ? '/board-members/admin' : '/board-members', label: 'Trust board' },
    { to: '/donors', label: 'Donations' },
  ];
  if (isAdmin && !isAdminPage) {
    links.push({ to: '/home/admin', label: 'Admin' });
  }

  return (
    <header className="site-header">
      <nav aria-label="Main">
        <div className="nav-container">
          <NavLink to={isAdminPage ? '/home/admin' : '/home'} className="logo">
            <Gopuram />
            <span>
              Raja Rajeshwara
              <small>Devastanam · Hasanparthy</small>
            </span>
          </NavLink>

          <button
            type="button"
            className="nav-toggle btn-outline"
            aria-expanded={menuOpen}
            aria-controls="primary-menu"
            onClick={() => setMenuOpen((open) => !open)}
            style={{
              font: 'inherit', fontSize: '0.9rem', padding: '0.35rem 0.75rem',
              borderRadius: 6, border: '1px solid rgba(232,196,106,.55)',
              background: 'transparent', color: '#e8c46a', cursor: 'pointer'
            }}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>

          <ul id="primary-menu" className={`nav-links${menuOpen ? ' is-open' : ''}`}>
            {links.map((link) => (
              <li key={link.to + link.label}>
                <NavLink to={link.to} end className={({ isActive }) => (isActive ? 'active' : undefined)}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav-tools">
            <IndiaTime />
            <label className="visually-hidden" htmlFor="language-select">Language</label>
            <select id="language-select" value={language} onChange={(e) => changeLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="te">తెలుగు</option>
              <option value="hi">हिंदी</option>
            </select>
            {user && (
              <button type="button" onClick={handleLogout} title={`Signed in as ${user.name}`}>
                {t('nav_logout')}
              </button>
            )}
          </div>
        </div>
      </nav>
      <Kaavi />
    </header>
  );
}
