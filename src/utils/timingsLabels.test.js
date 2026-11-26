import { dayKey, translateNote } from './timingsLabels';
import { translations } from '../i18n/translations';

const tFor = (lang) => (key) => translations[lang][key] || translations.en[key] || key;

test('weekday names translate to Telugu and Hindi', () => {
  expect(tFor('te')(dayKey('Thursday'))).toBe('గురువారం');
  expect(tFor('te')(dayKey('monday'))).toBe('సోమవారం');
  expect(tFor('hi')(dayKey('SUNDAY'))).toBe('रविवार');
});

test('known notes translate, custom notes stay as typed', () => {
  expect(translateNote('Morning darshan', tFor('te'))).toBe('ఉదయం దర్శనం');
  expect(translateNote('Evening Darshan', tFor('hi'))).toBe('सायं दर्शन');
  expect(translateNote('Annadanam after aarti', tFor('te'))).toBe('Annadanam after aarti');
});
