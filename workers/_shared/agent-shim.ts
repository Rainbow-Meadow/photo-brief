/**
 * Tiny shim every specialist agent imports so the wiring is uniform:
 *
 *   - declareRole(role)       — call once on module load (logs identity).
 *   - emitAgentEvent(env, e)  — fire-and-forget into the AGENT_EVENTS queue.
 *   - handleDispatch(req,...) — common /dispatch/:intent route handler.
 *
 * The orchestrator owns workspace context; specialists stay narrow.
 */

import type { AgentEvent, AgentRole } from "./roles";

export interface AgentEventQueue {
  send(body: AgentEvent, options?: { contentType?: "json" }): Promise<void>;
}

export interface AgentShimEnv {
  AGENT_EVENTS?: AgentEventQueue;
}

export function declareRole(role: AgentRole): void {
  // Surfaces in worker logs — useful when grepping cross-agent traces.
  console.log(`[pb-agent] role=${role} ready`);
}

export async function emitAgentEvent(env: AgentShimEnv, event: AgentEvent): Promise<void> {
  if (!env.AGENT_EVENTS) return; // optional during local dev
  try {
    await env.AGENT_EVENTS.send(event, { contentType: "json" });
  } catch (err) {
    console.warn("[pb-agent] emitAgentEvent failed", (err as Error).message);
  }
}

export type DispatchHandler = (
  payload: unknown,
  ctx: { workspaceId: string; correlationId?: string },
) => Promise<unknown>;

/**
 * Returns a Response if the request matches /dispatch/:intent, else null
 * so callers can fall through to their existing routes.
 */
export async function handleDispatch(
  req: Request,
  handlers: Record<string, DispatchHandler>,
): Promise<Response | null> {
  const url = new URL(req.url);
  const m = url.pathname.match(/^\/dispatch\/([^/]+)\/?$/);
  if (!m || req.method !== "POST") return null;
  const intent = decodeURIComponent(m[1]);
  const handler = handlers[intent];
  if (!handler) {
    return new Response(JSON.stringify({ ok: false, error: "unknown_intent", intent }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  const workspaceId = req.headers.get("x-pb-workspace-id") ?? "";
  const correlationId = req.headers.get("x-pb-correlation-id") ?? undefined;
  if (!workspaceId) {
    return new Response(JSON.stringify({ ok: false, error: "workspace_id_required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  let payload: unknown = null;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }
  try {
    const result = await handler(payload, { workspaceId, correlationId });
    return new Response(JSON.stringify({ ok: true, intent, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, intent, error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
