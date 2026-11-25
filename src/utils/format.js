/**
 * Date/time helpers shared by all pages.
 *
 * `new Date('2026-11-25')` is parsed as UTC midnight, which renders as the
 * previous day for every visitor west of Greenwich. `parseLocalDate` treats
 * a bare ISO date as a local calendar date instead.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseLocalDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const match = ISO_DATE.exec(String(value));
  if (match) {
    const [, y, m, d] = match.map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDate = (value, locale = 'en-US', options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  const date = parseLocalDate(value);
  return date ? date.toLocaleDateString(locale, options) : '';
};

/** "18:30" or "18:30:00" → "6:30 PM" */
export const formatTime = (value) => {
  if (!value) return '';
  const [h, m = '00'] = String(value).split(':');
  const hours = Number.parseInt(h, 10);
  if (Number.isNaN(hours)) return '';
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${m.padStart(2, '0')} ${suffix}`;
};

/** "18:30" → "18:30:00" (backend LocalTime format); empty → null */
export const toApiTime = (value) => {
  if (!value) return null;
  return String(value).split(':').length === 2 ? `${value}:00` : String(value);
};

/** "18:30:00" → "18:30" (value for <input type="time">) */
export const toInputTime = (value) => (value ? String(value).slice(0, 5) : '');

/** Today's date as YYYY-MM-DD in the visitor's local timezone. */
export const todayIso = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);
};
