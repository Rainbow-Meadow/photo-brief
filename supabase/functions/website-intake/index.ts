// website-intake
// Public webhook + hosted intake endpoint.
//
// GET  /functions/v1/website-intake/{public_token}
//      Returns safe public config for PhotoBrief-hosted intake forms.
//
// POST /functions/v1/website-intake/{public_token}
//      Body can be normalized fields or arbitrary form payload mapped by
//      intake_field_mappings.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import {
  buildEnvelopeTool,
  callAIWithRouter,
  routerErrorResponse,
} from "../_shared/aiModelRouter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = Deno.env.get("APP_PUBLIC_URL") ?? "https://photobrief.ai";

type PlanTier = "free" | "starter" | "pro" | "team" | "business";

interface IntakeSource {
  id: string;
  workspace_id: string;
  name: string;
  public_token: string;
  enabled: boolean;
  default_guide_id: string | null;
  intro_message: string | null;
  auto_send: boolean;
}

interface NormalizedLead {
  name: string;
  email?: string | null;
  phone?: string | null;
  requestType?: string | null;
  message?: string | null;
  address?: string | null;
}

interface TemplateRule {
  id: string;
  match_type: "exact" | "contains";
  match_value: string;
  guide_id: string;
  priority: number;
  photo_guides?: { name?: string | null; description?: string | null } | null;
}

