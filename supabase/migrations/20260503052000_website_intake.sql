-- Website Intake: turn website/contact-form leads into PhotoBrief requests.
--
-- Beta shape: one public intake token per source, simple field mapping, simple
-- template rules, event log for debugging/replay.

create table if not exists public.intake_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.business_workspaces(id) on delete cascade,
  name text not null default 'Website intake',
  public_token text not null unique default encode(gen_random_bytes(18), 'hex'),
  enabled boolean not null default true,
  default_guide_id uuid references public.photo_guides(id) on delete set null,
  intro_message text,
  auto_send boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.intake_field_mappings (
  id uuid primary key default gen_random_uuid(),
  intake_source_id uuid not null references public.intake_sources(id) on delete cascade,
  photobrief_field text not null check (photobrief_field in ('name', 'email', 'phone', 'request_type', 'message', 'address')),
  external_field text not null,
  created_at timestamptz not null default now(),
  unique (intake_source_id, photobrief_field)
);

create table if not exists public.intake_template_rules (
  id uuid primary key default gen_random_uuid(),
  intake_source_id uuid not null references public.intake_sources(id) on delete cascade,
  match_type text not null default 'contains' check (match_type in ('exact', 'contains')),
  match_value text not null,
  guide_id uuid not null references public.photo_guides(id) on delete cascade,
  priority integer not null default 100,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.intake_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.business_workspaces(id) on delete cascade,
  intake_source_id uuid references public.intake_sources(id) on delete set null,
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_customer jsonb not null default '{}'::jsonb,
  request_type text,
  message text,
  matched_rule_id uuid references public.intake_template_rules(id) on delete set null,
  matched_guide_id uuid references public.photo_guides(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  created_request_id uuid references public.photo_brief_requests(id) on delete set null,
  status text not null default 'received' check (status in ('received', 'request_created', 'no_template_match', 'error')),
  error text,
  created_at timestamptz not null default now()
);

create index if not exists idx_intake_sources_workspace on public.intake_sources(workspace_id);
create index if not exists idx_intake_sources_token on public.intake_sources(public_token);
create index if not exists idx_intake_rules_source on public.intake_template_rules(intake_source_id, enabled, priority);
create index if not exists idx_intake_events_workspace_created on public.intake_events(workspace_id, created_at desc);

alter table public.intake_sources enable row level security;
alter table public.intake_field_mappings enable row level security;
alter table public.intake_template_rules enable row level security;
alter table public.intake_events enable row level security;

drop policy if exists "Workspace members can read intake sources" on public.intake_sources;
create policy "Workspace members can read intake sources"
  on public.intake_sources for select
  using (exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = intake_sources.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  ));

drop policy if exists "Workspace members can manage intake sources" on public.intake_sources;
create policy "Workspace members can manage intake sources"
  on public.intake_sources for all
  using (exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = intake_sources.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  ))
  with check (exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = intake_sources.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  ));

drop policy if exists "Workspace members can read intake field mappings" on public.intake_field_mappings;
create policy "Workspace members can read intake field mappings"
  on public.intake_field_mappings for select
  using (exists (
    select 1 from public.intake_sources s
    join public.workspace_members wm on wm.workspace_id = s.workspace_id
    where s.id = intake_field_mappings.intake_source_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  ));

drop policy if exists "Workspace members can manage intake field mappings" on public.intake_field_mappings;
create policy "Workspace members can manage intake field mappings"
  on public.intake_field_mappings for all
  using (exists (
    select 1 from public.intake_sources s
    join public.workspace_members wm on wm.workspace_id = s.workspace_id
    where s.id = intake_field_mappings.intake_source_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  ))
  with check (exists (
    select 1 from public.intake_sources s
    join public.workspace_members wm on wm.workspace_id = s.workspace_id
    where s.id = intake_field_mappings.intake_source_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  ));

drop policy if exists "Workspace members can read intake template rules" on public.intake_template_rules;
create policy "Workspace members can read intake template rules"
  on public.intake_template_rules for select
  using (exists (
    select 1 from public.intake_sources s
    join public.workspace_members wm on wm.workspace_id = s.workspace_id
    where s.id = intake_template_rules.intake_source_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  ));

drop policy if exists "Workspace members can manage intake template rules" on public.intake_template_rules;
create policy "Workspace members can manage intake template rules"
  on public.intake_template_rules for all
  using (exists (
    select 1 from public.intake_sources s
    join public.workspace_members wm on wm.workspace_id = s.workspace_id
    where s.id = intake_template_rules.intake_source_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  ))
  with check (exists (
    select 1 from public.intake_sources s
    join public.workspace_members wm on wm.workspace_id = s.workspace_id
    where s.id = intake_template_rules.intake_source_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  ));

drop policy if exists "Workspace members can read intake events" on public.intake_events;
create policy "Workspace members can read intake events"
  on public.intake_events for select
  using (exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = intake_events.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  ));

-- Events are written by service-role Edge Functions. Members can only read them.
