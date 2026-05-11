## Goal

Update the hero before/after to show the **email-from-the-bad-form** (Before) and the **rich PhotoBrief packet** (After), both on a phone, in the Cedar & Sons Tree Care story.

## Story

A storm hit overnight. A homeowner submitted Cedar & Sons' website contact form. The contractor opens their inbox in the truck.

- **Before** — Phone Mail/Gmail inbox open to a single message:
  - From: website@cedarandsonstreecare.com
  - Subject: New quote request
  - Body (form fields):
    - Name: Jamie Smith
    - Email: jamie.s@example.com
    - Phone: (781) 555-0198
    - Describe your project: "Big tree out front looks bad after the storm, can you come look?"
  - **No photo attached. No address.**
- **After** — Phone showing the PhotoBrief "Cedar & Sons Tree Care — New Lead" packet, modeled on the user's uploaded reference (IMG_3616):
  - Header: "Cedar & Sons Tree Care — New Lead", subtitle "23 Maple St · Submitted 9:14 AM"
  - 2×2 grid of 4 crisp photos: leaning oak (wide), trunk close-up showing storm damage, house elevation with tree in frame, driveway access shot
  - Customer notes block: "Storm last night — tree leaning toward house, want it gone ASAP"
  - Address line: "23 Maple St, Northborough, MA 01532" with a small map snippet pin
  - Scope: "Removal + stump grind, residential, access via driveway"

Same hand, same phone, same truck-cab bokeh, identical framing — slider wipe stays continuous.

## Steps

1. **Regenerate the two hero images** (premium imagegen, portrait 3:4, 1152×1536):
   - `src/assets/hero/hero-before-messy-intake.jpg` — phone showing the inbox email above (Apple Mail or generic mobile mail UI), no photo attached.
   - `src/assets/hero/hero-after-photobrief-packet.jpg` — phone showing the rich brief packet matching IMG_3616, with the four labeled blocks. Use uploaded `user-uploads://IMG_3616.png` as a visual reference passed to `imagegen--edit_image` to keep layout fidelity.
   - QA both at zoom (`image_tools--zoom_image`) to confirm legibility of From/Subject and the four photo tiles.

2. **Update alt text** in `src/pages/Landing.tsx`:
   - beforeAlt: "Cedar & Sons inbox email from a website form — no photos, no address."
   - afterAlt: "Cedar & Sons PhotoBrief packet — four photos, customer notes, address with map, scope."

3. **No structural changes** to slider, layout, or other sections.

## Out of scope
- No copy/CTA changes in surrounding hero text.
- No edits to MechanismGrid, Pricing, or Comparison sections.

## Files
- **Regenerate**: `src/assets/hero/hero-before-messy-intake.jpg`, `src/assets/hero/hero-after-photobrief-packet.jpg`
- **Edit**: `src/pages/Landing.tsx` (alt text only)
