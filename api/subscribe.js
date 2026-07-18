import { supabaseAdmin } from './_supabaseAdmin.js';
import { isValidEmail, withinLength, clientIpHash, isRateLimited, sendJson } from './_util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const body = req.body || {};
  const { email, source, company } = body;

  // Honeypot: real visitors never fill this hidden field. Pretend success.
  if (company) {
    return sendJson(res, 200, { ok: true });
  }

  if (!isValidEmail(email)) {
    return sendJson(res, 400, { ok: false, error: 'A valid email is required' });
  }
  if (source !== undefined && !withinLength(source, 100)) {
    return sendJson(res, 400, { ok: false, error: 'Invalid source value' });
  }

  const supabase = supabaseAdmin();
  const ipHash = clientIpHash(req);

  if (await isRateLimited(supabase, 'newsletter_signups', ipHash)) {
    return sendJson(res, 429, { ok: false, error: 'Too many requests, please try again later' });
  }

  const { error } = await supabase.from('newsletter_signups').upsert(
    {
      email: email.trim().toLowerCase(),
      source: source?.trim() || null,
      user_agent: req.headers['user-agent'] || null,
      ip_hash: ipHash,
    },
    { onConflict: 'email', ignoreDuplicates: true }
  );

  if (error) {
    return sendJson(res, 500, { ok: false, error: 'Could not save your subscription' });
  }

  return sendJson(res, 200, { ok: true });
}
