/* ============================================================
   Account page: shows the logged-in member's details, lets them
   download the gated report, update their name, and log out.
   Logged-out visitors are sent to login.html and brought back here.
   ============================================================ */
import { supabase, isConfigured, friendlyAuthError } from './supabase-client.js';

const $ = id => document.getElementById(id);

function showPageError(text) {
  $('acctLead').textContent = '';
  $('acctErr').textContent = '⚠️ ' + text;
  $('acctErr').style.display = 'block';
}

function render(user) {
  const name = (user.user_metadata && user.user_metadata.full_name) || '';
  const first = name.split(' ')[0];
  $('acctGreeting').textContent = first ? `Welcome, ${first}.` : 'Welcome.';
  $('acctLead').textContent = 'Your research access and account details.';
  $('acctEmail').textContent = user.email;
  $('acctSince').textContent = new Date(user.created_at).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  $('acctName').value = name;
  $('acctBody').hidden = false;
}

async function downloadReport() {
  const btn = $('downloadBtn');
  const err = $('downloadErr');
  btn.disabled = true;
  err.style.display = 'none';
  try {
    // Re-read the session so we always send a fresh token.
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Error('Your session has expired. Please log in again.');
    const res = await fetch('/api/report-access', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + data.session.access_token },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.url) throw new Error(body.error || 'The report is not available right now.');
    window.open(body.url, '_blank', 'noopener');
  } catch (e) {
    err.textContent = '⚠️ ' + friendlyAuthError(e);
    err.style.display = 'block';
  }
  btn.disabled = false;
}

async function saveName(e) {
  e.preventDefault();
  const btn = $('nameSave');
  const ok = $('nameOk');
  ok.style.display = 'none';
  btn.disabled = true;
  try {
    const full_name = $('acctName').value.trim().slice(0, 120);
    const { data, error } = await supabase.auth.updateUser({ data: { full_name } });
    if (error) throw error;
    render(data.user);
    ok.style.display = 'block';
  } catch (err) {
    showPageError(friendlyAuthError(err));
  }
  btn.disabled = false;
}

async function init() {
  if (!isConfigured) {
    showPageError("Accounts aren't configured yet. Add your Supabase URL and anon key to supabase-client.js.");
    return;
  }

  let user;
  try {
    // getUser() checks the session with Supabase, not just local storage.
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      window.location.replace('login.html?next=account.html');
      return;
    }
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    user = data.user;
  } catch (err) {
    showPageError(friendlyAuthError(err));
    return;
  }

  render(user);
  $('downloadBtn').addEventListener('click', downloadReport);
  $('nameForm').addEventListener('submit', saveName);
  $('logoutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.replace('index.html');
  });
}

init();
