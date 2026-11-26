import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { formatTempleClock, panchangFor, templeDate } from '../utils/panchang';

const range = (slot) => `${formatTempleClock(slot.start)} – ${formatTempleClock(slot.end)}`;

/** Today's sunrise, sunset, rahu kalam and good time at the temple, as a scrolling strip. */
export default function PanchangTicker() {
  const { t } = useLanguage();
  const [now, setNow] = useState(() => new Date());

  // Re-check each minute so the strip rolls over at midnight in India.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const date = templeDate(now);
  const dayKey = `${date.year}-${date.month}-${date.day}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const p = useMemo(() => panchangFor(date), [dayKey]);

  const items = [
    { key: 'sunrise', icon: '🌅', label: t('pc_sunrise'), value: formatTempleClock(p.sunrise) },
    { key: 'sunset', icon: '🌇', label: t('pc_sunset'), value: formatTempleClock(p.sunset) },
    p.abhijit && { key: 'abhijit', icon: '✨', label: t('pc_abhijit'), value: range(p.abhijit), good: true },
    { key: 'rahu', icon: '⛔', label: t('pc_rahu'), value: range(p.rahuKalam), bad: true },
    { key: 'yama', icon: '⏳', label: t('pc_yama'), value: range(p.yamagandam), bad: true },
    { key: 'gulika', icon: '⏳', label: t('pc_gulika'), value: range(p.gulikaKalam), bad: true },
  ].filter(Boolean);

  const renderItems = (copy) =>
    items.map((it) => (
      <li
        key={`${copy}-${it.key}`}
        className={`panchang__item${it.good ? ' is-good' : ''}${it.bad ? ' is-bad' : ''}`}
      >
        <span aria-hidden="true">{it.icon}</span> {it.label}: <strong>{it.value}</strong>
      </li>
    ));

  return (
    <section className="panchang" aria-label={t('pc_title')}>
      <h2 className="panchang__title">{t('pc_title')}</h2>
      <div className="panchang__viewport" tabIndex={0}>
        <div className="panchang__track">
          <ul className="panchang__list">{renderItems('a')}</ul>
          {/* Second copy makes the loop seamless; screen readers read the first only. */}
          <ul className="panchang__list" aria-hidden="true">{renderItems('b')}</ul>
        </div>
      </div>
    </section>
  );
}
