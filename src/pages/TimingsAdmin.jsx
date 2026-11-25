import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { timingsAPI } from '../services/api';
import { formatTime, toApiTime, toInputTime } from '../utils/format';

const translations = {
  en: {
    timings: 'Temple Timings',
    weeklySchedule: 'Weekly Schedule',
    save: 'Save',
    cancel: 'Cancel',
    opening: 'Opening Time',
    closing: 'Closing Time',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    loading: 'Loading...',
    error: 'Error',
    success: 'Timings saved successfully!',
    unsavedChanges: 'You have unsaved changes',
    accessDenied: 'Access Denied',
    adminOnly: 'Only admins can access this page',
    backToHome: 'Back to Home',
    addSession: 'Add session',
    notes: 'Notes',
    day: 'Day',
    delete: 'Delete',
    noSessions: 'Closed',
    confirmDelete: 'Delete this session?'
  },
  te: {
    timings: 'మందిర సమయాలు',
    weeklySchedule: 'వారపు షెడ్యూల్',
    save: 'సేవ్',
    cancel: 'రద్దు',
    opening: 'తెరిచే సమయం',
    closing: 'ఆగిపోయే సమయం',
    monday: 'సోమవారం',
    tuesday: 'మంగళవారం',
    wednesday: 'బుధవారం',
    thursday: 'గురువారం',
    friday: 'శుక్రవారం',
    saturday: 'శనివారం',
    sunday: 'ఆదివారం',
    loading: 'లోడ్ చేస్తోంది...',
    error: 'లోపం',
    success: 'సమయాలు విజయవంతంగా సేవ్ చేయబడ్డాయి!',
    unsavedChanges: 'మీకు సేవ చేయని మార్పులు ఉన్నాయి',
    accessDenied: 'యాక్సెస్ నిరాకరించబడ్డారు',
    adminOnly: 'ఈ పేజీకి ప్రవేశించడానికి పరిపాలకులు మాత్రమే',
    backToHome: 'హోమ్‌కు తిరిగి వెళ్లండి'
  },
  hi: {
    timings: 'मंदिर के समय',
    weeklySchedule: 'साप्ताहिक अनुसूची',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    opening: 'खुलने का समय',
    closing: 'बंद होने का समय',
    monday: 'सोमवार',
    tuesday: 'मंगलवार',
    wednesday: 'बुधवार',
    thursday: 'गुरुवार',
    friday: 'शुक्रवार',
    saturday: 'शनिवार',
    sunday: 'रविवार',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'समय सफलतापूर्वक सहेजे गए!',
    unsavedChanges: 'आपके पास अनसेव किए गए परिवर्तन हैं',
    accessDenied: 'एक्सेस नकारा गया',
    adminOnly: 'केवल व्यवस्थापक इस पृष्ठ तक पहुंच सकते हैं',
    backToHome: 'होम पर वापस जाएं'
  }
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EMPTY_SESSION = { dayOfWeek: 'Monday', openingTime: '06:00', closingTime: '21:00', specialNotes: '' };

const cell = { padding: '8px', borderBottom: '1px solid #eee', verticalAlign: 'middle' };
const input = { padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' };
const button = (bg) => ({
  padding: '6px 12px', backgroundColor: bg, color: 'white', border: 'none',
  borderRadius: '4px', cursor: 'pointer', fontSize: '13px', marginRight: '6px'
});

const toForm = (row) => ({
  dayOfWeek: row.dayOfWeek,
  openingTime: toInputTime(row.openingTime),
  closingTime: toInputTime(row.closingTime),
  specialNotes: row.specialNotes || ''
});

const toPayload = (form) => ({
  dayOfWeek: form.dayOfWeek,
  openingTime: toApiTime(form.openingTime),
  closingTime: toApiTime(form.closingTime),
  specialNotes: form.specialNotes.trim() || null
});

const validate = (form) => {
  if (!form.openingTime || !form.closingTime) return 'Opening and closing times are required.';
  if (form.openingTime >= form.closingTime) return 'Closing time must be after opening time.';
  return null;
};

/**
 * Weekly opening sessions. A day can have several sessions (e.g. morning and
 * evening); each row is saved independently.
 */
export default function TimingsAdmin() {
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  const t = { ...translations.en, ...(translations[language] || {}) };

  const [rows, setRows] = useState([]);
  const [edits, setEdits] = useState({});
  const [newSession, setNewSession] = useState(EMPTY_SESSION);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await timingsAPI.getAll();
      const list = Array.isArray(data) ? data : [];
      setRows(list);
      setEdits(Object.fromEntries(list.map((r) => [r.id, toForm(r)])));
      setError(null);
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const changeRow = (id, field, value) => {
    setNotice(null);
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const isDirty = (row) => JSON.stringify(edits[row.id]) !== JSON.stringify(toForm(row));

  const run = async (id, action, successMessage) => {
    setBusyId(id);
    setError(null);
    setNotice(null);
    try {
      await action();
      await load();
      setNotice(successMessage);
    } catch (err) {
      setError(`${t.error}: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const saveRow = (row) => {
    const problem = validate(edits[row.id]);
    if (problem) return setError(problem);
    return run(row.id, () => timingsAPI.update(row.id, toPayload(edits[row.id])), t.success);
  };

  const deleteRow = (row) => {
    if (!window.confirm(t.confirmDelete)) return undefined;
    return run(row.id, () => timingsAPI.delete(row.id), t.success);
  };

  const addSession = (e) => {
    e.preventDefault();
    const problem = validate(newSession);
    if (problem) return setError(problem);
    return run('new', async () => {
      await timingsAPI.create(toPayload(newSession));
      setNewSession(EMPTY_SESSION);
    }, t.success);
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '40px 20px', minHeight: '60vh', textAlign: 'center' }}>
        <h2 style={{ color: '#d32f2f' }}>{t.accessDenied}</h2>
        <p style={{ color: '#666' }}>{t.adminOnly}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', minHeight: '70vh' }}>
      <h1 style={{ color: '#4a0c0e', marginBottom: '8px' }}>{t.timings}</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>{t.weeklySchedule}</p>

      {error && (
        <div role="alert" style={{ padding: '12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}
      {notice && (
        <div role="status" style={{ padding: '12px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', marginBottom: '16px' }}>
          {notice}
        </div>
      )}

      {loading ? (
        <p>{t.loading}</p>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#4a0c0e', color: '#c98e1b', textAlign: 'left' }}>
                <th style={cell}>{t.day}</th>
                <th style={cell}>{t.opening}</th>
                <th style={cell}>{t.closing}</th>
                <th style={cell}>{t.notes}</th>
                <th style={cell} aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                const sessions = rows.filter((r) => r.dayOfWeek === day);
                if (sessions.length === 0) {
                  return (
                    <tr key={day}>
                      <td style={cell}><strong>{t[day.toLowerCase()] || day}</strong></td>
                      <td style={{ ...cell, color: '#999' }} colSpan={4}>{t.noSessions}</td>
                    </tr>
                  );
                }
                return sessions.map((row, i) => {
                  const form = edits[row.id] || toForm(row);
                  return (
                    <tr key={row.id}>
                      <td style={cell}>{i === 0 && <strong>{t[day.toLowerCase()] || day}</strong>}</td>
                      <td style={cell}>
                        <input type="time" aria-label={`${day} ${t.opening}`} style={input} value={form.openingTime}
                          onChange={(e) => changeRow(row.id, 'openingTime', e.target.value)} />
                      </td>
                      <td style={cell}>
                        <input type="time" aria-label={`${day} ${t.closing}`} style={input} value={form.closingTime}
                          onChange={(e) => changeRow(row.id, 'closingTime', e.target.value)} />
                      </td>
                      <td style={cell}>
                        <input type="text" aria-label={`${day} ${t.notes}`} style={{ ...input, width: '100%' }} maxLength={255}
                          value={form.specialNotes} onChange={(e) => changeRow(row.id, 'specialNotes', e.target.value)} />
                      </td>
                      <td style={{ ...cell, whiteSpace: 'nowrap' }}>
                        <button type="button" style={button('#4a0c0e')} disabled={!isDirty(row) || busyId !== null}
                          onClick={() => saveRow(row)}>
                          {busyId === row.id ? t.loading : t.save}
                        </button>
                        <button type="button" style={button('#d32f2f')} disabled={busyId !== null}
                          onClick={() => deleteRow(row)}>
                          {t.delete}
                        </button>
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                          {formatTime(row.openingTime)} – {formatTime(row.closingTime)}
                        </div>
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={addSession} style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fbf1dc', borderRadius: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>{t.day}</div>
          <select style={input} value={newSession.dayOfWeek}
            onChange={(e) => setNewSession((s) => ({ ...s, dayOfWeek: e.target.value }))}>
            {DAYS.map((d) => <option key={d} value={d}>{t[d.toLowerCase()] || d}</option>)}
          </select>
        </label>
        <label>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>{t.opening}</div>
          <input type="time" required style={input} value={newSession.openingTime}
            onChange={(e) => setNewSession((s) => ({ ...s, openingTime: e.target.value }))} />
        </label>
        <label>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>{t.closing}</div>
          <input type="time" required style={input} value={newSession.closingTime}
            onChange={(e) => setNewSession((s) => ({ ...s, closingTime: e.target.value }))} />
        </label>
        <label style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontWeight: 500, marginBottom: '4px' }}>{t.notes}</div>
          <input type="text" maxLength={255} style={{ ...input, width: '100%' }} value={newSession.specialNotes}
            onChange={(e) => setNewSession((s) => ({ ...s, specialNotes: e.target.value }))} />
        </label>
        <button type="submit" style={button('#2e7d32')} disabled={busyId !== null}>
          {busyId === 'new' ? t.loading : `+ ${t.addSession}`}
        </button>
      </form>
    </div>
  );
}
