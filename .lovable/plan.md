## Replace Before/After comparison images

Goal: The `[ 03 ] Before / after` section on the landing page should show two screenshots of the *same* fictional Cedar & Sons website — one with their old contact form, one with PhotoBrief Smart Intake embedded inline.

### What changes

1. **Generate two new mockup images** using the AI gateway image tool (`google/gemini-3-pro-image-preview` for legible UI text):
   - `src/assets/comparison/cedar-before-contact-form.jpg` — A realistic browser window showing "Cedar & Sons Tree Care" site. Hero photo of a tree crew, nav, then a generic 3-field "Contact us" form (Name / Email / Message) with a "Send" button. Dated, generic, slightly tired styling. Operator-pain framing: this is what they have today.
   - `src/assets/comparison/cedar-after-photobrief-embed.jpg` — The same Cedar & Sons site, same hero, same nav, but where the contact form was, now an embedded PhotoBrief Smart Intake panel: a small "Powered by PhotoBrief" mark, a question header ("What kind of tree work do you need?"), three route chips (Emergency limb · Full removal · Stump grind), one active question with two answers, and a subtle "1 of 4" progress indicator. Looks live, embedded, native to the host page.
   - Both images: 1280×960, 4:3, same browser chrome treatment so the slider comparison reads as "same site, two intake experiences."

2. **Wire them into `src/pages/Landing.tsx`** — replace the two existing imports (`beforeIntakeFormIllo`, `afterCapturePipelineIllo`) with the new files. Update both `<CfImg>` `alt` strings to describe the new images accurately. Keep the surrounding bullet copy and section structure unchanged.

3. **Delete the old assets** (`before-cedar-intake.png`, `after-cedar-brief.png`) only after the new ones land and the import switch is verified.

### Out of scope
- No copy changes to the bullet lists or section heading.
- No layout changes to ComparisonSection.
- No changes to BeforeAfterSlider (this section uses a static two-column grid, not the slider).
- No new design tokens, no new components.

### QA
- Visually inspect both generated images at full size before wiring in. Re-generate if text is illegible or the "after" doesn't read as embedded.
- Confirm `landing-visual-contract.test.ts` still passes (no structural changes expected).

### Risk
- AI image gen may produce illegible UI text on the "after" panel. If the first pass is unreadable, fall back to a simpler "after" (single big "Get a quote in 60 seconds →" CTA button) rather than a complex embedded form mockup.
