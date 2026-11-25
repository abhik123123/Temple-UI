import { useState } from 'react';
import { eventRegistrationAPI } from '../services/api';
import { formatDate } from '../utils/format';
import './EventRegistrationModal.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EventRegistrationModal({ event, onClose, onSuccess }) {
  const [members, setMembers] = useState([
    { name: '', surname: '', address: '', phoneNo: '', email: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleMemberChange = (index, field, value) => {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const addMember = () => {
    setMembers([...members, { name: '', surname: '', address: '', phoneNo: '', email: '' }]);
  };

  const removeMember = (index) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate that at least one member has a name and email
    const isValid = members.some(m => m.name.trim() && m.email.trim());
    if (!isValid) {
      setError('Please enter at least one member with name and email');
      setLoading(false);
      return;
    }

    const filled = members
      .map((m) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v.trim()])))
      .filter((m) => m.name || m.email);
    if (filled.some((m) => !m.name)) {
      setError('Please enter a name for every member you add.');
      setLoading(false);
      return;
    }
    const badEmail = filled.find((m) => m.email && !EMAIL_PATTERN.test(m.email));
    if (badEmail) {
      setError(`Please enter a valid email address for ${badEmail.name || 'each member'}.`);
      setLoading(false);
      return;
    }

    try {
      await eventRegistrationAPI.register({ eventId: event.id, members: filled });
      setSuccess(true);
      onSuccess?.();
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.message || 'Failed to register for event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-registration-overlay">
      <div className="event-registration-modal" role="dialog" aria-modal="true" aria-label="Register for event">
        <div className="modal-header">
          <h2 className="modal-title">Register for Event</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="modal-close-btn"
          >
            ✕
          </button>
        </div>

        <div className="event-info-box">
          <h3 className="event-info-title">{event.title}</h3>
          <p className="event-info-detail">
            📅 {formatDate(event.eventDate)}
          </p>
        </div>

        {success && (
          <div className="success-message">
            ✅ Registration successful!
          </div>
        )}

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {!success && (
          <>
          <p style={{ color: 'red', fontWeight: 'bold' }}>⬇️ FILL IN YOUR DETAILS BELOW ⬇️</p>
          <form onSubmit={handleSubmit}>
          <div className="members-section">
            <h3 className="members-title">Member Details</h3>
            
            {members.map((member, index) => (
              <div key={index} className="member-card">
                <div className="member-header">
                  <h4 className="member-number">Member {index + 1}</h4>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="remove-member-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Name *"
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="text"
                    placeholder="Surname"
                    value={member.surname}
                    onChange={(e) => handleMemberChange(index, 'surname', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-row-full">
                  <input
                    type="text"
                    placeholder="Address"
                    value={member.address}
                    onChange={(e) => handleMemberChange(index, 'address', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <input
                    type="tel"
                    placeholder="Phone No. *"
                    value={member.phoneNo}
                    onChange={(e) => handleMemberChange(index, 'phoneNo', e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={member.email}
                    onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addMember}
            className="add-member-btn"
          >
            ➕ Add Another Member
          </button>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Registering...' : '✅ Register'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  );
}
