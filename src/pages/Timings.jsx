import { useLanguage } from '../context/LanguageContext';
import { useTempleTimings } from '../hooks/useAPI';
import { formatTime } from '../utils/format';
import { PageHero } from '../components/Ornaments';
import { dayKey, translateNote } from '../utils/timingsLabels';

const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const templeToday = () =>
  new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' }).format(new Date());

export default function Timings() {
  const { t } = useLanguage();
  const { timings: backendTimings, loading, error } = useTempleTimings();

  const displayTimings = loading ? [] : backendTimings;

  return (
    <div className="page">
      <PageHero title={t('timings_title')} subtitle={t('timings_daily')} image="/images/hero/sunset-meditation.jpg" position="center 25%" />

      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#a3171c' }}>{t('timings_daily')}</h2>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            {t('timings_loading')}
          </div>
        )}

        {error && (
          <div style={{ background: '#ffe5e5', padding: '1rem', borderRadius: '4px', color: '#d32f2f', marginBottom: '2rem' }}>
            ⚠️ {error}
          </div>
        )}
        
        <div className="table-container">
          <table className="darshan-table">
            <thead>
              <tr>
                <th>{t('timings_day')}</th>
                <th>{t('timings_darshan')}</th>
                <th>{t('timings_notes')}</th>
              </tr>
            </thead>
            <tbody>
              {WEEK.map((day) => {
                const sessions = displayTimings.filter((s) => String(s.dayOfWeek).toLowerCase() === day.toLowerCase());
                if (loading || displayTimings.length === 0) return null;
                const isToday = day === templeToday();
                return (
                  <tr key={day} className={isToday ? 'is-today' : undefined}>
                    <td className="day">{t(dayKey(day))}{isToday && <span className="visually-hidden"> ({t('timings_today')})</span>}</td>
                    <td>
                      {sessions.length === 0
                        ? t('timings_closed')
                        : sessions.map((s) => (
                            <div key={s.id} className="session">
                              {formatTime(s.openingTime)} – {formatTime(s.closingTime)}
                            </div>
                          ))}
                    </td>
                    <td>
                      {sessions.filter((s) => s.specialNotes).map((s) => (
                        <div key={s.id} className="session">{translateNote(s.specialNotes, t)}</div>
                      ))}
                      {sessions.every((s) => !s.specialNotes) && '—'}
                    </td>
                  </tr>
                );
              })}
              {(!loading && displayTimings.length === 0) && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>
                    {error ? t('timings_unavailable') : t('timings_none')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ 
          background: '#f7e8c8', 
          padding: '2rem', 
          borderRadius: '8px', 
          marginTop: '3rem',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#a3171c', marginBottom: '1rem' }}>📍 {t('timings_location')}</h3>
          <p><strong>{t('label_address')}:</strong> {t('address_line')}</p>
          <p><strong>{t('label_phone')}:</strong> (555) 123-4567</p>
          <p><strong>{t('label_email')}:</strong> info@rajarajeshwara.com</p>
          <p><strong>{t('label_website')}:</strong> www.rajarajeshwara.com</p>
          <button className="btn" style={{ marginTop: '1rem' }}>{t('get_directions')}</button>
        </div>
      </div>
    </div>
  );
}
