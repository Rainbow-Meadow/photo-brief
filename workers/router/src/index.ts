/**
 * photobrief-router — Cloudflare Worker bound to photobrief.ai/* and
 * www.photobrief.ai/*.
 *
 * Splits incoming requests between two origins:
 *
 *   - Public marketing pages (/, /pricing, /help, /for-ai-agents) →
 *     Cloudflare Pages. These routes should be stable, fast, prerendered, and
 *     driven by the repo deploy — not by Lovable's publish state.
 *
 *   - Pages-owned static files (/assets/*, /og-image, /robots.txt,
 *     /sitemap.xml, /llms*.txt, /openapi.json, /mcp.json, /.well-known/*,
 *     /marketing/*) → Cloudflare Pages first, with transparent fallback to
 *     Lovable for hashed app assets that only exist in Lovable's build.
 *
 *   - App/auth/customer paths (/auth, /dashboard, /requests, /r/*,
 *     /onboarding, /settings/*, …) → Lovable hosting.
 *
 * This keeps the landing page reliable while still allowing Lovable to host the
 * authenticated app and any routes that are not part of the public marketing
 * surface.
 */

interface Env {
  PAGES_HOST: string; // e.g. "photobrief-marketing.pages.dev"
  LOVABLE_HOST: string; // e.g. "photobrief.lovable.app"
}

const MARKETING_PATHS = new Set<string>([
  "/",
  "/pricing",
  "/help",
  "/for-ai-agents",
]);

// Public static assets that should prefer the Pages deployment. /assets/* is
// included with fallback: marketing HTML served from Pages needs Pages' hashed
// assets, while Lovable app HTML may request different hashes that Pages does
// not have. In that case we fall back to Lovable below.
const PAGES_STATIC_PREFIXES = [
  "/assets/",
  "/og-image",
  "/favicon",
  "/apple-touch-icon",
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
  if (pathname.endsWith("/") && MARKETING_PATHS.has(pathname.slice(0, -1))) return true;
  return false;
}

function isPagesStatic(pathname: string): boolean {
  return PAGES_STATIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Public marketing routes should come from the repo-built Pages artifact
    // for every visitor. This avoids a broken/stale Lovable publish taking down
    // the landing page.
    if (isMarketingPath(path)) {
      const res = await proxyTo(env.PAGES_HOST, request);
      if (res.status === 404) return proxyTo(env.LOVABLE_HOST, request);
      return res;
    }

    // Pages-owned static files and Pages/Lovable hashed assets. Try Pages first
    // and fall back to Lovable so authenticated app assets still work even when
    // their hashes only exist in Lovable's build.
    if (isPagesStatic(path)) {
      const res = await proxyTo(env.PAGES_HOST, request);
      if (res.status === 404) return proxyTo(env.LOVABLE_HOST, request);
      return res;
    }

    // Non-marketing paths (auth, app, recipient links, etc.) go to Lovable.
    return proxyTo(env.LOVABLE_HOST, request);
  },
};

/**
 * Proxy the incoming request to the given origin host, preserving the path,
 * query string, method, headers, and body. The Host header is rewritten so
 * the upstream sees its own hostname.
 */
async function proxyTo(host: string, request: Request): Promise<Response> {
  if (!host) {
    return new Response("Router misconfigured: missing origin host", { status: 500 });
  }

  const incoming = new URL(request.url);
  const target = new URL(incoming.pathname + incoming.search, `https://${host}`);

  const headers = new Headers(request.headers);
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

  // Break redirect loops between the public host and upstream origins.
  if (upstream.status >= 300 && upstream.status < 400) {
    const location = upstream.headers.get("location");
    if (location) {
      try {
        const loc = new URL(location, target);
        const userHost = incoming.hostname.toLowerCase();
        const locHost = loc.hostname.toLowerCase();
        const sameUserHost =
          locHost === userHost ||
          locHost === `www.${userHost}` ||
          `www.${locHost}` === userHost;
        const sameUpstreamPath =
          locHost === host.toLowerCase() && loc.pathname === incoming.pathname;

        if (sameUserHost || sameUpstreamPath) {
          const followed = await fetch(target.toString(), {
            ...init,
            redirect: "follow",
          });
          const cleaned = new Headers(followed.headers);
          cleaned.delete("location");
          return new Response(followed.body, {
            status: followed.status === 0 ? 200 : followed.status,
            statusText: followed.statusText,
            headers: cleaned,
          });
        }

        if (locHost === host.toLowerCase()) {
          loc.hostname = incoming.hostname;
          loc.protocol = incoming.protocol;
          const rewritten = new Response(upstream.body, upstream);
          rewritten.headers.set("location", loc.toString());
          return rewritten;
        }
      } catch {
        // Malformed Location; return upstream as-is.
      }
    }
  }

  return upstream;
}
