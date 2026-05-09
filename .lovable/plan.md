# New line-art illustrations for the landing page

Regenerate every illustration on `src/pages/Landing.tsx` so the visual language matches the new brandmark (`public/brand/mark-color.png`): clean monoline strokes, navy `#1B2A4A` outlines on transparent/cream, a single amber `#F2A33A` accent per scene (mirroring how the camera shutter has one filled wedge), generous negative space, no shading, no gradients, no photoreal elements.

## Style spec (applies to every image)

- Pure 2D line art, ~6–8px stroke at 1024px, rounded caps/joins, single line weight throughout
- Color palette only: navy `#1B2A4A` lines, optional amber `#F2A33A` for one focal accent, transparent background (PNG)
- Composition centered, square 1024×1024, ~8% padding, subject sized to fill ~85% of canvas (matches mark proportions)
- No text, no labels, no logos, no faces with detail (silhouettes / iconic forms only — same vocabulary as the mark: cameras, tools, belts, geometric props)
- Each scene must read instantly at 200px and still hold up at 800px

## Image-by-section map

Replace each file in place (same path, same dimensions) so no code changes are needed.

| # | File | Section | New concept |
|---|---|---|---|
| 1 | `src/assets/landing-hero-illustration.png` | Hero — "Replace weak forms. Send a guided photo brief." | Phone held in line-drawn hand; on screen, a 2×2 photo-grid brief with one amber checkmark; small camera-shutter glyph echoing the mark in the corner |
| 2 | `src/assets/scenes/transformation-illustration.png` | "Vague form becomes an actionable lead packet" | Crumpled paper on the left → arrow → tidy clipped photo packet on the right; clip is amber |
| 3 | `src/assets/trades/junk-hauler-illustration.png` | Junk hauler scene | Line-art pickup truck beside a stacked pile of boxes/appliances; one amber tag on the pile |
| 4 | `src/assets/scenes/founding-badge-illustration.png` | Beta program — "Accepting applications" | Three numbered ribbon rosettes pinned to a corkboard; center ribbon amber |
| 5 | `src/assets/trades/hvac-tech-illustration.png` | HVAC tech / structured intake | Technician silhouette beside an HVAC unit with a clipboard checklist; one checklist tick amber |
| 6 | `src/assets/trades/estimator-illustration.png` | Comparison — damage estimator | Magnifying glass over a stack of photos with measurement marks; lens rim amber |
| 7 | `src/assets/trades/landscaper-illustration.png` | Use cases — landscaper | Hand holding a phone framing a yard scene (tree + lawn shapes); shutter accent amber |
| 8 | `src/assets/trades/plumber-illustration.png` | Website intelligence — plumber diagnostic | Phone capturing under-sink pipe with a flashlight cone; flashlight cone amber |
| 9 | `src/assets/scenes/reward-ribbons-illustration.png` | Reward tiers | Three layered award rosettes of ascending size; top ribbon tail amber |
| 10 | `src/assets/scenes/beta-notebook-illustration.png` | Fine print | Open notebook with a magnifying glass over neat ruled lines; magnifier handle amber |
| 11 | `src/assets/scenes/mailbox-flag-illustration.png` | Final CTA — invitation | Classic mailbox with flag raised and one envelope peeking out; flag amber |

Hero illustration gets the most detail since it sits next to the brandmark and must clearly belong to the same family.

## Generation approach

- Use `imagegen--edit_image` with `public/brand/mark-color.png` as the single style reference for every call, so stroke weight, line treatment, and amber-accent rule stay identical across the set
- One prompt per image, written in the same voice ("monoline navy line art on transparent background, single amber accent on [X], matching the reference camera+toolbelt mark style, 1024×1024, no text, no shading")
- Save outputs back to the existing paths (overwrite); aspect ratio `1:1`

## QA pass

After all 11 are generated:
1. View each PNG in a 4-up grid to confirm consistent stroke weight, palette, and amber-accent discipline
2. Open `/` in the preview at 1380px and scroll the full landing page; screenshot the hero, transformation, use cases, beta, comparison, website intelligence, rewards, fine print, and final CTA sections
3. Verify each illustration reads at its rendered size and no element clips its container
4. Re-generate any image that drifts off-style (wrong palette, photoreal, multiple amber accents, text artifacts)

## Out of scope

- No code changes in `Landing.tsx` (paths and dimensions stay identical)
- No changes to the brandmark, wordmark, or `BrandMark` component
- No new sections, no copy edits, no layout adjustments
- The four `junk-removal/*.webp` photos (wide-garage, pile-closeup, appliances, driveway-access) stay as-is — they are intentionally photographic "evidence" inside the product demo, not editorial illustration
