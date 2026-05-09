/**
 * photobrief-router — Cloudflare Worker bound to photobrief.ai/* and
 * www.photobrief.ai/*.
 *
 * Splits incoming requests between two origins:
 *
 *   - Pages-only static files (/og-image, /robots.txt, /sitemap.xml,
 *     /llms*.txt, /openapi.json, /mcp.json, /.well-known/*) → Cloudflare
 *     Pages, edge-cached. Stable filenames, only the Pages build emits them.
 *
 *   - Marketing HTML routes (/, /pricing, /help, /for-ai-agents):
 *       • Bots / crawlers / LLM fetchers → Pages (prerendered static HTML
 *         optimized for SEO and answer-engine citation).
 *       • Real users → Lovable hosting (live SPA with the latest dynamic
 *         behavior, no prerender hydration delay).
 *
 *   - Hashed JS/CSS bundles (/assets/*) and everything else (/auth, /dashboard,
 *     /requests, /r/*, /onboarding, /settings/*, …) → Lovable hosting.
 *     /assets/* MUST come from the same origin that served the HTML, because
 *     Vite hash filenames differ between the Lovable build and the Pages build.
 *
 * The marketing allow-list MUST stay in sync with scripts/prerender.mjs,
 * which reads its routes from public/sitemap.xml.
 */

interface Env {
  PAGES_HOST: string; // e.g. "photobrief-marketing.pages.dev"
  LOVABLE_HOST: string; // e.g. "photobrief.lovable.app"
  ROUTER_CONFIG?: KVNamespace;
  WORKSPACE_BRAND?: KVNamespace;
}

// Cache KV reads for 60s to keep latency low. Cloudflare's edge cache
// already deduplicates, but this avoids a KV round-trip per request.
interface RouterConfig {
  force_origin: "pages" | "lovable" | null;
  maintenance_mode: boolean;
  loadedAt: number;
}
let configCache: RouterConfig | null = null;
const CONFIG_TTL_MS = 60_000;

async function loadConfig(env: Env): Promise<RouterConfig> {
  const now = Date.now();
  if (configCache && now - configCache.loadedAt < CONFIG_TTL_MS) return configCache;
  const fresh: RouterConfig = {
    force_origin: null,
    maintenance_mode: false,
    loadedAt: now,
  };
  if (env.ROUTER_CONFIG) {
    try {
      const [force, maint] = await Promise.all([
        env.ROUTER_CONFIG.get("force_origin"),
        env.ROUTER_CONFIG.get("maintenance_mode"),
      ]);
      if (force === "pages" || force === "lovable") fresh.force_origin = force;
      if (maint === "1" || maint === "true") fresh.maintenance_mode = true;
    } catch {
      /* fall back to defaults */
    }
  }
  configCache = fresh;
  return fresh;
}

// Exact paths served from Pages (everything else, including /auth, falls
// through to Lovable).
const MARKETING_PATHS = new Set<string>([
  "/",
  "/pricing",
  "/help",
  "/for-ai-agents",
]);

// Path prefixes for files that ONLY exist on the Pages build (AI/answer-engine
// discovery files, prerender artifacts, marketing OG image). These have stable
// filenames so it's safe to serve them from Pages regardless of which origin
// rendered the HTML.
//
// IMPORTANT: /assets/* is intentionally NOT in this list. Vite emits hashed
// filenames (index-XYZ.js) and the Lovable build and the Pages build produce
// DIFFERENT hashes for the same source. Routing /assets/* to Pages while the
// HTML came from Lovable causes 404s/MIME-type mismatches and a blank page.
// Assets must come from the same origin as the HTML — which is Lovable for
// real users — so we let /assets/* fall through to Lovable.
const PAGES_STATIC_PREFIXES = [
  "/og-image",
  "/og/",
  "/favicon",
  "/apple-touch-icon",
  "/icon-",
  "/site.webmanifest",
  "/brand/",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/llms-full.txt",
  "/openapi.json",
  "/mcp.json",
  "/.well-known/",
  "/marketing/",
];

