-- Connector OS foundation for native PhotoBrief integrations.
-- This creates a provider/connection/event/action/log model that lets Gmail,
-- Microsoft 365, Twilio, Website Intake, Zapier, Make, HubSpot, and future
-- vertical systems map into the same internal PhotoBrief primitives.

create table if not exists public.integration_providers (
  key text primary key,
  name text not null,
  category text not null check (category in ('website', 'communication', 'automation', 'crm')),
  stage text not null default 'planned' check (stage in ('live', 'setup_ready', 'planned')),
  minimum_plan public.plan_tier not null default 'free',
  description text,
  required_scopes text[] not null default '{}',
  capabilities jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.business_workspaces(id) on delete cascade,
  provider_key text not null references public.integration_providers(key) on delete restrict,
  status text not null default 'not_connected' check (status in ('not_connected', 'connected', 'needs_attention', 'disabled')),
  connection_key text not null default encode(gen_random_bytes(16), 'hex'),
  display_name text,
  connected_account text,
  scopes text[] not null default '{}',
  config jsonb not null default '{}'::jsonb,
  token_ref text,
  access_token_ciphertext text,
  refresh_token_ciphertext text,
  token_expires_at timestamptz,
  last_health_check_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, provider_key),
  unique (connection_key)
);

create table if not exists public.integration_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.business_workspaces(id) on delete cascade,
  connection_id uuid references public.integration_connections(id) on delete set null,
  provider_key text not null,
  event_type text not null,
  external_id text,
  payload jsonb not null default '{}'::jsonb,
  normalized_payload jsonb not null default '{}'::jsonb,
  status text not null default 'received' check (status in ('received', 'processed', 'ignored', 'failed')),
  error text,
  occurred_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists integration_events_workspace_created_idx
  on public.integration_events (workspace_id, created_at desc);

create index if not exists integration_events_connection_created_idx
  on public.integration_events (connection_id, created_at desc);

create table if not exists public.integration_action_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.business_workspaces(id) on delete cascade,
  connection_id uuid references public.integration_connections(id) on delete set null,
  provider_key text not null,
  action_type text not null,
  request_id uuid references public.photo_brief_requests(id) on delete set null,
  submission_id uuid references public.submissions(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'skipped')),
  error text,
  idempotency_key text,
  run_after timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id, provider_key, idempotency_key)
);

create index if not exists integration_action_runs_workspace_created_idx
  on public.integration_action_runs (workspace_id, created_at desc);

create table if not exists public.integration_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.business_workspaces(id) on delete cascade,
  connection_id uuid references public.integration_connections(id) on delete set null,
  provider_key text,
  level text not null default 'info' check (level in ('debug', 'info', 'warn', 'error')),
  message text not null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists integration_logs_workspace_created_idx
  on public.integration_logs (workspace_id, created_at desc);

alter table public.integration_providers enable row level security;
alter table public.integration_connections enable row level security;
alter table public.integration_events enable row level security;
alter table public.integration_action_runs enable row level security;
alter table public.integration_logs enable row level security;

-- Providers are catalog metadata and can be read by signed-in users.
drop policy if exists "Authenticated users can read integration providers" on public.integration_providers;
create policy "Authenticated users can read integration providers"
  on public.integration_providers for select
  to authenticated
  using (true);

-- Workspace owners can manage their own integration connections.
drop policy if exists "Workspace owners can read integration connections" on public.integration_connections;
create policy "Workspace owners can read integration connections"
  on public.integration_connections for select
  to authenticated
  using (
    exists (
      select 1 from public.business_workspaces bw
      where bw.id = integration_connections.workspace_id
        and bw.owner_id = auth.uid()
    )
  );

drop policy if exists "Workspace owners can insert integration connections" on public.integration_connections;
create policy "Workspace owners can insert integration connections"
  on public.integration_connections for insert
  to authenticated
  with check (
    exists (
      select 1 from public.business_workspaces bw
      where bw.id = integration_connections.workspace_id
        and bw.owner_id = auth.uid()
    )
  );

drop policy if exists "Workspace owners can update integration connections" on public.integration_connections;
create policy "Workspace owners can update integration connections"
  on public.integration_connections for update
  to authenticated
  using (
    exists (
      select 1 from public.business_workspaces bw
      where bw.id = integration_connections.workspace_id
        and bw.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.business_workspaces bw
      where bw.id = integration_connections.workspace_id
        and bw.owner_id = auth.uid()
    )
  );

