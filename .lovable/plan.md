# Extend prerender coverage to all marketing/legal/help routes

## Current state

`scripts/prerender.mjs` already does the heavy lifting: after `vite build`, it reads `public/sitemap.xml`, spins up a static server over `dist/`, and snapshots each sitemap URL into `dist/<route>/index.html`. The sitemap is the single source of truth.

The script itself doesn't need code changes. The gap is that **three public marketing/legal routes exist in the app but are missing from the sitemap and the two routing allow-lists**, so they never get prerendered and they never get routed to Pages even if they were.

### Public marketing/legal/help routes that exist in `src/App.tsx`

| Route | In sitemap.xml | In router allow-list | In _redirects |
|---|---|---|---|
| `/` | yes | yes | yes |
| `/pricing` | yes | yes | yes |
| `/for-ai-agents` | yes | yes | yes |
| `/help` | yes | yes | yes |
| `/privacy` | yes | no | yes |
| `/terms` | yes | no | yes |
| `/demo` | **no** | no | no |
| `/beta` | **no** | no | no |
| `/refund-policy` | **no** | no | no |

`/auth`, `/forgot-password`, `/signup`, `/welcome`, `/unsubscribe`, `/onboarding`, `/invite/*`, `/r/*`, `/i/*`, app, and admin routes are intentionally excluded per `docs/seo-llm-discovery.md` — they're either tokenized, auth-gated, or low-value for indexing.

## Changes

### 1. `public/sitemap.xml`
Add three `<url>` entries:
- `https://photobrief.ai/demo` — weekly, priority 0.9
- `https://photobrief.ai/beta` — weekly, priority 0.9
- `https://photobrief.ai/refund-policy` — yearly, priority 0.3

This alone makes `scripts/prerender.mjs` start emitting `dist/demo/index.html`, `dist/beta/index.html`, and `dist/refund-policy/index.html` on the next build. No script changes required.

### 2. `workers/router/src/index.ts`
Extend `MARKETING_PATHS` from 4 entries to 9 so the Cloudflare router actually routes these paths to Pages (otherwise they fall through to the Lovable origin and the prerendered HTML is never served):

```ts
const MARKETING_PATHS = new Set<string>([
  "/",
  "/pricing",
  "/help",
  "/for-ai-agents",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/demo",
  "/beta",
]);
```

### 3. `public/_redirects`
Add the missing Pages routes to the explicit allow-list so Pages can serve `dist/<route>/index.html` (this file is the fail-closed contract for Pages):

```
/demo /demo/index.html 200
/beta /beta/index.html 200
/refund-policy /refund-policy/index.html 200
```

`/privacy` and `/terms` are already there.

### 4. `docs/seo-llm-discovery.md` (small doc fix)
The "Current public indexable pages" list currently shows `/waitlist` (which doesn't exist) and is missing `/demo`, `/beta`, `/privacy`, `/terms`, `/refund-policy`. Update it to match reality so future changes don't drift again.

## Out of scope

- No SSR, no framework change, no React Router or build-pipeline changes.
- No new structured data, no copy changes — `PageMeta` already handles per-route `<title>`, description, canonical, OG, JSON-LD on each of these pages, and the prerender script captures the post-mount DOM.
- No changes to puppeteer flags, viewport, or wait conditions — current setup (`networkidle0` + `#root > div` + 30s timeout) already works for the existing 8 routes and the 3 new ones are simpler than `/` or `/pricing`.

## Verification

After the change ships:
1. CI / `npm run build:prerender` produces `dist/demo/index.html`, `dist/beta/index.html`, `dist/refund-policy/index.html` with rendered hero content (not the empty SPA shell).
2. `scripts/smoke-public-endpoints.mjs` returns 200 with non-empty HTML for each new path.
3. `curl -I https://photobrief.ai/demo` (with a bot UA) returns the Pages origin, not Lovable.
4. Sitemap fetched at `/sitemap.xml` lists all 11 URLs.