function isMarketingPath(pathname: string): boolean {
  if (MARKETING_PATHS.has(pathname)) return true;
  // Allow trailing slash variants (Pages serves /pricing and /pricing/).
  if (pathname.endsWith("/") && MARKETING_PATHS.has(pathname.slice(0, -1))) return true;
  return false;
}

function isPagesStatic(pathname: string): boolean {
  return PAGES_STATIC_PREFIXES.some((p) => pathname.startsWith(p));
}

// Known bot / crawler / answer-engine user agents. Matched case-insensitively
// as substrings against the UA string. Covers traditional search crawlers,
// social previewers, SEO tools, and LLM/answer-engine fetchers.
const BOT_UA_PATTERNS = [
  // Search engines
  "googlebot", "google-inspectiontool", "bingbot", "slurp", "duckduckbot",
  "baiduspider", "yandex", "sogou", "exabot", "facebot", "ia_archiver",
  "applebot",
  // Social / link unfurlers
  "facebookexternalhit", "twitterbot", "linkedinbot", "slackbot",
  "discordbot", "telegrambot", "whatsapp", "skypeuripreview", "pinterest",
  "redditbot", "embedly", "quora link preview",
  // SEO / monitoring
  "ahrefsbot", "semrushbot", "mj12bot", "dotbot", "rogerbot", "screaming frog",
  "lighthouse", "pagespeed", "gtmetrix", "pingdom", "uptimerobot",
  // LLMs / answer engines
  "gptbot", "oai-searchbot", "chatgpt-user", "chatgpt", "openai",
  "claudebot", "claude-web", "anthropic-ai", "anthropic",
  "perplexitybot", "perplexity-user", "perplexity",
  "google-extended", "googleother",
  "ccbot", "cohere-ai", "cohere",
  "youbot", "phindbot", "amazonbot", "bytespider", "diffbot",
  "meta-externalagent", "meta-externalfetcher",
  "mistralai-user", "mistral",
  "duckassistbot", "kagibot",
  // Generic crawler hints
  "bot/", " bot ", "spider", "crawler", "crawl", "headlesschrome",
];

function isBot(request: Request): boolean {
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  if (!ua) return true; // No UA → treat as bot, safer for SEO.
  return BOT_UA_PATTERNS.some((p) => ua.includes(p));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Live config from KV (kill-switches, manual origin override).
    const config = await loadConfig(env);

    if (config.maintenance_mode) {
      return new Response(
        "<!doctype html><meta charset=utf-8><title>Maintenance</title>" +
          "<style>body{font-family:system-ui;background:#0c0915;color:#e9e2ff;display:grid;place-items:center;height:100vh;margin:0}main{text-align:center;max-width:32rem;padding:2rem}</style>" +
          "<main><h1>Be right back</h1><p>PhotoBrief is undergoing brief maintenance. Please retry in a few minutes.</p></main>",
        { status: 503, headers: { "content-type": "text/html; charset=utf-8", "retry-after": "120" } },
      );
    }

    // Edge feature-flags endpoint. The SPA hits this on boot to read flags
    // in <10ms with no Supabase round-trip. Flags live in ROUTER_CONFIG KV
    // under keys `flag:<name>` (value: "1"/"0") or `flags:<workspace_id>`
    // (JSON object). Keys can be flipped live with `wrangler kv key put`.
    if (path === "/api/flags" || path === "/api/flags/") {
      return handleFlags(url, env);
    }

    // Pages-only static files (sitemap, robots, llms.txt, .well-known, og-image…).
    // These have stable filenames and only the Pages build emits them.
    // /assets/* is deliberately NOT included here — see PAGES_STATIC_PREFIXES.
    if (isPagesStatic(path)) {
      const res = await proxyTo(env.PAGES_HOST, request);
      // Transparent fallback if Pages doesn't have it for any reason.
      if (res.status === 404) {
        return proxyTo(env.LOVABLE_HOST, request);
      }
      return res;
    }

    // HTML navigations: split by client.
    //   - Bots/crawlers/LLMs → Pages (prerendered static HTML for SEO/citation).
    //   - Real users → Lovable (live SPA with the latest dynamic behavior).
    //   - KV `force_origin` overrides the UA-based decision when set.
    if (isMarketingPath(path)) {
      const useLovable =
        config.force_origin === "lovable" ||
        (config.force_origin !== "pages" && !isBot(request));
      if (useLovable) return proxyTo(env.LOVABLE_HOST, request);
      const res = await proxyTo(env.PAGES_HOST, request);
      if (res.status === 404) return proxyTo(env.LOVABLE_HOST, request);
      return res;
    }

    // Recipient capture links /r/{token}: proxy to Lovable, then use
    // HTMLRewriter to inject workspace branding (title, OG image, primary
    // color CSS var) into the SPA shell BEFORE it reaches the browser.
    // First paint shows the contractor's brand instead of a flash of
    // unbranded React shell. Branding payload comes from WORKSPACE_BRAND
    // KV, populated by a Supabase trigger on workspace updates.
    if (path.startsWith("/r/") && env.WORKSPACE_BRAND) {
      return handleRecipientPage(request, env);
    }

    // Non-marketing paths (auth, app, recipient links, etc.) always go to
    // the live SPA on Lovable.
    return proxyTo(env.LOVABLE_HOST, request);
  },
};

