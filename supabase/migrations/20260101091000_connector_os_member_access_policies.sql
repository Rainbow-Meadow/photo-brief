-- Align Connector OS RLS with the existing workspace membership model.
-- The app uses business_workspaces.owner_id plus workspace_members rows for team access.
-- Owners and admins can manage connector connections; active/accepted members can read
-- connector state, events, action runs, and logs.

create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_workspaces bw
    where bw.id = p_workspace_id
      and bw.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = auth.uid()
      and wm.status in ('active', 'accepted')
  );
$$;

create or replace function public.can_manage_workspace_integrations(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_workspaces bw
    where bw.id = p_workspace_id
      and bw.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin')
      and wm.status in ('active', 'accepted')
  );
$$;

revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.can_manage_workspace_integrations(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.can_manage_workspace_integrations(uuid) to authenticated;

-- integration_connections
drop policy if exists "Workspace owners can read integration connections" on public.integration_connections;
drop policy if exists "Workspace owners can insert integration connections" on public.integration_connections;
drop policy if exists "Workspace owners can update integration connections" on public.integration_connections;
drop policy if exists "Workspace owners can delete integration connections" on public.integration_connections;
drop policy if exists "Workspace members can read integration connections" on public.integration_connections;
drop policy if exists "Workspace admins can insert integration connections" on public.integration_connections;
drop policy if exists "Workspace admins can update integration connections" on public.integration_connections;
drop policy if exists "Workspace admins can delete integration connections" on public.integration_connections;

create policy "Workspace members can read integration connections"
  on public.integration_connections for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Workspace admins can insert integration connections"
  on public.integration_connections for insert
  to authenticated
  with check (public.can_manage_workspace_integrations(workspace_id));

create policy "Workspace admins can update integration connections"
  on public.integration_connections for update
  to authenticated
  using (public.can_manage_workspace_integrations(workspace_id))
  with check (public.can_manage_workspace_integrations(workspace_id));

create policy "Workspace admins can delete integration connections"
  on public.integration_connections for delete
  to authenticated
  using (public.can_manage_workspace_integrations(workspace_id));

-- integration_events
drop policy if exists "Workspace owners can read integration events" on public.integration_events;
drop policy if exists "Workspace members can read integration events" on public.integration_events;
create policy "Workspace members can read integration events"
  on public.integration_events for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

-- integration_action_runs
drop policy if exists "Workspace owners can read integration action runs" on public.integration_action_runs;
drop policy if exists "Workspace members can read integration action runs" on public.integration_action_runs;
create policy "Workspace members can read integration action runs"
  on public.integration_action_runs for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

-- integration_logs
drop policy if exists "Workspace owners can read integration logs" on public.integration_logs;
drop policy if exists "Workspace members can read integration logs" on public.integration_logs;
create policy "Workspace members can read integration logs"
  on public.integration_logs for select
  to authenticated
  using (workspace_id is null or public.is_workspace_member(workspace_id));
