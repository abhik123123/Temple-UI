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
export const staffAPI = crud('staff');
export const boardMembersAPI = crud('board-members');

export const donorsAPI = {
  ...crud('donors'),
  getStatistics: () => body(httpClient.get('/donors/statistics')),
};

export const timingsAPI = {
  getAll: () => body(httpClient.get('/timings')),
  /** `day` is a lower- or upper-case English weekday, e.g. "monday". */
  update: (day, timing) => body(httpClient.put(`/timings/${encodeURIComponent(day)}`, timing)),
};

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
