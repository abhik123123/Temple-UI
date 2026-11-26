import { useCallback, useEffect, useState } from 'react';
import { eventRegistrationAPI } from '../services/api';
import { formatDate } from '../utils/format';

const fullName = (m) => [m.name, m.surname].filter(Boolean).join(' ');

const formatRegisteredAt = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

const csvCell = (value) => {
  const s = value == null ? '' : String(value);
  // Neutralise spreadsheet formulas and quote every cell.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

const toCsv = (registrations) => {
  const header = ['Registration', 'Status', 'Registered at', 'Name', 'Phone', 'Email', 'Address'];
  const rows = registrations.flatMap((r) =>
    (r.members || []).map((m) => [
      `#${r.id}`, r.status, formatRegisteredAt(r.registrationDate),
      fullName(m), m.phoneNo, m.email, m.address,
    ]),
  );
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
};

/**
 * Admin-only list of everyone who registered for one event.
 * Shown as a dialog over the Events admin page.
 */
export default function EventRegistrations({ event, onClose }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelled, setShowCancelled] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventRegistrationAPI.getRegistrations(event.id);
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Could not load registrations.');
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const active = registrations.filter((r) => r.status !== 'CANCELLED');
  const cancelled = registrations.length - active.length;
  const shown = showCancelled ? registrations : active;
  const people = active.reduce((sum, r) => sum + (r.members?.length || 0), 0);

  const cancel = async (r) => {
    const who = fullName(r.members?.[0] || {}) || `#${r.id}`;
    if (!window.confirm(`Cancel the registration for ${who}?`)) return;
    try {
      setCancellingId(r.id);
      await eventRegistrationAPI.cancel(r.id);
      await load();
    } catch (err) {
      setError(err.message || 'Could not cancel the registration.');
    } finally {
      setCancellingId(null);
    }
  };

  const download = () => {
    const blob = new Blob(['﻿' + toCsv(active)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = (event.title || 'event').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
    a.href = url;
    a.download = `${slug}-registrations.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reg-overlay" onClick={onClose} role="presentation">
      <div
        className="reg-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reg-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="reg-head">
          <div>
            <h2 id="reg-dialog-title">{event.title}</h2>
            <p className="reg-meta">
              {formatDate(event.date)}
              {event.location ? ` at ${event.location}` : ''}
            </p>
          </div>
          <button type="button" className="reg-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        {!loading && !error && (
          <div className="reg-summary">
            <p>
              <strong>{active.length}</strong> {active.length === 1 ? 'registration' : 'registrations'},{' '}
              <strong>{people}</strong> {people === 1 ? 'person' : 'people'}
              {cancelled > 0 && <span className="reg-muted"> · {cancelled} cancelled</span>}
            </p>
            <div className="btn-row">
              {cancelled > 0 && (
                <label className="reg-toggle">
                  <input
                    type="checkbox"
                    checked={showCancelled}
                    onChange={(e) => setShowCancelled(e.target.checked)}
                  />
                  Show cancelled
                </label>
              )}
              <button type="button" className="btn-quiet" onClick={download} disabled={active.length === 0}>
                Download CSV
              </button>
            </div>
          </div>
        )}

        <div className="reg-body">
          {loading && <p className="reg-muted">Loading registrations…</p>}
          {error && (
            <div className="reg-error">
              <p>{error}</p>
              <button type="button" className="btn-quiet" onClick={load}>Try again</button>
            </div>
          )}
          {!loading && !error && shown.length === 0 && (
            <p className="reg-muted">
              No one has registered yet. Devotees register from the Events page using the Register button.
            </p>
          )}
          {!loading && !error && shown.length > 0 && (
            <div className="table-container">
              <table className="reg-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Registered</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                {shown.map((r) => {
                  const members = r.members?.length ? r.members : [{}];
                  const isCancelled = r.status === 'CANCELLED';
                  return (
                    <tbody key={r.id} className={isCancelled ? 'reg-cancelled' : undefined}>
                      {members.map((m, i) => (
                        <tr key={m.id ?? i}>
                          <td>
                            {fullName(m) || '—'}
                            {i === 0 && members.length > 1 && (
                              <span className="reg-group"> group of {members.length}</span>
                            )}
                            {i === 0 && isCancelled && <span className="reg-badge">Cancelled</span>}
                          </td>
                          <td>{m.phoneNo ? <a href={`tel:${m.phoneNo}`}>{m.phoneNo}</a> : '—'}</td>
                          <td>{m.email ? <a href={`mailto:${m.email}`}>{m.email}</a> : '—'}</td>
                          <td>{m.address || '—'}</td>
                          {i === 0 && (
                            <>
                              <td rowSpan={members.length}>{formatRegisteredAt(r.registrationDate)}</td>
                              <td rowSpan={members.length}>
                                {!isCancelled && (
                                  <button
                                    type="button"
                                    className="btn-quiet reg-cancel"
                                    onClick={() => cancel(r)}
                                    disabled={cancellingId === r.id}
                                  >
                                    {cancellingId === r.id ? 'Cancelling…' : 'Cancel'}
                                  </button>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  );
                })}
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
