import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { eventsAPI } from '../services/api';
import { resolveAssetUrl } from '../services/httpClient';
import { formatDate, formatTime, toApiTime, toInputTime } from '../utils/format';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB before compression
const MAX_IMAGE_DIMENSION = 1600; // px; keeps uploads small and fast

const translations = {
  en: {
    events: 'Events',
    addEvent: 'Add Event',
    editEvent: 'Edit Event',
    deleteEvent: 'Delete Event',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    eventTitle: 'Event Title',
    date: 'Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    location: 'Location',
    description: 'Description',
    category: 'Category',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    noEvents: 'No events',
    confirmDelete: 'Are you sure you want to delete this event?',
    accessDenied: 'Access Denied',
    adminOnly: 'Only admins can access this page',
    backToEvents: 'Back to Events'
  },
  te: {
    events: 'ఈవెంట్‌లు',
    addEvent: 'ఈవెంట్‌ను జోడించండి',
    editEvent: 'ఈవెంట్‌ను సవరించండి',
    deleteEvent: 'ఈవెంట్‌ను తొలగించండి',
    save: 'సేవ్',
    cancel: 'రద్దు',
    delete: 'తొలగించండి',
    edit: 'సవరించండి',
    create: 'సృష్టించండి',
    eventTitle: 'ఈవెంట్‌ టైటిల్',
    date: 'తేదీ',
    startTime: 'ప్రారంభ సమయం',
    endTime: 'ముగింపు సమయం',
    location: 'ప్రదేశం',
    description: 'వివరణ',
    category: 'వర్గం',
    loading: 'లోడ్ చేస్తోంది...',
    error: 'లోపం',
    success: 'విజయం',
    noEvents: 'ఈవెంట్‌లు లేవు',
    confirmDelete: 'మీరు ఈ ఈవెంట్‌ను తొలగించాలనుకుంటున్నారా?',
    accessDenied: 'యాక్సెస్ నిరాకరించబడ్డారు',
    adminOnly: 'ఈ పేజీకి ప్రవేశించడానికి పరిపాలకులు మాత్రమే',
    backToEvents: 'ఈవెంట్‌లకు తిరిగి వెళ్లండి'
  },
  hi: {
    events: 'कार्यक्रम',
    addEvent: 'ईवेंट जोड़ें',
    editEvent: 'ईवेंट संपादित करें',
    deleteEvent: 'ईवेंट हटाएं',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    create: 'बनाएं',
    eventTitle: 'ईवेंट शीर्षक',
    date: 'तारीख',
    startTime: 'शुरुआत का समय',
    endTime: 'समाप्ति का समय',
    location: 'स्थान',
    description: 'विवरण',
    category: 'श्रेणी',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    noEvents: 'कोई ईवेंट नहीं',
    confirmDelete: 'क्या आप इस ईवेंट को हटाना चाहते हैं?',
    accessDenied: 'एक्सेस नकारा गया',
    adminOnly: 'केवल व्यवस्थापक इस पृष्ठ तक पहुंच सकते हैं',
    backToEvents: 'ईवेंट्स पर वापस जाएं'
  }
};


