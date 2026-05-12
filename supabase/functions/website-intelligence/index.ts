import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_PAGES = 12;
const MAX_HTML_CHARS = 80_000;
const REQUEST_TIMEOUT_MS = 8_000;
const AGENT = "PhotoBriefWebsiteInspector/0.1";

type PhotoPolicy = "not_needed" | "optional" | "recommended" | "required";
type ReadinessGoal = "ready_to_quote" | "ready_to_dispatch" | "ready_for_callback" | "needs_review" | "needs_more_info" | "needs_photos";

type SupabaseAdmin = ReturnType<typeof createClient>;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function clean(value: unknown, max = 500) {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function isUnsafeHost(hostname: string) {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "0.0.0.0" || h === "127.0.0.1" || h.startsWith("127.")) return true;
  if (h.startsWith("10.")) return true;
  if (h.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  if (h.startsWith("169.254.")) return true;
  if (h === "::1" || h.startsWith("[::1]")) return true;
  if (h.includes("metadata.google") || h === "169.254.169.254") return true;
  return false;
}

function normalizePublicUrl(value: unknown) {
  const raw = clean(value, 500);
  if (!raw) return null;
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (isUnsafeHost(url.hostname)) return null;
    url.username = "";
    url.password = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function attr(tag: string, name: string) {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"));
  return clean(match?.[1] ?? null, 500);
}

function extractSingle(html: string, re: RegExp, max = 500) {
  const match = html.match(re);
  return clean(match?.[1] ? stripHtml(match[1]) : null, max);
}

function extractHeadings(html: string) {
  const out: string[] = [];
  for (const match of html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)) {
    const value = clean(stripHtml(match[1]), 160);
    if (value && !out.includes(value)) out.push(value);
    if (out.length >= 16) break;
  }
  return out;
}

function extractMeta(html: string) {
  const tag = html.match(/<meta[^>]+name=["']description["'][^>]*>/i)?.[0]
    ?? html.match(/<meta[^>]+property=["']og:description["'][^>]*>/i)?.[0];
  return tag ? attr(tag, "content") : null;
}

function extractCtas(html: string) {
  const out: string[] = [];
  const push = (value: string | null) => {
    if (!value) return;
    if (/quote|estimate|contact|book|schedule|request|service|repair|apply|get started|call|start/i.test(value) && !out.includes(value)) out.push(value);
  };
  for (const match of html.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)) push(clean(stripHtml(match[1]), 120));
  for (const match of html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)) push(clean(stripHtml(match[1]), 120));
  return out.slice(0, 16);
}

function extractLinks(html: string, base: URL) {
  const out: string[] = [];
  for (const match of html.matchAll(/<a[^>]+href=["']([^"'#]+)["'][^>]*>/gi)) {
    try {
      const href = match[1];
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
      const url = new URL(href, base);
      if (url.origin !== base.origin || isUnsafeHost(url.hostname)) continue;
      url.hash = "";
      if (/\.(jpg|jpeg|png|gif|webp|svg|pdf|zip|mp4|mov|css|js)$/i.test(url.pathname)) continue;
      const value = url.toString();
      if (!out.includes(value)) out.push(value);
    } catch {
      // ignore malformed links
    }
  }
  return out.sort((a, b) => linkPriority(b) - linkPriority(a));
}

function linkPriority(url: string) {
  const s = url.toLowerCase();
  let score = 0;
  if (/service|services|repair|quote|estimate|request|contact|intake|warranty|return|product|products|solutions|pricing/.test(s)) score += 20;
  if (/blog|news|privacy|terms|login|cart|checkout|tag|category/.test(s)) score -= 20;
  return score;
}

function classifyPage(url: string, title: string | null, h1: string | null, text: string) {
  const hay = `${url} ${title ?? ""} ${h1 ?? ""} ${text.slice(0, 1500)}`.toLowerCase();
  if (/contact|get in touch|request a quote|quote form|estimate form/.test(hay)) return "contact";
  if (/service|repair|installation|maintenance|warranty|inspection/.test(hay)) return "service";
  if (/product|catalog|shop|collection/.test(hay)) return "product";
  if (/pricing|plans|rates/.test(hay)) return "pricing";
  if (/faq|frequently asked/.test(hay)) return "faq";
  if (/about|our company|who we are/.test(hay)) return "about";
  try { return new URL(url).pathname === "/" ? "home" : "unknown"; } catch { return "unknown"; }
}

function extractForms(html: string, pageUrl: string) {
  const rows: Array<Record<string, unknown>> = [];
  for (const match of html.matchAll(/<form[\s\S]*?<\/form>/gi)) {
    const form = match[0];
    const fieldNames = [...form.matchAll(/<(?:input|select|textarea)[^>]+(?:name|id)=["']([^"']+)["'][^>]*>/gi)].map((m) => clean(m[1], 120)).filter(Boolean) as string[];
    const labels = [...form.matchAll(/<label[^>]*>([\s\S]*?)<\/label>/gi)].map((m) => clean(stripHtml(m[1]), 120)).filter(Boolean) as string[];
    const buttonText = extractSingle(form, /<button[^>]*>([\s\S]*?)<\/button>/i, 120);
    const fieldText = [...fieldNames, ...labels, buttonText ?? ""].join(" ").toLowerCase();
    let purpose = "generic_contact";
    if (/quote|estimate|price|project/.test(fieldText)) purpose = "quote_request";
    else if (/repair|service|appointment|schedule/.test(fieldText)) purpose = "service_request";
    else if (/warranty|claim|damage|return/.test(fieldText)) purpose = "warranty_or_damage";
    else if (/newsletter|subscribe/.test(fieldText)) purpose = "newsletter";
    let score = 25;
    if (/photo|image|upload|attachment/.test(fieldText)) score += 25;
    if (/service|issue|problem|description|details/.test(fieldText)) score += 15;
    if (/address|zip|location/.test(fieldText)) score += 10;
    if (/model|serial|order|sku/.test(fieldText)) score += 10;
    if (fieldNames.length <= 4 && purpose !== "newsletter") score -= 10;
    rows.push({ page_url: pageUrl, form_action: attr(form, "action"), method: attr(form, "method") ?? "get", field_names: fieldNames, field_labels: labels, required_fields: [], button_text: buttonText, nearby_heading: null, nearby_copy: clean(stripHtml(form), 800), inferred_purpose: purpose, quality_score: Math.max(0, Math.min(100, score)) });
  }
  return rows;
}

async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function fetchPublicHtml(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { "User-Agent": AGENT, Accept: "text/html,application/xhtml+xml" }, redirect: "follow", signal: controller.signal });
    const finalUrl = new URL(res.url);
    if (isUnsafeHost(finalUrl.hostname)) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.includes("text/html")) return null;
    return (await res.text()).slice(0, MAX_HTML_CHARS);
  } finally {
    clearTimeout(timer);
  }
}

