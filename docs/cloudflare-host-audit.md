# Cloudflare host audit

Audit date: 2026-05-02
Domain: `photobrief.ai`

This audit used a temporary GitHub Actions workflow that read the Cloudflare token from repository secrets. The workflow and script were removed before merge so repository secrets are not exposed to future PR workflows.

## Current Cloudflare state

The host is in good shape overall:

- Zone status: active
- Zone type: full
- Proxied through Cloudflare
- SSL mode: strict
- Always Use HTTPS: on
- Automatic HTTPS Rewrites: on
- Brotli: on
- HTTP/2: on
- HTTP/3: on
- Early Hints: on
- Rocket Loader: off, which is preferred for this React app
- Server responses include:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`

## Public endpoint observations

Checked endpoints:

- `https://photobrief.ai/`
- `https://photobrief.ai/robots.txt`
- `https://photobrief.ai/sitemap.xml`
- `https://photobrief.ai/llms.txt`

All returned `200` and were gzip-compressed.

The root document returned:

```text
Cache-Control: no-cache, must-revalidate, max-age=0
```

The public discovery files did not return useful explicit cache-control headers during the audit.

## Optimization applied in repo

Added `public/_headers` with safe static-host headers:

- immutable one-year caching for hashed build assets
- 30-day caching for static images/icons
- one-hour browser / one-day shared-cache hints for public discovery files:
  - `/robots.txt`
  - `/sitemap.xml`
  - `/llms.txt`
  - `/llms-full.txt`
  - `/openapi.json`
  - `/mcp.json`
  - `/.well-known/ai-plugin.json`
  - `/.well-known/agent.json`
- consistent security headers:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`

## Follow-up checks after deploy

Run:

```bash
curl -I https://photobrief.ai/assets/<hashed-file>.js
curl -I https://photobrief.ai/robots.txt
curl -I https://photobrief.ai/sitemap.xml
curl -I https://photobrief.ai/llms.txt
```

Confirm:

- hashed assets include `Cache-Control: public, max-age=31536000, immutable`
- discovery files include `Cache-Control: public, max-age=3600, s-maxage=86400`
- root HTML is still not aggressively browser-cached
- `/r/<token>` and authenticated app routes are not accidentally cached as public static documents

## Things not changed

Cloudflare minification is still off. That is acceptable because Vite already minifies production JS/CSS. Cloudflare minification can stay off unless a later audit proves HTML/CSS savings are worth the additional edge transform.

Cloudflare WAF was reported as off. This may be fine during beta, but before broad launch, consider enabling a managed WAF ruleset and bot protections for auth and public recipient routes.
