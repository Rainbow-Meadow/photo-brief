# PhotoBrief hybrid hosting architecture

PhotoBrief currently uses the right hosting split for this stage of the product:

- **Cloudflare Pages** serves public, prerendered marketing/discovery pages.
- **Lovable/Supabase app origin** serves authenticated app, workspace, admin, invite, and recipient-token routes.
- **Supabase** remains the source of truth for auth, database, RLS, business records, submissions metadata, AI feedback, billing, and Edge Functions.
- **Cloudflare R2** stores customer submission media.
- **Cloudflare router Worker** decides whether an incoming request goes to Pages or the app origin.

This is intentionally not a full Cloudflare Pages app migration. The app shell still belongs on the Lovable/Supabase side for now because auth, DB, RLS, and Edge Functions are already tightly integrated there.

## Public Pages origin

Cloudflare Pages should receive only these public routes:

- `/`
- `/pricing`
- `/for-ai-agents`
- `/help`
- `/waitlist`

And these public discovery files:

- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`
- `/llms-full.txt`
- `/openapi.json`
- `/mcp.json`
- `/.well-known/ai-plugin.json`
- `/.well-known/agent.json`

The source of truth for prerendered public pages is `public/sitemap.xml`.

Recommended Cloudflare Pages settings:

```text
Build command: npm run build:cloudflare-pages
Output directory: dist
Node version: 20
```

`npm run build:cloudflare-pages` runs:

```text
npm run hosting:validate && npm run build:prerender
```

This validates the hybrid hosting contract, runs Vite, and prerenders sitemap routes into static HTML.

## App origin

The Lovable/Supabase app origin should receive:

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
- `/invite/*`
- `/beta-invite/*`
- `/r/*`

These routes are intentionally excluded from `public/sitemap.xml`, blocked in `public/robots.txt`, and fail closed in `public/_redirects` if they accidentally reach Pages.

## Cloudflare router Worker contract

The Worker allow-list should match `public/sitemap.xml` and the discovery files above.

Suggested routing logic:

```ts
const PAGES_PATHS = new Set([
  "/",
  "/pricing",
  "/for-ai-agents",
  "/help",
  "/waitlist",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/llms-full.txt",
  "/openapi.json",
  "/mcp.json",
  "/.well-known/ai-plugin.json",
  "/.well-known/agent.json",
]);

if (PAGES_PATHS.has(new URL(request.url).pathname)) {
  return fetch(request, PAGES_ORIGIN);
}

return fetch(request, APP_ORIGIN);
```

Do not route wildcard app paths to Pages. If the Worker accidentally does, Pages now returns a noindex 404 through `public/_redirects`.

## Headers and caching

`public/_headers` now sets:

- global security headers:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `Permissions-Policy: camera=(self), microphone=(), geolocation=()`
  - `X-Frame-Options: DENY`
- immutable one-year caching for hashed assets
- 30-day caching for static images/icons
- short edge caching for public marketing HTML:
  - `Cache-Control: public, max-age=300, s-maxage=3600, stale-while-revalidate=86400`
- one-hour browser / one-day shared-cache hints for discovery files

Do not add public cache rules for app, admin, invite, or recipient-token HTML.

## Fail-closed Pages routing

`public/_redirects` explicitly serves only public/prerendered routes and discovery files from Pages.

If these routes accidentally reach Pages, they return `/404.html` with a 404:

- app/auth routes
- admin routes
- invite routes
- recipient-token routes
- any unknown route

This prevents Pages from accidentally serving the wrong app shell for private/tokenized paths.

## CI guardrail

`npm run hosting:validate` checks that:

- sitemap routes are public-only
- required public routes are present
- app/token routes are absent from the sitemap
- robots blocks app/token routes
- `_headers` has the expected asset/discovery cache policies
- `_headers` does not public-cache app/token routes
- discovery files referenced in headers exist

CI runs this before build.

## Post-deploy verification

After deploy, check:

```bash
curl -I https://photobrief.ai/
curl -I https://photobrief.ai/pricing
curl -I https://photobrief.ai/llms.txt
curl -I https://photobrief.ai/assets/<hashed-file>.js
curl -I https://photobrief.ai/r/not-a-real-token
curl -I https://photobrief.ai/dashboard
```

Expected:

- public marketing pages return 200 and public short edge cache headers
- discovery files return 200 and one-day shared-cache headers
- hashed assets return immutable one-year cache headers
- `/r/*` and `/dashboard` should be handled by the app origin, not Pages
- if `/r/*` or `/dashboard` ever reaches Pages, it should return the static noindex 404

## Recommendation

Keep this hybrid model for now. It is the lowest-risk optimized setup for the current product:

- Cloudflare Pages handles fast public SEO/LLM surfaces.
- Lovable/Supabase keeps the app runtime where auth and DB already live.
- R2 handles media storage.
- A future Worker can handle media proxying and other edge APIs without forcing a database/auth migration.

## See also

- [Cloudflare Workers AI catalog](./cloudflare-workers-ai-catalog.md) — full account model list and the tier-by-tier fallback strategy used by `aiModelRouter.ts`.