function inferServices(pages: Array<{ url: string; title: string | null; h1: string | null; page_type: string; text_excerpt: string | null; headings: string[] }>) {
  const map = new Map<string, { name: string; source_url: string; description: string; keywords: string[]; category: string; template: string; intent: string; confidence: number }>();
  const bad = /home|about|contact|privacy|terms|blog|faq|pricing|login|cart|menu/i;
  for (const page of pages) {
    const headings = [page.h1, page.title, ...page.headings].filter(Boolean) as string[];
    for (const heading of headings) {
      const name = clean(heading.replace(/\b(services?|products?|solutions?|what we do)\b/gi, ""), 90);
      if (!name || name.length < 4 || bad.test(name)) continue;
      const lower = `${name} ${page.text_excerpt ?? ""}`.toLowerCase();
      let template = "general_intake", category = "general", intent = "general_inquiry";
      if (/quote|estimate|install|project|price|cost/.test(lower)) { template = "quote_estimate"; category = "quote"; intent = "get_quote"; }
      else if (/repair|service|maintenance|schedule|emergency|fix/.test(lower)) { template = "service_repair"; category = "service"; intent = "request_service"; }
      else if (/warranty|damage|claim|return|defect/.test(lower)) { template = "warranty_damage"; category = "warranty"; intent = "report_issue"; }
      else if (/product|collection|shop|catalog/.test(lower)) { template = "product_inquiry"; category = "product"; intent = "product_question"; }
      if (!map.has(name.toLowerCase())) map.set(name.toLowerCase(), { name, source_url: page.url, description: clean(page.text_excerpt, 500) ?? `Detected from ${page.url}`, keywords: Array.from(new Set(lower.match(/[a-z][a-z0-9-]{3,}/g)?.slice(0, 12) ?? [])), category, template, intent, confidence: page.page_type === "service" || page.page_type === "product" ? 0.78 : 0.55 });
      if (map.size >= 18) break;
    }
  }
  return Array.from(map.values());
}

