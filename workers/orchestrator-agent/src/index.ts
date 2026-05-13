/**
 * PhotoBrief Orchestrator Agent — the Conductor.
 *
 * One Durable Object per workspace_id. Owns:
 *   - WorkspaceContext (brand, voice, vertical, plan tier, contact policy)
 *   - Cross-agent dispatch (HTTP RPC to peer DO bindings via internal hostnames)
 *   - Handoff history (last 200, SQLite via Agents SDK state)
 *   - Queue consumer for fire-and-forget AgentEvents
 *   - Nightly "team standup" digest at 09:00 UTC
 *
 * See workers/_shared/roles.ts for the role contract and
 * docs/agent-roles.md for the human-readable charter.
 */

import { Agent } from "agents";
import {
  AGENT_CHARTERS,
  type AgentEvent,
  type AgentRole,
  type DispatchTask,
  type DispatchResult,
} from "../../_shared/roles";
import {
  loadWorkspaceBrand,
  writeWorkspaceBrand,
  defaultBrand,
  type BrandKvBinding,
  type WorkspaceBrand,
} from "../../_shared/brand";

interface Env {
  ORCHESTRATOR_AGENT: DurableObjectNamespace;
  WORKSPACE_BRAND: BrandKvBinding & KVNamespace;
  AGENT_EVENTS: Queue<AgentEvent>;
  SITE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

interface OrchestratorState {
  workspaceId: string | null;
  brand: WorkspaceBrand | null;
  /** Most recent 200 events/handoffs for the dashboard. */
  history: HistoryEntry[];
  /** Per-role current status, derived from events. */
  roleStatus: Partial<Record<AgentRole, RoleStatus>>;
  digestEnabled: boolean;
  digestCron: string;
  digestScheduleId: string | null;
  lastDigestAt: string | null;
}

interface HistoryEntry {
  at: string;
  kind: "event" | "dispatch" | "digest";
  from?: AgentRole;
  toRole?: AgentRole;
  type: string;
  summary: string;
  ok?: boolean;
  correlationId?: string;
}

interface RoleStatus {
  state: "idle" | "working" | "paused" | "error";
  lastEventAt: string;
  lastEventType: string;
}

const HISTORY_LIMIT = 200;

/** Internal agent base URLs — keep in sync with wrangler routes. */
const AGENT_BASE_URLS: Record<AgentRole, string | null> = {
  conductor: null, // self
  account_strategist: "https://assistant-agent.photobrief.ai",
  capture_coach: "https://capture-agent.photobrief.ai",
  install_engineer: "https://installer-agent.photobrief.ai",
  growth_steward: "https://beta-onboarding.photobrief.ai",
  agent_gateway: "https://mcp.photobrief.ai",
  edge_traffic: null, // stateless
};

export class OrchestratorAgent extends Agent<Env, OrchestratorState> {
  initialState: OrchestratorState = {
    workspaceId: null,
    brand: null,
    history: [],
    roleStatus: {},
    digestEnabled: false,
    digestCron: "0 9 * * *",
    digestScheduleId: null,
    lastDigestAt: null,
  };

  /* ── HTTP entry ───────────────────────────────────────────────── */

  async onRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    try {
      if (path === "/health") return json({ ok: true, role: "conductor" });

      if (path === "/charters") return json({ charters: AGENT_CHARTERS });

      if (path === "/context" && method === "GET") {
        await this.ensureBrand(req);
        return json({
          workspaceId: this.state.workspaceId,
          brand: this.state.brand,
          roleStatus: this.state.roleStatus,
          digest: {
            enabled: this.state.digestEnabled,
            cron: this.state.digestCron,
            lastAt: this.state.lastDigestAt,
          },
        });
      }

      if (path === "/history" && method === "GET") {
        return json({ history: this.state.history.slice(-100).reverse() });
      }

      if (path === "/brand" && method === "PUT") {
        const body = (await req.json()) as Partial<WorkspaceBrand>;
        const workspaceId = body.workspaceId ?? this.state.workspaceId;
        if (!workspaceId) return json({ error: "workspace_id_required" }, 400);
        const merged: WorkspaceBrand = {
          ...(this.state.brand ?? defaultBrand(workspaceId)),
          ...body,
          workspaceId,
          voice: { ...(this.state.brand?.voice ?? defaultBrand(workspaceId).voice), ...(body.voice ?? {}) },
          updatedAt: new Date().toISOString(),
        };
        await writeWorkspaceBrand(this.env.WORKSPACE_BRAND, merged);
        this.setState({ ...this.state, workspaceId, brand: merged });
        return json({ brand: merged });
      }

      if (path === "/dispatch" && method === "POST") {
        const task = (await req.json()) as DispatchTask;
        const result = await this.dispatch(task);
        return json(result);
      }

      if (path === "/event" && method === "POST") {
        const event = (await req.json()) as AgentEvent;
        await this.handleEvent(event);
        return json({ ok: true });
      }

      if (path === "/digest/enable" && method === "POST") {
        const body = (await req.json().catch(() => ({}))) as { cron?: string };
        const cron = body.cron ?? this.state.digestCron;
        const sched = await this.schedule(cron, "runDigest" as never);
        this.setState({
          ...this.state,
          digestEnabled: true,
          digestCron: cron,
          digestScheduleId: (sched as { id?: string }).id ?? null,
        });
        return json({ ok: true, cron });
      }

      if (path === "/digest/disable" && method === "POST") {
        if (this.state.digestScheduleId) {
          await this.cancelSchedule(this.state.digestScheduleId).catch(() => {});
        }
        this.setState({ ...this.state, digestEnabled: false, digestScheduleId: null });
        return json({ ok: true });
      }

      if (path === "/digest/run" && method === "POST") {
        const summary = await this.runDigest();
        return json({ ok: true, summary });
      }

      return json({ error: "not_found", path }, 404);
    } catch (err) {
      return json({ error: (err as Error).message }, 500);
    }
  }