/**
 * GET /api/flags?ws=<workspace_id>
 * Returns: { flags: { [name]: boolean } }
 *
 * Reads from ROUTER_CONFIG KV:
 *   - flag:<name>           → global default ("1"|"0")
 *   - flags:<workspace_id>  → JSON object with per-workspace overrides
 */
async function handleFlags(url: URL, env: Env): Promise<Response> {
  const headers = {
    "content-type": "application/json",
    "cache-control": "public, max-age=30, s-maxage=30, stale-while-revalidate=60",
    "access-control-allow-origin": "*",
  };
  if (!env.ROUTER_CONFIG) {
    return new Response(JSON.stringify({ flags: {} }), { headers });
  }
  try {
    const ws = url.searchParams.get("ws");
    const flags: Record<string, boolean> = {};
    // Cloudflare doesn't expose a cheap "list keys with prefix" inside hot
    // path, so we read a single index key `flag:_index` (JSON array of names).
    const index = await env.ROUTER_CONFIG.get("flag:_index", { type: "json" }) as
      | string[]
      | null;
    if (Array.isArray(index)) {
      const values = await Promise.all(
        index.map((name) => env.ROUTER_CONFIG!.get(`flag:${name}`)),
      );
      index.forEach((name, i) => {
        flags[name] = values[i] === "1" || values[i] === "true";
      });
    }
    if (ws) {
      const overrides = await env.ROUTER_CONFIG.get(`flags:${ws}`, { type: "json" }) as
        | Record<string, boolean>
        | null;
      if (overrides && typeof overrides === "object") {
        for (const [k, v] of Object.entries(overrides)) flags[k] = !!v;
      }
    }
    return new Response(JSON.stringify({ flags }), { headers });
  } catch {
    return new Response(JSON.stringify({ flags: {} }), { headers });
  }
}

/**
 * Inject per-workspace branding into the recipient capture SPA shell at the
 * edge using HTMLRewriter. The token in /r/{token} maps to a workspace via
 * a KV lookup. KV value shape:
 *   { name: string, primary?: string, logo?: string, og?: string }
 *
 * Falls through to the unmodified Lovable response if no brand is found
 * or HTMLRewriter is unavailable.
 */
