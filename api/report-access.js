import { supabaseAdmin } from './_supabaseAdmin.js';
import { sendJson } from './_util.js';

const REPORT_BUCKET = 'reports';
const REPORT_PATH = 'ai-workforce-report.pdf';
const SIGNED_URL_TTL_SECONDS = 60;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return sendJson(res, 401, { ok: false, error: 'Not authenticated' });
  }

  const supabase = supabaseAdmin();

  // Never trust a client-reported "I'm logged in" state — re-validate the
  // token server-side on every request before minting a signed URL.
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return sendJson(res, 401, { ok: false, error: 'Not authenticated' });
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(REPORT_BUCKET)
    .createSignedUrl(REPORT_PATH, SIGNED_URL_TTL_SECONDS);

  if (signError || !signed?.signedUrl) {
    return sendJson(res, 500, { ok: false, error: 'Could not generate a download link' });
  }

  return sendJson(res, 200, { ok: true, url: signed.signedUrl });
}
