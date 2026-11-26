import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { eventsAPI } from '../services/api';
import { resolveAssetUrl } from '../services/httpClient';
import { formatDate, formatTime, parseLocalDate } from '../utils/format';
import EventRegistrationModal from '../components/EventRegistrationModal';
import EventAttendees from '../components/EventAttendees';

const translations = {
  en: {
    events: 'Events',
    register: 'Register',
    regClosed: 'Registration closed',
    whoIsComing: "Who's coming",
    devoteesRegistered: 'devotees registered',
    noAttendees: 'No one has registered yet.',
    attendeesUnavailable: 'The list is not available right now.',
    close: 'Close',
    registered: 'Registered',
    viewDetails: 'View Details',
    noEvents: 'No events available',
    date: 'Date',
    time: 'Time',
    location: 'Location',
    description: 'Description',
    loading: 'Loading events...',
    error: 'Error loading events',
    registerSuccess: 'Successfully registered for event!',
    registerError: 'Failed to register for event',
    upcomingEvents: 'Upcoming Events'
  },
  te: {
    events: 'ఈవెంట్‌లు',
    register: 'రిజిస్టర్',
    regClosed: 'నమోదు ముగిసింది',
    whoIsComing: 'ఎవరు వస్తున్నారు',
    devoteesRegistered: 'మంది భక్తులు నమోదు చేసుకున్నారు',
    noAttendees: 'ఇంకా ఎవరూ నమోదు చేసుకోలేదు.',
    attendeesUnavailable: 'ఈ జాబితా ప్రస్తుతం అందుబాటులో లేదు.',
    close: 'మూసివేయి',
    registered: 'నిబంధించబడినవి',
    viewDetails: 'వివరాలను చూడండి',
    noEvents: 'ఈవెంట్‌లు అందుబాటులో లేవు',
    date: 'తేదీ',
    time: 'సమయం',
    location: 'ప్రదేశం',
    description: 'వివరణ',
    loading: 'ఈవెంట్‌లు లోడ్ చేస్తోంది...',
    error: 'ఈవెంట్‌లను లోడ్ చేయడంలో లోపం',
    registerSuccess: 'ఈవెంట్‌కు విజయవంతంగా నిబంధించబడ్డారు!',
    registerError: 'ఈవెంట్‌కు నిబంధించడం విఫలమైంది',
    upcomingEvents: 'రాబోయే ఈవెంట్‌లు'
  },
  hi: {
    events: 'कार्यक्रम',
    register: 'पंजीकृत करें',
    regClosed: 'पंजीकरण बंद है',
    whoIsComing: 'कौन आ रहा है',
    devoteesRegistered: 'भक्तों ने पंजीकरण किया',
    noAttendees: 'अभी तक किसी ने पंजीकरण नहीं किया है।',
    attendeesUnavailable: 'यह सूची अभी उपलब्ध नहीं है।',
    close: 'बंद करें',
    registered: 'पंजीकृत',
    viewDetails: 'विवरण देखें',
    noEvents: 'कोई घटना उपलब्ध नहीं है',
    date: 'तारीख',
    time: 'समय',
    location: 'स्थान',
    description: 'विवरण',
    loading: 'ईवेंट लोड हो रहे हैं...',
    error: 'ईवेंट लोड करने में त्रुटि',
    registerSuccess: 'इवेंट के लिए सफलतापूर्वक पंजीकृत!',
    registerError: 'इवेंट के लिए पंजीकरण विफल',
    upcomingEvents: 'आने वाले कार्यक्रम'
  }
};


