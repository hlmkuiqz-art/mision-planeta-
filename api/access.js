const crypto = require('crypto');

const COOKIE_NAME = 'orbit_run_access';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function issueAccess(secret) {
  const payload = Buffer.from(JSON.stringify({ product: 'orbit-run', exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS })).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

function hasAccess(cookieHeader, secret) {
  const token = (cookieHeader || '').split(';').map((value) => value.trim()).find((value) => value.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!token || !secret) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Math.floor(Date.now() / 1000); } catch { return false; }
}

module.exports = { COOKIE_NAME, MAX_AGE_SECONDS, issueAccess, hasAccess };
