import { formatDate, formatTime, parseLocalDate, toApiTime, toInputTime } from './format';

describe('format utils', () => {
  it('parses bare ISO dates as local calendar dates (no off-by-one)', () => {
    const d = parseLocalDate('2026-11-25');
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 10, 25]);
    expect(formatDate('2026-11-25')).toBe('Nov 25, 2026');
  });

  it('handles invalid dates gracefully', () => {
    expect(parseLocalDate('nope')).toBeNull();
    expect(formatDate(null)).toBe('');
  });

  it('formats 24h times as 12h', () => {
    expect(formatTime('00:05')).toBe('12:05 AM');
    expect(formatTime('12:00:00')).toBe('12:00 PM');
    expect(formatTime('18:30')).toBe('6:30 PM');
    expect(formatTime('')).toBe('');
  });

  it('converts between input and API time formats', () => {
    expect(toApiTime('06:00')).toBe('06:00:00');
    expect(toApiTime('06:00:00')).toBe('06:00:00');
    expect(toApiTime('')).toBeNull();
    expect(toInputTime('06:00:00')).toBe('06:00');
  });
});

describe('templeTodayIso', () => {
  it('returns the India date as YYYY-MM-DD', () => {
    const { templeTodayIso } = require('./format');
    expect(templeTodayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
