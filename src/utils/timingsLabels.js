/** Translation key for a weekday name stored in English ("Monday" -> "day_Monday"). */
export const dayKey = (day) => {
  const d = String(day || '').trim().toLowerCase();
  return d ? `day_${d.charAt(0).toUpperCase()}${d.slice(1)}` : '';
};

/**
 * Notes are typed by the admin in English. The common ones are translated;
 * anything else is shown exactly as typed.
 */
export const translateNote = (note, t) => {
  const key = `note_${String(note || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
  const translated = t(key);
  return translated === key ? note : translated;
};
