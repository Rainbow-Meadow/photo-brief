-- Smart Intake storage foundation.
-- Additive schema for brief-first intake. Existing PhotoBrief request,
-- submission, capture, and /r/:token tables remain unchanged.

alter table if exists public.intake_routing_rules
  add column if not exists photo_policy text not null default 'recommended',
  add column if not exists photo_policy_reason text,
  add column if not exists readiness_goal text not null default 'needs_review',
  add column if not exists questions jsonb not null default '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'intake_routing_rules_photo_policy_check') THEN
    ALTER TABLE public.intake_routing_rules
      ADD CONSTRAINT intake_routing_rules_photo_policy_check
      CHECK (photo_policy IN ('not_needed', 'optional', 'recommended', 'required'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'intake_routing_rules_readiness_goal_check') THEN
    ALTER TABLE public.intake_routing_rules
      ADD CONSTRAINT intake_routing_rules_readiness_goal_check
      CHECK (readiness_goal IN (
        'ready_to_quote', 'ready_to_dispatch', 'ready_for_callback',
        'needs_review', 'needs_more_info', 'needs_photos',
        'out_of_service_area', 'low_intent', 'spam'
      ));
  END IF;
END $$;

create table if not exists public.intake_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.business_workspaces(id) on delete cascade,
  intake_source_id uuid references public.intake_sources(id) on delete set null,
  blueprint_id uuid references public.intake_blueprints(id) on delete set null,
  routing_rule_id uuid references public.intake_routing_rules(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  linked_photo_brief_request_id uuid references public.photo_brief_requests(id) on delete set null,
  public_session_token text not null unique default encode(gen_random_bytes(18), 'hex'),
  source text not null default 'website',
  selected_route_label text,
  selected_service text,
  customer_contact jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb,
  photo_policy text not null default 'recommended',
  readiness_status text not null default 'needs_review',
  status text not null default 'started',
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint intake_sessions_photo_policy_check check (photo_policy in ('not_needed', 'optional', 'recommended', 'required')),
  constraint intake_sessions_readiness_status_check check (readiness_status in (
    'ready_to_quote', 'ready_to_dispatch', 'ready_for_callback',
    'needs_review', 'needs_more_info', 'needs_photos',
    'out_of_service_area', 'low_intent', 'spam'
  )),
  constraint intake_sessions_status_check check (status in ('started', 'in_progress', 'submitted', 'abandoned', 'expired', 'error'))
);

create table if not exists public.intake_briefs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.business_workspaces(id) on delete cascade,
  intake_session_id uuid not null unique references public.intake_sessions(id) on delete cascade,
  intake_source_id uuid references public.intake_sources(id) on delete set null,
  blueprint_id uuid references public.intake_blueprints(id) on delete set null,
  routing_rule_id uuid references public.intake_routing_rules(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  linked_photo_brief_request_id uuid references public.photo_brief_requests(id) on delete set null,
  title text not null default 'New intake brief',
  summary text,
  route_label text,
  service_label text,
  customer_contact jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  brief jsonb not null default '{}'::jsonb,
  photo_policy text not null default 'recommended',
  photos_provided boolean not null default false,
  photo_count integer not null default 0,
  readiness_status text not null default 'needs_review',
  readiness_score integer,
  next_action text,
  missing_items text[] not null default '{}'::text[],
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint intake_briefs_photo_policy_check check (photo_policy in ('not_needed', 'optional', 'recommended', 'required')),
  constraint intake_briefs_readiness_status_check check (readiness_status in (
    'ready_to_quote', 'ready_to_dispatch', 'ready_for_callback',
    'needs_review', 'needs_more_info', 'needs_photos',
    'out_of_service_area', 'low_intent', 'spam'
  )),
  constraint intake_briefs_status_check check (status in ('new', 'reviewing', 'ready_to_quote', 'ready_to_dispatch', 'needs_more_info', 'closed', 'archived')),
  constraint intake_briefs_photo_count_check check (photo_count >= 0),
  constraint intake_briefs_readiness_score_check check (readiness_score is null or readiness_score between 0 and 100)
);

create index if not exists idx_intake_sessions_workspace_created on public.intake_sessions(workspace_id, created_at desc);
create index if not exists idx_intake_sessions_source_created on public.intake_sessions(intake_source_id, created_at desc) where intake_source_id is not null;
create index if not exists idx_intake_sessions_blueprint_created on public.intake_sessions(blueprint_id, created_at desc) where blueprint_id is not null;
create index if not exists idx_intake_sessions_customer on public.intake_sessions(customer_id) where customer_id is not null;
create index if not exists idx_intake_sessions_linked_request on public.intake_sessions(linked_photo_brief_request_id) where linked_photo_brief_request_id is not null;
create index if not exists idx_intake_sessions_status on public.intake_sessions(status, created_at desc);

create index if not exists idx_intake_briefs_workspace_created on public.intake_briefs(workspace_id, created_at desc);
create index if not exists idx_intake_briefs_workspace_status on public.intake_briefs(workspace_id, status, created_at desc);
create index if not exists idx_intake_briefs_readiness on public.intake_briefs(workspace_id, readiness_status, created_at desc);
create index if not exists idx_intake_briefs_source_created on public.intake_briefs(intake_source_id, created_at desc) where intake_source_id is not null;
create index if not exists idx_intake_briefs_customer on public.intake_briefs(customer_id) where customer_id is not null;
create index if not exists idx_intake_briefs_linked_request on public.intake_briefs(linked_photo_brief_request_id) where linked_photo_brief_request_id is not null;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_intake_sessions_updated_at ON public.intake_sessions;
    CREATE TRIGGER update_intake_sessions_updated_at
      BEFORE UPDATE ON public.intake_sessions
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    DROP TRIGGER IF EXISTS update_intake_briefs_updated_at ON public.intake_briefs;
    CREATE TRIGGER update_intake_briefs_updated_at
      BEFORE UPDATE ON public.intake_briefs
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

alter table public.intake_sessions enable row level security;
alter table public.intake_briefs enable row level security;

drop policy if exists "Workspace members can read intake sessions" on public.intake_sessions;
create policy "Workspace members can read intake sessions"
  on public.intake_sessions for select to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Platform admins can manage intake sessions" on public.intake_sessions;
create policy "Platform admins can manage intake sessions"
  on public.intake_sessions for all to authenticated
  using (exists (select 1 from public.platform_admins pa where pa.user_id = auth.uid()))
  with check (exists (select 1 from public.platform_admins pa where pa.user_id = auth.uid()));

drop policy if exists "Workspace members can read intake briefs" on public.intake_briefs;
create policy "Workspace members can read intake briefs"
  on public.intake_briefs for select to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Workspace members can update intake briefs" on public.intake_briefs;
create policy "Workspace members can update intake briefs"
  on public.intake_briefs for update to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop policy if exists "Platform admins can manage intake briefs" on public.intake_briefs;
create policy "Platform admins can manage intake briefs"
  on public.intake_briefs for all to authenticated
  using (exists (select 1 from public.platform_admins pa where pa.user_id = auth.uid()))
  with check (exists (select 1 from public.platform_admins pa where pa.user_id = auth.uid()));

comment on table public.intake_sessions is 'Raw Smart Intake sessions submitted through /i/:token. Public writes are expected to go through Edge Functions/service role.';
comment on table public.intake_briefs is 'Business-facing Smart Intake output created from intake_sessions.';
comment on column public.intake_routing_rules.photo_policy is 'Controls whether a Smart Intake route asks for photos: not_needed, optional, recommended, or required.';
comment on column public.intake_briefs.linked_photo_brief_request_id is 'Optional handoff to the existing /r/:token guided photo request flow.';
