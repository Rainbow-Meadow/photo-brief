// ai-analyze-media — runs one simple, standardized assessment on a captured photo.
//
// The AI should only answer:
// 1. Does this photo show what the requested step asked for?
// 2. Are there obvious issues that stop the business from using it?
//
// Keep the taxonomy intentionally small and stable. Do not let the model invent
// new issue types or long diagnostic checklists.

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

const PHOTO_ISSUES = [
  "wrong_subject",
  "too_dark",
  "blurry",
  "label_unreadable",
  "glare",
  "too_close_or_cropped",
] as const;

type PhotoIssueType = typeof PHOTO_ISSUES[number];
type Severity = "pass" | "warn" | "fail";

const ISSUE_LABELS: Record<PhotoIssueType, string> = {
  wrong_subject: "Requested subject not visible",
  too_dark: "Too dark",
  blurry: "Blurry",
  label_unreadable: "Label unreadable",
  glare: "Glare",
  too_close_or_cropped: "Too close or cropped",
};

const ISSUE_CUSTOMER_COPY: Record<PhotoIssueType, string> = {
  wrong_subject: "Make sure the requested item or area is clearly in the photo.",
  too_dark: "Try taking it somewhere brighter or turn on a light.",
  blurry: "Hold the camera steady and retake it if the details are hard to see.",
  label_unreadable: "Move closer so the label or text can be read.",
  glare: "Tilt the camera slightly to avoid glare or reflections.",
  too_close_or_cropped: "Back up a little so the full requested subject is visible.",
};

const ISSUE_DEFAULT_SEVERITY: Record<PhotoIssueType, Severity> = {
  wrong_subject: "fail",
  too_dark: "fail",
  blurry: "warn",
  label_unreadable: "fail",
  glare: "warn",
  too_close_or_cropped: "warn",
};

const SYSTEM = `You are PhotoBrief's simple photo checker.

Your job is intentionally narrow:
1. Compare the uploaded photo to the requested photo step.
2. Decide whether the photo is usable.
3. If there is a problem, choose only from this standard issue list:
   - wrong_subject: the requested item/area/subject is missing or unclear
   - too_dark: the image is too dark to use
   - blurry: the image is blurry or shaky
   - label_unreadable: needed text, label, serial number, or document is unreadable
   - glare: glare/reflection blocks important details
   - too_close_or_cropped: the subject is cut off or too zoomed in

Do not invent other issue types.
Do not create a long checklist.
Do not fail a photo for minor imperfections if the business can still use it.

Severity guidance:
- pass: the requested subject is visible and the photo is usable.
- warn: the photo is probably usable, but a clearer retake would help.
- fail: the business likely cannot use the photo as-is.

Use the requested step title and instructions as the source of truth for what the photo should show.

Call analyze_photo exactly once.`;

