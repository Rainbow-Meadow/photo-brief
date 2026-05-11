## Goal

Reframe the hero before/after to a **portrait, full-bleed phone-in-hand** shot so the phone screen dominates the frame.

## Steps

1. **Regenerate the hero pair** in portrait 3:4 (1152×1536), tightly cropped:
   - `src/assets/hero/hero-before-messy-intake.jpg` — phone held in hand, framed edge-to-edge top-to-bottom; phone screen fills ~85% of the frame; on-screen content = messy SMS thread (blurry far roof photo, "hey can you quote this? thx", no address). Minimal background bokeh.
   - `src/assets/hero/hero-after-photobrief-packet.jpg` — identical hand position, phone position, lighting, and crop; on-screen content = clean Job Brief packet (close-up shingle damage photo, Address: 142 Cedar Lane, Scope: Replace 12 sq damaged shingles, Customer: J. Martinez, "Ready to quote" badge).
   - Lock framing language in both prompts so the slider wipe stays continuous.

2. **Update `BeforeAfterSlider`**:
   - Switch the container from `aspect-[3/2]` to `aspect-[3/4]`.
   - Change `<img>` from `object-cover` (fine) — keep, but ensure no horizontal cropping artifacts at the new ratio.
   - Move the Fig. 01 / Reverse-Form Method™ caption strip out of the image (it currently overlays bottom inside the frame and would compete with the phone). Render it below the slider instead, in the same mono micro style.

3. **Update `Landing.tsx` Hero layout**:
   - The hero is a 2-column `lg:grid-cols-2` with `lg:items-center`. A tall portrait will dominate height. Constrain the slider's max width on large screens (e.g. `max-w-[420px] mx-auto lg:ml-auto lg:mr-0`) so it stays tasteful next to the headline column.
   - Keep `RiseIn` wrapper, BrandMark below.

## Out of scope
- No copy or CTA changes.
- No changes to other sections, mobile nav, or other pages.
- Old `hero-cedar-split-horizontal.png` stays unused for now (already removed from imports).

## Files
- **Regenerate**: `src/assets/hero/hero-before-messy-intake.jpg`, `src/assets/hero/hero-after-photobrief-packet.jpg`
- **Edit**: `src/components/marketing/BeforeAfterSlider.tsx` (aspect ratio + caption position)
- **Edit**: `src/pages/Landing.tsx` (max-width wrapper around slider, caption rendering)
