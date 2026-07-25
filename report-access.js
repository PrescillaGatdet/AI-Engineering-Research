/* ============================================================
   Gated "download the full report" flow for ai-workforce-report.html.
   Loaded as a module (needs `import`), unlike the site's other plain
   deferred scripts.
   Shows a login CTA when logged out; a download button when logged in,
   which requests a short-lived signed URL from /api/report-access
   (the server independently re-validates the session token — this
   script never assumes a logged-in-looking UI state is authoritative).
   ============================================================ */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Must match the values in login.html.
const SUPABASE_URL = 'https://mygvgcrpywzaffybsrdp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Z3ZnY3JweXd6YWZmeWJzcmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNDIyMTEsImV4cCI6MjA5OTkxODIxMX0.yn5T8J4C1mrqJY2elCXjhq5ZrgnbrxIicK7KgL2Pe6k';

const isPlaceholder = SUPABASE_URL.includes('YOUR-PROJECT') || SUPABASE_ANON_KEY.includes('YOUR-ANON-KEY');

function renderPlaceholder(mount) {
  mount.innerHTML =
    '<div class="calendly-slot">Report access isn’t configured yet — set up Supabase and paste your project URL/anon key into <code>login.html</code> and <code>report-access.js</code>.</div>';
}

function renderLoggedOut(mount) {
  const next = encodeURIComponent('ai-workforce-report.html');
  mount.innerHTML =
    '<div class="calendly-slot">' +
      '<p style="margin-bottom:12px">🔒 The full report is available to logged-in readers.</p>' +
      '<a class="btn btn-primary" href="login.html?next=' + next + '">Log in to read the full report</a>' +
    '</div>';
}

function renderLoggedIn(mount, supabase, accessToken) {
  mount.innerHTML =
    '<div class="calendly-slot">' +
      '<p style="margin-bottom:12px">✅ You’re logged in.</p>' +
      '<button class="btn btn-primary" id="downloadReportBtn">Download the full report</button> ' +
      '<button class="btn btn-ghost" id="logoutReportBtn" type="button">Log out</button>' +
      '<p class="err-msg" id="reportErr" style="display:none;margin-top:12px"></p>' +
    '</div>';

  mount.querySelector('#downloadReportBtn').addEventListener('click', async () => {
    const btn = mount.querySelector('#downloadReportBtn');
    const err = mount.querySelector('#reportErr');
    btn.disabled = true;
    err.style.display = 'none';
    try {
      const res = await fetch('/api/report-access', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + accessToken },
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not get the report');
      window.open(data.url, '_blank', 'noopener');
    } catch (e) {
      err.textContent = '⚠️ ' + e.message;
      err.style.display = 'block';
    }
    btn.disabled = false;
  });

  mount.querySelector('#logoutReportBtn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.reload();
  });
}

async function init() {
  const mount = document.getElementById('report-gate');
  if (!mount) return;

  if (isPlaceholder) {
    renderPlaceholder(mount);
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    renderLoggedIn(mount, supabase, data.session.access_token);
  } else {
    renderLoggedOut(mount);
  }
}

init();