const TOOL = buildEnvelopeTool({
  name: "analyze_photo",
  description: "Return a simple standardized assessment for one requested photo.",
  resultSchema: {
    type: "object",
    properties: {
      verdict: { type: "string", enum: ["pass", "warn", "fail"] },
      headline: { type: "string", description: "Short customer-safe headline." },
      detail: { type: "string", description: "One short customer-safe sentence." },
      checks: {
        type: "array",
        description: "Only include actual issues found. Return [] when verdict is pass.",
        items: {
          type: "object",
          properties: {
            type: { type: "string", enum: PHOTO_ISSUES as unknown as string[] },
            severity: { type: "string", enum: ["warn", "fail"] },
            message: { type: "string", description: "One short actionable customer sentence." },
          },
          required: ["type", "severity", "message"],
          additionalProperties: false,
        },
      },
      extractedDetails: {
        type: "array",
        description: "Optional visible values, only when clearly readable.",
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
  recipientNote?: string;
  capturedMediaId?: string;
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
  if (!body?.stepTitle || !body.capturedMediaId) {
    return json({ error: "stepTitle and capturedMediaId are required" }, 400);
  }

  const authz = await authorizeAnalyze(req, body);
  if (!authz.ok) return json({ error: authz.error }, authz.status);

  if (authz.creditCost > 0 && !(await workspaceHasCredits(authz.workspaceId, authz.creditCost))) {
    return creditErrorResponse(authz.creditCost, corsHeaders);
  }

  let imageUrl: string;
  try {
    imageUrl = await resolveImageUrlForModel(body.capturedMediaId);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Could not resolve media URL" }, 400);
  }

  const userPrompt = [
    `Requested photo: ${body.stepTitle}`,
    body.instruction ? `Instructions: ${body.instruction}` : null,
    body.captureType ? `Expected capture type: ${body.captureType}` : null,
    body.overlayType ? `Framing guidance: ${body.overlayType}` : null,
    body.recipientNote ? `Recipient note: ${body.recipientNote}` : null,
    "",
    "Assess this uploaded photo against the requested photo. Return only standard issue categories if there is a problem.",
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
      verdict?: Severity;
      headline?: string;
      detail?: string;
      checks?: Array<{ type: string; severity: string; message: string }>;
      extractedDetails?: Array<{ label: string; value: string; confidence?: number }>;
    };

    const checks = normalizeChecks(inner.checks ?? []);
    const verdict = normalizeVerdict(inner.verdict, checks);
    const primaryIssue = checks[0];

    const result = {
      verdict,
      headline: inner.headline ?? headlineFor(verdict),
      detail: inner.detail ?? (primaryIssue ? primaryIssue.message : detailFor(verdict)),
      checks,
      extractedDetails: Array.isArray(inner.extractedDetails) ? inner.extractedDetails : [],
      confidence: envelope.confidence,
      flags: checks.map((c) => c.type),
      recipientFeedback: primaryIssue?.message ?? detailFor(verdict),
      businessSummary: businessSummaryFor(verdict, checks),
      missingItems: verdict === "fail" ? checks.map((c) => c.label) : [],
      suggestedNextAction: suggestedNextActionFor(verdict),
      model,
      attempts,
    };

    await persistAuthorized(body.capturedMediaId, result);

    return json(result, 200);
  } catch (e) {
    const mapped = routerErrorResponse(e, corsHeaders);
    if (mapped) return mapped;
    console.error("ai-analyze-media error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function normalizeChecks(raw: Array<{ type: string; severity: string; message?: string }>) {
  const seen = new Set<string>();
  const normalized: Array<{ type: PhotoIssueType; severity: Severity; label: string; message: string }> = [];

  for (const item of raw) {
    const mappedType = mapIssueType(item.type);
    if (!mappedType || seen.has(mappedType)) continue;
    seen.add(mappedType);

    const defaultSeverity = ISSUE_DEFAULT_SEVERITY[mappedType];
    const severity: Severity = item.severity === "fail" || item.severity === "warn" ? item.severity : defaultSeverity;
    normalized.push({
      type: mappedType,
      severity,
      label: ISSUE_LABELS[mappedType],
      message: sanitizeMessage(item.message) ?? ISSUE_CUSTOMER_COPY[mappedType],
    });
  }

  return normalized.slice(0, 2);
}

function mapIssueType(type: string): PhotoIssueType | null {
  if ((PHOTO_ISSUES as readonly string[]).includes(type)) return type as PhotoIssueType;
  const aliases: Record<string, PhotoIssueType> = {
    blur: "blurry",
    low_light: "too_dark",
    unreadable_text: "label_unreadable",
    wrong_shot: "wrong_subject",
    cropped_subject: "too_close_or_cropped",
    missing_required_item: "wrong_subject",
  };
  return aliases[type] ?? null;
}

function sanitizeMessage(message?: string) {
  if (!message) return undefined;
  const trimmed = message.trim();
  if (!trimmed) return undefined;
  return trimmed.length > 120 ? `${trimmed.slice(0, 117)}…` : trimmed;
}

function normalizeVerdict(verdict: Severity | undefined, checks: Array<{ severity: Severity }>): Severity {
  if (checks.some((c) => c.severity === "fail")) return "fail";
  if (checks.some((c) => c.severity === "warn")) return "warn";
  return verdict === "warn" || verdict === "fail" ? verdict : "pass";
}

function headlineFor(verdict: Severity) {
  if (verdict === "pass") return "Looks good";
  if (verdict === "warn") return "Usable, but could be clearer";
  return "This probably needs a retake";
}

function detailFor(verdict: Severity) {
  if (verdict === "pass") return "This photo should work well.";
  if (verdict === "warn") return "You can keep this photo, or retake it if you want to make it easier to review.";
  return "The business may not be able to use this photo unless it is clearer.";
}

function businessSummaryFor(verdict: Severity, checks: Array<{ label: string }>) {
  if (verdict === "pass") return "Photo appears usable for the requested shot.";
  if (checks.length === 0) return "Photo may need review.";
  return `Photo flagged for: ${checks.map((c) => c.label).join(", ")}.`;
}

function suggestedNextActionFor(verdict: Severity) {
  if (verdict === "pass") return "Continue";
  if (verdict === "warn") return "Keep or retake";
  return "Retake recommended";
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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

  return { ok: false, status: 400, error: "capturedMediaId is required" };
}

async function resolveImageUrlForModel(capturedMediaId: string): Promise<string> {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: media, error } = await admin
    .from("captured_media")
    .select("id, storage_provider, original_storage_key, processed_storage_key, preview_storage_key")
    .eq("id", capturedMediaId)
    .maybeSingle();
  if (error) throw error;
  if (!media) throw new Error("Captured media not found");

  const m: any = media;
  if (m.storage_provider !== "r2") {
    throw new Error("Captured media is not stored in R2");
  }

  const key = m.original_storage_key ?? m.processed_storage_key ?? m.preview_storage_key;
  if (!key) throw new Error("R2 media has no object key");
  return presignR2Url({ key, method: "GET", expiresSeconds: 900 });
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
