import { useEffect, useState } from 'react';
import { eventRegistrationAPI } from '../services/api';
import { formatDate } from '../utils/format';

/** Public "who's coming" list: first names and surname initials only. */
export default function EventAttendees({ event, labels, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    eventRegistrationAPI
      .getPublicAttendees(event.id)
      .then((res) => alive && setData(res))
      .catch(() => alive && setError(labels.attendeesUnavailable));
    return () => { alive = false; };
  }, [event.id, labels.attendeesUnavailable]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="reg-overlay" onClick={onClose} role="presentation">
      <div
        className="reg-dialog reg-dialog--narrow"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendees-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="reg-head">
          <div>
            <h2 id="attendees-title">{labels.whoIsComing}</h2>
            <p className="reg-meta">{event.title} · {formatDate(event.eventDate)}</p>
          </div>
          <button type="button" className="reg-close" onClick={onClose} aria-label={labels.close}>×</button>
        </header>
        <div className="reg-body">
          {!data && !error && <p className="reg-muted">{labels.loading}</p>}
          {error && <p className="reg-muted">{error}</p>}
          {data && data.names.length === 0 && <p className="reg-muted">{labels.noAttendees}</p>}
          {data && data.names.length > 0 && (
            <>
              <p className="attendee-count">
                <strong>{data.people}</strong> {labels.devoteesRegistered}
              </p>
              <ul className="attendee-list">
                {data.names.map((name, i) => <li key={`${name}-${i}`}>{name}</li>)}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
