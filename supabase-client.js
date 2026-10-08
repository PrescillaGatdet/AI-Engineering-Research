/* ============================================================
   Shared Supabase client for the browser (login, account, report).
   Loaded as an ES module. One place for the project URL and key.

   👉 To go live, paste your Supabase project URL and anon (public)
      key below. Find both in Supabase: Project Settings → API.
      The anon key is safe to expose client-side — it's a public
      identifier; Row Level Security controls what it can do.
   ============================================================ */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL = 'https://mygvgcrpywzaffybsrdp.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Z3ZnY3JweXd6YWZmeWJzcmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNDIyMTEsImV4cCI6MjA5OTkxODIxMX0.yn5T8J4C1mrqJY2elCXjhq5ZrgnbrxIicK7KgL2Pe6k';

export const isConfigured =
  !SUPABASE_URL.includes('YOUR-PROJECT') && !SUPABASE_ANON_KEY.includes('YOUR-ANON-KEY');

export const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Turns Supabase / network errors into messages a visitor can act on.
export function friendlyAuthError(error) {
  const msg = (error && (error.message || String(error))) || '';
  const name = (error && error.name) || '';
  if (name === 'AuthRetryableFetchError' || /fetch|network|load failed/i.test(msg)) {
    return "We couldn't reach the login service. Please check your connection and try again in a moment.";
  }
  if (/invalid login credentials/i.test(msg)) return 'That email and password don’t match an account.';
  if (/email not confirmed/i.test(msg)) return 'Please confirm your email first. Check your inbox for the link we sent.';
  if (/already registered|already exists/i.test(msg)) return 'An account with this email already exists. Try logging in instead.';
  if (/password/i.test(msg) && /characters|short|weak/i.test(msg)) return 'Please choose a longer password (at least 8 characters).';
  if (/rate limit|too many/i.test(msg)) return 'Too many attempts. Please wait a minute and try again.';
  return msg || 'Something went wrong. Please try again.';
}

// Only allow redirects to pages on this site (e.g. "account.html", "ai-workforce-report.html#full").
export function safeNext(defaultPage = 'account.html') {
  const next = new URLSearchParams(window.location.search).get('next') || '';
  return /^[a-z0-9-]+\.html(#[a-z0-9-]*)?$/i.test(next) ? next : defaultPage;
}