const CLASSIFY_TOOL = buildEnvelopeTool({
  name: "choose_intake_template",
  description: "Choose the best PhotoBrief template for a website inquiry.",
  resultSchema: {
    type: "object",
    properties: {
      ruleId: { type: "string", description: "The chosen intake rule id, or empty string when unsure." },
      confidence: { type: "number", description: "0-1 confidence." },
      reason: { type: "string", description: "Short reason." },
    },
    required: ["ruleId", "confidence", "reason"],
    additionalProperties: false,
  },
}) as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const token = req.url.split("/website-intake/")[1]?.split(/[/?#]/)[0];
  if (!token) return json({ error: "Missing intake token" }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: source, error: sourceErr } = await admin
    .from("intake_sources")
    .select("*")
    .eq("public_token", token)
    .maybeSingle();
  if (sourceErr) return json({ error: sourceErr.message }, 500);
  if (!source) return json({ error: "Intake source not found" }, 404);

  const intake = source as IntakeSource;
  if (!intake.enabled) return json({ error: "This intake source is disabled" }, 403);

  const { data: workspace, error: workspaceErr } = await admin
    .from("business_workspaces")
    .select("plan")
    .eq("id", intake.workspace_id)
    .maybeSingle();
  if (workspaceErr) return json({ error: workspaceErr.message }, 500);

  const plan = ((workspace as any)?.plan ?? "free") as PlanTier;
  if (!canUseWebsiteIntake(plan)) {
    return json(
      {
        ok: false,
        error: "Website Intake requires Pro",
        message: "This PhotoBrief intake link is not active on the current plan. Ask the business to upgrade to Pro or send a manual PhotoBrief link.",
        requiredPlan: "pro",
      },
      402,
    );
  }

  if (req.method === "GET") return getPublicConfig(admin, intake);
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  let eventId: string | null = null;
  try {
    const { data: mappings } = await admin
      .from("intake_field_mappings")
      .select("photobrief_field, external_field")
      .eq("intake_source_id", intake.id);

    const lead = normalizeLead(payload, mappings ?? []);
    const baseEvent = {
      workspace_id: intake.workspace_id,
      intake_source_id: intake.id,
      raw_payload: payload,
      normalized_customer: lead,
      request_type: lead.requestType ?? null,
      message: lead.message ?? null,
      status: "received",
    };
    const { data: event } = await admin.from("intake_events").insert(baseEvent).select("id").single();
    eventId = event?.id ?? null;

    if (!lead.name || (!lead.email && !lead.phone)) {
      await markEvent(admin, eventId, { status: "error", error: "Customer name and email or phone are required" });
      return json({ error: "Customer name and email or phone are required" }, 400);
    }

    const match = await matchGuide(admin, intake, lead);
    if (!match.guideId) {
      await markEvent(admin, eventId, { status: "no_template_match", error: "No intake rule, AI match, or default template matched" });
      return json({
        ok: false,
        status: "no_template_match",
        message: "No template matched this request. Add a default template or mapping rule.",
      }, 200);
    }

    const customerId = await findOrCreateCustomer(admin, intake.workspace_id, lead);
    const customMessage = buildIntro(intake.intro_message, lead);

    const { data: requestRow, error: reqErr } = await admin
      .from("photo_brief_requests")
      .insert({
        workspace_id: intake.workspace_id,
        guide_id: match.guideId,
        recipient_name: lead.name,
        recipient_email: lead.email ?? null,
        recipient_phone: lead.phone ?? null,
        custom_message: customMessage,
        customer_id: customerId,
        status: "sent",
      })
      .select("id, token")
      .single();
    if (reqErr) throw reqErr;

    let delivery: "sent" | "logged_only" | "skipped" = "skipped";
    if (intake.auto_send && lead.email) {
      delivery = await sendInitialEmail(admin, {
        workspaceId: intake.workspace_id,
        requestId: requestRow.id,
        recipientEmail: lead.email,
        recipientName: lead.name,
        requestToken: requestRow.token,
        customMessage,
      });
    } else {
      await admin.from("request_messages").insert({
        request_id: requestRow.id,
        workspace_id: intake.workspace_id,
        kind: "initial",
        channel: lead.email ? "email" : "sms",
        to_address: lead.email ?? lead.phone ?? null,
        subject: "Photo request created",
        body: `${APP_URL}/r/${requestRow.token}`,
        sent_by: null,
        metadata: { delivery: "skipped", source: "website_intake" },
      });
    }

    await admin
      .from("customers")
      .update({ last_request_at: new Date().toISOString() } as any)
      .eq("id", customerId);

    await markEvent(admin, eventId, {
      status: "request_created",
      matched_rule_id: match.ruleId,
      matched_guide_id: match.guideId,
      customer_id: customerId,
      created_request_id: requestRow.id,
    });

    return json({
      ok: true,
      status: "request_created",
      requestId: requestRow.id,
      requestLink: `${APP_URL}/r/${requestRow.token}`,
      customerId,
      matchedGuideId: match.guideId,
      delivery,
      matchSource: match.source,
    });
  } catch (e) {
    const mapped = routerErrorResponse(e, corsHeaders);
    if (mapped) return mapped;
    await markEvent(admin, eventId, { status: "error", error: e instanceof Error ? e.message : String(e) });
    console.error("website-intake error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function canUseWebsiteIntake(plan: PlanTier) {
  return plan === "pro" || plan === "team" || plan === "business";
}

async function getPublicConfig(admin: ReturnType<typeof createClient>, intake: IntakeSource) {
  const [{ data: ws }, { data: brand }, { data: rules }] = await Promise.all([
    admin.from("business_workspaces").select("name").eq("id", intake.workspace_id).maybeSingle(),
    admin
      .from("brand_profiles")
      .select("logo_url, primary_color, intro_message, hide_photobrief_branding")
      .eq("workspace_id", intake.workspace_id)
      .maybeSingle(),
    admin
      .from("intake_template_rules")
      .select("match_value")
      .eq("intake_source_id", intake.id)
      .eq("enabled", true)
      .order("priority", { ascending: true }),
  ]);

  const options = Array.from(
    new Set((rules ?? []).map((r: any) => String(r.match_value ?? "").trim()).filter(Boolean)),
  ).slice(0, 12);

  return json({
    ok: true,
    sourceName: intake.name,
    businessName: (ws as any)?.name ?? "this business",
    logoUrl: (brand as any)?.logo_url ?? null,
    brandColor: (brand as any)?.primary_color ?? null,
    hidePhotobriefBranding: Boolean((brand as any)?.hide_photobrief_branding),
    introMessage:
      intake.intro_message ??
      (brand as any)?.intro_message ??
      "Tell us what you need help with. We may ask for a few photos next so we can help faster.",
    requestTypeOptions: options,
  });
}

function normalizeLead(payload: Record<string, unknown>, mappings: Array<{ photobrief_field: string; external_field: string }>): NormalizedLead {
  const mapped = new Map(mappings.map((m) => [m.photobrief_field, m.external_field]));
  const get = (field: string, fallbacks: string[]) => {
    const external = mapped.get(field);
    if (external && payload[external] != null) return asText(payload[external]);
    for (const f of fallbacks) {
      if (payload[f] != null) return asText(payload[f]);
    }
    return "";
  };
  const first = get("name", ["name", "full_name", "customer_name", "first_name"]);
  const last = asText(payload.last_name);
  const name = first && last && first !== last ? `${first} ${last}` : first;
  return {
    name: name.trim(),
    email: clean(get("email", ["email", "customer_email", "email_address"])),
    phone: clean(get("phone", ["phone", "customer_phone", "phone_number", "mobile"])),
    requestType: clean(get("request_type", ["request_type", "service", "service_type", "category", "subject"])),
    message: clean(get("message", ["message", "details", "description", "comments", "notes"])),
    address: clean(get("address", ["address", "street_address", "job_address", "service_address"])),
  };
}

function asText(value: unknown) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function clean(value: string) {
  const v = value.trim();
  return v.length ? v : null;
}

async function matchGuide(admin: ReturnType<typeof createClient>, source: IntakeSource, lead: NormalizedLead) {
  const { data: rules } = await admin
    .from("intake_template_rules")
    .select("id, match_type, match_value, guide_id, priority, photo_guides(name, description)")
    .eq("intake_source_id", source.id)
    .eq("enabled", true)
    .order("priority", { ascending: true });

  const typedRules = (rules ?? []) as TemplateRule[];
  const haystack = `${lead.requestType ?? ""} ${lead.message ?? ""}`.toLowerCase();
  for (const rule of typedRules) {
    const needle = String(rule.match_value ?? "").toLowerCase().trim();
    if (!needle) continue;
    const matched = rule.match_type === "exact"
      ? (lead.requestType ?? "").toLowerCase().trim() === needle
      : haystack.includes(needle);
    if (matched) return { guideId: rule.guide_id, ruleId: rule.id, source: "rule" as const };
  }

  const ai = await classifyGuideWithAI(typedRules, lead);
  if (ai?.guideId) return { ...ai, source: "ai" as const };

  return { guideId: source.default_guide_id, ruleId: null as string | null, source: source.default_guide_id ? "fallback" as const : "none" as const };
}

async function classifyGuideWithAI(rules: TemplateRule[], lead: NormalizedLead): Promise<{ guideId: string; ruleId: string | null } | null> {
  if (rules.length < 2) return null;
  const options = rules.slice(0, 12).map((r) => ({
    ruleId: r.id,
    matchValue: r.match_value,
    templateName: r.photo_guides?.name ?? "Template",
    description: r.photo_guides?.description ?? "",
  }));

  try {
    const { envelope } = await callAIWithRouter({
      task: "classification",
      messages: [
        {
          role: "system",
          content:
            "You classify a small-business website inquiry into one of the provided PhotoBrief routing rules. Pick only when the fit is clear. If unclear, return an empty ruleId and low confidence.",
        },
        {
          role: "user",
          content: JSON.stringify({
            inquiry: {
              requestType: lead.requestType,
              message: lead.message,
              address: lead.address,
            },
            options,
          }),
        },
      ],
      tools: [CLASSIFY_TOOL],
      tool_choice: { type: "function", function: { name: "choose_intake_template" } },
    });
    const result = (envelope.result ?? {}) as { ruleId?: string; confidence?: number };
    if (!result.ruleId || (result.confidence ?? 0) < 0.7) return null;
    const rule = rules.find((r) => r.id === result.ruleId);
    return rule ? { guideId: rule.guide_id, ruleId: rule.id } : null;
  } catch (e) {
    console.warn("website-intake AI classification skipped", e);
    return null;
  }
}

async function findOrCreateCustomer(admin: ReturnType<typeof createClient>, workspaceId: string, lead: NormalizedLead) {
  let existing = null as any;
  if (lead.email) {
    const { data } = await admin
      .from("customers")
      .select("id")
      .eq("workspace_id", workspaceId)
      .ilike("email", lead.email)
      .maybeSingle();
    existing = data;
  }
  if (!existing && lead.phone) {
    const { data } = await admin
      .from("customers")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("phone", lead.phone)
      .maybeSingle();
    existing = data;
  }
  if (existing?.id) return existing.id as string;

  const { data, error } = await admin
    .from("customers")
    .insert({
      workspace_id: workspaceId,
      display_name: lead.name,
      email: lead.email ?? null,
      phone: lead.phone ?? null,
      preferred_contact_method: lead.email ? "email" : lead.phone ? "sms" : "unknown",
      notes: [lead.requestType, lead.message, lead.address].filter(Boolean).join("\n\n") || null,
      tags: ["website-intake"],
      metadata: { source: "website_intake", requestType: lead.requestType, address: lead.address },
    } as any)
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

function buildIntro(intro: string | null, lead: NormalizedLead) {
  if (intro?.trim()) return intro.trim();
  const context = lead.requestType ? ` for your ${lead.requestType} request` : "";
  return `Thanks for reaching out${context}. Please send these quick photos so we can help faster.`;
}

async function sendInitialEmail(
  admin: ReturnType<typeof createClient>,
  args: {
    workspaceId: string;
    requestId: string;
    recipientEmail: string;
    recipientName: string;
    requestToken: string;
    customMessage: string;
  },
): Promise<"sent" | "logged_only"> {
  const [{ data: ws }] = await Promise.all([
    admin.from("business_workspaces").select("name").eq("id", args.workspaceId).maybeSingle(),
  ]);
  const businessName = (ws as any)?.name ?? "PhotoBrief";
  const firstName = args.recipientName.split(" ")[0] || "there";
  const link = `${APP_URL}/r/${args.requestToken}`;

  let delivery: "sent" | "logged_only" = "logged_only";
  let error: string | undefined;
  const { error: sendErr } = await admin.functions.invoke("send-transactional-email", {
    body: {
      templateName: "recipient-request-link",
      recipientEmail: args.recipientEmail,
      idempotencyKey: `website-intake-${args.requestId}`,
      templateData: {
        recipientName: firstName,
        businessName,
        introMessage: args.customMessage,
        link,
        estimatedMinutes: 2,
      },
    },
  });
  if (sendErr) error = sendErr.message;
  else delivery = "sent";

  await admin.from("request_messages").insert({
    request_id: args.requestId,
    workspace_id: args.workspaceId,
    kind: "initial",
    channel: "email",
    to_address: args.recipientEmail,
    subject: `${businessName}: a quick photo request`,
    body: `Hi ${firstName}, ${businessName} needs a few quick photos. Open here: ${link}`,
    sent_by: null,
    metadata: { delivery, source: "website_intake", ...(error ? { error } : {}) },
  });
  return delivery;
}

async function markEvent(admin: ReturnType<typeof createClient>, eventId: string | null, patch: Record<string, unknown>) {
  if (!eventId) return;
  await admin.from("intake_events").update(patch as any).eq("id", eventId);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