  /* ── Queue consumer ───────────────────────────────────────────── */

  async queue(batch: MessageBatch<AgentEvent>): Promise<void> {
    for (const msg of batch.messages) {
      try {
        await this.handleEvent(msg.body);
        msg.ack();
      } catch {
        msg.retry();
      }
    }
  }

  /* ── Core logic ───────────────────────────────────────────────── */

  private async ensureBrand(req: Request): Promise<void> {
    const url = new URL(req.url);
    const wsId = url.searchParams.get("workspaceId") ?? this.state.workspaceId;
    if (!wsId) return;
    if (this.state.brand && this.state.workspaceId === wsId) return;
    const brand = await loadWorkspaceBrand(this.env.WORKSPACE_BRAND, wsId, () =>
      this.hydrateBrandFromSupabase(wsId),
    );
    this.setState({ ...this.state, workspaceId: wsId, brand });
  }

  private async hydrateBrandFromSupabase(workspaceId: string): Promise<WorkspaceBrand | null> {
    if (!this.env.SUPABASE_SERVICE_ROLE_KEY) return null;
    try {
      const res = await fetch(
        `${this.env.SUPABASE_URL}/rest/v1/business_workspaces?id=eq.${workspaceId}&select=id,name,brand_profiles(intro_message,completion_message,brand_color,logo_url,signature,language,vertical)`,
        {
          headers: {
            apikey: this.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${this.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
        },
      );
      if (!res.ok) return null;
      const rows = (await res.json()) as Array<{
        id: string;
        name: string;
        brand_profiles?: Array<{
          brand_color?: string;
          logo_url?: string;
          signature?: string;
          language?: string;
          vertical?: string;
        }>;
      }>;
      const row = rows[0];
      if (!row) return null;
      const profile = row.brand_profiles?.[0];
      return {
        workspaceId: row.id,
        name: row.name ?? "Workspace",
        logoUrl: profile?.logo_url,
        accentHsl: profile?.brand_color,
        voice: {
          tone: "warm-professional",
          signature: profile?.signature ?? `— ${row.name ?? "PhotoBrief"}`,
          language: profile?.language ?? "en",
        },
        vertical: profile?.vertical,
        updatedAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  async dispatch<P, R>(task: DispatchTask<P>): Promise<DispatchResult<R>> {
    const base = AGENT_BASE_URLS[task.toRole];
    if (!base) {
      return { ok: false, role: task.toRole, intent: task.intent, error: "no_endpoint_for_role" };
    }
    const at = new Date().toISOString();
    let ok = false;
    let result: R | undefined;
    let error: string | undefined;
    try {
      const res = await fetch(`${base}/dispatch/${encodeURIComponent(task.intent)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pb-workspace-id": task.workspaceId,
          "x-pb-correlation-id": task.correlationId ?? "",
        },
        body: JSON.stringify(task.payload ?? {}),
      });
      ok = res.ok;
      const text = await res.text();
      result = text ? (safeJson<R>(text) ?? (text as unknown as R)) : undefined;
      if (!ok) error = `peer_${res.status}`;
    } catch (e) {
      error = (e as Error).message;
    }

    this.recordHistory({
      at,
      kind: "dispatch",
      toRole: task.toRole,
      type: task.intent,
      summary: `dispatch → ${task.toRole}: ${task.intent}`,
      ok,
      correlationId: task.correlationId,
    });

    return { ok, role: task.toRole, intent: task.intent, result, error };
  }

  private async handleEvent(event: AgentEvent): Promise<void> {
    if (event.workspaceId && event.workspaceId !== this.state.workspaceId) {
      const brand = await loadWorkspaceBrand(this.env.WORKSPACE_BRAND, event.workspaceId, () =>
        this.hydrateBrandFromSupabase(event.workspaceId),
      );
      this.setState({ ...this.state, workspaceId: event.workspaceId, brand });
    }

    // Update role status from the emitter side.
    const status: RoleStatus = {
      state: "working",
      lastEventAt: event.at,
      lastEventType: event.type,
    };
    this.setState({
      ...this.state,
      roleStatus: { ...this.state.roleStatus, [event.from]: status },
    });

    // Routing rules — minimal, deterministic.
    switch (event.type) {
      case "submission_completed":
        await this.dispatch({
          toRole: "account_strategist",
          workspaceId: event.workspaceId,
          intent: "submission_review",
          payload: { submissionId: event.submissionId, requestId: event.requestId },
          correlationId: event.correlationId,
        });
        break;
      case "install_verified":
      case "install_monitor_failed":
        await this.dispatch({
          toRole: "account_strategist",
          workspaceId: event.workspaceId,
          intent: "install_status_changed",
          payload: event,
          correlationId: event.correlationId,
        });
        break;
      case "beta_activated":
        await this.dispatch({
          toRole: "account_strategist",
          workspaceId: event.workspaceId,
          intent: "kickoff_digest",
          payload: { userId: event.userId, planTier: event.planTier },
          correlationId: event.correlationId,
        });
        break;
      default:
        break;
    }

    this.recordHistory({
      at: event.at,
      kind: "event",
      from: event.from,
      type: event.type,
      summary: `${event.from} → ${event.type}`,
      correlationId: event.correlationId,
    });
  }

  private recordHistory(entry: HistoryEntry): void {
    const next = [...this.state.history, entry];
    if (next.length > HISTORY_LIMIT) next.splice(0, next.length - HISTORY_LIMIT);
    this.setState({ ...this.state, history: next });
  }

  /* ── Scheduled digest ─────────────────────────────────────────── */

  async runDigest(): Promise<string> {
    const wsId = this.state.workspaceId;
    if (!wsId) return "no_workspace";
    const events = this.state.history.slice(-100);
    const counts: Record<string, number> = {};
    for (const e of events) counts[e.type] = (counts[e.type] ?? 0) + 1;
    const summary = Object.entries(counts)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    this.recordHistory({
      at: new Date().toISOString(),
      kind: "digest",
      type: "team_standup",
      summary: `Standup — ${summary || "no activity"}`,
    });
    this.setState({ ...this.state, lastDigestAt: new Date().toISOString() });

    // Hand the digest off to the Account Strategist for delivery.
    await this.dispatch({
      toRole: "account_strategist",
      workspaceId: wsId,
      intent: "deliver_team_standup",
      payload: { counts, generatedAt: new Date().toISOString() },
    }).catch(() => {});

    return summary;
  }
}

/* ── Worker entry ────────────────────────────────────────────────── */

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      return json({
        ok: true,
        name: "photobrief-orchestrator-agent",
        roles: Object.keys(AGENT_CHARTERS),
      });
    }
    // Route per-workspace via path /w/:workspaceId/* or header.
    const wsId =
      url.searchParams.get("workspaceId") ??
      req.headers.get("x-pb-workspace-id") ??
      url.pathname.split("/")[2] ??
      null;
    if (!wsId) return json({ error: "workspace_id_required" }, 400);
    const id = env.ORCHESTRATOR_AGENT.idFromName(wsId);
    return env.ORCHESTRATOR_AGENT.get(id).fetch(req);
  },

  async queue(batch: MessageBatch<AgentEvent>, env: Env): Promise<void> {
    // Group by workspace and forward to that workspace's DO.
    const byWs = new Map<string, AgentEvent[]>();
    for (const msg of batch.messages) {
      const ws = msg.body.workspaceId;
      const arr = byWs.get(ws) ?? [];
      arr.push(msg.body);
      byWs.set(ws, arr);
      msg.ack();
    }
    await Promise.all(
      [...byWs.entries()].map(async ([ws, events]) => {
        const id = env.ORCHESTRATOR_AGENT.idFromName(ws);
        const stub = env.ORCHESTRATOR_AGENT.get(id);
        for (const e of events) {
          await stub.fetch("https://do/event", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-pb-workspace-id": ws },
            body: JSON.stringify(e),
          });
        }
      }),
    );
  },
};

/* ── Helpers ─────────────────────────────────────────────────────── */

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type, authorization, x-pb-workspace-id, x-pb-correlation-id",
      "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    },
  });
}

function safeJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