function suggestPhotoPolicy(templateType: string, keywords: string[]): { policy: PhotoPolicy; reason: string; readinessGoal: ReadinessGoal } {
  const hay = `${templateType} ${keywords.join(" ")}`.toLowerCase();
  if (/warranty|claim|damage|defect|return|broken|crack|leak/.test(hay)) {
    return { policy: "required", reason: "Visible condition or proof is usually needed before this can be reviewed.", readinessGoal: "needs_photos" };
  }
  if (/repair|service|maintenance|estimate|quote|install|project|volume|size|area|access/.test(hay)) {
    return { policy: "recommended", reason: "Photos can reduce follow-up and help the team judge scope faster.", readinessGoal: "ready_to_quote" };
  }
  if (/product|catalog|question|general/.test(hay)) {
    return { policy: "optional", reason: "Photos may help with context, but the request can usually be reviewed without them.", readinessGoal: "ready_for_callback" };
  }
  return { policy: "not_needed", reason: "This route can start as a simple customer inquiry without visual context.", readinessGoal: "ready_for_callback" };
}

function suggestedQuestions(templateType: string) {
  const base = [
    { id: "contact_name", prompt: "What is your name?", type: "short_text", required: true, sortOrder: 0 },
    { id: "contact_method", prompt: "What is the best email or phone number to reach you?", type: "short_text", required: true, sortOrder: 1 },
  ];
  if (templateType === "quote_estimate") {
    return [...base, { id: "project_details", prompt: "What are you hoping to get quoted?", type: "long_text", required: true, sortOrder: 2 }, { id: "location", prompt: "Where would the work happen?", type: "address", required: false, sortOrder: 3 }];
  }
  if (templateType === "service_repair") {
    return [...base, { id: "issue_details", prompt: "What needs service or repair?", type: "long_text", required: true, sortOrder: 2 }, { id: "urgency", prompt: "How soon do you need help?", type: "single_select", required: false, sortOrder: 3, options: [{ label: "Today", value: "today" }, { label: "This week", value: "this_week" }, { label: "Flexible", value: "flexible" }] }];
  }
  if (templateType === "warranty_damage") {
    return [...base, { id: "problem_details", prompt: "What happened or what are you noticing?", type: "long_text", required: true, sortOrder: 2 }, { id: "product_or_order", prompt: "Do you have a product, order, serial, or model number?", type: "short_text", required: false, sortOrder: 3 }];
  }
  return [...base, { id: "message", prompt: "How can we help?", type: "long_text", required: true, sortOrder: 2 }];
}

function buildPlan(services: ReturnType<typeof inferServices>, forms: Array<Record<string, unknown>>) {
  const buckets = new Map<string, typeof services>();
  for (const service of services) buckets.set(service.template, [...(buckets.get(service.template) ?? []), service]);
  const ordered = ["quote_estimate", "service_repair", "warranty_damage", "product_inquiry", "general_intake"].filter((t) => buckets.has(t));
  const types = (ordered.length ? ordered : ["quote_estimate", "service_repair", "general_intake"]).slice(0, 3);
  const labels: Record<string, string> = { quote_estimate: "Get a quote or estimate", service_repair: "Request service or repair", warranty_damage: "Report damage or warranty issue", product_inquiry: "Ask about a product", general_intake: "Something else" };
  const rules = types.map((type, index) => {
    const group = buckets.get(type) ?? [];
    const keywords = Array.from(new Set(group.flatMap((s) => [s.name, s.category, s.intent, ...s.keywords]))).slice(0, 20);
    const photo = suggestPhotoPolicy(type, keywords);
    return {
      label: labels[type] ?? "General request",
      customer_description: photo.policy === "not_needed"
        ? "Collects the basic details needed for a fast follow-up."
        : "Collects the details needed to make this request actionable.",
      match_keywords: keywords,
      template_type: type,
      sort_order: index,
      is_fallback: index === types.length - 1,
      service_names: group.map((s) => s.name).slice(0, 8),
      photo_policy: photo.policy,
      photo_policy_reason: photo.reason,
      readiness_goal: photo.readinessGoal,
      questions: suggestedQuestions(type),
    };
  });
  const weakForms = forms.filter((f) => Number(f.quality_score ?? 0) < 60 && f.inferred_purpose !== "newsletter");
  return { rules, summary: `Found ${services.length} likely service/product signals and ${forms.length} form(s). Recommended ${rules.length} smart intake path(s).`, install: weakForms.length ? "Replace or augment the weakest existing website form with a PhotoBrief hosted intake link first." : "Add a PhotoBrief hosted intake link beside existing CTAs first, then evaluate form replacement after beta data." };
}

