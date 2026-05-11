## Goal

Replace the four generic illustrations in the landing page Mechanism section with a coherent, photorealistic narrative that follows a single mock customer (Cedar & Sons Tree Care) through the Reverse-Form Method™ — from research, to capture, to brief, to close.

## The story (one job, four beats)

Mock job: a homeowner requests an estimate for a leaning oak after a storm. Cedar & Sons is the contractor.

1. **Research** — Cedar & Sons' homepage shown on a laptop/desktop browser, with PhotoBrief annotations marking the trade ("Tree removal — residential"), the photos that actually unblock a quote (full canopy, base + lean angle, proximity to house/power lines, access path), and the callback risks they prevent.
2. **Mechanism (Capture)** — Customer's phone showing the guided capture flow: camera viewfinder framed on the leaning oak, with a tap-to-shoot prompt ("Step 2 of 4 — Step back, capture the full canopy and lean").
3. **Brief** — The assembled brief packet on a phone/tablet: header "Cedar & Sons — New Lead · 23 Maple St", thumbnails of the four shots, customer notes, address + map snippet, scope summary.
4. **Close** — A Gmail-style thread: inbound brief from PhotoBrief at 9:14am, contractor's reply at 9:31am with a clean itemized quote ("Removal + stump grind — $1,840, available Thursday").

## Files

- Generate 4 new images into `src/assets/rmbc/cedar/`:
  - `01-research-website-analysis.png`
  - `02-capture-phone-viewfinder.png`
  - `03-brief-packet.png`
  - `04-close-gmail-quote.png`
- Update `src/components/marketing/MechanismGrid.tsx`:
  - Swap the four imports for the new Cedar set.
  - Adjust the card image wrapper so screenshots read clearly at small sizes: drop the `p-6` padding and `object-contain` may stay, but tighten so devices fill the frame edge-to-edge with a hairline inset.
  - Keep step numbers, titles, and copy unchanged (Research / Mechanism / Brief / Close).
- Leave the old `src/assets/rmbc/*.png` files in place (still referenced elsewhere — verify with a quick grep before deleting; out of scope for this change).

## Image generation approach

- Use `imagegen--generate_image` with `model: premium` (text legibility matters — every shot contains UI text).
- Square 1024×1024, no transparent background, white/neutral surface around the device so the existing card frame reads cleanly.
- Each prompt explicitly names "Cedar & Sons Tree Care" and the leaning oak job so brand and subject stay consistent across all four.
- After generation, QA each image by viewing it; regenerate any whose UI text is garbled or whose subject drifts.

## Out of scope

- Changing card layout, copy, section intro, or the rest of the landing page.
- Updating other pages that may reuse the old rmbc illustrations.
- Adding a real Cedar & Sons brand mark — the screenshots show a plausible generic tree-care site/email, not a fabricated logo system.
