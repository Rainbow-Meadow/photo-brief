# Route every raster image through `cfImage`

## Scope

- 18 files contain `<img>` tags. The `cfImage` helper already exists with a working **preview-domain fallback** (when not on `photobrief.ai` it returns the raw URL — no Cloudflare detour).
- No `<video>` / `<source>` tags exist in `src/` (only in the separate `remotion/` render pipeline). Out of scope.
- 137 files use `lucide-react`. Those are inline React SVG components, not images. Out of scope.
- The `BrandMark` `<img>` element loads an SVG. SVGs don't benefit from Cloudflare Image Resizing, so we explicitly skip them.

## Approach — one wrapper component, replace every `<img>`

Adding `cfImage()` + `cfImageSrcSet()` calls inline on 25+ JSX `<img>` tags is verbose and brittle. Instead build a single `CfImg` component that:

1. Accepts the same props as `<img>` plus an optional `widths={[480, 720, 1080]}` array and `sizes` string.
2. Automatically calls `cfImage(src, { width: defaultWidth, format: "auto" })` for `src`.
3. Auto-builds `srcSet` from `widths` via `cfImageSrcSet`.
4. Bypasses cleanly on:
   - Empty / nullish src
   - `data:` and `blob:` URLs (user uploads in progress, base64 thumbnails)
   - `.svg` URLs (no benefit, can break)
   - Already-wrapped `/cdn-cgi/image/` URLs
   - The preview domain (existing `cfImage` already handles this)
5. Forwards every other prop (`className`, `alt`, `loading`, `decoding`, `width`, `height`, `fetchpriority`) untouched.

File: `src/components/shared/CfImg.tsx`.

## Replacements (per file)

| File | What it shows | Notes |
|---|---|---|
| `src/pages/Landing.tsx` | comparison illos | already migrated, leave as-is or swap to `CfImg` for consistency |
| `src/components/marketing/BeforeAfterSlider.tsx` | hero LCP slider | already migrated, swap to `CfImg` |
| `src/components/marketing/InteractiveHeroBriefAssembly.tsx` | 6 illustrations | wrap |
| `src/components/marketing/PublicPhotoPair.tsx` | marketing photo pair | wrap |
| `src/components/marketing/MechanismGrid.tsx` | mechanism illos | wrap |
| `src/features/capture/components/ReviewSummaryCard.tsx` | submitted photo previews | wrap; bypass blob/data |
| `src/features/capture/pages/PublicRecipientPage.tsx` (×2) | retake & completed previews | wrap; bypass blob/data |
| `src/features/capture/pages/RecipientConfirmationPage.tsx` | thank-you image | wrap |
| `src/features/intake/pages/PublicIntakePage.tsx` | intake hero | wrap |
| `src/features/intake/pages/IntakeBriefDetailPage.tsx` | brief preview | wrap; bypass blob/data |
| `src/features/submissions/components/ShotCard.tsx` | submission thumbnail | wrap; bypass blob/data |
| `src/features/help/components/AnnotatedScreenshot.tsx` | help screenshots | wrap |
| `src/features/integrations/components/ConnectorLogo.tsx` | logos (mostly SVG) | wrap; SVG bypass kicks in automatically |
| `src/features/workspace/pages/BrandSettingsPage.tsx` (×2) | uploaded brand logo previews | wrap; SVG/blob bypass |
| `src/components/shared/EmptyState.tsx` | empty-state illustrations | wrap |
| `src/components/layout/PublicRequestLayout.tsx` | recipient header logo | wrap (SVG bypass) |
| `src/components/layout/BrandMark.tsx` | two-tone wordmark SVG | **leave as-is** — SVG, also memory rule |

## Out of scope

- `index.html` `<link rel="icon">` and `og:image` — static, tiny, cf-image rewrites would require knowing the deployed asset hash.
- The Remotion render pipeline (`remotion/` directory).
- Lucide-react icons.
- The `BrandMark` SVG — explicitly excluded by brand-mark contract.

## Verification

1. `bunx vitest run` — unit + brand-mark contract tests must pass (BrandMark SVG check is enforced).
2. Visual check on `/`, `/help`, `/r/<demo>` to confirm images still render in preview (the cfImage fallback covers this).
3. After deploy, `curl -sI https://photobrief.ai/cdn-cgi/image/.../<asset>` should return `cf-polished` / WebP / AVIF headers.

## Risk

Low — the wrapper preserves all existing props and the preview-domain fallback already returns raw URLs. The only behavior change on production is that requests get rewritten through `/cdn-cgi/image/`, which Cloudflare proxies transparently.
