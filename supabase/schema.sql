-- Run once in the Supabase SQL Editor for this project.
-- Both tables are only ever read/written by the service_role key used
-- inside api/*.js — RLS is enabled with NO policies, so anon/authenticated
-- roles are denied by default. This is deliberately more restrictive than
-- writing explicit `using (false)` policies.

create table public.contact_requests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  service     text,
  field       text,
  message     text,
  user_agent  text,
  ip_hash     text
);
alter table public.contact_requests enable row level security;

create table public.newsletter_signups (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text not null unique,
  source      text,
  user_agent  text,
  ip_hash     text
);
alter table public.newsletter_signups enable row level security;

create index contact_requests_ip_hash_created_at_idx
  on public.contact_requests (ip_hash, created_at);
create index newsletter_signups_ip_hash_created_at_idx
  on public.newsletter_signups (ip_hash, created_at);

-- The "reports" Storage bucket (created in the dashboard, private/non-public)
-- has NO storage.objects policies for anon/authenticated select — access is
-- only ever granted via short-lived signed URLs minted server-side by
-- api/report-access.js, never via a public policy.
