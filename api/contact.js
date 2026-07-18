import { supabaseAdmin } from './_supabaseAdmin.js';
import { isValidEmail, withinLength, clientIpHash, isRateLimited, sendJson } from './_util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const body = req.body || {};
  const { name, email, service, field, msg, company } = body;

  // Honeypot: real visitors never fill this hidden field. Pretend success.
  if (company) {
    return sendJson(res, 200, { ok: true });
  }

  if (!withinLength(name, 120) || !name?.trim()) {
    return sendJson(res, 400, { ok: false, error: 'Name is required' });
  }
  if (!isValidEmail(email)) {
    return sendJson(res, 400, { ok: false, error: 'A valid email is required' });
  }
  if (!withinLength(msg, 4000)) {
    return sendJson(res, 400, { ok: false, error: 'Message is too long' });
  }
  if (service !== undefined && !withinLength(service, 200)) {
    return sendJson(res, 400, { ok: false, error: 'Invalid service value' });
  }
  if (field !== undefined && !withinLength(field, 200)) {
    return sendJson(res, 400, { ok: false, error: 'Invalid field value' });
  }

  const supabase = supabaseAdmin();
  const ipHash = clientIpHash(req);

  if (await isRateLimited(supabase, 'contact_requests', ipHash)) {
    return sendJson(res, 429, { ok: false, error: 'Too many requests, please try again later' });
  }

  const { error } = await supabase.from('contact_requests').insert({
    name: name.trim(),
    email: email.trim(),
    service: service?.trim() || null,
    field: field?.trim() || null,
    message: msg?.trim() || null,
    user_agent: req.headers['user-agent'] || null,
    ip_hash: ipHash,
  });

  if (error) {
    return sendJson(res, 500, { ok: false, error: 'Could not save your request' });
  }

  return sendJson(res, 200, { ok: true });
}
