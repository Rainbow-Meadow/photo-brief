## Goal

Replace the static hero illustration on `/` (Landing) with an interactive **before/after slider**, using a newly generated photoreal pair (messy intake vs. quote-ready PhotoBrief packet).

## Steps

1. **Generate two new photoreal hero images** (3:2, 1536×1024) into `src/assets/hero/`:
   - `hero-before-messy-intake.jpg` — Contractor's phone showing a chaotic text/email thread: blurry far-away photo of a roof, vague "can you quote this?" message, no address, no scope. Realistic phone-in-hand shot, natural daylight, slight desk clutter.
   - `hero-after-photobrief-packet.jpg` — Same contractor's phone showing a clean PhotoBrief packet: crisp close-up roof photo, address, scope notes, customer name, "Ready to quote" badge. Same framing/lighting so the slider reveal feels continuous.
   - Constraint: identical camera angle, lighting, and phone position so the wipe transition reads cleanly.

2. **Build `BeforeAfterSlider` component** at `src/components/marketing/BeforeAfterSlider.tsx`:
   - Two stacked `<img>` layers inside an aspect-[3/2] frame (matches current hero box).
   - Top image clipped via `clip-path: inset(0 X% 0 0)` driven by a `position` state (0–100).
   - Draggable vertical handle (pointer events: down/move/up, also touch). Keyboard a11y: focusable handle, ←/→ adjust by 5%, Home/End jump to 0/100.
   - "Before" / "After" pill labels in opposite corners.
   - Respects `prefers-reduced-motion` (no idle nudge animation; still draggable).
   - Touch-friendly: large hit area on handle, no hover-only affordances (per touch-vs-desktop memory).
   - Uses semantic tokens only (border, background, accent-kinetic for handle).

3. **Wire into `src/pages/Landing.tsx` Hero**:
   - Remove `heroIllustration` import and the current `<img>` block inside the `RiseIn` on the right column.
   - Replace with `<BeforeAfterSlider before={...} after={...} beforeAlt="..." afterAlt="..." />` keeping the surrounding `RiseIn`, Fig. 01 caption strip, and BrandMark below.
   - Keep the `aspect-[3/2]` frame, border, and caption overlay styling.

4. **Analytics**: fire `trackEvent("landing_hero_before_after_drag")` once per session on first drag (debounced) so we can see engagement.

## Out of scope
- No changes to comparison section further down the page (still uses existing before/after illustrations).
- No copy changes in the hero.
- No changes to mobile nav, footer, or other pages.

## Technical notes
- Slider uses `clip-path` (not two-canvas) to keep DOM simple and SSR/prerender-safe — both `<img>` tags ship in markup, so the prerender script captures them.
- `loading="eager"` + `fetchpriority="high"` on the "after" image (LCP candidate); "before" can be `eager` too since both render in viewport.
- Generated with `imagegen` premium tier for photoreal phone/screen detail, then QA'd as instructed.
- No new deps; pure React + Tailwind.

## Files
- **Add**: `src/assets/hero/hero-before-messy-intake.jpg`, `src/assets/hero/hero-after-photobrief-packet.jpg`, `src/components/marketing/BeforeAfterSlider.tsx`
- **Edit**: `src/pages/Landing.tsx` (Hero function only)
- **Possibly delete later**: old `hero-cedar-split-horizontal.png` if no other importers (will check before removing)
