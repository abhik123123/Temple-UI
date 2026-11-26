import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Gopuram, Kaavi } from './Ornaments';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <Kaavi />
      <div className="site-footer__inner">
        <div className="site-footer__name">
          <Gopuram />
          <div>
            <h2>{t('home_title')}</h2>
            <p>Near Old Market, Hasanparthy, Warangal, Telangana</p>
            <p>
              <a href="tel:+15551234567">(555) 123-4567</a> ·{' '}
              <a href="mailto:info@rajarajeshwara.com">info@rajarajeshwara.com</a>
            </p>
          </div>
        </div>
        <div>
          <h2>Visit</h2>
          <ul>
            <li><Link to="/timings">Darshan timings</Link></li>
            <li><Link to="/events">Festivals and events</Link></li>
            <li><Link to="/services">Pujas and sevas</Link></li>
          </ul>
        </div>
        <div>
          <h2>Support the temple</h2>
          <ul>
            <li><Link to="/donors">Donations</Link></li>
            <li><Link to="/board-members">Trust board</Link></li>
            <li><Link to="/staff">Priests and staff</Link></li>
          </ul>
        </div>
      </div>
      <div className="site-footer__base">
        <p>&copy; {year} Raja Rajeshwara Devastanam. {t('footer_rights')}.</p>
      </div>
    </footer>
  );
}
