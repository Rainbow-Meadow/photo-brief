#!/usr/bin/env node

/**
 * Validates the intended PhotoBrief hybrid hosting contract:
 *
 * - Cloudflare Pages owns only public marketing/discovery routes.
 * - Lovable/Supabase app origin owns authenticated, workspace, admin, and
 *   tokenized recipient routes.
 * - public/sitemap.xml is the source of truth for Pages/prerender routes.
 * - robots.txt blocks app/token routes.
 * - _headers caches static assets/discovery docs without caching app/token HTML.
 *
 * This intentionally does not boot Chromium. It is a cheap CI guardrail that
 * catches drift before deployment. The full prerender still lives in
 * scripts/prerender.mjs.
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "public");

const REQUIRED_PUBLIC_PAGES = ["/", "/pricing", "/for-ai-agents", "/help"];
const FORBIDDEN_PAGES_ROUTES = [
  "/auth",
  "/forgot-password",
  "/reset-password",
  "/unsubscribe",
  "/signup",
  "/onboarding",
  "/dashboard",
  "/requests",
  "/submissions",
  "/guides",
  "/customers",
  "/settings",
  "/admin",
  "/invite/",
  "/beta-invite/",
  "/r/",
];

const DISCOVERY_FILES = [
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/llms-full.txt",
  "/openapi.json",
  "/mcp.json",
  "/.well-known/ai-plugin.json",
  "/.well-known/agent.json",
];

function fail(message) {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`✅ ${message}`);
}

function parseSitemapRoutes(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
    const loc = m[1].replace(/&amp;/g, "&").trim();
    let pathname;
    try {
      pathname = new URL(loc, "https://photobrief.ai").pathname;
    } catch {
      pathname = loc;
    }
    if (!pathname.startsWith("/")) pathname = `/${pathname}`;
    if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
    return pathname || "/";
  });
}

function sectionFor(headers, path) {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|\\n)${escaped}\\n([\\s\\S]*?)(?=\\n\\S|$)`);
  return headers.match(re)?.[2] ?? "";
}

async function main() {
  const sitemapPath = join(PUBLIC_DIR, "sitemap.xml");
  const robotsPath = join(PUBLIC_DIR, "robots.txt");
  const headersPath = join(PUBLIC_DIR, "_headers");

  for (const path of [sitemapPath, robotsPath, headersPath]) {
    if (!existsSync(path)) fail(`${path} is missing`);
  }
  if (process.exitCode) process.exit(process.exitCode);

  const [sitemap, robots, headers] = await Promise.all([
    readFile(sitemapPath, "utf8"),
    readFile(robotsPath, "utf8"),
    readFile(headersPath, "utf8"),
  ]);

  const routes = parseSitemapRoutes(sitemap);
  const uniqueRoutes = [...new Set(routes)];
  if (routes.length !== uniqueRoutes.length) fail("sitemap.xml contains duplicate routes");

  for (const route of REQUIRED_PUBLIC_PAGES) {
    if (!uniqueRoutes.includes(route)) fail(`sitemap.xml is missing required public route ${route}`);
  }

  for (const route of uniqueRoutes) {
    const forbidden = FORBIDDEN_PAGES_ROUTES.find((prefix) =>
      prefix.endsWith("/") ? route.startsWith(prefix) : route === prefix || route.startsWith(`${prefix}/`),
    );
    if (forbidden) fail(`sitemap.xml includes non-Pages/app route ${route} (blocked prefix ${forbidden})`);
  }
  ok(`sitemap routes are public-only: ${uniqueRoutes.join(", ")}`);

  for (const blocked of FORBIDDEN_PAGES_ROUTES) {
    if (!robots.includes(`Disallow: ${blocked}`)) {
      fail(`robots.txt does not disallow ${blocked}`);
    }
  }
  ok("robots.txt blocks app, auth, admin, invite, and recipient-token routes");

  if (!headers.includes("/assets/*") || !headers.includes("max-age=31536000") || !headers.includes("immutable")) {
    fail("_headers does not set immutable long-cache headers for /assets/*");
  } else {
    ok("_headers sets immutable caching for hashed assets");
  }

  for (const file of DISCOVERY_FILES) {
    const section = sectionFor(headers, file);
    if (!section.includes("Cache-Control: public, max-age=3600, s-maxage=86400")) {
      fail(`_headers does not set expected discovery-file cache policy for ${file}`);
    }
  }
  ok("_headers sets shared-cache policy for public discovery files");

  const forbiddenExplicitSections = ["/dashboard", "/requests", "/submissions", "/settings", "/r/"];
  for (const route of forbiddenExplicitSections) {
    if (sectionFor(headers, route).includes("Cache-Control: public")) {
      fail(`_headers explicitly public-caches app/token route ${route}`);
    }
  }

  const globalSection = sectionFor(headers, "/*");
  if (globalSection.includes("Cache-Control: public")) {
    fail("_headers sets public Cache-Control on the global /* rule");
  }
  ok("_headers does not explicitly public-cache app/token routes");

  for (const file of DISCOVERY_FILES) {
    const publicPath = join(PUBLIC_DIR, file.replace(/^\//, ""));
    if (!existsSync(publicPath)) fail(`discovery file is referenced but missing: public${file}`);
  }
  ok("all referenced public discovery files exist");

  if (process.exitCode) {
    console.error("\nHybrid hosting validation failed.");
    process.exit(process.exitCode);
  }
  console.log("\nHybrid hosting validation passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
