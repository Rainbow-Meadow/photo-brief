// website-intake
// Public webhook + hosted intake endpoint.
//
// POST /functions/v1/website-intake/{public_token}
// Body can be either normalized fields or arbitrary form payload mapped by
// intake_field_mappings.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = Deno.env.get("APP_PUBLIC_URL") ?? "https://photobrief.ai";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const token = req.url.split("/website-intake/")[1]?.split(/[/?#]/)[0];
  if (!token) return json({ error: "Missing intake token" }, 400);

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

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
      await markEvent(admin, eventId, { status: "no_template_match", error: "No intake rule or default template matched" });
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
    });
  } catch (e) {
    await markEvent(admin, eventId, { status: "error", error: e instanceof Error ? e.message : String(e) });
    console.error("website-intake error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

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
    .select("id, match_type, match_value, guide_id, priority")
    .eq("intake_source_id", source.id)
    .eq("enabled", true)
    .order("priority", { ascending: true });

  const haystack = `${lead.requestType ?? ""} ${lead.message ?? ""}`.toLowerCase();
  for (const rule of rules ?? []) {
    const needle = String((rule as any).match_value ?? "").toLowerCase().trim();
    if (!needle) continue;
    const matched = (rule as any).match_type === "exact"
      ? (lead.requestType ?? "").toLowerCase().trim() === needle
      : haystack.includes(needle);
    if (matched) return { guideId: (rule as any).guide_id as string, ruleId: (rule as any).id as string };
  }

  return { guideId: source.default_guide_id, ruleId: null as string | null };
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
