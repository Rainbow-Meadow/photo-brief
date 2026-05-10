// demo-discovery — Public conversational reverse-form demo.
//
// Visitor describes their service and a typical photo request. The AI either
// asks ONE clarifying follow-up or generates a tailored guide and creates a
// real PhotoBrief request inside the hidden Demo workspace. The visitor is
// then redirected to /r/<token> to walk through the recipient capture flow.
//
// No auth. Cleaned up daily by demo-cleanup.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import {
  buildEnvelopeTool,
  callAIWithRouter,
  routerErrorResponse,
} from "../_shared/aiModelRouter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DEMO_WORKSPACE_ID = Deno.env.get("DEMO_WORKSPACE_ID")!;
const TURNSTILE_SECRET = Deno.env.get("TURNSTILE_SECRET_KEY") ?? "";

const STANDARD_CHECKS = ["wrong_subject", "too_dark", "blurry", "label_unreadable", "glare", "too_close_or_cropped"];

const SYSTEM = `You are PhotoBrief's reverse-form designer.

A visitor is trying PhotoBrief on their own business. They describe what they
do (e.g. plumber, roofer, HVAC tech, property manager, auto detailer, photographer)
and a typical photo request from their customers (e.g. "leaking faucet under
the kitchen sink", "missing shingles after a storm").

Your job: design the perfect 3–5 step photo brief THEIR customer would walk
through. Each step is something the customer should photograph, written in
plain consumer language ("Wide shot of the leak", "Close-up of the drip point").

Decide:
1. If you have enough information, generate the guide.
2. If ONE short clarifier would meaningfully improve the brief, ask it.
   (Examples: "Is this for residential or commercial customers?",
   "Do you usually need to see the model number?")
   Never ask more than one clarifier total. Never ask for personal info.

Principles:
- Consumer app feel. Warm, direct, never jargon.
- Each step title 2–7 words.
- Each instruction one plain sentence.
- 3–5 steps. Default to 4. Never more than 5.
- Use captureType "document" only when clearly a label/receipt/sticker.

Always call demo_response once.`;

const TOOL = buildEnvelopeTool({
  name: "demo_response",
  description: "Either ask one clarifier OR generate the final guide.",
  resultSchema: {
    type: "object",
    properties: {
      action: { type: "string", enum: ["clarify", "generate"] },
      clarifyingQuestion: {
        type: "string",
        description: "Required when action='clarify'. One short question.",
      },
      title: { type: "string", description: "Brief title, e.g. 'Leaking faucet inspection'." },
      introMessage: { type: "string", description: "1–2 sentence friendly intro shown to the customer." },
      steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            instruction: { type: "string" },
            captureType: { type: "string", enum: ["photo", "document"] },
          },
          required: ["title", "instruction", "captureType"],
          additionalProperties: false,
        },
      },
    },
    required: ["action"],
    additionalProperties: false,
  },
}) as const;

