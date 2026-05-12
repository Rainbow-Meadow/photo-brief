/**
 * Shared Workers AI adapter for PhotoBrief.
 *
 * Wraps the env.AI binding with a tiny envelope-shaped helper used by
 * worker code (assistant-agent classification, capture-agent guardrails, …).
 *
 * The Lovable AI Gateway remains the primary path for envelope-grade
 * structured output inside edge functions (see
 * supabase/functions/_shared/aiModelRouter.ts). This helper is for
 * worker-side, ephemeral, low-stakes tasks where Workers AI inference
 * runs on the same Cloudflare runtime — no extra hop, sub-100ms, free
 * within the Workers Paid plan's neuron budget.
 *
 * Pilot model (cheap tier): @cf/meta/llama-3.2-3b-instruct.
 * Catalog reference: docs/cloudflare-workers-ai-catalog.md
 */

export interface AiBinding {
  run<T = unknown>(
    model: string,
    input: Record<string, unknown>,
    options?: { gateway?: { id: string } },
  ): Promise<T>;
}

export type WorkersAiTier = "cheap" | "default" | "vision" | "guardrail";

const TIER_MODEL: Record<WorkersAiTier, string> = {
  cheap: "@cf/meta/llama-3.2-3b-instruct",
  default: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  vision: "@cf/meta/llama-4-scout-17b-16e-instruct",
  guardrail: "@cf/meta/llama-guard-3-8b",
};

export function modelForTier(tier: WorkersAiTier): string {
  return TIER_MODEL[tier];
}

export interface WorkersAiChatInput {
  system?: string;
  user: string;
  /** Optional override; defaults to the tier's pilot model. */
  model?: string;
  /** Request a single JSON object as response (Workers AI native option). */
  responseFormatJson?: boolean;
  maxTokens?: number;
}

export interface WorkersAiChatResult {
  text: string;
  model: string;
}

/**
 * Run a chat-completion against Workers AI. Throws on missing binding so
 * callers can fall back to whatever they were doing before — never fail
 * silently.
 */
export async function workersAiChat(
  ai: AiBinding | undefined,
  tier: WorkersAiTier,
  input: WorkersAiChatInput,
): Promise<WorkersAiChatResult> {
  if (!ai) throw new Error("workers_ai_binding_missing");
  const model = input.model ?? modelForTier(tier);

  const messages: Array<{ role: string; content: string }> = [];
  if (input.system) messages.push({ role: "system", content: input.system });
  messages.push({ role: "user", content: input.user });

  const payload: Record<string, unknown> = {
    messages,
    max_tokens: input.maxTokens ?? 256,
  };
  if (input.responseFormatJson) {
    payload.response_format = { type: "json_object" };
  }

  const result = await ai.run<{ response?: string; result?: { response?: string } }>(
    model,
    payload,
  );

  // Workers AI returns either { response } or { result: { response } }
  // depending on streaming / model family.
  const text =
    (typeof result === "object" && result && "response" in result && (result as { response?: string }).response) ||
    (typeof result === "object" && result && "result" in result && (result as { result?: { response?: string } }).result?.response) ||
    "";

  return { text: typeof text === "string" ? text : "", model };
}

/**
 * Convenience: ask a Workers AI cheap-tier model to classify a short input
 * into one of `labels`. Returns the chosen label or null when the model's
 * output doesn't match. No retries — this is best-effort.
 */
export async function workersAiClassify(
  ai: AiBinding | undefined,
  text: string,
  labels: string[],
): Promise<string | null> {
  const { text: out } = await workersAiChat(ai, "cheap", {
    system:
      "You are a strict classifier. Reply with EXACTLY one of the allowed labels and nothing else.",
    user: `Allowed labels: ${labels.join(", ")}\n\nInput: ${text}`,
    maxTokens: 16,
  });
  const cleaned = out.trim().split(/\s+/)[0]?.replace(/[^a-zA-Z0-9_-]/g, "") ?? "";
  const match = labels.find((l) => l.toLowerCase() === cleaned.toLowerCase());
  return match ?? null;
}
