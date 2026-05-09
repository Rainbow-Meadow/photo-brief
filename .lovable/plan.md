
## Goal

Bring every off-app brand surface (browser tab, OS home-screen, social share previews, PWA install) onto the new dark Field Manual system: near-black canvas `#0c0c0a`, cream wordmark `#F4F1EA`, single amber accent `#F2A33A`, monospace plate codes, hairline rules, tagline `GUIDE · CAPTURE · CLOSE`.

## 1. App icons & favicon (dark canvas)

Generate a single master icon (cream "Photo" + amber "brief" monogram on `#0c0c0a`, hairline amber rule above tagline, safe-area padding for maskable) and emit:

- `public/favicon.ico` (16/32/48 multi-res)
- `public/favicon-16x16.png`, `public/favicon.png` (32×32)
- `public/icon-192.png`, `public/icon-512.png` (any-purpose, dark)
- `public/brand/icon-192.png`, `public/brand/icon-512.png` (maskable, with extra safe-area)
- `public/apple-touch-icon.png` (180×180, dark)

Implementation: `imagegen` premium tier for the master, then `nix run nixpkgs#imagemagick` to downscale to each exact size and to build the `.ico`. Old cream-bg PNGs are overwritten in place so existing `<link rel="icon">` URLs don't change.

## 2. PWA manifest + index.html theme tokens

`public/site.webmanifest`:
- `background_color`: `#FAF7F2` → `#0c0c0a`
- `theme_color`: `#F2A33A` → `#0c0c0a` (amber stays as accent inside icon, not as Android status bar wash)
- `description` rewritten in declarative RMBC voice: "Guide. Capture. Close. Quote-ready customer briefs for service businesses."

`index.html`:
- `theme-color` light/dark both → `#0c0c0a` (single-palette per `mem://design/color-system`)
- `apple-mobile-web-app-status-bar-style` → `black-translucent`
- Drop the legacy light/dark `prefers-color-scheme` split (we no longer ship a light theme)
- `og:image` / `twitter:image` defaults point to new `/og-image.png` (1200×630)
- JSON-LD `Organization.logo` updated to dedicated `/brand/logo-square.png`

## 3. Per-page OG image variants (1200×630, Field Manual plate)

Each variant uses the same template: dark `#0c0c0a` bg, 1px hairline frame inset 48px, monospace plate code top-left in amber (`[ NN ] LABEL`), cream editorial wordmark `Photo` + amber `brief`, page-specific eyebrow line, tagline `GUIDE · CAPTURE · CLOSE` bottom-right, single amber rule.

| File | Plate | Eyebrow |
|---|---|---|
| `/og-image.png` (default) | `[ 00 ] FIELD MANUAL` | Quote-ready customer briefs for service businesses. |
| `/og/pricing.png` | `[ 01 ] PRICING` | Free to start. Pro tiers when you scale. |
| `/og/for-ai-agents.png` | `[ 02 ] FOR AI AGENTS` | MCP + OpenAPI. Programmable photo briefs. |
| `/og/help.png` | `[ 03 ] HELP` | Setup, capture flow, recipient experience. |
| `/og/beta.png` | `[ 04 ] BETA` | 60-day founding partner program. |

Generated via `imagegen` premium per page (text legibility), QA'd by inspecting each PNG before delivery.

`SEOHead.tsx` default constant: `DEFAULT_OG_IMAGE = "/og-image.png"` (was `.svg`, file never existed → currently a broken share preview). Per-route pages opt into their variant via existing `ogImage` prop on `PageMeta` (`Pricing.tsx`, `ForAiAgents.tsx`, `Help.tsx`, `BetaWelcome.tsx`).

## 4. Cloudflare router

`workers/router/src/index.ts` `PAGES_STATIC_PREFIXES` already covers `/og-image` and `/brand/`. Add `/og/` so per-page variants are served from Pages with edge caching. No origin logic changes.

## 5. Out of scope

- No changes to in-app `BrandMark` component or marketing pages.
- No changes to email templates (already redesigned).
- No service worker / vite-plugin-pwa work — manifest-only install path stays as-is.
- No DB / RLS / edge-function logic changes.

## 6. Verification

- `bun run build` clean.
- Inspect each generated PNG visually (QA pass per skill instructions).
- `curl -I https://photobrief.ai/og-image.png` returns 200 from Pages.
- Validate share preview with `curl https://www.opengraph.xyz/url/...` after publish (manual step the user does).
- `lighthouse` PWA audit: manifest installable, icon checks pass.

## Technical notes

- ImageMagick path: `nix run nixpkgs#imagemagick -- convert master.png -resize 192x192 icon-192.png` etc.
- `.ico` build: `convert favicon-48.png favicon-32.png favicon-16.png favicon.ico`.
- Maskable safe area: keep all glyphs within central 80% (per W3C maskable spec) — generated source prompt enforces this.
- Memory note to add after build: `mem://design/brand-system` should be updated with new icon canvas decision (dark `#0c0c0a`, single source set).
