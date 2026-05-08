## Brand overhaul: navy + amber, tradesperson identity

The new logo is a navy + amber tool-belt camera with the wordmark "Photo" (navy) + "Brief" (amber) and tagline "Guide · Capture · Close". This replaces the old purple/lavender SaaS look. Confirmed direction:

- **Theme:** light surfaces (cream/white), navy text, amber accents
- **Wordmark:** rendered as two-tone CSS text (navy + amber) — no image
- **Tagline:** "Guide · Capture · Close" becomes the official tagline everywhere

---

### 1. Replace brand assets

Copy the uploaded SVGs into the project and regenerate raster sizes for favicons, social previews, email logos, and the Remotion video.

- `public/brand/mark.svg` — new mark (from `Brand_Mark.svg`)
- `public/brand/full-logo.svg` — full lockup (from `Full_Logo.svg`)
- Re-rasterize from the mark SVG: `mark-color.png`, `mark-color.webp`, `mark-color-sm.webp`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon.png`, `favicon.ico`, `favicon-16x16.png`, `photobrief-mark.png`
- Re-rasterize full lockup: `photobrief-logo.png`, regenerated `og-image.png` and `og-betalist.png` (navy mark on cream with new tagline)
- Upload `mark-color.png` to the `email-assets` Supabase storage bucket (used by transactional email header)

### 2. New color tokens (light theme aligned to logo)

Define the palette once and propagate. Approximate HSL values pulled from the artwork; will be tuned for AA contrast during implementation.

| Token | Old (purple-on-dark) | New (navy + amber) |
|---|---|---|
| Brand navy | `260 52% 4%` | `218 55% 17%` (#1B2A4A) |
| Brand amber | `262 83% 58%` | `35 88% 55%` (#F2A33A) |
| Background | `260 24% 96%` mixed w/ navy | `40 33% 97%` cream (#FAF7F2) |
| Surface | `#15121f` dark cards | `0 0% 100%` white cards |
| Foreground | white-on-dark | navy-on-cream |
| Primary CTA | `#8f63ff` | amber `#F2A33A` |
| Primary glow | lavender `#b98cff` | amber-light `#F6BC6A` |
| Accent / link | lavender | navy |
| Border | lavender alpha | warm gray `30 15% 88%` |

Files updated:

- `src/index.css` — `:root` semantic tokens, gradients (`--gradient-primary`, `--gradient-brand`, `--gradient-radial-glow`), shadows (drop the violet glow, replace with amber glow + soft navy shadow), `--brand-navy`, `--brand-lens` retuned. Dark-mode block kept but recolored navy/amber instead of purple.
- `src/brand-overrides.css` — replaces the dark navy + purple marketing override layer with cream/navy/amber. Removes `#0c0915`, `#8f63ff`, `#b98cff`, `#cfb2ff` references. Marketing pages become light by default.
- `src/theme.css` — recolor any premium-dark utility classes to the new palette.
- `src/design-system/shared/brand.tokens.ts` — `BRAND.colors` updated: `violet→amber`, `lavender→amberLight`, `electric→navy`, `paper→cream`, `night/ink→deep navy`. `tone: "premium-light"`.
- `tailwind.config.ts` — extend `colors.brand.{navy,amber,amberLight,cream}`; update `backgroundImage.gradient-*` and `boxShadow.glow/brand` references if hard-coded.

### 3. Wordmark + BrandMark component

`src/components/layout/BrandMark.tsx`:

- Drop the purple gradient text. Replace `Wordmark` with two `<span>`s: "Photo" in `text-brand-navy`, "Brief" in `text-brand-amber` (and ".ai" in muted navy at 60% weight where the `.ai` is shown). Same Inter Black weight, same `-0.06em` tracking.
- `MarkImage` swaps to the new `mark.svg` (vector first, with PNG fallback). Update `MARK_SRC` / `MARK_FALLBACK` paths.
- Add an optional `showTagline?: boolean` prop that renders `GUIDE · CAPTURE · CLOSE` underneath in small navy uppercase tracked-out type — used by the stacked variant, footer, OG image, and video.

### 4. Tagline rollout

Replace the existing taglines wherever they appear:

- Hero subhead (`src/pages/Landing.tsx`): "Turn website leads into photo-ready briefs" → keep as longer secondary line under H1, but the **3-word tagline appears in the lockup directly under the wordmark**.
- Marketing footer / `MarketingLayout` — show stacked BrandMark with tagline.
- `PoweredByBadge.tsx` — "Sent securely with PhotoBrief.ai · Guide · Capture · Close".
- Remotion `SceneLogo.tsx` — replace "Visual intake for small businesses" / "Turn website leads into photo-ready briefs" with the new lockup.
- `index.html` `<meta name="description">`, OG description, `public/site.webmanifest` description, `llms.txt`, `llms-full.txt`, `public/.well-known/agent.json` — update tagline string.

### 5. Email + dark surfaces

`supabase/functions/_shared/transactional-email-templates/brand-styles.ts` and the six auth email templates (`signup`, `recovery`, `magic-link`, `invite`, `email-change`, `reauthentication`):

- Background `#0c0915` → cream `#FAF7F2`
- Surface `#15121f` → white `#FFFFFF` with subtle navy border `rgba(27,42,74,0.08)`
- Primary text → navy `#1B2A4A`
- CTA `#8f63ff` → amber `#F2A33A`, hover `#F6BC6A`, white CTA text
- Accent / link → navy
- Logo URL stays the same (file is replaced in storage)

Re-deploy the auth-email-hook edge function after edits.

### 6. Remotion video theme

`remotion/src/theme.ts`:

- `bgDark` → cream / off-white (`#FAF7F2`)
- `primary` violet → amber, `primaryGlow` → amber-light, `cyan/violet` aliases retired or recolored navy
- Shadows lose the violet glow, gain a soft amber glow + navy depth shadow
- `SceneLogo.tsx` switches gradient text to two-tone navy + amber

### 7. Manifest + meta

- `public/site.webmanifest`: `theme_color` `#8f63ff` → `#F2A33A`, `background_color` `#060507` → `#FAF7F2`
- `index.html` `<meta name="theme-color">` updated
- `public/_headers` — no change unless CSP references images we removed

### 8. Memory

Update `mem://index.md` Core line and `mem://design/brand-system`:

- Old: "dark navy bg (#0c0915), purple/lavender accents (#8f63ff, #b98cff, #7C3AED)"
- New: "cream bg (#FAF7F2), brand navy (#1B2A4A) + amber (#F2A33A). Tagline 'Guide · Capture · Close'. BrandMark renders Photo (navy) + Brief (amber) two-tone."

### 9. QA after implementation

- Walk every top-level marketing route at desktop + mobile viewport: `/`, `/pricing`, `/for-ai-agents`, `/auth`, `/signup`, `/beta-invite`, `/beta-welcome`, `/intake/badge`
- Verify the dashboard + capture + recipient pages still read well on the new light palette (no hard-coded white/dark text trapping)
- Verify favicon + OG image + apple-touch render correctly
- Render one frame of the Remotion logo scene to confirm new colors

---

### Out of scope

- No backend, plan-gating, or business-logic changes
- No copy rewrites beyond the tagline swap
- The marketing illustrations (notebook, ribbons, mailbox, badge) generated previously stay; they read fine on cream as well as navy

