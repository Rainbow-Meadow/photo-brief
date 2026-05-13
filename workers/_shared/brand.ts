/**
 * Per-workspace brand context for agent outputs.
 *
 * Voice & visual identity live in two places:
 *   - WORKSPACE_BRAND KV (fast, read by all agents)
 *   - public.business_workspaces / public.brand_profiles (canonical)
 *
 * The Orchestrator hydrates KV from Postgres on workspace change; every
 * other agent only reads from KV. The frontend updates the KV via the
 * `agent-brand` edge function which itself hits the Orchestrator.
 */

import type { AgentRole, AgentCharter } from "./roles";
import { AGENT_CHARTERS } from "./roles";

export interface WorkspaceBrand {
  workspaceId: string;
  name: string;
  logoUrl?: string;
  /** HSL triplet, e.g. "32 88% 59%". */
  accentHsl?: string;
  voice: {
    /** "warm-professional" | "casual" | "technical-direct" | string */
    tone: string;
    /** Signature appended to outbound copy. */
    signature?: string;
    /** BCP-47, defaults to "en". */
    language: string;
  };
  vertical?: string;
  contactPolicy?: {
    hours?: string;
    channels?: Array<"sms" | "email" | "in_app">;
    escalateTo?: string;
  };
  updatedAt: string;
}

export interface BrandKvBinding {
  get(key: string, options?: { type: "json" }): Promise<WorkspaceBrand | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

const KV_PREFIX = "brand:";
const KV_TTL_SECONDS = 60 * 60 * 24; // 24h, refreshed on write

function kvKey(workspaceId: string): string {
  return `${KV_PREFIX}${workspaceId}`;
}

/** Default voice when a workspace has not customised anything. */
export const DEFAULT_BRAND_VOICE: WorkspaceBrand["voice"] = {
  tone: "warm-professional",
  signature: "— PhotoBrief",
  language: "en",
};

export function defaultBrand(workspaceId: string): WorkspaceBrand {
  return {
    workspaceId,
    name: "PhotoBrief",
    voice: DEFAULT_BRAND_VOICE,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Read brand from KV. Falls back to defaultBrand() so callers never have
 * to null-check. Pass `supabase` to hydrate KV on miss.
 */
export async function loadWorkspaceBrand(
  kv: BrandKvBinding | undefined,
  workspaceId: string,
  hydrate?: () => Promise<WorkspaceBrand | null>,
): Promise<WorkspaceBrand> {
  if (kv) {
    const cached = await kv.get(kvKey(workspaceId), { type: "json" });
    if (cached) return cached;
  }
  if (hydrate) {
    const fresh = await hydrate();
    if (fresh) {
      if (kv) {
        await kv.put(kvKey(workspaceId), JSON.stringify(fresh), {
          expirationTtl: KV_TTL_SECONDS,
        });
      }
      return fresh;
    }
  }
  return defaultBrand(workspaceId);
}

/** Write brand to KV. Only the Orchestrator should call this. */
export async function writeWorkspaceBrand(
  kv: BrandKvBinding,
  brand: WorkspaceBrand,
): Promise<void> {
  await kv.put(kvKey(brand.workspaceId), JSON.stringify(brand), {
    expirationTtl: KV_TTL_SECONDS,
  });
}

/* ── Branded prompt builder ────────────────────────────────────────── */

export interface BrandedPromptInput {
  /** What this agent is trying to do. */
  task: string;
  /** Optional extra system context (e.g. dynamic data). */
  context?: string;
}

export interface BrandedPromptOutput {
  system: string;
  user: string;
}

/**
 * Wrap a raw task with the role's charter + the workspace's brand voice.
 * Use the returned `{system, user}` pair with workersAiChat or
 * any OpenAI-compatible call.
 */
export function brandedPrompt(
  role: AgentRole,
  brand: WorkspaceBrand,
  input: BrandedPromptInput,
): BrandedPromptOutput {
  const charter: AgentCharter = AGENT_CHARTERS[role];
  const voice = brand.voice;

  const systemParts: string[] = [
    charter.voicePreamble,
    `You represent the workspace "${brand.name}".`,
    `Tone: ${voice.tone}.`,
    `Language: ${voice.language}.`,
    voice.signature ? `Sign off with: ${voice.signature}` : "",
    brand.vertical ? `The customer's business vertical is: ${brand.vertical}.` : "",
    input.context ? `\nContext:\n${input.context}` : "",
  ];

  return {
    system: systemParts.filter(Boolean).join("\n"),
    user: input.task,
  };
}
