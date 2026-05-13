# Cloudflare images: rewrite at build time, not just at runtime

## What's actually happening

Cloudflare Image Resizing on `photobrief.ai` is configured correctly. Verified directly:

- `GET /assets/01-research-website-analysis-…png` → **2,104,511 B**, `image/png`
- `GET /cdn-cgi/image/width=800,format=auto/assets/01-research-website-analysis-…png` → **77,153 B**, `image/jpeg`, `cf-resized: internal=ok`

So the zone is fine. What's broken is the **HTML the user actually downloads**.

The site is prerendered (`scripts/prerender.mjs`) by Puppeteer hitting `http://127.0.0.1:4173`. Inside that headless browser, `window.location.hostname === "127.0.0.1"`, so `cfResizingAvailable()` in `src/lib/cfImage.ts` returns `false`, and `cfImage()` / `cfImageSrcSet()` return the **raw** Vite asset URLs.

The resulting `dist/index.html` (and every other prerendered route) ships with:

```html
<img src="/assets/01-research-website-analysis-BQ2bG-gZ.png" …>
```

instead of:

```html
<img src="https://photobrief.ai/cdn-cgi/image/width=1080,format=auto,…/assets/01-research-website-analysis-BQ2bG-gZ.png" …>
```

Lighthouse downloads what's in the HTML before React hydrates and rewrites the `src`, which is why the report shows ~11 MB of original PNGs and a 6.8 s LCP. That matches all 8 PNG/JPG entries in the "Avoid enormous network payloads" list.

## Fix

Stop relying on `window.location.hostname` to decide whether to wrap URLs. Use an explicit build flag that's true for the production build (and therefore also true inside the Puppeteer prerender, because it just reads the built bundle).

### Changes

**1. `src/lib/cfImage.ts` — `cfResizingAvailable()`**

Replace the hostname check with an env-driven flag, with hostname as a runtime safety net:

```ts
function cfResizingAvailable(): boolean {
  // Build-time opt-in: production builds and prerender both see this as "true",
  // so the emitted HTML already contains /cdn-cgi/image/... URLs.
  if (import.meta.env.VITE_CF_IMAGES === "true") return true;
  // Runtime safety net for any deploy that forgot the env var.
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h === DEFAULT_HOST || h === `www.${DEFAULT_HOST}`) return true;
  }
  return false;
}
```

This keeps preview (`*.lovable.app`) and `localhost` unaffected: they don't set `VITE_CF_IMAGES` and their hostname doesn't match, so `cfImage()` keeps returning the raw URL exactly as today.

**2. `.github/workflows/deploy-cloudflare.yml` — set the env var for the production build**

Add `VITE_CF_IMAGES: "true"` to the `env:` block of the step that runs `vite build` (and the prerender step, if it builds again). One-line addition.

**3. `.env.example`**

Document the flag:
```
# Set to "true" in CI for the photobrief.ai production build so prerendered
# HTML emits /cdn-cgi/image/ URLs. Leave unset locally and on previews.
VITE_CF_IMAGES=
```

No changes to `CfImg`, no changes to any component, no changes to Cloudflare dashboard / DNS / Page Rules — the zone is already configured.

## Verification

After deploy:

1. `curl -s https://photobrief.ai/ | grep -oE '/cdn-cgi/image/[^"<> ]+' | sort -u` should list the hero/landing illustrations.
2. Re-run Lighthouse mobile. Expected: LCP image ~80 KB instead of ~2 MB; total payload drops from ~11 MB to ~1 MB; LCP drops from 6.8 s into the green zone; "Avoid enormous network payloads" cleared.
3. `*.lovable.app` preview must still render images (raw URLs, no `/cdn-cgi/image/` prefix) — confirms preview wasn't broken.

## Out of scope

- Image compression / format conversion of the source PNGs (CF resizing already handles this).
- The two "Reduce unused CSS / JS" diagnostics — separate issue, not what the user asked about.
- The "Image elements do not have explicit width/height" diagnostic — already partially handled in `BeforeAfterSlider` and friends; can be a follow-up sweep.
