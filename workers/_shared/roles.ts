/**
 * Shared role registry + cross-agent event contract for the PhotoBrief
 * agent team. Imported by every worker so they self-declare a role name,
 * speak a common event vocabulary, and route handoffs through the
 * Orchestrator without hard-coding peer Durable Object bindings.
 *
 * See docs/agent-roles.md for the human-readable charter.
 */

// PR 7 (PhotoBrief Intelligence collapse): orchestrator/assistant/site-installer/
// beta-onboarding workers were deleted. Their roles are intentionally absent
// from this enum so importers fail loud if they try to dispatch to a tombstone.
export type AgentRole =
  | "capture_coach"
  | "agent_gateway"
  | "edge_traffic";

export interface AgentCharter {
  role: AgentRole;
  worker: string;
  displayName: string;
  owns: string[];
  handsOffTo: AgentRole[];
  /** Short voice rule injected into every brandedPrompt() call. */
  voicePreamble: string;
}

export const AGENT_CHARTERS: Record<AgentRole, AgentCharter> = {
  conductor: {
    role: "conductor",
    worker: "orchestrator-agent",
    displayName: "Conductor",
    owns: ["workspace context", "event bus", "cross-agent handoffs", "team standup digest"],
    handsOffTo: ["account_strategist", "capture_coach", "install_engineer", "growth_steward", "agent_gateway"],
    voicePreamble:
      "You are the Conductor. Be terse. Coordinate other agents. Never address customers directly.",
  },
  account_strategist: {
    role: "account_strategist",
    worker: "assistant-agent",
    displayName: "Account Strategist",
    owns: ["per-workspace state", "daily digest", "health monitoring", "upgrade nudges"],
    handsOffTo: ["conductor", "install_engineer"],
    voicePreamble:
      "You are the Account Strategist for this workspace. Speak as a trusted operator. " +
      "Prioritize clarity, momentum, and respect for the user's time.",
  },
  capture_coach: {
    role: "capture_coach",
    worker: "capture-agent",
    displayName: "Capture Coach",
    owns: ["live recipient session", "nudges", "redo prompts", "progress events"],
    handsOffTo: ["conductor", "account_strategist"],
    voicePreamble:
      "You are the Capture Coach. Talk to the recipient on their phone. " +
      "Be encouraging, plain, and one-step-at-a-time. Never use jargon.",
  },
  install_engineer: {
    role: "install_engineer",
    worker: "site-installer-agent",
    displayName: "Install Engineer",
    owns: ["platform detection", "site install", "daily verification monitor"],
    handsOffTo: ["conductor", "account_strategist"],
    voicePreamble:
      "You are the Install Engineer. Be precise about what you changed and what to verify. " +
      "Surface platform-specific steps clearly.",
  },
  growth_steward: {
    role: "growth_steward",
    worker: "beta-onboarding-agent",
    displayName: "Growth Steward",
    owns: ["beta qualification", "founding-partner nurture", "activation"],
    handsOffTo: ["conductor", "account_strategist"],
    voicePreamble:
      "You are the Growth Steward. Welcome new operators warmly. " +
      "Match the brand voice while protecting beta program standards.",
  },
  agent_gateway: {
    role: "agent_gateway",
    worker: "mcp-agent",
    displayName: "Agent Gateway",
    owns: ["external MCP surface", "x402 payments", "audit log"],
    handsOffTo: ["conductor"],
    voicePreamble:
      "You are the Agent Gateway. Reply to machine clients with structured, deterministic output.",
  },
  edge_traffic: {
    role: "edge_traffic",
    worker: "router",
    displayName: "Edge Traffic",
    owns: ["host routing", "bot vs user split"],
    handsOffTo: [],
    voicePreamble: "", // never talks to humans
  },
};

/* ── Cross-agent events ────────────────────────────────────────────── */

interface BaseEvent {
  /** ISO timestamp. */
  at: string;
  /** Workspace this event belongs to. */
  workspaceId: string;
  /** Role that emitted the event. */
  from: AgentRole;
  /** Optional correlation id (e.g. request_id, session_id). */
  correlationId?: string;
}

export type AgentEvent =
  | (BaseEvent & { type: "submission_completed"; submissionId: string; requestId: string })
  | (BaseEvent & { type: "submission_quality_scored"; submissionId: string; score: number })
  | (BaseEvent & { type: "install_verified"; siteUrl: string; sessionId: string })
  | (BaseEvent & { type: "install_monitor_failed"; siteUrl: string; sessionId: string; reason: string })
  | (BaseEvent & { type: "beta_activated"; userId: string; planTier: string })
  | (BaseEvent & { type: "capture_stalled"; requestId: string; minutesIdle: number })
  | (BaseEvent & { type: "agent_gateway_call"; tool: string; payerId?: string })
  | (BaseEvent & { type: "handoff"; toRole: AgentRole; reason: string; payload?: Record<string, unknown> });

export type AgentEventType = AgentEvent["type"];

/** Helper to stamp `at` automatically. */
export function makeEvent<T extends Omit<AgentEvent, "at">>(e: T): AgentEvent {
  return { at: new Date().toISOString(), ...e } as AgentEvent;
}

/* ── Dispatch contract ─────────────────────────────────────────────── */

export interface DispatchTask<P = unknown> {
  toRole: AgentRole;
  workspaceId: string;
  intent: string;
  payload: P;
  correlationId?: string;
}

export interface DispatchResult<R = unknown> {
  ok: boolean;
  role: AgentRole;
  intent: string;
  result?: R;
  error?: string;
}
