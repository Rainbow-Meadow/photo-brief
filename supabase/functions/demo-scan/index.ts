// demo-scan — Public, no-auth. Visitor pastes their business URL, we run the
// real website-intelligence pipeline into a fresh per-visit workspace, and
// return an intake token they can immediately try at /i/<token>.
//
// On signup, claim-demo-blueprint transfers that workspace to the new user.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DEMO_WORKSPACE_ID = Deno.env.get("DEMO_WORKSPACE_ID")!;
const TURNSTILE_SECRET = Deno.env.get("TURNSTILE_SECRET_KEY") ?? "";
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY") ?? "";

const MAX_PAGES = 10;
const MAX_HTML_CHARS = 80_000;
const REQUEST_TIMEOUT_MS = 8_000;
const FIRECRAWL_TIMEOUT_MS = 25_000;
const AGENT = "PhotoBriefDemoInspector/0.1";
const RATE_LIMIT_PER_HOUR = 3;
const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

// A page is "thin" (likely a JS shell like Wix/Framer/SPA) if it has very few
// internal links AND little visible text. When the root looks thin, we re-fetch
// it through Firecrawl (which executes JS) and use /map to seed the crawl.
function looksLikeJsShell(html: string, linkCount: number) {
  const textLen = stripHtml(html).length;
  return linkCount < 3 || textLen < 600;
}

type PhotoPolicy = "not_needed" | "optional" | "recommended" | "required";
type ReadinessGoal =
  | "ready_to_quote"
  | "ready_to_dispatch"
  | "ready_for_callback"
  | "needs_review"
  | "needs_more_info"
  | "needs_photos";

