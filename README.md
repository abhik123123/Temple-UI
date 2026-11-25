# Temple UI

React single-page app for the Raja Rajeshwara Devastanam website: public pages
(events, services, timings, staff, board, donations, newsletter) and an admin
area for temple staff. It talks to the Spring Boot backend in
[temple-backend](https://github.com/abhik123123/temple-backend) over a JSON REST API under `/api`.

## Quick start (development)

```bash
npm ci
npm start            # http://localhost:3000
```

The dev server proxies `/api/*` to `http://localhost:8080` (see `"proxy"` in
`package.json`), so start the backend first. No CORS setup is needed in
development.

Admin login is at `/login`. Credentials come from the backend — there are no
built-in usernames or passwords in the UI.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Dev server with hot reload |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm test` / `npm run test:ci` | Jest + Testing Library (watch / single run) |
| `npm run build` | Production build into `build/` |

## Configuration

All settings are build-time `REACT_APP_*` variables (see `.env.example`).
They end up in the public JavaScript bundle, so **never put secrets in them**.

| Variable | Default | Purpose |
| --- | --- | --- |
| `REACT_APP_API_URL` | `/api` | API base URL. Keep `/api` when the UI and API share a domain (recommended). |
| `REACT_APP_API_TIMEOUT_MS` | `15000` | Request timeout |
| `REACT_APP_DEBUG` | `false` | Log API calls to the console (dev builds only) |

Put local overrides in `.env.local` (git-ignored).

## Production deployment (Docker)

```bash
docker build -t temple-ui .
docker run -p 80:80 -e BACKEND_URL=http://temple-backend:8080 temple-ui
```

The image serves the static build with nginx and reverse-proxies `/api/` to
`BACKEND_URL`, so the browser only ever talks to one origin. nginx also sets
security headers (CSP, `X-Frame-Options`, etc.), long-lived caching for
fingerprinted assets, `no-cache` for `index.html`, SPA fallback routing and a
`/healthz` endpoint. Terminate TLS in front of this container (load balancer,
Caddy, Traefik…) and enable HSTS there.

If you host the API on a different domain instead, set `REACT_APP_API_URL` to
its absolute URL at build time **and** add that origin to `connect-src` and
`img-src` in `nginx/default.conf.template`, plus the backend's
`APP_CORS_ALLOWED_ORIGINS`.

The temple-backend repository contains a `docker-compose.yml` that runs
PostgreSQL, the backend and this UI together.

## Project layout

```
src/
  config/environment.js   build-time config (no hard-coded URLs)
  services/httpClient.js  single axios instance: auth header, timeouts, error normalisation
  services/api.js         every backend endpoint the UI calls
  services/tokenStorage.js JWT storage + expiry checks
  context/AuthContext.jsx login/logout, session restore, auto-logout on expiry/401
  hooks/useAPI.js         data-fetching hook with loading/error/refetch
  utils/format.js         date/time/currency helpers (timezone-safe)
  components/             shared UI (navigation, error boundary, modals…)
  pages/                  route components; *Admin pages require the ADMIN role
```

## Security notes

- The UI only *hides* admin screens; the backend enforces authorization on
  every write endpoint.
- The JWT is kept in `localStorage` and expires server-side (default 8h). The
  UI logs out automatically at expiry or on any 401. Keep the CSP strict —
  it is the main defence for tokens stored this way.
