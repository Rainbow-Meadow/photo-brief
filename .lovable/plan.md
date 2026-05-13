# Fix: Bundled images blank on live site

## Problem
On https://photobrief.ai the hero before/after slider (and any other `@/assets` image routed through `CfImg`) renders as a black box. Network shows:

```
GET /cdn-cgi/image/width=960,format=auto,metadata=none//assets/hero-before-…jpg → 403
```

Note the `//assets` — double slash. `cfImage()` builds `https://photobrief.ai/cdn-cgi/image/${opts}/${url}` but Vite-bundled asset URLs already start with `/`, so the join produces `…/${opts}//assets/…`. Cloudflare's resizer rejects that path (`err=9404` / 403).

Preview (`*.lovable.app`) is unaffected because `cfResizingAvailable()` short-circuits and returns the raw URL.

## Fix (single file: `src/lib/cfImage.ts`)

In `cfImage()`, normalize the source before concatenation:

- If `url` is an absolute `http(s)://…` URL → keep as-is (Cloudflare fetches it verbatim).
- If `url` is a same-origin path → ensure exactly one leading `/`. Strip any leading `/` from `url` and always emit `…/cdn-cgi/image/${opts}/${normalized}` where `normalized` does **not** start with `/`. Cloudflare treats a relative source as same-zone, which is the desired behavior for Vite assets.

Apply the same normalization inside `cfImageSrcSet()` (it calls `cfImage()` so the single fix covers both).

## Verification

1. After edit, refresh https://photobrief.ai in the browser tool and confirm the four `/cdn-cgi/image/...` requests return `200` with `cf-resized` success header (no `err=`).
2. Confirm the before/after slider renders both photos.
3. Spot-check one other CfImg consumer that uses an external URL (e.g. `ConnectorLogo` simpleicons) to confirm absolute URLs still work.
4. `bunx vitest run` to make sure no test regressed.

## Out of scope
No component changes; no behavior change on preview/localhost; brand SVGs and bypass list untouched.
