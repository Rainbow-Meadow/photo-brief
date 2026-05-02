# SEO and LLM discovery strategy

PhotoBrief has two discovery audiences:

1. Traditional search engines that need crawlable marketing pages, canonical tags, structured data, sitemap, robots.txt, and fast prerendered HTML.
2. LLMs / answer engines / agents that need concise, current, quotable product facts and machine-readable API/discovery files.

## Current public indexable pages

Only these public pages should appear in the sitemap and search index:

- `/`
- `/pricing`
- `/for-ai-agents`
- `/help`
- `/waitlist`

The app, auth, invite, recipient, settings, customer, request, submission, and admin routes should not be indexed. These paths may contain private workspace state, tokenized recipient links, or low-value app screens.

## Crawl controls

`public/robots.txt` allows public marketing/discovery pages and disallows:

- `/auth`
- `/forgot-password`
- `/reset-password`
- `/unsubscribe`
- `/signup`
- `/onboarding`
- `/dashboard`
- `/requests`
- `/submissions`
- `/guides`
- `/customers`
- `/settings`
- `/admin`
- `/invite/`
- `/beta-invite/`
- `/r/`

Robots rules are repeated for major search and AI crawlers so tokenized recipient links are not invited into search or training surfaces.

## Metadata system

Use `PageMeta` from `src/hooks/seo/usePageMeta.tsx` for every public or noindex route that needs page-specific metadata.

It supports:

- title
- meta description
- canonical URL
- robots/noindex
- Open Graph and Twitter image/card metadata
- JSON-LD
- breadcrumbs

`PageMeta` delegates to `SEOHead`, so the prerender pass and client-side navigation use the same DOM mutation path.

## Prerendering

`scripts/prerender.mjs` reads `public/sitemap.xml` after build and prerenders each sitemap URL into static HTML. This means public marketing pages have crawlable HTML before client-side hydration.

The sitemap is the source of truth for prerendered public pages. Do not add authenticated or tokenized routes to the sitemap.

## Structured data

Use structured data only where it helps answer engines and search engines understand the page:

- Home: `SoftwareApplication`, `HowTo`, `FAQPage`, `BreadcrumbList`
- Pricing: `FAQPage`, `BreadcrumbList`
- For AI agents: `TechArticle`, `HowTo`, `FAQPage`, `BreadcrumbList`
- Help: FAQ-derived structured data where available

Avoid injecting stale product claims or pricing into page-specific schema. Pricing must match `src/config/planLimits.ts` and the LLM files.

## LLM and agent files

Public machine-readable files:

- `/llms.txt` — concise LLM summary and quotable facts
- `/llms-full.txt` — full product, pricing, FAQ, and API reference
- `/openapi.json` — API schema for creating requests
- `/.well-known/ai-plugin.json` — plugin-style manifest
- `/.well-known/agent.json` — agent capabilities manifest
- `/mcp.json` — planned MCP descriptor and REST fallback

These files must stay aligned with product reality. Current canonical claims:

- PhotoBrief turns customer photos into business-ready briefs.
- Recipients do not need an app.
- Requests can contain one photo or many.
- Pricing is per submitted/analyzed photo.
- 1 submitted/analyzed photo = 1 PhotoBrief Credit.
- First-pass guarantee: follow-up photos requested by PhotoBrief after a rejected first pass do not consume credits.

## Copy guardrails

Do not reintroduce stale language such as:

- “Requests per month” as the primary pricing unit
- “AI checks per month” as the customer-facing pricing unit
- “If rework is needed, the request is refunded”
- “25 / 100 / 500 extra requests” for top-ups

Preferred language:

- “PhotoBrief Credits are photo credits.”
- “1 submitted/analyzed photo = 1 credit.”
- “Requests can contain one photo or many photos.”
- “First-pass follow-up photos are free.”
- “Basic AI quality checks and summaries are included.”

## Deployment checklist

After SEO/LLM changes:

1. Run CI.
2. Run `npm run build:prerender` locally or in preview if possible.
3. Verify `/sitemap.xml` contains only public indexable pages.
4. Verify `/robots.txt` blocks `/r/`, app routes, auth, invites, and admin.
5. Verify `/llms.txt` and `/llms-full.txt` match current pricing/product copy.
6. Verify public pages render canonical tags and structured data in prerendered HTML.
7. Submit sitemap in Google Search Console and Bing Webmaster Tools after production deploy.
8. In GA4, watch organic landing pages and conversion events after indexing updates.
