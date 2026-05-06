
-- 0. Function
create or replace function public.can_manage_workspace_integrations(p_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.business_workspaces bw where bw.id = p_workspace_id and bw.owner_id = auth.uid())
  or exists (select 1 from public.workspace_members wm where wm.workspace_id = p_workspace_id and wm.user_id = auth.uid() and wm.role in ('owner','admin') and wm.status in ('active','accepted'));
$$;
revoke all on function public.can_manage_workspace_integrations(uuid) from public;
grant execute on function public.can_manage_workspace_integrations(uuid) to authenticated;

-- 1. Marketing tables
create table if not exists public.marketing_live_submissions (
  id uuid primary key default gen_random_uuid(), session_id text not null,
  source text not null default 'photobrief-marketing-hero', workflow_mode text not null default 'capture',
  selected_count integer not null default 0, required_count integer not null default 4,
  readiness text not null default 'incomplete', issue text, summary text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists marketing_live_submissions_session_idx on public.marketing_live_submissions (session_id);
alter table public.marketing_live_submissions enable row level security;
create policy "Service role manages marketing live submissions" on public.marketing_live_submissions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create table if not exists public.marketing_live_leads (
  id uuid primary key default gen_random_uuid(), session_id text not null, email text not null,
  name text, company text, phone text, readiness text not null default 'incomplete',
  selected_count integer not null default 0, required_count integer not null default 4,
  issue text, summary text, payload jsonb not null default '{}'::jsonb,
  consented_at timestamptz, first_seen_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  customer_id uuid references public.customers(id) on delete set null,
  request_id uuid references public.photo_brief_requests(id) on delete set null,
  request_token text, request_url text, converted_at timestamptz, conversion_error text,
  followup_sent_at timestamptz, followup_channel text, followup_error text,
  constraint marketing_live_leads_email_check check (position('@' in email) > 1)
);
create unique index if not exists marketing_live_leads_session_email_idx on public.marketing_live_leads (session_id, lower(email));
create index if not exists marketing_live_leads_request_idx on public.marketing_live_leads (request_id);
create index if not exists marketing_live_leads_customer_idx on public.marketing_live_leads (customer_id);
alter table public.marketing_live_leads enable row level security;
create policy "Service role manages marketing live leads" on public.marketing_live_leads for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- 2. OAuth states
create table if not exists public.integration_oauth_states (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.business_workspaces(id) on delete cascade,
  provider_key text not null, state text not null unique, code_verifier text, redirect_to text,
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  consumed_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists integration_oauth_states_state_idx on public.integration_oauth_states (state);
alter table public.integration_oauth_states enable row level security;
create policy "Workspace admins can read integration oauth states" on public.integration_oauth_states for select to authenticated using (public.can_manage_workspace_integrations(workspace_id));

-- 3. Align ai_check_type enum
-- A: drop default, convert to text
ALTER TABLE public.guide_steps ALTER COLUMN ai_checks DROP DEFAULT;
ALTER TABLE public.guide_steps ALTER COLUMN ai_checks TYPE text[] USING ai_checks::text[];
ALTER TABLE public.ai_check_results ALTER COLUMN check_type TYPE text USING check_type::text;

-- B: map old values
UPDATE public.guide_steps SET ai_checks = (
  SELECT array_agg(CASE v
    WHEN 'blur' THEN 'blurry' WHEN 'low_light' THEN 'too_dark' WHEN 'unreadable_text' THEN 'label_unreadable'
    WHEN 'wrong_shot' THEN 'wrong_subject' WHEN 'cropped_subject' THEN 'too_close_or_cropped'
    WHEN 'duplicate_image' THEN 'wrong_subject' WHEN 'missing_scale' THEN 'wrong_subject' WHEN 'missing_required_item' THEN 'wrong_subject'
    WHEN 'label_detected' THEN 'label_unreadable' WHEN 'serial_model_detected' THEN 'label_unreadable' WHEN 'receipt_order_detected' THEN 'label_unreadable'
    WHEN 'damage_visible' THEN 'wrong_subject' WHEN 'wide_shot_detected' THEN 'too_close_or_cropped' WHEN 'close_up_detected' THEN 'too_close_or_cropped'
    WHEN 'unsafe_condition_flag' THEN 'wrong_subject' ELSE v END
  ) FROM unnest(ai_checks) AS v
) WHERE ai_checks != '{}';

UPDATE public.ai_check_results SET check_type = CASE check_type
  WHEN 'blur' THEN 'blurry' WHEN 'low_light' THEN 'too_dark' WHEN 'unreadable_text' THEN 'label_unreadable'
  WHEN 'wrong_shot' THEN 'wrong_subject' WHEN 'cropped_subject' THEN 'too_close_or_cropped'
  WHEN 'duplicate_image' THEN 'wrong_subject' WHEN 'missing_scale' THEN 'wrong_subject' WHEN 'missing_required_item' THEN 'wrong_subject'
  WHEN 'label_detected' THEN 'label_unreadable' WHEN 'serial_model_detected' THEN 'label_unreadable' WHEN 'receipt_order_detected' THEN 'label_unreadable'
  WHEN 'damage_visible' THEN 'wrong_subject' WHEN 'wide_shot_detected' THEN 'too_close_or_cropped' WHEN 'close_up_detected' THEN 'too_close_or_cropped'
  WHEN 'unsafe_condition_flag' THEN 'wrong_subject' ELSE check_type END
WHERE check_type NOT IN ('wrong_subject','too_dark','blurry','label_unreadable','glare','too_close_or_cropped');

-- C: drop old enum with CASCADE, create new, restore columns
DROP TYPE public.ai_check_type CASCADE;
CREATE TYPE public.ai_check_type AS ENUM ('wrong_subject','too_dark','blurry','label_unreadable','glare','too_close_or_cropped');
ALTER TABLE public.guide_steps ALTER COLUMN ai_checks TYPE ai_check_type[] USING ai_checks::ai_check_type[];
ALTER TABLE public.guide_steps ALTER COLUMN ai_checks SET DEFAULT '{}'::ai_check_type[];
ALTER TABLE public.ai_check_results ALTER COLUMN check_type TYPE ai_check_type USING check_type::ai_check_type;
