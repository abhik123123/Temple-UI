import React, { useEffect, useState } from 'react';

const timeFormat = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true,
});
const dayFormat = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short',
});

/** Current time at the temple (IST), shown in the header for devotees abroad. */
export default function IndiaTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="ist-clock" aria-label={`Temple time: ${timeFormat.format(now)} IST`}>
      <strong>{timeFormat.format(now)}</strong> IST
      <br />
      {dayFormat.format(now)}
    </div>
  );
}
