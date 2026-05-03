// ai-analyze-media — runs vision checks on a single captured photo.
// Routed via the centralized aiModelRouter (task: photo_quality_check, vision tier).
//
// Authorization and credit checks happen BEFORE model calls. Public recipient
// traffic must include x-request-token tied to the captured_media row's request;
// workspace traffic must be an active member of the media's workspace.
//
// When capturedMediaId is provided, the model image URL is resolved server-side
// from Supabase/R2 metadata instead of trusting a client-supplied arbitrary URL.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import {
  buildEnvelopeTool,
  callAIWithRouter,
  routerErrorResponse,
} from "../_shared/aiModelRouter.ts";
import {
  CREDIT_COST,
  creditErrorResponse,
  workspaceHasCredits,
} from "../_shared/creditUsage.ts";
import { presignR2Url } from "../_shared/r2Storage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-request-token, x-workspace-id",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const SYSTEM = `You are PhotoBrief's image-quality reviewer. You judge whether a single recipient-submitted photo is usable for a small-business workflow (quotes, claims, intake, support).

Reply ONLY by calling the analyze_photo function. Be specific, kind, and actionable. Severity guidance:
- "pass": photo clearly satisfies the step's intent and quality is acceptable.
- "warn": usable but a better retake would help (slight blur, glare, framing).
- "fail": not usable for this step (wrong subject, too dark, blurry, missing key element).

Per-check messages should be one short sentence the recipient could act on.

Always populate the envelope:
  result.verdict, result.headline, result.checks[], result.extractedDetails[]
  confidence (0..1), flags[] (e.g. low_light, ambiguous_label, low_confidence),
  recipient_feedback (kind sentence to recipient),
  business_summary (one short sentence for the business owner),
  missing_items[] (required items still missing — usually empty for a single photo),
  suggested_next_action (e.g. "Retake closer", "Accept as-is").`;

const TOOL = buildEnvelopeTool({
  name: "analyze_photo",
  description: "Return per-check verdicts and reviewer feedback for one photo.",
  resultSchema: {
    type: "object",
    properties: {
      verdict: { type: "string", enum: ["pass", "warn", "fail"] },
      headline: { type: "string", description: "Short reviewer headline (max 60 chars)." },
      detail: { type: "string", description: "Optional 1-sentence detail." },
      checks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string" },
            severity: { type: "string", enum: ["pass", "warn", "fail"] },
            message: { type: "string" },
          },
          required: ["type", "severity", "message"],
          additionalProperties: false,
        },
      },
      extractedDetails: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            value: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["label", "value"],
          additionalProperties: false,
        },
      },
    },
    required: ["verdict", "headline", "checks"],
    additionalProperties: false,
  },
}) as const;

interface Body {
  stepId?: string;
  stepTitle: string;
  instruction?: string;
  captureType?: string;
  overlayType?: string;
  aiChecks?: string[];
  imageUrl?: string;
  recipientNote?: string;
  capturedMediaId?: string;
  /** When "admin_review", router escalates to the premium tier first. */
  priority?: "admin_review";
}

type AuthzResult =
  | { ok: true; workspaceId: string; requestId?: string; creditCost: number }
  | { ok: false; status: number; error: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!body?.stepTitle || (!body.imageUrl && !body.capturedMediaId)) {
    return json({ error: "stepTitle and either imageUrl or capturedMediaId are required" }, 400);
  }

  const authz = await authorizeAnalyze(req, body);
  if (!authz.ok) return json({ error: authz.error }, authz.status);

  if (authz.creditCost > 0 && !(await workspaceHasCredits(authz.workspaceId, authz.creditCost))) {
    return creditErrorResponse(authz.creditCost, corsHeaders);
  }

  let imageUrl: string;
  try {
    imageUrl = await resolveImageUrlForModel(body.capturedMediaId, body.imageUrl);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Could not resolve media URL" }, 400);
  }

  const userPrompt = [
    `Step: ${body.stepTitle}`,
    body.instruction ? `Instruction to recipient: ${body.instruction}` : null,
    body.captureType ? `Expected capture type: ${body.captureType}` : null,
    body.overlayType ? `Framing overlay shown: ${body.overlayType}` : null,
    body.aiChecks?.length ? `AI checks to evaluate: ${body.aiChecks.join(", ")}` : null,
    body.recipientNote ? `Recipient note: ${body.recipientNote}` : null,
    "",
    "Evaluate the photo and call analyze_photo.",
  ].filter(Boolean).join("\n");

  try {
    const { envelope, model, attempts } = await callAIWithRouter({
      task: "photo_quality_check",
      escalate: body.priority === "admin_review",
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      tools: [TOOL],
      tool_choice: { type: "function", function: { name: "analyze_photo" } },
    });

    const inner = (envelope.result ?? {}) as {
      verdict?: "pass" | "warn" | "fail";
      headline?: string;
      detail?: string;
      checks?: Array<{ type: string; severity: string; message: string; label?: string }>;
      extractedDetails?: Array<{ label: string; value: string; confidence?: number }>;
    };

    const enrichedChecks = (inner.checks ?? []).map((c) => ({
      type: c.type,
      severity: c.severity,
      label: c.label ?? prettyLabel(c.type),
      message: c.message,
    }));

    const result = {
      verdict: inner.verdict ?? "pass",
      headline: inner.headline ?? "Photo received",
      detail: inner.detail,
      checks: enrichedChecks,
      extractedDetails: inner.extractedDetails ?? [],
      confidence: envelope.confidence,
      flags: envelope.flags,
      recipientFeedback: envelope.recipient_feedback,
      businessSummary: envelope.business_summary,
      missingItems: envelope.missing_items,
      suggestedNextAction: envelope.suggested_next_action,
      model,
      attempts,
    };

    if (body.capturedMediaId) {
      await persistAuthorized(body.capturedMediaId, result);
    }

    return json(result, 200);
  } catch (e) {
    const mapped = routerErrorResponse(e, corsHeaders);
    if (mapped) return mapped;
    console.error("ai-analyze-media error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function prettyLabel(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function authorizeAnalyze(req: Request, body: Body): Promise<AuthzResult> {
  if (body.capturedMediaId) {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: media } = await admin
      .from("captured_media")
      .select("id, step_id, submissions!inner(id, workspace_id, request_id)")
      .eq("id", body.capturedMediaId)
      .maybeSingle();
    if (!media) return { ok: false, status: 404, error: "Captured media not found" };

    const submission: any = (media as any).submissions;
    const workspaceId = submission?.workspace_id as string | undefined;
    const requestId = submission?.request_id as string | undefined;
    const submissionId = submission?.id as string | undefined;
    const stepId = (media as any).step_id as string | null;
    if (!workspaceId || !requestId || !submissionId) {
      return { ok: false, status: 400, error: "Captured media is missing request context" };
    }

    if (!(await isAuthorizedForWorkspaceOrRequest(req, workspaceId, requestId))) {
      return { ok: false, status: 403, error: "Not authorized for this media" };
    }

    const isFollowup = await isFirstPassFollowup(admin, submissionId, body.capturedMediaId, stepId);
    return {
      ok: true,
      workspaceId,
      requestId,
      creditCost: isFollowup ? CREDIT_COST.firstPassFollowupPhoto : CREDIT_COST.submittedPhoto,
    };
  }

  const auth = req.headers.get("Authorization");
  if (!auth) return { ok: false, status: 401, error: "Authentication required" };
  const workspaceId = req.headers.get("x-workspace-id");
  if (!workspaceId) return { ok: false, status: 400, error: "x-workspace-id is required" };

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: auth } },
  });
  const { data } = await userClient.auth.getUser();
  if (!data?.user) return { ok: false, status: 401, error: "Invalid auth token" };

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: member } = await admin
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", data.user.id)
    .eq("status", "active")
    .maybeSingle();

  return member
    ? { ok: true, workspaceId, creditCost: CREDIT_COST.submittedPhoto }
    : { ok: false, status: 403, error: "Not a workspace member" };
}

