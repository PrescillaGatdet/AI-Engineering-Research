// Shared helpers for the public write endpoints (api/contact.js, api/subscribe.js).
import crypto from 'node:crypto';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return typeof email === 'string' && email.length <= 200 && EMAIL_RE.test(email);
}

export function withinLength(str, max) {
  return typeof str === 'string' && str.length <= max;
}

export function clientIpHash(req) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex');
}

// Rejects with 429 if this ip_hash has more than `limit` rows in `table`
// within the last `windowHours`. Coarse, IP-based, no extra dependency.
export async function isRateLimited(supabase, table, ipHash, limit = 5, windowHours = 1) {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since);
  if (error) return false; // fail open on a counting error rather than blocking legitimate traffic
  return (count ?? 0) >= limit;
}

export function sendJson(res, status, body) {
  res.status(status).json(body);
}
