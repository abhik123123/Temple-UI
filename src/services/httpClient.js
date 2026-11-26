import axios from 'axios';
import config from '../config/environment';
import { getToken } from './tokenStorage';

/** Fired on `window` when the backend rejects our token; AuthContext listens for it. */
export const AUTH_EXPIRED_EVENT = 'temple:auth-expired';

/**
 * Error type every API call rejects with, so components never have to dig
 * through `err.response?.data?.message` themselves.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {}, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.cause = cause;
  }
}

const toApiError = (error) => {
  if (axios.isCancel(error)) {
    return new ApiError('Request cancelled', { status: 0, cause: error });
  }
  if (!error.response) {
    const timedOut = error.code === 'ECONNABORTED';
    return new ApiError(
      timedOut
        ? 'The temple server is taking longer than usual to respond. Please try again in a minute.'
        : 'Unable to reach the server. Please check your connection and try again.',
      { status: 0, cause: error }
    );
  }

  const { status, data } = error.response;
  // Backend returns RFC 7807 problem details: { title, detail, errors }
  const message =
    (data && (data.detail || data.message || data.title)) ||
    (status >= 500 ? 'Something went wrong on our side. Please try again later.' : `Request failed (${status})`);
  return new ApiError(message, { status, fieldErrors: data?.errors || {}, cause: error });
};

const httpClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.requestTimeoutMs,
  headers: { Accept: 'application/json' },
});

httpClient.interceptors.request.use((request) => {
  const token = getToken();
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  // Let the browser set the multipart boundary itself.
  if (typeof FormData !== 'undefined' && request.data instanceof FormData) {
    delete request.headers['Content-Type'];
  }
  if (config.debug) {
    // eslint-disable-next-line no-console
    console.debug(`[api] ${request.method?.toUpperCase()} ${request.url}`);
  }
  return request;
});

const RETRYABLE_STATUS = new Set([502, 503, 504]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GETs only (safe to repeat): retry while the backend is starting up, i.e. no
 * response at all, a timeout, or a gateway error from the host's proxy.
 * Writes are never retried, so a registration can't be submitted twice.
 */
export const shouldRetry = (error, attempt, maxRetries = config.readRetries) => {
  const method = (error.config?.method || 'get').toLowerCase();
  if (method !== 'get' || axios.isCancel(error) || attempt >= maxRetries) return false;
  return !error.response || RETRYABLE_STATUS.has(error.response.status);
};

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const attempt = error.config?.__retryCount || 0;
    if (error.config && shouldRetry(error, attempt)) {
      error.config.__retryCount = attempt + 1;
      await sleep(Math.min(2000 * 2 ** attempt, 10000));
      return httpClient.request(error.config);
    }
    const hadToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && hadToken) {
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(toApiError(error));
  }
);

/**
 * Turns a server-relative asset path (e.g. "/api/files/events/abc.jpg") into
 * a URL the browser can load, regardless of whether the API is same-origin.
 */
export const resolveAssetUrl = (path) => {
  if (!path || typeof path !== 'string') return null;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  if (/^https?:/i.test(config.apiBaseUrl)) {
    const { origin } = new URL(config.apiBaseUrl);
    return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  return path.startsWith('/') ? path : `/${path}`;
};

export default httpClient;
