# Cloudflare zone performance pass for photobrief.ai

The `CLOUDFLARE_API_TOKEN` secret is in place and the photobrief.ai zone (`6d712e4f9a56f8531b3cfe39c65af5d7`) responds to API calls. I audited the live zone — most of the easy wins are already on, but a few high-impact toggles are off and the HTML response is the worst offender.

## Current zone state (audit)

| Setting | Value | Verdict |
|---|---|---|
| Brotli | on | ✅ |
| Early Hints | on | ✅ |
| HTTP/3 + 0-RTT | on | ✅ |
| TLS 1.3 (zrt) | on | ✅ |
| Polish | lossy | ✅ |
| WebP | on | ✅ |
| Image Resizing | on | ✅ |
| HTTP/2 | on | ✅ |
| Always Use HTTPS | on | ✅ |
| Auto Minify | css/html/js OFF | ⚠️ html worth turning on |
| Mirage | OFF | ⚠️ adaptive image loading for mobile |
| Tiered Cache | unset | ⚠️ free latency win |
| Speculation Rules | ON | 🔴 source of the 90 KB `/metrics` Lighthouse warning |
| HTML cache-control | `private, no-store, no-cache` | 🔴 every hit goes to origin |
| Browser cache TTL | Respect Existing Headers | OK once HTML headers are fixed |
| Rocket Loader | off | ✅ correct — would break React |

## Plan — what I'll change and why

### 1. Disable Speculation Rules (zone setting)

Lighthouse called out a phantom 90 KB `/metrics/` prefetch as "unused JavaScript". That's Cloudflare's speculation-rules feature prefetching the next likely navigation. For a single-page React app this is wasted bandwidth on the first paint. Turn `speculation` off via the Settings API.

### 2. Add a Cache Rule for the HTML shell

The root document currently ships `cache-control: private, no-store, no-cache` — every visit blocks on origin TTFB. The Vite `index.html` has hashed asset references inside it, so 60s edge cache is safe and cuts repeat-visit TTFB to near zero.

Cache rule:
- Match: `(http.host eq "photobrief.ai" and http.request.uri.path eq "/")` (and `www.photobrief.ai`)
- Action: Eligible for cache, edge TTL 60 s, browser TTL 0, override origin headers.

### 3. Add a Cache Rule for hashed Vite assets

Match `/assets/*` and `/brand/*` — set edge TTL = 1 year, browser TTL = 1 year (`immutable`). Vite filenames already include content hashes, so this is safe and stops repeat fetches entirely.

### 4. Enable Mirage

`PATCH …/settings/mirage value=on`. Mirage swaps in placeholder image variants on slow connections — pairs well with the `cfImage` work just shipped.

### 5. Enable Tiered Cache (Smart topology)

`PATCH …/cache/tiered_cache_smart_topology_enable value=on` and `…/argo/tiered_caching value=on`. Free for paid plans; cuts origin fetches by routing through a regional tier.

### 6. Enable HTML auto-minify

`PATCH …/settings/minify value={html: on, css: off, js: off}`. CSS/JS minification is deprecated and Vite already minifies; HTML minification is still safe and trims a few KB off the shell.

### 7. Polish → ensure WebP conversion is forced

Already `lossy` + WebP on, but I'll re-PATCH to confirm WebP is the chosen format (defensive).

### 8. Verify

After each PATCH, re-read the setting via the API, then `curl -I https://photobrief.ai/` to confirm:
- `cache-control` no longer says `no-store`
- `cf-cache-status` flips from `DYNAMIC` to `MISS` then `HIT` on a second curl
- `speculation-rules` header is gone

Then ask the user to re-run the mobile Lighthouse pass against `https://photobrief.ai`.

## Out of scope

- Rocket Loader (would break React hydration).
- Bot Fight Mode / Under Attack (security, not perf).
- Origin changes — these are all edge-only.
- Workers/route changes — not needed for this pass.

## Risk and rollback

Every change is a single API call against a documented setting. Rollback is the inverse PATCH. The HTML cache rule is the only change with user-visible blast radius — 60 s edge TTL means a worst-case 60 s delay before content updates propagate after a deploy. If that's a problem we can shorten to 30 s or scope it to anonymous visitors only.
