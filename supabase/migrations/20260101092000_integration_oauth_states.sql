-- OAuth state tracking for native connector auth flows.
-- Provider secrets stay in Supabase/Edge Function env vars; browser code only
-- receives a short-lived authorization URL and never sees provider secrets.

create table if not exists public.integration_oauth_states (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.business_workspaces(id) on delete cascade,
  provider_key text not null references public.integration_providers(key) on delete cascade,
  state text not null unique,
  code_verifier text,
  redirect_to text,
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists integration_oauth_states_workspace_created_idx
  on public.integration_oauth_states (workspace_id, created_at desc);

create index if not exists integration_oauth_states_state_idx
  on public.integration_oauth_states (state);

alter table public.integration_oauth_states enable row level security;

-- Users never need direct browser access to OAuth states; Edge Functions use
-- service role access. This read policy is only for workspace audit visibility.
drop policy if exists "Workspace admins can read integration oauth states" on public.integration_oauth_states;
create policy "Workspace admins can read integration oauth states"
  on public.integration_oauth_states for select
  to authenticated
  using (public.can_manage_workspace_integrations(workspace_id));
