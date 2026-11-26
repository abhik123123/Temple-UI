import { formatTempleClock, panchangFor, sunTimes, templeDate } from './panchang';

const ist = (d) => formatTempleClock(d);
const minutesIst = (d) => {
  const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
    .format(d).split(':').map(Number);
  return h * 60 + m;
};

test('sunrise and sunset in Warangal are realistic through the year', () => {
  // Published tables for Warangal: sunrise 6:18 on 17 Nov (later each day), earliest
  // sunset of the year 5:34 PM on 24 Nov; earliest sunrise ~5:35 in June, latest sunset 6:51.
  const nov = sunTimes({ year: 2026, month: 11, day: 26 });
  expect(Math.abs(minutesIst(nov.sunrise) - (6 * 60 + 23))).toBeLessThanOrEqual(3);
  expect(Math.abs(minutesIst(nov.sunset) - (17 * 60 + 34))).toBeLessThanOrEqual(3);
  const jun = sunTimes({ year: 2026, month: 6, day: 21 });
  expect(Math.abs(minutesIst(jun.sunrise) - (5 * 60 + 37))).toBeLessThanOrEqual(3);
  expect(Math.abs(minutesIst(jun.sunset) - (18 * 60 + 50))).toBeLessThanOrEqual(3);
});

test('rahu kalam uses the right eighth of the day for each weekday', () => {
  // 26 Nov 2026 is a Thursday: rahu kalam is the 6th part (about 1:30-3:00 PM).
  const thu = panchangFor({ year: 2026, month: 11, day: 26, weekday: 4 });
  expect(minutesIst(thu.rahuKalam.start)).toBeGreaterThan(13 * 60);
  expect(minutesIst(thu.rahuKalam.end)).toBeLessThan(15 * 60 + 30);
  // Thursday yamagandam starts at sunrise.
  expect(thu.yamagandam.start.getTime()).toBe(thu.sunrise.getTime());
  // Monday rahu kalam is the 2nd part (about 7:30-9:00 AM).
  const mon = panchangFor({ year: 2026, month: 11, day: 30, weekday: 1 });
  expect(minutesIst(mon.rahuKalam.start)).toBeLessThan(8 * 60);
});

test('abhijit muhurtham is around noon and skipped on Wednesdays', () => {
  const thu = panchangFor({ year: 2026, month: 11, day: 26, weekday: 4 });
  expect(minutesIst(thu.abhijit.start)).toBeGreaterThan(11 * 60 + 30);
  expect(minutesIst(thu.abhijit.end)).toBeLessThan(12 * 60 + 30);
  expect(panchangFor({ year: 2026, month: 11, day: 25, weekday: 3 }).abhijit).toBeNull();
});

test('temple date follows India time, not the visitor clock', () => {
  // 20:00 in New York on 25 Nov is already 26 Nov (Thursday) in India.
  const d = templeDate(new Date('2026-11-26T01:00:00Z'));
  expect(d).toEqual({ year: 2026, month: 11, day: 26, weekday: 4 });
  expect(ist(new Date('2026-11-26T00:50:00Z'))).toBe('6:20 AM');
});
