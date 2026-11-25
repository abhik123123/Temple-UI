import { useLanguage } from '../context/LanguageContext';
import { useTempleTimings } from '../hooks/useAPI';
import { formatTime } from '../utils/format';

export default function Timings() {
  const { t } = useLanguage();
  const { timings: backendTimings, loading, error } = useTempleTimings();

  const displayTimings = loading ? [] : backendTimings;

  return (
    <div className="page">
      <div className="hero" style={{
        backgroundImage: 'url(/images/temple-images/temple-main.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)'
        }}></div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{ color: 'white' }}>⏰ {t('timings_title')}</h1>
          <p style={{ color: '#f0f0f0' }}>{t('timings_daily')}</p>
        </div>
      </div>

      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#8b4513' }}>{t('timings_daily')}</h2>
        
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
          <table>
            <thead>
              <tr>
                <th>{t('timings_day')}</th>
                <th>Opening Time</th>
                <th>Closing Time</th>
                <th>Special Notes</th>
              </tr>
            </thead>
            <tbody>
              {displayTimings.map((timing, idx) => (
                <tr key={idx}>
                  <td><strong>{timing.dayOfWeek}</strong></td>
                  <td>{formatTime(timing.openingTime)}</td>
                  <td>{formatTime(timing.closingTime)}</td>
                  <td>{timing.specialNotes || '—'}</td>
                </tr>
              ))}
              {(!loading && displayTimings.length === 0) && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                    {error ? 'Unable to load timings. Please try again later.' : 'No timing records available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ 
          background: '#f0f0f0', 
          padding: '2rem', 
          borderRadius: '8px', 
          marginTop: '3rem',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#8b4513', marginBottom: '1rem' }}>📍 Location & Contact</h3>
          <p><strong>Address:</strong> Near Old Market, Hasaparthy, Warangal</p>
          <p><strong>Phone:</strong> (555) 123-4567</p>
          <p><strong>Email:</strong> info@rajarajeshwara.com</p>
          <p><strong>Website:</strong> www.rajarajeshwara.com</p>
          <button className="btn" style={{ marginTop: '1rem' }}>Get Directions</button>
        </div>
      </div>
    </div>
  );
}
