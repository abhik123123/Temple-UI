/**
 * Daily panchangam timings for the temple, computed in the browser.
 *
 * Sunrise and sunset use the standard sunrise equation (accurate to about a
 * minute). Rahu kalam, yamagandam and gulika kalam divide the daylight
 * (sunrise to sunset) into eight equal parts and take a fixed part per
 * weekday. Abhijit muhurtham is the 8th of 15 daytime muhurtas, centred on
 * local noon; by tradition it is not observed on Wednesdays.
 */

/** Sri Raja Rajeshwara Devastanam, Hasanparthy, Warangal. */
export const TEMPLE_LOCATION = { latitude: 18.07, longitude: 79.53, timeZone: 'Asia/Kolkata' };

const RAD = Math.PI / 180;
const J2000 = 2451545.0;
const UNIX_EPOCH_JD = 2440587.5;
const DAY_MS = 86400000;

const jdToDate = (jd) => new Date((jd - UNIX_EPOCH_JD) * DAY_MS);

/**
 * Sunrise, solar noon and sunset for a calendar date at the given place.
 * @param {{year:number, month:number, day:number}} date  month is 1-12
 */
export function sunTimes({ year, month, day }, { latitude, longitude } = TEMPLE_LOCATION) {
  const noonUtcJd = Date.UTC(year, month - 1, day, 12) / DAY_MS + UNIX_EPOCH_JD;
  const n = Math.ceil(noonUtcJd - J2000 + 0.0008);
  const jStar = n - longitude / 360;
  const m = (357.5291 + 0.98560028 * jStar) % 360;
  const c = 1.9148 * Math.sin(m * RAD) + 0.02 * Math.sin(2 * m * RAD) + 0.0003 * Math.sin(3 * m * RAD);
  const lambda = (m + c + 180 + 102.9372) % 360;
  const transit = J2000 + jStar + 0.0053 * Math.sin(m * RAD) - 0.0069 * Math.sin(2 * lambda * RAD);
  const sinDec = Math.sin(lambda * RAD) * Math.sin(23.4397 * RAD);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosHour =
    (Math.sin(-0.833 * RAD) - Math.sin(latitude * RAD) * sinDec) / (Math.cos(latitude * RAD) * cosDec);
  const hourAngle = Math.acos(Math.min(1, Math.max(-1, cosHour))) / RAD;
  return {
    sunrise: jdToDate(transit - hourAngle / 360),
    noon: jdToDate(transit),
    sunset: jdToDate(transit + hourAngle / 360),
  };
}

// Part (1-8) of the daylight for each weekday, Sunday = 0.
const RAHU = [8, 2, 7, 5, 6, 4, 3];
const YAMAGANDAM = [5, 4, 3, 2, 1, 7, 6];
const GULIKA = [7, 6, 5, 4, 3, 2, 1];

/** Calendar date (and weekday) "now" at the temple, whatever the visitor's own time zone. */
export function templeDate(now = new Date(), timeZone = TEMPLE_LOCATION.timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short',
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day), weekday };
}

/** Everything the home page shows for one day. Times are Date objects. */
export function panchangFor(date, location = TEMPLE_LOCATION) {
  const { sunrise, noon, sunset } = sunTimes(date, location);
  const part = (sunset - sunrise) / 8;
  const slot = (n) => ({
    start: new Date(sunrise.getTime() + (n - 1) * part),
    end: new Date(sunrise.getTime() + n * part),
  });
  const muhurta = (sunset - sunrise) / 15;
  const abhijit = date.weekday === 3
    ? null
    : { start: new Date(noon.getTime() - muhurta / 2), end: new Date(noon.getTime() + muhurta / 2) };
  return {
    sunrise,
    sunset,
    rahuKalam: slot(RAHU[date.weekday]),
    yamagandam: slot(YAMAGANDAM[date.weekday]),
    gulikaKalam: slot(GULIKA[date.weekday]),
    abhijit,
  };
}

/** "6:21 AM" in the temple's time zone. */
export const formatTempleClock = (d, timeZone = TEMPLE_LOCATION.timeZone) =>
  new Intl.DateTimeFormat('en-IN', { timeZone, hour: 'numeric', minute: '2-digit', hour12: true })
    .format(d)
    .replace(/\s?([ap])\.?m\.?/i, (_, x) => ` ${x.toUpperCase()}M`);
