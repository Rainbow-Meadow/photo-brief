create table if not exists public.marketing_live_submissions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  source text not null default 'photobrief-marketing-hero',
  workflow_mode text not null default 'capture',
  selected_count integer not null default 0,
  required_count integer not null default 4,
  readiness text not null default 'incomplete',
  issue text,
  summary text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_live_submissions_session_idx on public.marketing_live_submissions (session_id);
create index if not exists marketing_live_submissions_readiness_idx on public.marketing_live_submissions (readiness);

alter table public.marketing_live_submissions enable row level security;

drop policy if exists "Service role manages marketing live submissions" on public.marketing_live_submissions;
create policy "Service role manages marketing live submissions"
  on public.marketing_live_submissions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
