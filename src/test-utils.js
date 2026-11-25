/** Builds an unsigned JWT-shaped token for tests (the UI never verifies signatures). */
export const makeToken = (claims) => {
  const enc = (obj) =>
    btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc(claims)}.signature`;
};

export const inSeconds = (s) => Math.floor(Date.now() / 1000) + s;