async function handleRecipientPage(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const token = url.pathname.split("/")[2] || "";
  const upstream = await proxyTo(env.LOVABLE_HOST, request);
  if (!token || !env.WORKSPACE_BRAND) return upstream;
  const ct = upstream.headers.get("content-type") || "";
  if (!ct.includes("text/html")) return upstream;

  let brand: { name?: string; primary?: string; logo?: string; og?: string } | null = null;
  try {
    brand = await env.WORKSPACE_BRAND.get(`token:${token}`, { type: "json" });
  } catch {
    /* ignore */
  }
  if (!brand) return upstream;

  const title = brand.name ? `${brand.name} — Photo capture` : null;
  const ogImage = brand.og || brand.logo || null;
  const cssVar = brand.primary
    ? `:root{--brand-primary:${brand.primary};--brand-primary-rgb:${hexToRgb(brand.primary)}}`
    : "";

  const rewriter = new HTMLRewriter()
    .on("title", {
      element(el) {
        if (title) el.setInnerContent(title);
      },
    })
    .on('meta[property="og:title"]', {
      element(el) {
        if (title) el.setAttribute("content", title);
      },
    })
    .on('meta[property="og:image"]', {
      element(el) {
        if (ogImage) el.setAttribute("content", ogImage);
      },
    })
    .on("head", {
      element(el) {
        if (cssVar) el.append(`<style>${cssVar}</style>`, { html: true });
        if (brand?.name) {
          el.append(
            `<meta name="x-pb-brand" content="${escapeAttr(brand.name)}">`,
            { html: true },
          );
        }
      },
    });

  return rewriter.transform(upstream);
}

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "0,0,0";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/**
 * Proxy the incoming request to the given origin host, preserving the path,
 * query string, method, headers, and body. The Host header is rewritten so
 * the upstream sees its own hostname (required by both Pages and Lovable).
 */
async function proxyTo(host: string, request: Request): Promise<Response> {
  if (!host) {
    return new Response("Router misconfigured: missing origin host", { status: 500 });
  }
  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, `https://${host}`);

  const headers = new Headers(request.headers);
  // fetch() in Workers derives Host from the URL, but set it explicitly too.
  headers.set("host", host);
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) headers.set("x-forwarded-for", cfIp);
  headers.set("x-forwarded-host", incoming.hostname);
  headers.set("x-forwarded-proto", "https");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  const upstream = await fetch(target.toString(), init);

  // Break redirect loops: if the origin is trying to send the browser back to
  // the user-facing host (e.g. Lovable redirecting custom-domain traffic to
  // its canonical hostname or vice-versa), rewrite or strip that redirect so
  // the browser doesn't bounce back into this worker indefinitely.
  if (upstream.status >= 300 && upstream.status < 400) {
    const location = upstream.headers.get("location");
    if (location) {
      try {
        const loc = new URL(location, target);
        const userHost = incoming.hostname.toLowerCase();
        const locHost = loc.hostname.toLowerCase();
        // If the redirect targets the user-facing host OR the upstream host
        // with the same path we just requested, treat it as a loop and
        // serve the body of a fresh request to the same upstream URL with
        // redirects followed internally.
        const sameUserHost =
          locHost === userHost ||
          locHost === `www.${userHost}` ||
          `www.${locHost}` === userHost;
        const sameUpstreamPath =
          locHost === host.toLowerCase() && loc.pathname === incoming.pathname;
        if (sameUserHost || sameUpstreamPath) {
          // Re-fetch from upstream following redirects internally; this
          // bypasses the loop without exposing the origin host to the client.
          const followed = await fetch(target.toString(), {
            ...init,
            redirect: "follow",
          });
          // Strip any lingering Location header just in case.
          const cleaned = new Headers(followed.headers);
          cleaned.delete("location");
          return new Response(followed.body, {
            status: followed.status === 0 ? 200 : followed.status,
            statusText: followed.statusText,
            headers: cleaned,
          });
        }
        // Redirect points elsewhere on the upstream — rewrite it to be
        // user-facing if it targets the upstream hostname.
        if (locHost === host.toLowerCase()) {
          loc.hostname = incoming.hostname;
          loc.protocol = incoming.protocol;
          const rewritten = new Response(upstream.body, upstream);
          rewritten.headers.set("location", loc.toString());
          return rewritten;
        }
      } catch {
        // Malformed Location; fall through and return upstream as-is.
      }
    }
  }

  return upstream;
}