async function authenticate(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return { error: json({ error: "unauthorized" }, 401) };
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) return { error: json({ error: "unauthorized" }, 401) };
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: adminRow } = await admin.from("platform_admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return { admin, userId: user.id, isPlatformAdmin: Boolean(adminRow) };
}

async function authorizeScan(admin: SupabaseAdmin, userId: string, isPlatformAdmin: boolean, workspaceId: string | null) {
  if (isPlatformAdmin) return true;
  if (!workspaceId) return false;
  const { data: member } = await admin
    .from("workspace_members")
    .select("workspace_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  return Boolean(member);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const actor = await authenticate(req);
  if (actor.error) return actor.error;
  const admin = actor.admin;
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  if ((clean(body.action, 80) ?? "scan_website") !== "scan_website") return json({ error: "unknown_action" }, 400);
  const rootUrl = normalizePublicUrl(body.website_url ?? body.url);
  if (!rootUrl) return json({ error: "invalid_website_url" }, 400);
  const betaApplicationId = clean(body.beta_application_id, 80);
  const workspaceId = clean(body.workspace_id, 80);
  const allowed = await authorizeScan(admin, actor.userId, actor.isPlatformAdmin, workspaceId);
  if (!allowed) return json({ error: "forbidden" }, 403);
  const root = new URL(rootUrl);

  const { data: profile, error: profileError } = await admin.from("business_intake_profiles").insert({ workspace_id: workspaceId, beta_application_id: betaApplicationId, website_url: rootUrl, status: "reviewing", install_mode: "hosted_link", primary_goal: "replace_or_augment_website_form", metadata: { source: actor.isPlatformAdmin ? "admin_scan" : "workspace_scan" } }).select("id").single();
  if (profileError || !profile) return json({ error: "profile_insert_failed" }, 500);
  const { data: job, error: jobError } = await admin.from("website_scan_jobs").insert({ workspace_id: workspaceId, beta_application_id: betaApplicationId, profile_id: profile.id, root_url: rootUrl, status: "running", scan_type: "manual", started_at: new Date().toISOString(), created_by: actor.userId }).select("id").single();
  if (jobError || !job) return json({ error: "scan_job_insert_failed" }, 500);

  try {
    const queue = [rootUrl];
    const visited = new Set<string>();
    const pageRows: Array<Record<string, unknown> & { headings: string[]; text_excerpt: string | null }> = [];
    const formRows: Array<Record<string, unknown>> = [];
    while (queue.length && visited.size < MAX_PAGES) {
      const url = queue.shift()!;
      if (visited.has(url)) continue;
      visited.add(url);
      const html = await fetchPublicHtml(url);
      if (!html) continue;
      const title = extractSingle(html, /<title[^>]*>([\s\S]*?)<\/title>/i, 180);
      const h1 = extractSingle(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i, 180);
      const headings = extractHeadings(html);
      const text = stripHtml(html);
      const row = { workspace_id: workspaceId, beta_application_id: betaApplicationId, scan_job_id: job.id, url, title, meta_description: extractMeta(html), h1, page_type: classifyPage(url, title, h1, text), text_excerpt: clean(text, 1500), content_hash: await sha256(text.slice(0, 60_000)), headings, ctas: extractCtas(html) };
      pageRows.push(row);
      formRows.push(...extractForms(html, url).map((f) => ({ ...f, workspace_id: workspaceId, beta_application_id: betaApplicationId, scan_job_id: job.id })));
      for (const link of extractLinks(html, root)) if (!visited.has(link) && !queue.includes(link) && queue.length < MAX_PAGES) queue.push(link);
    }

    if (pageRows.length) await admin.from("website_pages").insert(pageRows);
    if (formRows.length) await admin.from("website_forms").insert(formRows);
    const services = inferServices(pageRows.map((p) => ({ url: String(p.url), title: p.title as string | null, h1: p.h1 as string | null, page_type: String(p.page_type), text_excerpt: p.text_excerpt, headings: p.headings })));
    const serviceRows = services.map((s) => ({ workspace_id: workspaceId, beta_application_id: betaApplicationId, profile_id: profile.id, scan_job_id: job.id, source_url: s.source_url, name: s.name, description: s.description, category: s.category, keywords: s.keywords, customer_intent: s.intent, recommended_template_type: s.template, confidence_score: s.confidence, status: "proposed" }));
    const { data: insertedServices } = serviceRows.length ? await admin.from("service_catalog_items").insert(serviceRows).select("id, recommended_template_type") : { data: [] };
    const plan = buildPlan(services, formRows);
    const { data: blueprint, error: blueprintError } = await admin.from("intake_blueprints").insert({ workspace_id: workspaceId, beta_application_id: betaApplicationId, profile_id: profile.id, source_scan_job_id: job.id, status: "draft", routing_question: "What do you need help with?", summary: plan.summary, install_recommendation: plan.install, customer_experience: { recommended_paths: plan.rules }, lead_packet_plan: { include_customer_contact: true, include_matched_service: true, include_photos_by_policy: true, include_missing_info: true, include_recommended_next_action: true } }).select("id").single();
    if (blueprintError || !blueprint) throw blueprintError ?? new Error("blueprint insert failed");
    const serviceIdsByType = new Map<string, string[]>();
    for (const s of (insertedServices ?? []) as Array<{ id: string; recommended_template_type: string }>) serviceIdsByType.set(s.recommended_template_type, [...(serviceIdsByType.get(s.recommended_template_type) ?? []), s.id]);
    if (plan.rules.length) await admin.from("intake_routing_rules").insert(plan.rules.map((r) => ({ workspace_id: workspaceId, beta_application_id: betaApplicationId, blueprint_id: blueprint.id, label: r.label, customer_description: r.customer_description, match_keywords: r.match_keywords, service_catalog_item_ids: serviceIdsByType.get(r.template_type) ?? [], template_type: r.template_type, sort_order: r.sort_order, is_fallback: r.is_fallback, photo_policy: r.photo_policy, photo_policy_reason: r.photo_policy_reason, readiness_goal: r.readiness_goal, questions: r.questions })));
    await admin.from("website_change_events").insert([...pageRows.slice(0, 8).map((p) => ({ workspace_id: workspaceId, beta_application_id: betaApplicationId, scan_job_id: job.id, change_type: "new_page", subject_url: String(p.url), after: { title: p.title, page_type: p.page_type }, recommendation: "Review this page for service and intake routing opportunities." })), ...services.slice(0, 8).map((s) => ({ workspace_id: workspaceId, beta_application_id: betaApplicationId, scan_job_id: job.id, change_type: "new_service", subject_url: s.source_url, after: { name: s.name, template_type: s.template, confidence: s.confidence }, recommendation: `Consider routing ${s.name} into ${s.template.replace(/_/g, " ")}.` }))]);
    await admin.from("website_scan_jobs").update({ status: "completed", completed_at: new Date().toISOString(), pages_scanned_count: pageRows.length, forms_detected_count: formRows.length, services_detected_count: services.length }).eq("id", job.id);
    await admin.from("business_intake_profiles").update({ latest_scan_job_id: job.id, approved_blueprint_id: blueprint.id, routing_question: "What do you need help with?", status: "reviewing" }).eq("id", profile.id);
    return json({ ok: true, profile_id: profile.id, scan_job_id: job.id, blueprint_id: blueprint.id, pages_scanned: pageRows.length, forms_detected: formRows.length, services_detected: services.length, summary: plan.summary, install_recommendation: plan.install, routing_rules: plan.rules, services: serviceRows.map((s) => ({ name: s.name, category: s.category, template_type: s.recommended_template_type, source_url: s.source_url, confidence: s.confidence })), forms: formRows.map((f) => ({ page_url: f.page_url, inferred_purpose: f.inferred_purpose, quality_score: f.quality_score, field_names: f.field_names })) });
  } catch (error) {
    console.error("website intelligence failed", error);
    await admin.from("website_scan_jobs").update({ status: "failed", completed_at: new Date().toISOString(), error: error instanceof Error ? error.message : String(error) }).eq("id", job.id);
    return json({ error: "scan_failed", message: error instanceof Error ? error.message : String(error) }, 500);
  }
});
