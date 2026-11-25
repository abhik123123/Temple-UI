/**
 * Runtime configuration.
 *
 * Every value comes from a REACT_APP_* build-time variable so that no
 * environment-specific URLs or credentials are baked into source code.
 * See `.env.example` for the full list.
 */

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const config = Object.freeze({
  /** Logical environment name shown nowhere in the UI; used for diagnostics only. */
  env: process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development',

  /**
   * Base URL of the backend REST API, including the `/api` prefix.
   * Defaults to a same-origin `/api`, which works both with the CRA dev proxy
   * (see "proxy" in package.json) and behind the production nginx reverse proxy.
   */
  apiBaseUrl: trimTrailingSlash(process.env.REACT_APP_API_URL || '/api'),

  /** Request timeout in milliseconds. */
  requestTimeoutMs: Number(process.env.REACT_APP_API_TIMEOUT_MS) || 15000,

  isProduction: process.env.NODE_ENV === 'production',

  /** Verbose request logging; never enabled in production builds. */
  debug: process.env.NODE_ENV !== 'production' && process.env.REACT_APP_DEBUG === 'true',
});

export default config;
