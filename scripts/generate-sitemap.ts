/**
 * Generates public/sitemap.xml from a hand-maintained allowlist of public,
 * indexable routes. Runs via `prebuild` so the file is fresh on every build.
 *
 * Why a hardcoded list (not derived from routePaths.ts)? Most app routes are
 * private/tokenized and must NEVER be indexed. An explicit allowlist is the
 * audit surface.
 *
 * Only `<loc>` and `<lastmod>` are emitted. Google ignores `<changefreq>` and
 * `<priority>` — see https://developers.google.com/search/blog/2023/05/sitemaps-lastmod-ping.
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://photobrief.ai";

const paths: readonly string[] = [
  "/",
  "/demo",
  "/pricing",
  "/for-ai-agents",
  "/help",
  "/privacy",
  "/terms",
  "/refund-policy",
];

const lastmod = new Date().toISOString().slice(0, 10);

const urls = paths
  .map((p) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${p === "/" ? "/" : p}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `  </url>`,
    ].join("\n"),
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(resolve("public/sitemap.xml"), xml);
console.log(`sitemap.xml written (${paths.length} entries, lastmod ${lastmod})`);
