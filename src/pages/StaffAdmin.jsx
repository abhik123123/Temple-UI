import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { staffAPI } from '../services/api';
import { resolveAssetUrl } from '../services/httpClient';
import { prepareImage } from '../utils/image';

const DEPARTMENTS = ['Religious', 'Operations', 'Community', 'Finance', 'Administration'];

const initials = (name = '') =>
  name.replace(/^(Sri|Smt|Dr|Priest)\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const translations = {
  en: {
    staff: 'Staff',
    addStaff: 'Add Staff Member',
    editStaff: 'Edit Staff Member',
    deleteStaff: 'Delete Staff Member',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    name: 'Name',
    position: 'Position',
    email: 'Email',
    phone: 'Phone',
    department: 'Department',
    photo: 'Photo',
    choosePhoto: 'Choose photo',
    changePhoto: 'Change photo',
    description: 'Description',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    noStaff: 'No staff members',
    confirmDelete: 'Are you sure you want to delete this staff member?',
    accessDenied: 'Access Denied',
    adminOnly: 'Only admins can access this page',
    backToStaff: 'Back to Staff'
  },
  te: {
    staff: 'సిబ్బంది',
    addStaff: 'సిబ్బంది సభ్యుడిని జోడించండి',
    editStaff: 'సిబ్బంది సభ్యుడిని సవరించండి',
    deleteStaff: 'సిబ్బంది సభ్యుడిని తొలగించండి',
    save: 'సేవ్',
    cancel: 'రద్దు',
    delete: 'తొలగించండి',
    edit: 'సవరించండి',
    create: 'సృష్టించండి',
    name: 'పేరు',
    position: 'స్థానం',
    email: 'ఇమెయిల్',
    phone: 'ఫోన్',
    department: 'విభాగం',
    photo: 'ఫోటో',
    choosePhoto: 'ఫోటో ఎంచుకోండి',
    changePhoto: 'ఫోటో మార్చండి',
    description: 'వివరణ',
    loading: 'లోడ్ చేస్తోంది...',
    error: 'లోపం',
    success: 'విజయం',
    noStaff: 'సిబ్బంది సభ్యులు లేరు',
    confirmDelete: 'మీరు ఈ సిబ్బంది సభ్యుడిని తొలగించాలనుకుంటున్నారా?',
    accessDenied: 'యాక్సెస్ నిరాకరించబడ్డారు',
    adminOnly: 'ఈ పేజీకి ప్రవేశించడానికి పరిపాలకులు మాత్రమే',
    backToStaff: 'సిబ్బందికి తిరిగి వెళ్లండి'
  },
  hi: {
    staff: 'कर्मचारी',
    addStaff: 'कर्मचारी सदस्य जोड़ें',
    editStaff: 'कर्मचारी सदस्य संपादित करें',
    deleteStaff: 'कर्मचारी सदस्य हटाएं',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    create: 'बनाएं',
    name: 'नाम',
    position: 'पद',
    email: 'ईमेल',
    phone: 'फोन',
    department: 'विभाग',
    photo: 'फ़ोटो',
    choosePhoto: 'फ़ोटो चुनें',
    changePhoto: 'फ़ोटो बदलें',
    description: 'विवरण',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    noStaff: 'कोई कर्मचारी नहीं',
    confirmDelete: 'क्या आप इस कर्मचारी को हटाना चाहते हैं?',
    accessDenied: 'एक्सेस नकारा गया',
    adminOnly: 'केवल व्यवस्थापक इस पृष्ठ तक पहुंच सकते हैं',
    backToStaff: 'कर्मचारी पर वापस जाएं'
  }
};

export default function StaffAdmin() {
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  const t = translations[language] || translations.en;

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    email: '',
    phoneNumber: '',
    department: 'Religious',
    biography: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      fetchStaff();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await staffAPI.getAll();
      setStaff(Array.isArray(data) ? data : data?.data || []);
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

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const { file: prepared, previewUrl } = await prepareImage(file, { maxDimension: 800, namePrefix: 'staff' });
      setPhotoFile(prepared);
      setPhotoPreview(previewUrl);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    try {
      setSaving(true);
      if (editingId) {
        await staffAPI.update(editingId, formData, photoFile);
      } else {
        await staffAPI.create(formData, photoFile);
      }
      await fetchStaff();
      resetForm();
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (staffMember) => {
    setFormData({
      fullName: staffMember.fullName || '',
      position: staffMember.position || '',
      email: staffMember.email || '',
      phoneNumber: staffMember.phoneNumber || '',
      department: staffMember.department || 'Religious',
      biography: staffMember.biography || ''
    });
    setPhotoFile(null);
    setPhotoPreview(staffMember.profileImageUrl ? resolveAssetUrl(staffMember.profileImageUrl) : null);
    setEditingId(staffMember.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await staffAPI.delete(id);
      await fetchStaff();
      setShowDeleteConfirm(null);
    } catch (err) {
      setError(err.message || t.error);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      position: '',
      email: '',
      phoneNumber: '',
      department: 'Religious',
      biography: ''
    });
    setPhotoFile(null);
    setPhotoPreview(null);
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
        <a href="/staff" style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#4a0c0e',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontWeight: '500'
        }}>
          {t.backToStaff}
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', minHeight: '70vh', backgroundColor: '#fbf1dc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{ fontSize: '2rem', color: '#4a0c0e', margin: 0 }}>
            {t.staff} Management
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4a0c0e',
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
            + {t.addStaff}
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
            <h2 style={{ color: '#4a0c0e', marginBottom: '20px', marginTop: 0 }}>
              {editingId ? t.editStaff : t.addStaff}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    {t.name}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
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
                    {t.position}
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
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

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    {t.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
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
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
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
                <label htmlFor="staff-department" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  {t.department}
                </label>
                <select
                  id="staff-department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', background: 'white' }}
                >
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <span style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{t.photo}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                    border: '2px solid #c98e1b', background: '#4a0c0e',
                    display: 'grid', placeItems: 'center', color: '#e8c46a', fontSize: 28
                  }}>
                    {photoPreview
                      ? <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span aria-hidden="true">{initials(formData.fullName) || '🛕'}</span>}
                  </div>
                  <label className="btn btn-quiet" style={{ marginTop: 0, cursor: 'pointer' }}>
                    {photoPreview ? t.changePhoto : t.choosePhoto}
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="visually-hidden" />
                  </label>
                </div>
                <p style={{ fontSize: 13, color: '#5b4636', marginTop: 6 }}>
                  A clear head-and-shoulders photo works best. JPEG, PNG or WebP, up to 10 MB.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  {t.description}
                </label>
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleInputChange}
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#4a0c0e',
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
                  {saving ? t.loading : t.save}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#fbf1dc',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => e.target.style.backgroundColor = '#efd8a8'}
                  onMouseLeave={e => e.target.style.backgroundColor = '#fbf1dc'}
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Staff List */}
        {staff.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '16px', color: '#999' }}>{t.noStaff}</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '25px'
          }}>
            {staff.map(member => (
              <div
                key={member.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #4a0c0e 0%, #7e1015 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                    border: '2px solid #c98e1b', display: 'grid', placeItems: 'center', color: '#e8c46a', fontSize: 22
                  }}>
                    {member.profileImageUrl
                      ? <img src={resolveAssetUrl(member.profileImageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span aria-hidden="true">{initials(member.fullName)}</span>}
                  </div>
                  <div>
                  <h3 style={{ margin: '0 0 5px 0', color: 'white' }}>{member.fullName}</h3>
                  <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
                    {[member.position, member.department].filter(Boolean).join(' · ')}
                  </p>
                  </div>
                </div>

                <div style={{ padding: '20px' }}>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                    📧 {member.email}
                  </p>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                    📞 {member.phoneNumber}
                  </p>
                  <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '13px', lineHeight: '1.4' }}>
                    {member.biography && (member.biography.length > 100 ? `${member.biography.substring(0, 100)}…` : member.biography)}
                  </p>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleEdit(member)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: '#c98e1b',
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
                      onClick={() => setShowDeleteConfirm(member.id)}
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
              <h3 style={{ color: '#4a0c0e', marginBottom: '15px', marginTop: 0 }}>
                {t.deleteStaff}
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
                    backgroundColor: '#fbf1dc',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => e.target.style.backgroundColor = '#efd8a8'}
                  onMouseLeave={e => e.target.style.backgroundColor = '#fbf1dc'}
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
