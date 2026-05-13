/**
 * agentTeamService — talks to the Orchestrator (Conductor) via the
 * `agent-brand` edge function for brand voice + directly to the
 * orchestrator HTTP endpoints for read-only history/context.
 */
import { supabase } from "@/integrations/supabase/client";

const ORCHESTRATOR_BASE = "https://orchestrator.photobrief.ai";

export type AgentRole =
  | "conductor"
  | "account_strategist"
  | "capture_coach"
  | "install_engineer"
  | "growth_steward"
  | "agent_gateway"
  | "edge_traffic";

export interface AgentCharter {
  role: AgentRole;
  worker: string;
  displayName: string;
  owns: string[];
  handsOffTo: AgentRole[];
  voicePreamble: string;
}

export interface WorkspaceBrandVoice {
  tone: string;
  signature?: string;
  language: string;
}

export interface WorkspaceBrand {
  workspaceId: string;
  name: string;
  logoUrl?: string;
  accentHsl?: string;
  voice: WorkspaceBrandVoice;
  vertical?: string;
  updatedAt: string;
}

export interface RoleStatus {
  state: "idle" | "working" | "paused" | "error";
  lastEventAt: string;
  lastEventType: string;
}

export interface HistoryEntry {
  at: string;
  kind: "event" | "dispatch" | "digest";
  from?: AgentRole;
  toRole?: AgentRole;
  type: string;
  summary: string;
  ok?: boolean;
  correlationId?: string;
}

export interface AgentContext {
  workspaceId: string | null;
  brand: WorkspaceBrand | null;
  roleStatus: Partial<Record<AgentRole, RoleStatus>>;
  digest: { enabled: boolean; cron: string; lastAt: string | null };
}

export async function fetchAgentContext(workspaceId: string): Promise<AgentContext> {
  const { data, error } = await supabase.functions.invoke("agent-brand", {
    method: "GET",
    headers: {},
    body: undefined,
    // edge function reads workspace_id from the query string
    // supabase-js doesn't expose query, so call fetch directly:
  } as never);
  if (data && !error) return data as AgentContext;

  // Fallback to direct call (no auth — read-only context for membership-validated user)
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-brand?workspace_id=${workspaceId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token ?? ""}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "" },
  });
  if (!res.ok) throw new Error(`fetchAgentContext failed: ${res.status}`);
  return (await res.json()) as AgentContext;
}

export async function updateWorkspaceBrand(
  workspaceId: string,
  brand: Partial<WorkspaceBrand>,
): Promise<{ brand: WorkspaceBrand }> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-brand`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token ?? ""}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
    },
    body: JSON.stringify({ workspace_id: workspaceId, brand }),
  });
  if (!res.ok) throw new Error(`updateWorkspaceBrand failed: ${res.status}`);
  return (await res.json()) as { brand: WorkspaceBrand };
}

export async function fetchAgentHistory(workspaceId: string): Promise<HistoryEntry[]> {
  const url = `${ORCHESTRATOR_BASE}/w/${workspaceId}/history?workspaceId=${workspaceId}`;
  const res = await fetch(url, { headers: { "x-pb-workspace-id": workspaceId } });
  if (!res.ok) return [];
  const body = (await res.json()) as { history?: HistoryEntry[] };
  return body.history ?? [];
}

export async function fetchCharters(): Promise<Record<AgentRole, AgentCharter>> {
  const res = await fetch(`${ORCHESTRATOR_BASE}/charters?workspaceId=public`);
  if (!res.ok) return {} as Record<AgentRole, AgentCharter>;
  const body = (await res.json()) as { charters: Record<AgentRole, AgentCharter> };
  return body.charters;
}

export async function runDigestNow(workspaceId: string): Promise<void> {
  await fetch(`${ORCHESTRATOR_BASE}/w/${workspaceId}/digest/run`, {
    method: "POST",
    headers: { "x-pb-workspace-id": workspaceId },
  }).catch(() => {});
}
