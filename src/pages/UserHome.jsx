import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SubscribeNewsletter from '../components/SubscribeNewsletter';
import { SectionTitle } from '../components/Ornaments';
import { useLanguage } from '../context/LanguageContext';
import { dayKey } from '../utils/timingsLabels';
import { useAPI, useTempleTimings } from '../hooks/useAPI';
import { servicesAPI } from '../services/api';
import PanchangTicker from '../components/PanchangTicker';
import { formatTime } from '../utils/format';

const SHIVA_IMAGES = [
  '/images/hero/sunset-meditation.jpg',
  '/images/hero/sky-statue.jpg',
  '/images/hero/kailash.jpg',
  '/images/hero/cosmic.jpg',
];

const ABOUT = {
  history: {
    label: 'Our history',
    text:
      'Raja Rajeshwara Devastanam has served the families of Hasanparthy for generations. Daily abhishekam to Lord Shiva, festivals through the year and the community kitchen are kept alive by priests, volunteers and devotees.',
  },
  temple: {
    label: 'The temple',
    text:
      'Built in the South Indian tradition, the temple rises from the sanctum of Sri Raja Rajeshwara Swamy to a gopuram crowned with kalasams. Devotees circle the prakaram, offer bilva leaves and receive vibhuti and prasadam.',
  },
  community: {
    label: 'Community',
    text:
      'Beyond worship, the temple runs the Bhojanashala, Vedic classes for children, and seva programmes that support families in need. Everyone is welcome to volunteer.',
  },
};


const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Weekday name at the temple (IST), so devotees abroad see the temple's day. */
const templeWeekday = () =>
  new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' }).format(new Date());

function DarshanToday() {
  const { t } = useLanguage();
  const { timings, loading, error, slow } = useTempleTimings();
  const today = templeWeekday();
  const sessions = useMemo(
    () => timings.filter((t) => String(t.dayOfWeek).toLowerCase() === today.toLowerCase()),
    [timings, today]
  );

  let body;
  if (loading) body = <span>{slow ? t('server_waking') : t('today_checking')}</span>;
  else if (error) body = <span>{t('today_unavailable')}</span>;
  else if (sessions.length === 0) body = <span>{t('today_closed')}</span>;
  else {
    body = (
      <span>
        {sessions.map((s, i) => (
          <React.Fragment key={s.id ?? i}>
            {i > 0 && t('today_and')}
            <strong>{formatTime(s.openingTime)}–{formatTime(s.closingTime)}</strong>
          </React.Fragment>
        ))}
      </span>
    );
  }

  return (
    <section className="darshan-today" aria-label="Darshan today">
      <div className="darshan-today__inner">
        <h2>{t('today_heading')}, {WEEKDAYS.includes(today) ? t(dayKey(today)) : ''}</h2>
        {body}
        <Link to="/timings">{t('today_weekly')}</Link>
      </div>
    </section>
  );
}

/** Sevas come from Services admin; the section hides until at least one is added. */
function HomeSevas() {
  const { t } = useLanguage();
  const { data } = useAPI(servicesAPI.getAll);
  const sevas = (Array.isArray(data) ? data : []).filter((s) => s.active !== false).slice(0, 6);
  if (sevas.length === 0) return null;
  return (
    <section className="band-sandal">
      <div className="container">
        <SectionTitle title={t('sevas_title')}>{t('sevas_sub')}</SectionTitle>
        <ul className="seva-list">
          {sevas.map((seva) => (
            <li key={seva.id}>
              {seva.icon && <span className="seva-icon" aria-hidden="true">{seva.icon}</span>}
              <h3>{seva.name}</h3>
              {seva.description && <p>{seva.description}</p>}
            </li>
          ))}
        </ul>
        <p style={{ textAlign: 'center', margin: '1.5rem auto 0' }}>
          <Link className="btn" to="/services">{t('sevas_all')}</Link>
        </p>
      </div>
    </section>
  );
}

export default function UserHome() {
  const { t } = useLanguage();
  const [aboutTab, setAboutTab] = useState('history');
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (paused || reduceMotion) return undefined;
    const interval = setInterval(() => setSlide((i) => (i + 1) % SHIVA_IMAGES.length), 7000);
    return () => clearInterval(interval);
  }, [paused]);

  return (
    <div className="page">
      <PanchangTicker />

      <section className="home-hero" aria-label="Welcome">
        {SHIVA_IMAGES.map((src, i) => (
          <div
            key={src}
            className={`home-hero__slide${i === slide ? ' is-active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
            aria-hidden="true"
          />
        ))}

        <div className="home-hero__content">
          <div>
            <p className="home-hero__mantra" lang="te">
              ఓం నమః శివాయ
              <span lang="sa">ॐ नमः शिवाय</span>
            </p>
            <h1>{t('home_title')}</h1>
            <p className="home-hero__lead">
              Abode of Sri Raja Rajeshwara Swamy in Hasanparthy, Warangal. Come for darshan, stay for the aarti.
            </p>
            <div className="btn-row">
              <Link className="btn btn-brass" to="/timings">See darshan timings</Link>
              <Link className="btn btn-outline" to="/events">Upcoming festivals</Link>
            </div>
            <div className="hero-dots" role="group" aria-label="Choose image">
              {SHIVA_IMAGES.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === slide}
                  onClick={() => { setSlide(i); setPaused(true); }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <DarshanToday />

      <section className="container">
        <SectionTitle title="About the temple" />
        <div className="tabs" role="tablist" aria-label="About the temple">
          {Object.entries(ABOUT).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`about-tab-${key}`}
              aria-selected={aboutTab === key}
              aria-controls="about-panel"
              onClick={() => setAboutTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <p id="about-panel" role="tabpanel" aria-labelledby={`about-tab-${aboutTab}`} className="tab-panel">
          {ABOUT[aboutTab].text}
        </p>
      </section>

      <HomeSevas />

      <section className="invite">
        <h2>Support the temple</h2>
        <p>
          Your offering keeps the lamps lit, feeds visitors at the Bhojanashala and funds the festivals.
        </p>
        <Link className="btn btn-brass" to="/donors">Make a donation</Link>
      </section>

      <section className="container">
        <SubscribeNewsletter isDarkMode={false} />
      </section>
    </div>
  );
}
