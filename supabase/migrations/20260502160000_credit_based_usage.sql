-- Credit-based usage model for PhotoBrief.
--
-- Requests are workflow containers. PhotoBrief Credits are the metered resource
-- for AI/photo workload: photo checks, summaries, guide generation, request
-- drafting, follow-ups, and admin reruns.
--
-- This migration is intentionally additive and beta-safe. Existing
-- request_credit_packs remain in place, but their remaining balance now maps to
-- PhotoBrief Credits in the UI/RPCs.

alter table if exists public.usage_events
  add column if not exists credit_cost numeric not null default 0;

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.business_workspaces(id) on delete cascade,
  event_type text not null,
  related_type text null,
  related_id uuid null,
  credits_delta numeric not null,
  source text not null check (source in ('plan_allowance', 'topup', 'usage', 'refund', 'adjustment')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists credit_ledger_workspace_created_idx
  on public.credit_ledger(workspace_id, created_at desc);

create index if not exists credit_ledger_workspace_source_idx
  on public.credit_ledger(workspace_id, source, created_at desc);

create index if not exists credit_ledger_related_idx
  on public.credit_ledger(related_type, related_id)
  where related_id is not null;

alter table public.credit_ledger enable row level security;

drop policy if exists "Workspace members can read credit ledger" on public.credit_ledger;
create policy "Workspace members can read credit ledger"
  on public.credit_ledger
  for select
  using (public.is_workspace_member(workspace_id));

-- Writes are intentionally service-role only. Edge Functions and DB helpers
-- insert usage rows after authorization and before/after paid AI work.

create or replace function public.plan_credit_allowance(_plan public.plan_tier)
returns numeric
language sql
immutable
as $$
  select case _plan
    when 'free'::public.plan_tier then 10
    when 'starter'::public.plan_tier then 100
    when 'pro'::public.plan_tier then 500
    when 'team'::public.plan_tier then 1500
    when 'business'::public.plan_tier then 5000
    else 10
  end;
$$;

create or replace function public.credit_cost_for_event(_event_type text)
returns numeric
language sql
immutable
as $$
  select case _event_type
    when 'ai_photo_check' then 1
    when 'ai_submission_summary' then 1
    when 'ai_request_builder' then 2
    when 'ai_guide_generation' then 3
    when 'ai_followup_generation' then 1
    when 'ai_admin_rerun' then 5
    when 'manual_request_created' then 0
    when 'request_created' then 0
    when 'ai_check_run' then 1
    else 0
  end;
$$;

create or replace function public.current_period_start_for_workspace(_workspace_id uuid)
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select s.current_period_start
      from public.subscriptions s
      where s.workspace_id = _workspace_id
        and s.status in ('trialing', 'active', 'past_due')
      order by s.created_at desc
      limit 1
    ),
    date_trunc('month', now())
  );
$$;

create or replace function public.current_plan_credits(_workspace_id uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select public.plan_credit_allowance(coalesce(w.plan_tier, 'free'::public.plan_tier))
  from public.business_workspaces w
  where w.id = _workspace_id;
$$;

create or replace function public.current_credit_usage(_workspace_id uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(credit_cost), 0)
  from public.usage_events
  where workspace_id = _workspace_id
    and created_at >= public.current_period_start_for_workspace(_workspace_id);
$$;

create or replace function public.current_topup_credits(_workspace_id uuid)
returns table(remaining numeric, expires_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(sum(p.remaining), 0)::numeric as remaining,
    min(p.period_end) as expires_at
  from public.request_credit_packs p
  where p.workspace_id = _workspace_id
    and p.status = 'active'
    and p.remaining > 0
    and (p.period_end is null or p.period_end >= now());
$$;

create or replace function public.current_credit_balance(_workspace_id uuid)
returns table(
  included numeric,
  used numeric,
  topup_remaining numeric,
  remaining numeric,
  period_start timestamptz,
  topup_expires_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with topup as (
    select * from public.current_topup_credits(_workspace_id)
  )
  select
    coalesce(public.current_plan_credits(_workspace_id), 0) as included,
    public.current_credit_usage(_workspace_id) as used,
    coalesce((select remaining from topup), 0) as topup_remaining,
    greatest(
      0,
      coalesce(public.current_plan_credits(_workspace_id), 0)
      + coalesce((select remaining from topup), 0)
      - public.current_credit_usage(_workspace_id)
    ) as remaining,
    public.current_period_start_for_workspace(_workspace_id) as period_start,
    (select expires_at from topup) as topup_expires_at;
$$;

create or replace function public.workspace_has_credits(_workspace_id uuid, _credits numeric default 1)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select remaining from public.current_credit_balance(_workspace_id)), 0) >= greatest(_credits, 0);
$$;

create or replace function public.log_credit_usage(
  _workspace_id uuid,
  _event_type text,
  _related_type text default null,
  _related_id uuid default null,
  _metadata jsonb default '{}'::jsonb,
  _credits numeric default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cost numeric := coalesce(_credits, public.credit_cost_for_event(_event_type));
  v_usage_id uuid;
begin
  insert into public.usage_events(workspace_id, event_type, related_id, metadata, credit_cost)
  values (_workspace_id, _event_type, _related_id, coalesce(_metadata, '{}'::jsonb), greatest(v_cost, 0))
  returning id into v_usage_id;

  if greatest(v_cost, 0) > 0 then
    insert into public.credit_ledger(
      workspace_id,
      event_type,
      related_type,
      related_id,
      credits_delta,
      source,
      metadata
    ) values (
      _workspace_id,
      _event_type,
      _related_type,
      _related_id,
      -greatest(v_cost, 0),
      'usage',
      coalesce(_metadata, '{}'::jsonb)
    );
  end if;

  return v_usage_id;
end;
$$;

create or replace function public.current_period_usage(_workspace_id uuid, _event_type text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(count(*), 0)::integer
  from public.usage_events
  where workspace_id = _workspace_id
    and event_type = _event_type
    and created_at >= public.current_period_start_for_workspace(_workspace_id);
$$;

create or replace function public.current_topup_balance(_workspace_id uuid)
returns table(remaining integer, expires_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(sum(p.remaining), 0)::integer as remaining,
    min(p.period_end) as expires_at
  from public.request_credit_packs p
  where p.workspace_id = _workspace_id
    and p.status = 'active'
    and p.remaining > 0
    and (p.period_end is null or p.period_end >= now());
$$;

comment on table public.credit_ledger is 'Auditable PhotoBrief Credit ledger. Requests are containers; credits are consumed by AI/photo workload.';
comment on column public.usage_events.credit_cost is 'PhotoBrief Credits consumed by this usage event. Zero for non-billable/manual events.';
