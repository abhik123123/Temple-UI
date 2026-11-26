/**
 * Typed-ish wrappers for every backend endpoint the UI uses.
 *
 * Every function resolves with the response body (not the axios response)
 * and rejects with an `ApiError` (see httpClient.js).
 */
import httpClient from './httpClient';

const body = (promise) => promise.then((res) => res.data);

const crud = (resource) => ({
  getAll: (params) => body(httpClient.get(`/${resource}`, { params })),
  getById: (id) => body(httpClient.get(`/${resource}/${encodeURIComponent(id)}`)),
  create: (data) => body(httpClient.post(`/${resource}`, data)),
  update: (id, data) => body(httpClient.put(`/${resource}/${encodeURIComponent(id)}`, data)),
  delete: (id) => body(httpClient.delete(`/${resource}/${encodeURIComponent(id)}`)),
});

/**
 * Builds the multipart body the events endpoint expects:
 *   part "event" -> application/json, part "photo" -> image file (optional)
 */
const toEventPayload = (event, photo) => {
  if (!photo) return event;
  const form = new FormData();
  form.append('event', new Blob([JSON.stringify(event)], { type: 'application/json' }));
  form.append('photo', photo, photo.name);
  return form;
};

export const eventsAPI = {
  ...crud('events'),
  create: (event, photo) => body(httpClient.post('/events', toEventPayload(event, photo))),
  update: (id, event, photo) =>
    body(httpClient.put(`/events/${encodeURIComponent(id)}`, toEventPayload(event, photo))),
};

export const eventRegistrationAPI = {
  register: (registration) => body(httpClient.post('/events/register', registration)),
  getRegistrations: (eventId) =>
    body(httpClient.get(`/events/${encodeURIComponent(eventId)}/registrations`)),
  getStatistics: (eventId) =>
    body(httpClient.get(`/events/${encodeURIComponent(eventId)}/registration-stats`)),
  cancel: (registrationId) =>
    body(httpClient.delete(`/events/registrations/${encodeURIComponent(registrationId)}`)),
};

export const servicesAPI = crud('services');

/** JSON, or multipart with a JSON part named `partName` plus an optional "photo". */
const withPhoto = (partName, data, photo) => {
  if (!photo) return data;
  const form = new FormData();
  form.append(partName, new Blob([JSON.stringify(data)], { type: 'application/json' }));
  form.append('photo', photo, photo.name);
  return form;
};

const peopleAPI = (resource, partName) => ({
  ...crud(resource),
  create: (person, photo) => body(httpClient.post(`/${resource}`, withPhoto(partName, person, photo))),
  update: (id, person, photo) =>
    body(httpClient.put(`/${resource}/${encodeURIComponent(id)}`, withPhoto(partName, person, photo))),
});

export const staffAPI = peopleAPI('staff', 'staff');
export const boardMembersAPI = peopleAPI('board-members', 'boardMember');

export const donorsAPI = {
  ...crud('donors'),
  getStatistics: () => body(httpClient.get('/donors/statistics')),
  /** Admin only: full records including contact details. */
  getAllWithContacts: () => body(httpClient.get('/donors/admin/all')),
};

/** Opening sessions: { id, dayOfWeek: "Monday", openingTime, closingTime, specialNotes }. A day may have several. */
export const timingsAPI = crud('timings');

export const subscriptionAPI = {
  subscribe: (email) => body(httpClient.post('/subscriptions/subscribe', { email })),
  unsubscribe: (email) => body(httpClient.post('/subscriptions/unsubscribe', { email })),
  getAllSubscribers: (page = 0, size = 10) =>
    body(httpClient.get('/subscriptions/admin/all', { params: { page, size } })),
  getStatistics: () => body(httpClient.get('/subscriptions/admin/stats')),
  sendTestEmail: (email) => body(httpClient.post('/subscriptions/admin/send-test', { email })),
};

export const authAPI = {
  login: (credentials) => body(httpClient.post('/auth/login', credentials)),
  me: () => body(httpClient.get('/auth/me')),
};
