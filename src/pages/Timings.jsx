import { useLanguage } from '../context/LanguageContext';
import { useTempleTimings } from '../hooks/useAPI';
import { formatTime } from '../utils/format';
import { PageHero } from '../components/Ornaments';

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
            Loading temple timings...
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
                <th>Darshan</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {WEEK.map((day) => {
                const sessions = displayTimings.filter((t) => String(t.dayOfWeek).toLowerCase() === day.toLowerCase());
                if (loading || displayTimings.length === 0) return null;
                const isToday = day === templeToday();
                return (
                  <tr key={day} className={isToday ? 'is-today' : undefined}>
                    <td className="day">{day}{isToday && <span className="visually-hidden"> (today)</span>}</td>
                    <td>
                      {sessions.length === 0
                        ? 'Closed'
                        : sessions.map((t) => (
                            <div key={t.id} className="session">
                              {formatTime(t.openingTime)} – {formatTime(t.closingTime)}
                            </div>
                          ))}
                    </td>
                    <td>
                      {sessions.filter((t) => t.specialNotes).map((t) => (
                        <div key={t.id} className="session">{t.specialNotes}</div>
                      ))}
                      {sessions.every((t) => !t.specialNotes) && '—'}
                    </td>
                  </tr>
                );
              })}
              {(!loading && displayTimings.length === 0) && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>
                    {error ? 'Unable to load timings. Please try again later.' : 'No timing records available.'}
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
          <h3 style={{ color: '#a3171c', marginBottom: '1rem' }}>📍 Location & Contact</h3>
          <p><strong>Address:</strong> Near Old Market, Hasanparthy, Warangal</p>
          <p><strong>Phone:</strong> (555) 123-4567</p>
          <p><strong>Email:</strong> info@rajarajeshwara.com</p>
          <p><strong>Website:</strong> www.rajarajeshwara.com</p>
          <button className="btn" style={{ marginTop: '1rem' }}>Get Directions</button>
        </div>
      </div>
    </div>
  );
}