interface DiscoveryBody {
  serviceType?: string;
  scenario?: string;
  clarifierAnswer?: string;
  clarifyingQuestionAsked?: string;
  visitorName?: string;
  visitorEmail?: string;
  finalize?: boolean;
  turnstileToken?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!DEMO_WORKSPACE_ID) return json({ error: "Demo workspace not configured" }, 500);

  let body: DiscoveryBody;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const serviceType = (body.serviceType ?? "").trim().slice(0, 120);
  const scenario = (body.scenario ?? "").trim().slice(0, 600);
  if (!serviceType || !scenario) return json({ error: "serviceType and scenario are required" }, 400);

  // Build user message including any prior clarifier round.
  const userParts = [
    `Service: ${serviceType}`,
    `Typical photo request: ${scenario}`,
  ];
  if (body.clarifyingQuestionAsked && body.clarifierAnswer) {
    userParts.push(`Clarifier asked: ${body.clarifyingQuestionAsked}`);
    userParts.push(`Visitor answered: ${body.clarifierAnswer.slice(0, 400)}`);
    userParts.push(`You already asked one clarifier — now generate the guide.`);
  }

  try {
    const { envelope } = await callAIWithRouter({
      task: "guide_generation",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userParts.join("\n") },
      ],
      tools: [TOOL],
      tool_choice: { type: "function", function: { name: "demo_response" } },
    });

    const args = (envelope.result ?? {}) as any;

    // If AI wants to clarify and we haven't finalized yet, return the question.
    if (args.action === "clarify" && !body.finalize && !body.clarifyingQuestionAsked) {
      const q = String(args.clarifyingQuestion ?? "").trim();
      if (!q) {
        // Treat as generate fallback
      } else {
        return json({ status: "clarify", clarifyingQuestion: q });
      }
    }

    // Need a generated guide to proceed.
    const steps = Array.isArray(args.steps) ? args.steps : [];
    if (!args.title || steps.length === 0) {
      return json({ error: "Could not generate brief. Try again." }, 502);
    }

    // Visitor contact required to actually create the demo request.
    const email = (body.visitorEmail ?? "").trim().toLowerCase();
    const name = (body.visitorName ?? "").trim().slice(0, 80) || "Demo visitor";
    if (!body.finalize) {
      // Caller is just generating preview — return the draft without creating a request.
      return json({
        status: "draft",
        draft: {
          title: String(args.title).slice(0, 80),
          introMessage: String(args.introMessage ?? "").slice(0, 280),
          steps: normalizeSteps(steps),
        },
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "A valid email is required to generate the brief." }, 400);
    }

    // Turnstile (only enforced if a secret + token are present).
    if (TURNSTILE_SECRET) {
      if (!body.turnstileToken) return json({ error: "Verification required." }, 400);
      const ok = await verifyTurnstile(body.turnstileToken, req.headers.get("cf-connecting-ip") ?? undefined);
      if (!ok) return json({ error: "Verification failed." }, 400);
    }

    // Create guide + steps + request in the demo workspace.
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const guideName = String(args.title).slice(0, 80);
    const intro = String(args.introMessage ?? `Hi! A few quick photos of the ${serviceType.toLowerCase()} situation.`).slice(0, 280);

    const { data: guide, error: guideErr } = await admin
      .from("photo_guides")
      .insert({
        workspace_id: DEMO_WORKSPACE_ID,
        name: guideName,
        description: scenario.slice(0, 240),
        is_active: true,
        is_request_scoped: true,
      })
      .select("id")
      .single();
    if (guideErr) throw guideErr;

    const stepRows = normalizeSteps(steps).map((s, i) => ({
      guide_id: guide.id,
      order_index: i,
      title: s.title,
      instruction: s.instruction,
      capture_type: s.captureType,
      overlay_type: "full_area",
      required: true,
      ai_checks: STANDARD_CHECKS,
    }));
    const { error: stepsErr } = await admin.from("guide_steps").insert(stepRows);
    if (stepsErr) throw stepsErr;

    const { data: request, error: reqErr } = await admin
      .from("photo_brief_requests")
      .insert({
        workspace_id: DEMO_WORKSPACE_ID,
        guide_id: guide.id,
        recipient_name: name,
        recipient_email: email,
        custom_message: intro,
        status: "sent",
        is_demo: true,
      })
      .select("id, token")
      .single();
    if (reqErr) throw reqErr;

    return json({
      status: "ready",
      requestId: request.id,
      requestLink: `/r/${request.token}`,
      title: guideName,
      stepCount: stepRows.length,
    });
  } catch (e) {
    const mapped = routerErrorResponse(e, corsHeaders);
    if (mapped) return mapped;
    console.error("demo-discovery error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function normalizeSteps(steps: any[]) {
  return steps.slice(0, 5).map((s: any, i: number) => ({
    title: String(s.title || `Photo ${i + 1}`).slice(0, 70),
    instruction: String(s.instruction || "Take a clear, well-lit photo.").slice(0, 180),
    captureType: s.captureType === "document" ? "document" : "photo",
  }));
}

async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  try {
    const form = new FormData();
    form.append("secret", TURNSTILE_SECRET);
    form.append("response", token);
    if (ip) form.append("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const j = await r.json();
    return !!j.success;
  } catch { return false; }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
