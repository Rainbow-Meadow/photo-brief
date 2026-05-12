// website-intake
// Public hosted intake endpoint.
//
// GET  /functions/v1/website-intake/{public_token}
//      Returns safe public config for PhotoBrief-hosted Smart Intake.
//
// POST /functions/v1/website-intake/{public_token}
//      Creates a Smart Intake session and brief. A legacy /r/:token photo
//      request is created only when the route requires photos and a default
//      guide is available.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = Deno.env.get("APP_PUBLIC_URL") ?? "https://photobrief.ai";

type PlanTier = "free" | "starter" | "pro" | "team" | "business";
type PhotoPolicy = "not_needed" | "optional" | "recommended" | "required";
type ReadinessStatus =
  | "ready_to_quote"
  | "ready_to_dispatch"
  | "ready_for_callback"
  | "needs_review"
  | "needs_more_info"
  | "needs_photos"
  | "out_of_service_area"
  | "low_intent"
  | "spam";

type SupabaseAdmin = ReturnType<typeof createClient>;

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

interface SmartRule {
  id: string;
  label: string;
  customer_description: string | null;
  match_keywords: string[] | null;
  template_type: string;
  sort_order: number;
  is_fallback: boolean;
  photo_policy: PhotoPolicy;
  photo_policy_reason: string | null;
  readiness_goal: ReadinessStatus;
  questions: unknown[] | null;
}

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
    .select("plan_tier, name")
    .eq("id", intake.workspace_id)
    .maybeSingle();
  if (workspaceErr) return json({ error: workspaceErr.message }, 500);

  const plan = ((workspace as any)?.plan_tier ?? "free") as PlanTier;
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

  if (req.method === "GET") return getPublicConfig(admin, intake, (workspace as any)?.name ?? "this business");
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

    const customerId = await findOrCreateCustomer(admin, intake.workspace_id, lead);
    const smartConfig = await loadSmartConfig(admin, intake.workspace_id);
    const route = chooseSmartRoute(smartConfig.rules, payload, lead);
    const photoPolicy = route?.photo_policy ?? "optional";
    const routeReadiness = route?.readiness_goal ?? "ready_for_callback";

    let photoRequest: { id: string; token: string } | null = null;
    if (photoPolicy === "required" && intake.default_guide_id) {
      photoRequest = await createPhotoRequest(admin, intake, lead, customerId);
    }

    const readinessStatus = resolveReadiness(photoPolicy, routeReadiness, Boolean(photoRequest));
    const nextAction = resolveNextAction(photoPolicy, Boolean(photoRequest));
    const answers = buildAnswers(payload, lead);

    const { data: session, error: sessionErr } = await admin
      .from("intake_sessions")
      .insert({
        workspace_id: intake.workspace_id,
        intake_source_id: intake.id,
        blueprint_id: smartConfig.blueprintId,
        routing_rule_id: route?.id ?? null,
        customer_id: customerId,
        linked_photo_brief_request_id: photoRequest?.id ?? null,
        source: "website",
        selected_route_label: route?.label ?? lead.requestType ?? "General request",
        selected_service: lead.requestType ?? route?.label ?? null,
        customer_contact: customerContact(lead),
        answers,
        raw_payload: payload,
        photo_policy: photoPolicy,
        readiness_status: readinessStatus,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        metadata: {
          source: "website_intake",
          public_token: intake.public_token,
          matched_route_id: route?.id ?? null,
          matched_route_label: route?.label ?? null,
        },
      })
      .select("id, public_session_token")
      .single();
    if (sessionErr || !session) throw sessionErr ?? new Error("intake session insert failed");

    const title = route?.label ?? lead.requestType ?? "Website intake brief";
    const summary = summarizeBrief(lead, route?.label ?? null);
    const missingItems = missingItemsFor(photoPolicy, Boolean(photoRequest));

    const { data: brief, error: briefErr } = await admin
      .from("intake_briefs")
      .insert({
        workspace_id: intake.workspace_id,
        intake_session_id: session.id,
        intake_source_id: intake.id,
        blueprint_id: smartConfig.blueprintId,
        routing_rule_id: route?.id ?? null,
        customer_id: customerId,
        linked_photo_brief_request_id: photoRequest?.id ?? null,
        title,
        summary,
        route_label: route?.label ?? null,
        service_label: lead.requestType ?? route?.label ?? null,
        customer_contact: customerContact(lead),
        answers,
        brief: {
          summary,
          route: route?.label ?? null,
          service: lead.requestType ?? null,
          message: lead.message ?? null,
          address: lead.address ?? null,
          photo_policy: photoPolicy,
          photo_policy_reason: route?.photo_policy_reason ?? null,
          recommended_next_action: nextAction,
          photo_request_link: photoRequest ? `${APP_URL}/r/${photoRequest.token}` : null,
        },
        photo_policy: photoPolicy,
        photos_provided: false,
        photo_count: 0,
        readiness_status: readinessStatus,
        readiness_score: readinessScore(photoPolicy, Boolean(photoRequest)),
        next_action: nextAction,
        missing_items: missingItems,
        status: readinessStatus === "needs_more_info" || readinessStatus === "needs_photos" ? "needs_more_info" : "new",
      })
      .select("id")
      .single();
    if (briefErr || !brief) throw briefErr ?? new Error("intake brief insert failed");

    await markEvent(admin, eventId, {
      status: "request_created",
      matched_guide_id: intake.default_guide_id,
      customer_id: customerId,
      created_request_id: photoRequest?.id ?? null,
    });

    return json({
      ok: true,
      status: "intake_brief_created",
      briefId: brief.id,
      sessionId: session.id,
      sessionToken: (session as any).public_session_token,
      readiness_status: readinessStatus,
      photo_policy: photoPolicy,
      next_action: nextAction,
      photoRequestToken: photoRequest?.token ?? null,
      photoRequestLink: photoRequest ? `${APP_URL}/r/${photoRequest.token}` : null,
      requestId: photoRequest?.id ?? null,
      requestLink: photoRequest ? `${APP_URL}/r/${photoRequest.token}` : null,
      customerId,
      matchedRouteId: route?.id ?? null,
      matchSource: route ? "smart_route" : "fallback",
      message: photoRequest
        ? "We received your request and opened the photo steps."
        : "We received your request and created an intake brief.",
    });
  } catch (e) {
    await markEvent(admin, eventId, { status: "error", error: e instanceof Error ? e.message : String(e) });
    console.error("website-intake error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function canUseWebsiteIntake(plan: PlanTier) {
  return plan === "pro" || plan === "team" || plan === "business";
}

async function getPublicConfig(admin: SupabaseAdmin, intake: IntakeSource, businessName: string) {
  const [{ data: brand }, smartConfig] = await Promise.all([
    admin
      .from("brand_profiles")
      .select("logo_url, primary_color, intro_message, hide_photobrief_branding")
      .eq("workspace_id", intake.workspace_id)
      .maybeSingle(),
    loadSmartConfig(admin, intake.workspace_id),
  ]);

  const routeOptions = smartConfig.rules.map((r) => r.label);

  return json({
    ok: true,
    sourceName: intake.name,
    businessName,
    logoUrl: (brand as any)?.logo_url ?? null,
    brandColor: (brand as any)?.primary_color ?? null,
    hidePhotobriefBranding: Boolean((brand as any)?.hide_photobrief_branding),
    introMessage:
      intake.intro_message ??
      (brand as any)?.intro_message ??
      "Tell us what you need help with. We will only ask for photos if they help this request.",
    requestTypeOptions: routeOptions,
    smartIntake: {
      blueprintId: smartConfig.blueprintId,
      routingQuestion: smartConfig.routingQuestion,
      routes: smartConfig.rules.map((rule) => ({
        id: rule.id,
        label: rule.label,
        description: rule.customer_description,
        photoPolicy: rule.photo_policy,
        photoPolicyReason: rule.photo_policy_reason,
        readinessGoal: rule.readiness_goal,
        questions: rule.questions ?? [],
      })),
    },
  });
}

async function loadSmartConfig(admin: SupabaseAdmin, workspaceId: string) {
  const { data: profile } = await admin
    .from("business_intake_profiles")
    .select("approved_blueprint_id, routing_question, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let blueprintId = (profile as any)?.approved_blueprint_id ?? null;
  let routingQuestion = (profile as any)?.routing_question ?? "What do you need help with?";

  if (!blueprintId) {
    const { data: blueprint } = await admin
      .from("intake_blueprints")
      .select("id, routing_question")
      .eq("workspace_id", workspaceId)
      .in("status", ["active", "approved", "reviewing", "draft"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    blueprintId = (blueprint as any)?.id ?? null;
    routingQuestion = (blueprint as any)?.routing_question ?? routingQuestion;
  }

  if (!blueprintId) return { blueprintId: null as string | null, routingQuestion, rules: [] as SmartRule[] };

  const { data: rules } = await admin
    .from("intake_routing_rules")
    .select("id, label, customer_description, match_keywords, template_type, sort_order, is_fallback, photo_policy, photo_policy_reason, readiness_goal, questions")
    .eq("blueprint_id", blueprintId)
    .order("sort_order", { ascending: true });

  return { blueprintId, routingQuestion, rules: ((rules ?? []) as SmartRule[]) };
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
    requestType: clean(get("request_type", ["request_type", "selected_route", "route", "service", "service_type", "category", "subject"])),
    message: clean(get("message", ["message", "details", "description", "comments", "notes"])),
    address: clean(get("address", ["address", "street_address", "job_address", "service_address"])),
  };
}

function chooseSmartRoute(rules: SmartRule[], payload: Record<string, unknown>, lead: NormalizedLead) {
  if (!rules.length) return null;
  const selectedId = clean(asText(payload.route_id ?? payload.routing_rule_id ?? ""));
  if (selectedId) {
    const exactId = rules.find((r) => r.id === selectedId);
    if (exactId) return exactId;
  }
  const selected = `${lead.requestType ?? ""}`.toLowerCase().trim();
  if (selected) {
    const exactLabel = rules.find((r) => r.label.toLowerCase() === selected);
    if (exactLabel) return exactLabel;
  }
  const haystack = `${lead.requestType ?? ""} ${lead.message ?? ""}`.toLowerCase();
  const keywordMatch = rules.find((rule) => (rule.match_keywords ?? []).some((keyword) => keyword && haystack.includes(String(keyword).toLowerCase())));
  if (keywordMatch) return keywordMatch;
  return rules.find((r) => r.is_fallback) ?? rules[0];
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

function customerContact(lead: NormalizedLead) {
  return {
    name: lead.name,
    email: lead.email ?? null,
    phone: lead.phone ?? null,
    address: lead.address ?? null,
    preferredContactMethod: lead.email ? "email" : lead.phone ? "sms" : "unknown",
  };
}

function buildAnswers(payload: Record<string, unknown>, lead: NormalizedLead) {
  return {
    contact_name: lead.name,
    contact_email: lead.email ?? null,
    contact_phone: lead.phone ?? null,
    request_type: lead.requestType ?? null,
    message: lead.message ?? null,
    address: lead.address ?? null,
    raw: payload,
  };
}

function resolveReadiness(photoPolicy: PhotoPolicy, routeReadiness: ReadinessStatus, hasPhotoRequest: boolean): ReadinessStatus {
  if (photoPolicy === "required") return hasPhotoRequest ? "needs_photos" : "needs_more_info";
  return routeReadiness;
}

function resolveNextAction(photoPolicy: PhotoPolicy, hasPhotoRequest: boolean) {
  if (photoPolicy === "required" && hasPhotoRequest) return "Customer should complete the linked photo steps before review.";
  if (photoPolicy === "required") return "Review the brief and request photos manually if needed.";
  if (photoPolicy === "recommended") return "Review the brief. Photos may help, but this request can be followed up without blocking.";
  if (photoPolicy === "optional") return "Review the brief and follow up if more context is needed.";
  return "Review the brief and respond to the customer.";
}

function missingItemsFor(photoPolicy: PhotoPolicy, hasPhotoRequest: boolean) {
  if (photoPolicy === "required" && !hasPhotoRequest) return ["photos"];
  if (photoPolicy === "required" && hasPhotoRequest) return ["customer_photo_submission"];
  return [];
}

function readinessScore(photoPolicy: PhotoPolicy, hasPhotoRequest: boolean) {
  if (photoPolicy === "not_needed") return 88;
  if (photoPolicy === "optional") return 82;
  if (photoPolicy === "recommended") return 74;
  return hasPhotoRequest ? 58 : 42;
}

function summarizeBrief(lead: NormalizedLead, routeLabel: string | null) {
  const subject = routeLabel ?? lead.requestType ?? "customer request";
  const message = lead.message ? `: ${lead.message}` : ".";
  return `${lead.name} submitted a ${subject}${message}`;
}

async function createPhotoRequest(admin: SupabaseAdmin, intake: IntakeSource, lead: NormalizedLead, customerId: string) {
  if (!intake.default_guide_id) return null;
  const { data: requestRow, error: reqErr } = await admin
    .from("photo_brief_requests")
    .insert({
      workspace_id: intake.workspace_id,
      guide_id: intake.default_guide_id,
      recipient_name: lead.name,
      recipient_email: lead.email ?? null,
      recipient_phone: lead.phone ?? null,
      custom_message: buildIntro(intake.intro_message, lead),
      customer_id: customerId,
      status: "sent",
    })
    .select("id, token")
    .single();
  if (reqErr) throw reqErr;

  await admin.from("request_messages").insert({
    request_id: requestRow.id,
    workspace_id: intake.workspace_id,
    kind: "initial",
    channel: lead.email ? "email" : "sms",
    to_address: lead.email ?? lead.phone ?? null,
    subject: "Photo request created",
    body: `${APP_URL}/r/${requestRow.token}`,
    sent_by: null,
    metadata: { delivery: "skipped", source: "website_intake_required_photo" },
  });

  return requestRow as { id: string; token: string };
}

async function findOrCreateCustomer(admin: SupabaseAdmin, workspaceId: string, lead: NormalizedLead) {
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

async function markEvent(admin: SupabaseAdmin, eventId: string | null, patch: Record<string, unknown>) {
  if (!eventId) return;
  await admin.from("intake_events").update(patch as any).eq("id", eventId);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
