-- Allow one-off request guides for blank/AI manual links without exposing them
-- as reusable saved templates or gating them behind the saved-template plan feature.

alter table public.photo_guides
  add column if not exists is_request_scoped boolean not null default false;

create index if not exists photo_guides_workspace_reusable_idx
  on public.photo_guides(workspace_id, is_active, created_at desc)
  where workspace_id is not null
    and is_global_template = false
    and is_request_scoped = false;

create or replace function public.enforce_custom_guides_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare ws_plan plan_tier;
begin
  if new.workspace_id is null
     or new.is_global_template
     or coalesce(new.is_request_scoped, false) then
    return new;
  end if;

  select plan_tier into ws_plan
  from public.business_workspaces
  where id = new.workspace_id;

  if ws_plan not in ('pro','team','business') then
    raise exception 'PLAN_FEATURE_LOCKED: custom_guides requires Pro or higher (current: %)', ws_plan
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

comment on column public.photo_guides.is_request_scoped is
  'True for private one-off guides that power a single request. Hidden from saved template libraries and excluded from custom-guide plan gating.';