export default function EventsUser() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [registeringEvent, setRegisteringEvent] = useState(null);
  const [attendeesFor, setAttendeesFor] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getAll({ upcoming: true });
      setEvents((Array.isArray(data) ? data : []).map((event) => ({ ...event, imageUrl: resolveAssetUrl(event.imageUrl) })));
      setError(null);
    } catch (err) {
      setError(err.message || 'Unable to load events right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (event) => {
    if (registeredEvents.has(event.id)) return;
    setShowModal(false);
    setRegisteringEvent(event);
  };

  const handleRegistered = (eventId) => {
    setRegisteredEvents((prev) => new Set(prev).add(eventId));
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>{t.loading}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', minHeight: '70vh', backgroundColor: '#fbf1dc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#4a0c0e',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            {t.upcomingEvents}
          </h1>
          <div style={{
            height: '4px',
            width: '60px',
            backgroundColor: '#c98e1b',
            margin: '0 auto'
          }}></div>
        </div>

        {error && (
          <div style={{
            padding: '15px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '18px', color: '#999' }}>{t.noEvents}</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '25px'
          }}>
            {events.map(event => {
              const d = parseLocalDate(event.eventDate);
              const registered = registeredEvents.has(event.id);
              return (
                <article key={event.id} className="event-card">
                  <div className={`event-card__media${event.imageUrl ? ' has-photo' : ''}`} style={event.imageUrl ? { backgroundImage: `url(${event.imageUrl})` } : undefined}>
                    {d && (
                      <div className="event-card__date" aria-hidden="true">
                        <span>{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                        <strong>{d.getDate()}</strong>
                        <span>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      </div>
                    )}
                  </div>
                  <div className="event-card__body">
                    {event.category && <p className="event-card__category">{event.category}</p>}
                    <h3>{event.title}</h3>
                    <p className="event-card__meta">
                      {formatDate(event.eventDate)}
                      {event.startTime && <> · {formatTime(event.startTime)}{event.endTime && `–${formatTime(event.endTime)}`}</>}
                      <br />
                      {event.location || 'Temple'}
                    </p>
                    {event.description && <p className="event-card__desc">{event.description}</p>}
                    <div className="event-card__actions">
                      <button type="button" className="btn btn-quiet" onClick={() => handleViewDetails(event)}>
                        {t.viewDetails}
                      </button>
                      {event.registrationOpen === false ? (
                        <span className="event-card__closed">{t.regClosed}</span>
                      ) : (
                        <button type="button" className="btn" disabled={registered} onClick={() => handleRegister(event)}>
                          {registered ? t.registered : t.register}
                        </button>
                      )}
                    </div>
                    {event.attendeeListPublic && (
                      <button type="button" className="event-card__who" onClick={() => setAttendeesFor(event)}>
                        {t.whoIsComing}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {attendeesFor && (
          <EventAttendees
            event={attendeesFor}
            labels={{ ...t, loading: '…' }}
            onClose={() => setAttendeesFor(null)}
          />
        )}

        {/* Details Modal */}
        {showModal && selectedEvent && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h2 style={{ color: '#4a0c0e', marginBottom: '20px' }}>
                {selectedEvent.title}
              </h2>

              <div style={{ marginBottom: '20px', lineHeight: '1.6', color: '#666' }}>
                <h4 style={{ color: '#4a0c0e', marginBottom: '10px' }}>{t.description}</h4>
                <p>{selectedEvent.description || 'No description available'}</p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#fbf1dc',
                borderRadius: '4px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{t.date}</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    {formatDate(selectedEvent.eventDate)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{t.time}</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    {formatTime(selectedEvent.startTime)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{t.location}</div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    {selectedEvent.location || 'Temple'}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '25px'
              }}>
                {selectedEvent.registrationOpen !== false && (
                <button
                  onClick={() => {
                    handleRegister(selectedEvent);
                    setShowModal(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: registeredEvents.has(selectedEvent.id) ? '#c98e1b' : '#4a0c0e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => e.target.style.opacity = '0.9'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                >
                  {registeredEvents.has(selectedEvent.id) ? t.registered : t.register}
                </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#fbf1dc',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => e.target.style.backgroundColor = '#efd8a8'}
                  onMouseLeave={e => e.target.style.backgroundColor = '#fbf1dc'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {registeringEvent && (
        <EventRegistrationModal
          event={registeringEvent}
          onClose={() => setRegisteringEvent(null)}
          onSuccess={() => handleRegistered(registeringEvent.id)}
        />
      )}
    </div>
  );
}
