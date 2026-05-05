create table if not exists public.marketing_live_leads (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  email text not null,
  name text,
  company text,
  phone text,
  readiness text not null default 'incomplete',
  selected_count integer not null default 0,
  required_count integer not null default 4,
  issue text,
  summary text,
  payload jsonb not null default '{}'::jsonb,
  consented_at timestamptz,
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_live_leads_email_check check (position('@' in email) > 1)
);

create unique index if not exists marketing_live_leads_session_email_idx
  on public.marketing_live_leads (session_id, lower(email));

create index if not exists marketing_live_leads_readiness_idx
  on public.marketing_live_leads (readiness);

alter table public.marketing_live_leads enable row level security;

drop policy if exists "Service role manages marketing live leads" on public.marketing_live_leads;
create policy "Service role manages marketing live leads"
  on public.marketing_live_leads
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
