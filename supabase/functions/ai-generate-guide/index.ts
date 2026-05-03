// ai-generate-guide — Pro-gated AI request/template scaffolding.
//
// The builder should feel intentionally simple: collect a few useful inputs
// first, then generate a short editable request. No admin jargon, no sprawling
// setup, no invented complexity.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import {
  buildEnvelopeTool,
  callAIWithRouter,
  routerErrorResponse,
} from "../_shared/aiModelRouter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PRO_TIERS = new Set(["pro", "team", "business"]);
const STANDARD_CHECKS = ["wrong_subject", "too_dark", "blurry", "label_unreadable", "glare", "too_close_or_cropped"];

const SYSTEM = `You are PhotoBrief's request builder.

Your job is to turn a few simple business inputs into a clean customer photo request.

Principles:
- Consumer app feel. Simple, warm, direct.
- No admin language. No executive language. No operational jargon.
- The customer should understand each photo step instantly.
- Respect the requested photo count exactly when one is provided.
- Include every must-have photo the business listed.
- Include every required customer question the business listed.
- Do not pad with unnecessary questions.
- Prefer fewer, clearer steps over comprehensive complexity.

Photo step rules:
- Each step title should be 2–7 words.
- Each instruction should be one plain sentence.
- Use captureType "photo" unless the business clearly requested a document.
- Output should be easy to finish in 5 minutes or less.

Always call build_guide once and populate the envelope.`;

const TOOL = buildEnvelopeTool({
  name: "build_guide",
  description: "Return a simple editable PhotoBrief request draft.",
  resultSchema: {
    type: "object",
    properties: {
      title: { type: "string" },
      category: { type: "string" },
      introMessage: { type: "string" },
      assistantReply: { type: "string", description: "Friendly short reply describing what was built." },
      steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            instruction: { type: "string" },
            captureType: { type: "string", enum: ["photo", "document"] },
            required: { type: "boolean" },
          },
          required: ["title", "instruction", "captureType"],
          additionalProperties: false,
        },
      },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            prompt: { type: "string" },
            inputType: {
              type: "string",
              enum: ["short_text", "long_text", "single_select", "multi_select", "yes_no", "number", "date"],
            },
            options: { type: "array", items: { type: "string" } },
            required: { type: "boolean" },
          },
          required: ["prompt", "inputType"],
          additionalProperties: false,
        },
      },
    },
    required: ["title", "introMessage", "steps", "assistantReply"],
    additionalProperties: false,
  },
}) as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

  let body: { prompt?: string; category?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const prompt = (body?.prompt ?? "").trim();
  if (!prompt) return json({ error: "prompt is required" }, 400);

  // Plan gate.
  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "Sign in required." }, 401);
  const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: auth } } });
  const { data: u } = await userClient.auth.getUser();
  if (!u?.user) return json({ error: "Sign in required." }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: ws } = await admin
    .from("workspace_members")
    .select("workspace_id, business_workspaces!inner(plan_tier)")
    .eq("user_id", u.user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  const tier = (ws as any)?.business_workspaces?.plan_tier;
  if (!tier || !PRO_TIERS.has(tier)) {
    return json(
      { error: "AI guide generation requires the Pro plan or higher.", requiredPlan: "pro" },
      402,
    );
  }

  try {
    const { envelope, model, attempts } = await callAIWithRouter({
      task: "guide_generation",
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Use these setup notes to build the request.\n\n${prompt}${body.category ? `\n\nLikely category: ${body.category}` : ""}`,
        },
      ],
      tools: [TOOL],
      tool_choice: { type: "function", function: { name: "build_guide" } },
    });

    const args = (envelope.result ?? {}) as any;
    if (!args.title) return json({ error: "AI returned no draft" }, 502);

    return json({
      draft: {
        title: args.title,
        category: args.category ?? "Custom",
        introMessage: args.introMessage,
        steps: normalizeSteps(args.steps ?? []),
        questions: normalizeQuestions(args.questions ?? []),
      },
      assistantReply: args.assistantReply ?? `Built "${args.title}". Review it, make any quick edits, then send or save it as a template.`,
      confidence: envelope.confidence,
      flags: envelope.flags,
      businessSummary: envelope.business_summary,
      suggestedNextAction: envelope.suggested_next_action,
      model,
      attempts,
    });
  } catch (e) {
    const mapped = routerErrorResponse(e, corsHeaders);
    if (mapped) return mapped;
    console.error("ai-generate-guide error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function normalizeSteps(steps: any[]) {
  const safe = Array.isArray(steps) && steps.length > 0 ? steps : [{ title: "Photo I need", instruction: "Take a clear, well-lit photo of the item or issue.", captureType: "photo", required: true }];
  return safe.slice(0, 8).map((s: any, i: number) => ({
    orderIndex: i,
    title: String(s.title || `Photo ${i + 1}`).slice(0, 70),
    instructions: String(s.instruction || s.instructions || "Take a clear, well-lit photo.").slice(0, 180),
    shotType: s.captureType === "document" ? "document" : "photo",
    overlayType: "full_area",
    required: s.required ?? true,
    aiChecks: STANDARD_CHECKS,
  }));
}

function normalizeQuestions(questions: any[]) {
  if (!Array.isArray(questions)) return [];
  return questions.slice(0, 6).map((q: any, i: number) => ({
    orderIndex: i,
    prompt: String(q.prompt || "Question for the customer").slice(0, 120),
    inputType: q.inputType ?? "short_text",
    options: Array.isArray(q.options) ? q.options : undefined,
    required: q.required ?? false,
  }));
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