async function resolveImageUrlForModel(capturedMediaId?: string, fallbackUrl?: string): Promise<string> {
  if (!capturedMediaId) {
    if (fallbackUrl && /^https?:\/\//.test(fallbackUrl)) return fallbackUrl;
    throw new Error("No usable image URL provided");
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: media, error } = await admin
    .from("captured_media")
    .select("id, file_url, storage_provider, original_storage_key, processed_storage_key, preview_storage_key")
    .eq("id", capturedMediaId)
    .maybeSingle();
  if (error) throw error;
  if (!media) throw new Error("Captured media not found");

  const m: any = media;
  if (m.storage_provider === "r2") {
    const key = m.original_storage_key ?? m.processed_storage_key ?? m.preview_storage_key;
    if (!key) throw new Error("R2 media has no object key");
    return presignR2Url({ key, method: "GET", expiresSeconds: 900 });
  }

  const filePath = m.file_url as string | null;
  if (!filePath) throw new Error("Media has no file_url");
  if (filePath.startsWith("http")) return filePath;
  const projectUrl = SUPABASE_URL.replace(/\/$/, "");
  return `${projectUrl}/storage/v1/object/public/submission-media/${filePath}`;
}

async function isFirstPassFollowup(
  admin: ReturnType<typeof createClient>,
  submissionId: string,
  capturedMediaId: string,
  stepId: string | null,
): Promise<boolean> {
  if (!stepId) return false;
  const { data } = await admin
    .from("captured_media")
    .select("id")
    .eq("submission_id", submissionId)
    .eq("step_id", stepId)
    .neq("id", capturedMediaId)
    .in("status", ["rejected", "resubmitted"])
    .limit(1);
  return (data?.length ?? 0) > 0;
}

async function isAuthorizedForWorkspaceOrRequest(
  req: Request,
  workspaceId: string,
  requestId: string,
): Promise<boolean> {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const auth = req.headers.get("Authorization");
  if (auth) {
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: auth } },
    });
    const { data: u } = await userClient.auth.getUser();
    if (u?.user) {
      const { data: member } = await admin
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", workspaceId)
        .eq("user_id", u.user.id)
        .eq("status", "active")
        .maybeSingle();
      if (member) return true;
    }
  }

  const token = req.headers.get("x-request-token");
  if (!token) return false;
  const { data: tokReq } = await admin
    .from("photo_brief_requests")
    .select("id")
    .eq("token", token)
    .eq("id", requestId)
    .maybeSingle();
  return !!tokReq;
}

async function persistAuthorized(capturedMediaId: string, result: any) {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  await admin
    .from("captured_media")
    .update({ ai_feedback: result, status: result.verdict === "fail" ? "needs_retake" : "approved" })
    .eq("id", capturedMediaId);

  if (Array.isArray(result.checks)) {
    const rows = result.checks.map((c: any) => ({
      captured_media_id: capturedMediaId,
      check_type: c.type,
      passed: c.severity === "pass",
      score: c.severity === "pass" ? 1 : c.severity === "warn" ? 0.6 : 0.2,
      message: c.message,
    }));
    if (rows.length) await admin.from("ai_check_results").insert(rows);
  }
}
