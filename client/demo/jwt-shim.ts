// Browser stand-in for `jsonwebtoken` in the live demo build. Tokens never leave the
// visitor's browser, so a signed JWT is unnecessary; this keeps the same sign/verify API.
const enc = (o: unknown) => btoa(unescape(encodeURIComponent(JSON.stringify(o))));
const dec = (s: string) => JSON.parse(decodeURIComponent(escape(atob(s))));

export function sign(payload: Record<string, unknown>, _secret?: string, _opts?: unknown) {
  return 'demo.' + enc({ ...payload, exp: Math.floor(Date.now() / 1000) + 7 * 86400 });
}

export function verify(token: string) {
  if (!token.startsWith('demo.')) throw new Error('invalid token');
  const p = dec(token.slice(5));
  if (p.exp * 1000 < Date.now()) throw new Error('token expired');
  return p;
}

export default { sign, verify };