type Admin = ReturnType<typeof createClient>;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/* ─────────────────────  shared scrape helpers (copy of website-intelligence) ───────────────────── */

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
  const m = tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"));
  return clean(m?.[1] ?? null, 500);
}
function extractSingle(html: string, re: RegExp, max = 500) {
  const m = html.match(re);
  return clean(m?.[1] ? stripHtml(m[1]) : null, max);
}
function extractHeadings(html: string) {
  const out: string[] = [];
  for (const m of html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)) {
    const v = clean(stripHtml(m[1]), 160);
    if (v && !out.includes(v)) out.push(v);
    if (out.length >= 16) break;
  }
  return out;
}
function extractMeta(html: string) {
  const tag =
    html.match(/<meta[^>]+name=["']description["'][^>]*>/i)?.[0] ??
    html.match(/<meta[^>]+property=["']og:description["'][^>]*>/i)?.[0];
  return tag ? attr(tag, "content") : null;
}
function extractLinks(html: string, base: URL) {
  const out: string[] = [];
  for (const m of html.matchAll(/<a[^>]+href=["']([^"'#]+)["'][^>]*>/gi)) {
    try {
      const href = m[1];
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
      const u = new URL(href, base);
      if (u.origin !== base.origin || isUnsafeHost(u.hostname)) continue;
      u.hash = "";
      if (/\.(jpg|jpeg|png|gif|webp|svg|pdf|zip|mp4|mov|css|js)$/i.test(u.pathname)) continue;
      const v = u.toString();
      if (!out.includes(v)) out.push(v);
    } catch { /* ignore */ }
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
    const fieldNames = [...form.matchAll(/<(?:input|select|textarea)[^>]+(?:name|id)=["']([^"']+)["'][^>]*>/gi)]
      .map((m) => clean(m[1], 120)).filter(Boolean) as string[];
    const labels = [...form.matchAll(/<label[^>]*>([\s\S]*?)<\/label>/gi)]
      .map((m) => clean(stripHtml(m[1]), 120)).filter(Boolean) as string[];
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
    rows.push({
      page_url: pageUrl, form_action: attr(form, "action"), method: attr(form, "method") ?? "get",
      field_names: fieldNames, field_labels: labels, required_fields: [], button_text: buttonText,
      nearby_heading: null, nearby_copy: clean(stripHtml(form), 800),
      inferred_purpose: purpose, quality_score: Math.max(0, Math.min(100, score)),
    });
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
    const res = await fetch(url, {
      headers: { "User-Agent": AGENT, Accept: "text/html,application/xhtml+xml" },
      redirect: "follow", signal: controller.signal,
    });
    const finalUrl = new URL(res.url);
    if (isUnsafeHost(finalUrl.hostname)) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.includes("text/html")) return null;
    return (await res.text()).slice(0, MAX_HTML_CHARS);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Firecrawl /v2/scrape — returns rendered HTML (JS executed) and discovered links.
async function fetchRenderedHtml(
  url: string,
): Promise<{ html: string; links: string[] } | null> {
  if (!FIRECRAWL_API_KEY) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FIRECRAWL_TIMEOUT_MS);
  try {
    const res = await fetch(`${FIRECRAWL_V2}/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["html", "links"],
        onlyMainContent: false,
        waitFor: 1500,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn("firecrawl scrape failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    const body = await res.json() as {
      data?: { html?: string; links?: string[] };
      html?: string;
      links?: string[];
    };
    const html = (body.data?.html ?? body.html ?? "").slice(0, MAX_HTML_CHARS);
    const links = body.data?.links ?? body.links ?? [];
    if (!html) return null;
    return { html, links: Array.isArray(links) ? links : [] };
  } catch (err) {
    console.warn("firecrawl scrape error", err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Firecrawl /v2/map — fast URL enumeration for a domain. Used to seed the crawl
// when the root page is a JS shell with no static internal links.
async function mapSiteUrls(url: string, limit = MAX_PAGES * 3): Promise<string[]> {
  if (!FIRECRAWL_API_KEY) return [];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FIRECRAWL_TIMEOUT_MS);
  try {
    const res = await fetch(`${FIRECRAWL_V2}/map`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, limit, includeSubdomains: false }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn("firecrawl map failed", res.status);
      return [];
    }
    const body = await res.json() as { links?: string[]; data?: { links?: string[] } };
    const links = body.links ?? body.data?.links ?? [];
    return Array.isArray(links) ? links : [];
  } catch (err) {
    console.warn("firecrawl map error", err instanceof Error ? err.message : err);
    return [];
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
      if (!map.has(name.toLowerCase())) map.set(name.toLowerCase(), {
        name, source_url: page.url,
        description: clean(page.text_excerpt, 500) ?? `Detected from ${page.url}`,
        keywords: Array.from(new Set(lower.match(/[a-z][a-z0-9-]{3,}/g)?.slice(0, 12) ?? [])),
        category, template, intent,
        confidence: page.page_type === "service" || page.page_type === "product" ? 0.78 : 0.55,
      });
      if (map.size >= 18) break;
    }
  }
  return Array.from(map.values());
}
function suggestPhotoPolicy(templateType: string, keywords: string[]): { policy: PhotoPolicy; reason: string; readinessGoal: ReadinessGoal } {
  const hay = `${templateType} ${keywords.join(" ")}`.toLowerCase();
  if (/warranty|claim|damage|defect|return|broken|crack|leak/.test(hay))
    return { policy: "required", reason: "Visible condition or proof is usually needed before this can be reviewed.", readinessGoal: "needs_photos" };
  if (/repair|service|maintenance|estimate|quote|install|project|volume|size|area|access/.test(hay))
    return { policy: "recommended", reason: "Photos can reduce follow-up and help the team judge scope faster.", readinessGoal: "ready_to_quote" };
  if (/product|catalog|question|general/.test(hay))
    return { policy: "optional", reason: "Photos may help with context, but the request can usually be reviewed without them.", readinessGoal: "ready_for_callback" };
  return { policy: "not_needed", reason: "This route can start as a simple customer inquiry without visual context.", readinessGoal: "ready_for_callback" };
}
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const AI_TIMEOUT_MS = 20_000;

type AiRoute = {
  label: string;
  customer_description: string;
  template_type: string;
  photo_policy: PhotoPolicy;
  photo_policy_reason: string;
  readiness_goal: ReadinessGoal;
  match_keywords: string[];
  service_names: string[];
  evidence_urls: string[];
  is_fallback?: boolean;
};

const VALID_TEMPLATE_TYPES = new Set([
  "quote_estimate", "service_repair", "warranty_damage", "product_inquiry",
  "delivery_pickup", "bulk_order", "general_intake",
]);
const VALID_POLICIES = new Set<PhotoPolicy>(["not_needed", "optional", "recommended", "required"]);
const VALID_GOALS = new Set<ReadinessGoal>([
  "ready_to_quote", "ready_to_dispatch", "ready_for_callback",
  "needs_review", "needs_more_info", "needs_photos",
]);

async function inferRoutesWithAI(
  pages: Array<{ url: string; title: string | null; h1: string | null; page_type: string; text_excerpt: string | null; headings: string[] }>,
  forms: Array<Record<string, unknown>>,
  host: string,
): Promise<AiRoute[]> {
  if (!LOVABLE_API_KEY || pages.length === 0) return [];

  // Pick highest-signal pages first (service/product/pricing/contact, then others).
  const ranked = [...pages].sort((a, b) => {
    const score = (p: typeof a) =>
      ({ service: 5, product: 5, pricing: 4, contact: 3, faq: 2, about: 1, home: 3, unknown: 0 } as Record<string, number>)[p.page_type] ?? 0;
    return score(b) - score(a);
  }).slice(0, 8);

  const pageSummaries = ranked.map((p) => ({
    url: p.url,
    type: p.page_type,
    title: p.title,
    h1: p.h1,
    headings: p.headings.slice(0, 8),
    excerpt: (p.text_excerpt ?? "").slice(0, 800),
  }));

  const formSummaries = forms.slice(0, 6).map((f) => ({
    purpose: f.inferred_purpose,
    labels: (f.field_labels as string[] | undefined)?.slice(0, 10) ?? [],
  }));

  const scannedUrls = new Set(pages.map((p) => p.url));

  const system = [
    "You design a Smart Intake for a service or product business.",
    "Read the scanned pages and propose 2-4 distinct intake routes a REAL customer of THIS specific business would actually pick.",
    "Do NOT invent services the site doesn't show evidence of. If they sell mulch, do not propose 'repair'. If they're a roofer, do not propose 'product catalog'.",
    "Photos are CONDITIONAL, not default. Only set photo_policy='required' when the team literally cannot act without seeing the issue (damage/warranty/leak). Use 'recommended' when photos clearly speed up scoping. Use 'optional' when they help sometimes (e.g. measuring a yard for mulch coverage). Use 'not_needed' for simple orders, pickups, or general questions.",
    "Labels must be in customer voice, verb-led, max 50 chars. Plain words. No jargon. No 'AI-powered'. No exclamation points.",
    "Always include exactly one fallback route ('Something else' / 'Tell us what you need') with is_fallback=true and photo_policy='optional'.",
    "Each non-fallback route MUST include 1-3 evidence_urls from the scanned pages that justify it.",
    "Pick the most natural template_type from: quote_estimate, service_repair, warranty_damage, product_inquiry, delivery_pickup, bulk_order, general_intake.",
  ].join(" ");

  const user = JSON.stringify({ host, pages: pageSummaries, forms: formSummaries });

  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["routes"],
    properties: {
      routes: {
        type: "array", minItems: 2, maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["label", "customer_description", "template_type", "photo_policy", "photo_policy_reason", "readiness_goal", "match_keywords", "service_names", "evidence_urls", "is_fallback"],
          properties: {
            label: { type: "string", maxLength: 60 },
            customer_description: { type: "string", maxLength: 160 },
            template_type: { type: "string", enum: ["quote_estimate", "service_repair", "warranty_damage", "product_inquiry", "delivery_pickup", "bulk_order", "general_intake"] },
            photo_policy: { type: "string", enum: ["not_needed", "optional", "recommended", "required"] },
            photo_policy_reason: { type: "string", maxLength: 200 },
            readiness_goal: { type: "string", enum: ["ready_to_quote", "ready_to_dispatch", "ready_for_callback", "needs_review", "needs_more_info", "needs_photos"] },
            match_keywords: { type: "array", maxItems: 12, items: { type: "string" } },
            service_names: { type: "array", maxItems: 6, items: { type: "string" } },
            evidence_urls: { type: "array", maxItems: 3, items: { type: "string" } },
            is_fallback: { type: "boolean" },
          },
        },
      },
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "intake_routes", strict: true, schema },
        },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn("ai route inference failed", res.status, await res.text().catch(() => ""));
      return [];
    }
    const body = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = body.choices?.[0]?.message?.content;
    if (!content) return [];
    const parsed = JSON.parse(content) as { routes?: AiRoute[] };
    const routes = Array.isArray(parsed.routes) ? parsed.routes : [];

    // Validate + sanitize
    const cleaned: AiRoute[] = [];
    for (const r of routes) {
      if (!r || typeof r.label !== "string") continue;
      if (!VALID_TEMPLATE_TYPES.has(r.template_type)) continue;
      if (!VALID_POLICIES.has(r.photo_policy)) continue;
      if (!VALID_GOALS.has(r.readiness_goal)) continue;
      const evidence = (r.evidence_urls ?? []).filter((u) => scannedUrls.has(u));
      // Allow fallback routes without evidence; require it for the rest.
      if (!r.is_fallback && evidence.length === 0) continue;
      cleaned.push({
        ...r,
        evidence_urls: evidence,
        match_keywords: (r.match_keywords ?? []).slice(0, 12),
        service_names: (r.service_names ?? []).slice(0, 6),
      });
      if (cleaned.length >= 4) break;
    }

    if (cleaned.length === 0) return [];

    // Ensure exactly one fallback at the end.
    const fallbacks = cleaned.filter((r) => r.is_fallback);
    const nonFallbacks = cleaned.filter((r) => !r.is_fallback);
    if (fallbacks.length === 0) {
      nonFallbacks.push({
        label: "Something else",
        customer_description: "Tell us what you need and we'll follow up.",
        template_type: "general_intake",
        photo_policy: "optional",
        photo_policy_reason: "Photos may help with context, but aren't required.",
        readiness_goal: "ready_for_callback",
        match_keywords: [],
        service_names: [],
        evidence_urls: [],
        is_fallback: true,
      });
      return [...nonFallbacks];
    }
    return [...nonFallbacks, fallbacks[0]];
  } catch (err) {
    console.warn("ai route inference error", err instanceof Error ? err.message : err);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function questionsForTemplate(templateType: string) {
  // delivery_pickup and bulk_order map to quote_estimate-style questions.
  if (templateType === "delivery_pickup") {
    return [
      { id: "contact_name", prompt: "What is your name?", type: "short_text", required: true, sortOrder: 0 },
      { id: "contact_method", prompt: "What is the best email or phone number to reach you?", type: "short_text", required: true, sortOrder: 1 },
      { id: "material_and_quantity", prompt: "What material do you need, and roughly how much?", type: "long_text", required: true, sortOrder: 2 },
      { id: "delivery_address", prompt: "Where should we deliver, or are you picking up?", type: "address", required: false, sortOrder: 3 },
      { id: "needed_by", prompt: "When do you need it?", type: "short_text", required: false, sortOrder: 4 },
    ];
  }
  if (templateType === "bulk_order") {
    return [
      { id: "contact_name", prompt: "What is your name or company?", type: "short_text", required: true, sortOrder: 0 },
      { id: "contact_method", prompt: "What is the best email or phone number to reach you?", type: "short_text", required: true, sortOrder: 1 },
      { id: "order_details", prompt: "What are you looking to order, and roughly how much?", type: "long_text", required: true, sortOrder: 2 },
      { id: "timing", prompt: "When do you need it?", type: "short_text", required: false, sortOrder: 3 },
    ];
  }
  return suggestedQuestions(templateType);
}

function suggestedQuestions(templateType: string) {
  const base = [
    { id: "contact_name", prompt: "What is your name?", type: "short_text", required: true, sortOrder: 0 },
    { id: "contact_method", prompt: "What is the best email or phone number to reach you?", type: "short_text", required: true, sortOrder: 1 },
  ];
  if (templateType === "quote_estimate")
    return [...base,
      { id: "project_details", prompt: "What are you hoping to get quoted?", type: "long_text", required: true, sortOrder: 2 },
      { id: "location", prompt: "Where would the work happen?", type: "address", required: false, sortOrder: 3 }];
  if (templateType === "service_repair")
    return [...base,
      { id: "issue_details", prompt: "What needs service or repair?", type: "long_text", required: true, sortOrder: 2 },
      { id: "urgency", prompt: "How soon do you need help?", type: "single_select", required: false, sortOrder: 3,
        options: [{ label: "Today", value: "today" }, { label: "This week", value: "this_week" }, { label: "Flexible", value: "flexible" }] }];
  if (templateType === "warranty_damage")
    return [...base,
      { id: "problem_details", prompt: "What happened or what are you noticing?", type: "long_text", required: true, sortOrder: 2 },
      { id: "product_or_order", prompt: "Do you have a product, order, serial, or model number?", type: "short_text", required: false, sortOrder: 3 }];
  return [...base, { id: "message", prompt: "How can we help?", type: "long_text", required: true, sortOrder: 2 }];
}
function buildPlan(services: ReturnType<typeof inferServices>, forms: Array<Record<string, unknown>>) {
  const buckets = new Map<string, typeof services>();
  for (const s of services) buckets.set(s.template, [...(buckets.get(s.template) ?? []), s]);
  const ordered = ["quote_estimate", "service_repair", "warranty_damage", "product_inquiry", "general_intake"].filter((t) => buckets.has(t));
  const types = (ordered.length ? ordered : ["quote_estimate", "service_repair", "general_intake"]).slice(0, 3);
  const labels: Record<string, string> = {
    quote_estimate: "Get a quote or estimate", service_repair: "Request service or repair",
    warranty_damage: "Report damage or warranty issue", product_inquiry: "Ask about a product",
    general_intake: "Something else",
  };
  const rules = types.map((type, index) => {
    const group = buckets.get(type) ?? [];
    const keywords = Array.from(new Set(group.flatMap((s) => [s.name, s.category, s.intent, ...s.keywords]))).slice(0, 20);
    const photo = suggestPhotoPolicy(type, keywords);
    return {
      label: labels[type] ?? "General request",
      customer_description: photo.policy === "not_needed"
        ? "Collects the basic details needed for a fast follow-up."
        : "Collects the details needed to make this request actionable.",
      match_keywords: keywords, template_type: type, sort_order: index,
      is_fallback: index === types.length - 1,
      service_names: group.map((s) => s.name).slice(0, 8),
      photo_policy: photo.policy, photo_policy_reason: photo.reason,
      readiness_goal: photo.readinessGoal, questions: suggestedQuestions(type),
    };
  });
  return {
    rules,
    summary: `Found ${services.length} likely service/product signals and ${forms.length} form(s). Recommended ${rules.length} smart intake path(s).`,
  };
}

/* ─────────────────────  rate limiting + turnstile ───────────────────── */

async function verifyTurnstile(token: string | undefined, ip: string) {
  if (!TURNSTILE_SECRET) return true; // dev fallback
  // No widget on demo page yet — fall back to IP rate-limit only when client
  // doesn't send a token. Verify strictly only when client opts in.
  if (!token) return true;
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token, remoteip: ip }),
    });
    const data = await r.json();
    return Boolean(data?.success);
  } catch {
    return false;
  }
}

async function hashIp(ip: string) {
  return (await sha256(`pb-demo-salt:${ip}`)).slice(0, 32);
}

async function ipRateLimited(admin: Admin, ipHash: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("demo_sessions")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  return (count ?? 0) >= RATE_LIMIT_PER_HOUR;
}

/* ─────────────────────  handler ───────────────────── */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!DEMO_WORKSPACE_ID) return json({ error: "demo_not_configured" }, 500);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }

  const rootUrl = normalizePublicUrl(body.url);
  if (!rootUrl) return json({ error: "invalid_url", message: "That doesn't look like a public website URL." }, 400);

  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
  const ipHash = await hashIp(ip);

  const tsOk = await verifyTurnstile(typeof body.turnstileToken === "string" ? body.turnstileToken : undefined, ip);
  if (!tsOk) return json({ error: "verification_failed", message: "Please complete the verification and try again." }, 403);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  if (await ipRateLimited(admin, ipHash))
    return json({ error: "rate_limited", message: "You've started a few demos in the last hour. Try again later or start a trial." }, 429);

  // 1. Look up the system "demo owner" via the existing DEMO_WORKSPACE_ID.
  const { data: demoRoot } = await admin
    .from("business_workspaces")
    .select("owner_id")
    .eq("id", DEMO_WORKSPACE_ID)
    .maybeSingle();
  const demoOwnerId = (demoRoot as any)?.owner_id;
  if (!demoOwnerId) return json({ error: "demo_root_missing", looked_up: DEMO_WORKSPACE_ID?.slice(0, 8) ?? null, len: DEMO_WORKSPACE_ID?.length ?? 0 }, 500);

  // 2. Create a fresh per-visit workspace.
  const root = new URL(rootUrl);
  const hostLabel = root.hostname.replace(/^www\./, "");
  const { data: ws, error: wsErr } = await admin
    .from("business_workspaces")
    .insert({
      name: `Demo · ${hostLabel}`,
      owner_id: demoOwnerId,
      plan_tier: "intake",
      is_demo: true,
    })
    .select("id")
    .single();
  if (wsErr || !ws) return json({ error: "workspace_create_failed", message: wsErr?.message }, 500);
  const workspaceId = (ws as any).id as string;

  // Owner needs to be a workspace member for downstream RLS.
  await admin.from("workspace_members").insert({
    workspace_id: workspaceId, user_id: demoOwnerId, role: "owner", status: "active",
  });

  // 3. Pre-create the demo_sessions row so the client can poll it.
  const { data: sessionRow, error: sessionErr } = await admin
    .from("demo_sessions")
    .insert({ url: rootUrl, ip_hash: ipHash, workspace_id: workspaceId, status: "scanning" })
    .select("id")
    .single();
  if (sessionErr || !sessionRow) return json({ error: "session_create_failed", message: sessionErr?.message }, 500);
  const demoSessionId = (sessionRow as any).id as string;

  // 4. Run the scrape pipeline (sync; client waits).
  try {
    const { data: profile } = await admin.from("business_intake_profiles").insert({
      workspace_id: workspaceId, website_url: rootUrl, status: "reviewing",
      install_mode: "hosted_link", primary_goal: "replace_or_augment_website_form",
      metadata: { source: "public_demo", demo_session_id: demoSessionId },
    }).select("id").single();
    if (!profile) throw new Error("profile_insert_failed");

    const { data: job } = await admin.from("website_scan_jobs").insert({
      workspace_id: workspaceId, profile_id: (profile as any).id, root_url: rootUrl,
      status: "running", scan_type: "manual", started_at: new Date().toISOString(),
      created_by: demoOwnerId,
    }).select("id").single();
    if (!job) throw new Error("scan_job_insert_failed");
    const scanJobId = (job as any).id as string;

    const queue = [rootUrl];
    const visited = new Set<string>();
    const pageRows: Array<Record<string, unknown> & { headings: string[]; text_excerpt: string | null }> = [];
    const formRows: Array<Record<string, unknown>> = [];

    let isFirstPage = true;
    while (queue.length && visited.size < MAX_PAGES) {
      const url = queue.shift()!;
      if (visited.has(url)) continue;
      visited.add(url);

      // 1. Try a fast static fetch first.
      let html = await fetchPublicHtml(url);
      let extraLinks: string[] = [];

      // 2. If the page is missing or looks like a JS shell (Wix, Framer,
      //    Webflow with heavy JS, most SPAs), re-fetch through Firecrawl so we
      //    get rendered HTML and discovered links.
      const staticLinkCount = html ? extractLinks(html, root).length : 0;
      if (!html || looksLikeJsShell(html, staticLinkCount)) {
        const rendered = await fetchRenderedHtml(url);
        if (rendered) {
          html = rendered.html;
          extraLinks = rendered.links;
        }
      }
      if (!html) continue;

      const title = extractSingle(html, /<title[^>]*>([\s\S]*?)<\/title>/i, 180);
      const h1 = extractSingle(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i, 180);
      const headings = extractHeadings(html);
      const text = stripHtml(html);
      pageRows.push({
        workspace_id: workspaceId, scan_job_id: scanJobId, url, title,
        meta_description: extractMeta(html), h1,
        page_type: classifyPage(url, title, h1, text),
        text_excerpt: clean(text, 1500),
        content_hash: await sha256(text.slice(0, 60_000)),
        headings, ctas: [],
      });
      formRows.push(...extractForms(html, url).map((f) => ({ ...f, workspace_id: workspaceId, scan_job_id: scanJobId })));

      // 3. Seed the queue from static <a> links + Firecrawl-discovered links.
      const candidateLinks = new Set<string>(extractLinks(html, root));
      for (const link of extractLinks(html, root)) candidateLinks.add(link);
      for (const link of extraLinks) {
        try {
          const u = new URL(link, root);
          if (u.origin !== root.origin || isUnsafeHost(u.hostname)) continue;
          if (/\.(jpg|jpeg|png|gif|webp|svg|pdf|zip|mp4|mov|css|js)$/i.test(u.pathname)) continue;
          u.hash = "";
          candidateLinks.add(u.toString());
        } catch { /* ignore */ }
      }

      // 4. On the root page, if discovery is still thin, ask Firecrawl /map to
      //    enumerate the rest of the site.
      if (isFirstPage && candidateLinks.size < 5) {
        for (const link of await mapSiteUrls(url)) {
          try {
            const u = new URL(link, root);
            if (u.origin !== root.origin || isUnsafeHost(u.hostname)) continue;
            if (/\.(jpg|jpeg|png|gif|webp|svg|pdf|zip|mp4|mov|css|js)$/i.test(u.pathname)) continue;
            u.hash = "";
            candidateLinks.add(u.toString());
          } catch { /* ignore */ }
        }
      }
      isFirstPage = false;

      const prioritized = Array.from(candidateLinks).sort((a, b) => linkPriority(b) - linkPriority(a));
      for (const link of prioritized) {
        if (!visited.has(link) && !queue.includes(link) && queue.length < MAX_PAGES) queue.push(link);
      }
    }

    if (pageRows.length) await admin.from("website_pages").insert(pageRows);
    if (formRows.length) await admin.from("website_forms").insert(formRows);

    const services = inferServices(pageRows.map((p) => ({
      url: String(p.url), title: p.title as string | null, h1: p.h1 as string | null,
      page_type: String(p.page_type), text_excerpt: p.text_excerpt, headings: p.headings,
    })));

    const serviceRows = services.map((s) => ({
      workspace_id: workspaceId, profile_id: (profile as any).id, scan_job_id: scanJobId,
      source_url: s.source_url, name: s.name, description: s.description, category: s.category,
      keywords: s.keywords, customer_intent: s.intent, recommended_template_type: s.template,
      confidence_score: s.confidence, status: "proposed",
    }));
    const { data: insertedServices } = serviceRows.length
      ? await admin.from("service_catalog_items").insert(serviceRows).select("id, recommended_template_type")
      : { data: [] as Array<{ id: string; recommended_template_type: string }> };

    const plan = buildPlan(services, formRows);
    if (!plan.rules.length) {
      // Always give the visitor at least one route.
      plan.rules.push({
        label: "Tell us what you need",
        customer_description: "Collects basic details so we can follow up.",
        match_keywords: [],
        template_type: "general_intake", sort_order: 0, is_fallback: true,
        service_names: [], photo_policy: "optional",
        photo_policy_reason: "Photos may help, but aren't required.",
        readiness_goal: "ready_for_callback",
        questions: suggestedQuestions("general_intake"),
      });
    }

    const { data: blueprint } = await admin.from("intake_blueprints").insert({
      workspace_id: workspaceId, profile_id: (profile as any).id, source_scan_job_id: scanJobId,
      status: "draft", routing_question: "What do you need help with?",
      summary: plan.summary,
      install_recommendation: "Replace your contact form with this Smart Intake link.",
      customer_experience: { recommended_paths: plan.rules },
      lead_packet_plan: { include_customer_contact: true, include_matched_service: true, include_photos_by_policy: true, include_missing_info: true, include_recommended_next_action: true },
    }).select("id").single();
    if (!blueprint) throw new Error("blueprint_insert_failed");
    const blueprintId = (blueprint as any).id as string;

    const idsByType = new Map<string, string[]>();
    for (const s of (insertedServices ?? []) as Array<{ id: string; recommended_template_type: string }>)
      idsByType.set(s.recommended_template_type, [...(idsByType.get(s.recommended_template_type) ?? []), s.id]);

    await admin.from("intake_routing_rules").insert(plan.rules.map((r) => ({
      workspace_id: workspaceId, blueprint_id: blueprintId,
      label: r.label, customer_description: r.customer_description,
      match_keywords: r.match_keywords,
      service_catalog_item_ids: idsByType.get(r.template_type) ?? [],
      template_type: r.template_type, sort_order: r.sort_order, is_fallback: r.is_fallback,
      photo_policy: r.photo_policy, photo_policy_reason: r.photo_policy_reason,
      readiness_goal: r.readiness_goal, questions: r.questions,
    })));

    await admin.from("website_scan_jobs").update({
      status: "completed", completed_at: new Date().toISOString(),
      pages_scanned_count: pageRows.length, forms_detected_count: formRows.length,
      services_detected_count: services.length,
    }).eq("id", scanJobId);
    await admin.from("business_intake_profiles").update({
      latest_scan_job_id: scanJobId, approved_blueprint_id: blueprintId, status: "reviewing",
    }).eq("id", (profile as any).id);

    // 5. Mint the public intake source/token so /i/<token> works immediately.
    const { data: source } = await admin.from("intake_sources").insert({
      workspace_id: workspaceId,
      name: `Demo intake · ${hostLabel}`,
      intro_message: `Hi! Tell us a bit about what ${hostLabel} can help you with.`,
      created_by: demoOwnerId,
    }).select("id, public_token").single();
    if (!source) throw new Error("intake_source_failed");

    const routesPreview = plan.rules.map((r) => ({
      label: r.label, photoPolicy: r.photo_policy,
      photoPolicyReason: r.photo_policy_reason, description: r.customer_description,
    }));

    await admin.from("demo_sessions").update({
      status: "ready",
      intake_source_id: (source as any).id,
      intake_public_token: (source as any).public_token,
      blueprint_id: blueprintId,
      scan_job_id: scanJobId,
      summary: plan.summary,
      routes_preview: routesPreview,
      scan_completed_at: new Date().toISOString(),
      pages_scanned: pageRows.length,
    }).eq("id", demoSessionId);

    return json({
      ok: true,
      demoSessionId,
      intakeToken: (source as any).public_token,
      businessName: hostLabel,
      summary: plan.summary,
      pagesScanned: pageRows.length,
      routes: routesPreview,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await admin.from("demo_sessions").update({
      status: "failed",
      error: msg,
      scan_completed_at: new Date().toISOString(),
    }).eq("id", demoSessionId);
    return json({
      ok: false, error: "scan_failed", demoSessionId,
      message: "We couldn't read enough from that site. Start a trial and we'll help you set it up.",
    }, 200);
  }
});