drop policy if exists "Workspace owners can delete integration connections" on public.integration_connections;
create policy "Workspace owners can delete integration connections"
  on public.integration_connections for delete
  to authenticated
  using (
    exists (
      select 1 from public.business_workspaces bw
      where bw.id = integration_connections.workspace_id
        and bw.owner_id = auth.uid()
    )
  );

-- Events, action runs, and logs are readable by the workspace owner. Inserts
-- are generally performed by Edge Functions using the service role key.

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'integration_events' and policyname = 'Workspace owners can read integration events'
  ) then
    create policy "Workspace owners can read integration events"
      on public.integration_events for select
      to authenticated
      using (
        exists (
          select 1 from public.business_workspaces bw
          where bw.id = integration_events.workspace_id
            and bw.owner_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'integration_action_runs' and policyname = 'Workspace owners can read integration action runs'
  ) then
    create policy "Workspace owners can read integration action runs"
      on public.integration_action_runs for select
      to authenticated
      using (
        exists (
          select 1 from public.business_workspaces bw
          where bw.id = integration_action_runs.workspace_id
            and bw.owner_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'integration_logs' and policyname = 'Workspace owners can read integration logs'
  ) then
    create policy "Workspace owners can read integration logs"
      on public.integration_logs for select
      to authenticated
      using (
        workspace_id is null or exists (
          select 1 from public.business_workspaces bw
          where bw.id = integration_logs.workspace_id
            and bw.owner_id = auth.uid()
        )
      );
  end if;
end $$;

insert into public.integration_providers (key, name, category, stage, minimum_plan, description, capabilities)
values
  ('website-intake', 'Hosted Website Intake', 'website', 'live', 'pro', 'PhotoBrief-hosted website intake flow.', '{"triggers":["website_lead_received"],"actions":["create_request"]}'::jsonb),
  ('site-badge', 'PhotoBrief Site Badge', 'website', 'live', 'pro', 'Embeddable PhotoBrief intake badge.', '{"triggers":["badge_clicked"],"actions":["open_intake"]}'::jsonb),
  ('webhook-bridge', 'Existing Form Webhook Bridge', 'website', 'setup_ready', 'pro', 'Existing forms can post lead payloads to PhotoBrief.', '{"triggers":["external_form_submitted"],"actions":["create_customer","create_request"]}'::jsonb),
  ('gmail', 'Gmail', 'communication', 'setup_ready', 'starter', 'Send request links from Gmail via OAuth.', '{"actions":["send_request_link","send_reminder"]}'::jsonb),
  ('microsoft-365', 'Microsoft 365 Outlook', 'communication', 'setup_ready', 'starter', 'Send request links via Microsoft Graph.', '{"actions":["send_request_link","send_reminder"]}'::jsonb),
  ('manual-sms', 'Manual Phone Text', 'communication', 'live', 'free', 'Copy/paste SMS from the business phone.', '{"actions":["generate_manual_send_message","log_external_message"]}'::jsonb),
  ('twilio', 'Twilio SMS', 'communication', 'setup_ready', 'pro', 'Automated SMS with compliance-aware setup.', '{"triggers":["sms_reply","delivery_callback"],"actions":["send_request_link","send_reminder"]}'::jsonb),
  ('zapier', 'Zapier', 'automation', 'setup_ready', 'pro', 'Zapier triggers and actions for long-tail providers.', '{"triggers":["request_created","submission_completed"],"actions":["create_request","create_customer"]}'::jsonb),
  ('make', 'Make', 'automation', 'setup_ready', 'pro', 'Make scenarios for routed request automation.', '{"triggers":["request_created","submission_completed"],"actions":["create_request","create_customer"]}'::jsonb),
  ('hubspot', 'HubSpot', 'crm', 'planned', 'team', 'Sync briefs to HubSpot contacts, deals, notes, and tasks.', '{"actions":["push_brief_summary","create_external_task"]}'::jsonb),
  ('google-sheets', 'Google Sheets', 'automation', 'planned', 'starter', 'Append request and submission rows to Sheets.', '{"actions":["append_request_row","append_submission_row"]}'::jsonb)
on conflict (key) do update set
  name = excluded.name,
  category = excluded.category,
  stage = excluded.stage,
  minimum_plan = excluded.minimum_plan,
  description = excluded.description,
  capabilities = excluded.capabilities,
  updated_at = now();