export default function EventsAdmin() {
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  const t = translations[language] || translations.en;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    category: 'Festival',
    imageUrl: '',
    imageFile: null
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchEvents();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getAll();
      setEvents(
        (Array.isArray(data) ? data : []).map((event) => ({
          ...event,
          date: event.eventDate,
          imageUrl: resolveAssetUrl(event.imageUrl),
        }))
      );
      setError(null);
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image is too large. Please choose a file under 10 MB.');
      return;
    }

    // Re-encode as a resized JPEG: normalises formats (HEIC/WebP/PNG) the
    // backend may not accept and keeps uploads small.
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError('Failed to process image. Please try another image.');
            return;
          }
          const jpegFile = new File([blob], `event-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFormData((prev) => ({ ...prev, imageFile: jpegFile, imageUrl: canvas.toDataURL('image/jpeg', 0.6) }));
        },
        'image/jpeg',
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError('Failed to load image. Please try another image.');
    };
    img.src = objectUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      eventDate: formData.date,
      startTime: toApiTime(formData.startTime),
      endTime: toApiTime(formData.endTime),
      location: formData.location.trim(),
      category: formData.category,
    };
    try {
      setSubmitting(true);
      if (editingId) {
        await eventsAPI.update(editingId, payload, formData.imageFile);
      } else {
        await eventsAPI.create(payload, formData.imageFile);
      }
      await fetchEvents();
      resetForm();
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title || '',
      date: event.date || '',
      startTime: toInputTime(event.startTime),
      endTime: toInputTime(event.endTime),
      location: event.location || '',
      description: event.description || '',
      category: event.category || 'Festival',
      imageUrl: event.imageUrl || '',
      imageFile: null
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await eventsAPI.delete(id);
      await fetchEvents();
      setShowDeleteConfirm(null);
    } catch (err) {
      setError(err.message || t.error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      description: '',
      category: 'Festival',
      imageUrl: '',
      imageFile: null
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <p>{t.loading}</p>
      </div>
    );
  }

  // Check admin access
  if (!isAdmin) {
    return (
      <div style={{
        padding: '40px 20px',
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#d32f2f', marginBottom: '20px' }}>{t.accessDenied}</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>{t.adminOnly}</p>
        <a href="/events" style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#0B1C3F',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: '500'
        }}>
          {t.backToEvents}
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', minHeight: '70vh', backgroundColor: '#f9f9f9' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{ fontSize: '2rem', color: '#0B1C3F', margin: 0 }}>
            {t.events} {t.events === 'Management'}
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#0B1C3F',
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
            + {t.addEvent}
          </button>
        </div>

        {error && (
          <div style={{
            padding: '15px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            marginBottom: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#0B1C3F', marginBottom: '20px', marginTop: 0 }}>
              {editingId ? t.editEvent : t.addEvent}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  {t.eventTitle}
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    {t.date}
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    {t.category}
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option>Festival</option>
                    <option>Religious</option>
                    <option>Cultural</option>
                    <option>Community</option>
                    <option>Celebration</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    {t.startTime}
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    {t.endTime}
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  {t.location}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  {t.description}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  📸 Event Photo / Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  title="Upload any image format: JPG, PNG, WebP, GIF, BMP, TIFF, SVG, etc."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px dashed #E6B325',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                />
                <p style={{ fontSize: '11px', color: '#999', marginTop: '5px', marginBottom: '10px' }}>
                  ✓ Supports all image formats: JPG, JPEG, PNG, WebP, GIF, BMP, TIFF, SVG, ICO, etc.
                </p>
                {formData.imageUrl && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Preview:</p>
                    <img 
                      src={formData.imageUrl} 
                      alt="Event preview" 
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#0B1C3F',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => e.target.style.opacity = '0.9'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                >
                  {submitting ? t.loading : t.save}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => e.target.style.backgroundColor = '#e8e8e8'}
                  onMouseLeave={e => e.target.style.backgroundColor = '#f5f5f5'}
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        {events.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '16px', color: '#999' }}>{t.noEvents}</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '25px'
          }}>
            {events.map(event => (
              <div
                key={event.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease'
                }}
              >
                {/* Event Image */}
                {event.imageUrl && (
                  <div style={{ 
                    width: '100%', 
                    height: '200px', 
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5'
                  }}>
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div style={{
                  padding: '20px',
                  backgroundColor: 'linear-gradient(135deg, #0B1C3F 0%, #112A57 100%)',
                  color: 'white'
                }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>{event.title}</h3>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                    {event.category || 'Event'}
                  </p>
                </div>

                <div style={{ padding: '20px' }}>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                    📅 {formatDate(event.date)}
                  </p>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                    🕐 {formatTime(event.startTime)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </p>
                  <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                    📍 {event.location}
                  </p>
                  <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '13px', lineHeight: '1.4' }}>
                    {event.description?.substring(0, 100)}...
                  </p>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleEdit(event)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#E6B325',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={e => e.target.style.opacity = '0.9'}
                      onMouseLeave={e => e.target.style.opacity = '1'}
                    >
                      {t.edit}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(event.id)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#d32f2f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={e => e.target.style.opacity = '0.9'}
                      onMouseLeave={e => e.target.style.opacity = '1'}
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
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
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#0B1C3F', marginBottom: '15px', marginTop: 0 }}>
                {t.deleteEvent}
              </h3>
              <p style={{ color: '#666', marginBottom: '25px' }}>
                {t.confirmDelete}
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => e.target.style.opacity = '0.9'}
                  onMouseLeave={e => e.target.style.opacity = '1'}
                >
                  {t.delete}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => e.target.style.backgroundColor = '#e8e8e8'}
                  onMouseLeave={e => e.target.style.backgroundColor = '#f5f5f5'}
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
