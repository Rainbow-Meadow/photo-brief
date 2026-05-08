## What I observed on surveva.com

Surveva's landing has a very distinct **warm, editorial, "calm marketing site"** feel. Key design DNA:

1. **Top floating pill nav** — centered, with logo in the middle and links split left/right, sitting on a soft background.
2. **Oversized hand-drawn / serif-flavored display type** — the hero headline is huge, almost poster-sized, with three short sentences ("Quick surveys. Instant responses. Analytics.") set in a single brand color on a creamy background. Body copy is small, narrow, sitting to the right of (or under) the headline.
3. **Warm off-white background** (cream/paper) everywhere, with one strong brand accent color used for headlines, links, icons, and one big CTA section.
4. **Sectioned "Vision / Mission / Approach" rhythm** — each section has a tiny eyebrow label ("Our Goal"), a small subtitle, then a multi-line oversized heading with extra spacing, then a short paragraph. Lots of whitespace, single-column, left aligned.
5. **Custom hand-drawn illustration** as a hero visual (animated character, ghosts, trees) instead of a screenshot or mockup.
6. **"How it works"** = stacked rows alternating image left / text right (or vice versa), each with a phone screenshot inside a soft-shadowed device frame.
7. **Big colored CTA band** ("Start your journey…") in the brand accent color with rotated/peeking phone screenshots in the corner.
8. **FAQ as plain expandable rows** with `+` icons, very minimal lines.
9. **Footer:** dark slab with brand mark, tagline, app store buttons, simple link columns.

Overall vibe: **slow, confident, magazine-like**, not SaaS-dashboardy. Short copy. Type does the heavy lifting. Almost no gradients, no glassmorphism, no neon glow.

## What I'd change on PhotoBrief's Landing

PhotoBrief today is the opposite tone: dark navy background, lots of dense cards, gradients, glow shadows, many sections, ROI calculator, stats, comparison tables, etc. Translating Surveva's feel — but keeping PhotoBrief's brand colors and product story — means a fairly substantial visual rewrite of `src/pages/Landing.tsx` and likely `index.css` token additions.

Two possible directions, I'd recommend **Direction A**:

### Direction A — Full editorial restyle (recommended, matches your ask)

Rebuild the marketing page in the Surveva mold while keeping our content blocks (hero, pain points, how it works, ROI, pricing teaser, FAQ, CTA, footer):

- **Background:** swap the dark navy hero/section bg for a **warm "paper" surface** built from our brand. New tokens: `--pb-paper` (soft off-white, slightly lavender-tinted to nod to our brand), `--pb-paper-warm` (slightly deeper for alternating sections), and keep `--pb-violet` / `--pb-lavender` as the single accent color used for headlines, links, icons, CTA band.
- **Top nav:** convert the current top bar to a centered floating pill with logo in the middle, links split left/right, soft border, sticky.
- **Hero:** replace the multi-column hero (headline + chips + calculator + 81% card + quote) with a Surveva-style two-column:
  - Left: oversized 3-line headline in `--pb-violet`, small body paragraph beneath.
  - Right: a single hand-illustrated / playful visual (we can either use a stylized phone-with-photo-request mockup or a simple line-art illustration). Keep the route chip strip but move it under the body copy as a tiny inline badge row.
  - Move the **ROI calculator + 81% card + quote** into their own dedicated downstream section so the hero stays calm.
- **Vision / Mission / Approach analog:** repurpose three of our existing value props ("Stop chasing", "Send in 60s", "Score & approve") as three Surveva-style stacked sections — each with eyebrow label, subtitle, oversized multi-line heading, short paragraph, and a single illustrative graphic.
- **How it works:** restructure the existing steps into the alternating image-left / text-right pattern with phone-frame screenshots and lots of vertical breathing room (no card chrome).
- **CTA band:** add a full-bleed `--pb-violet` band near the bottom with the "Start your founding-partner trial" copy, big white headline, and rotated peeking phone screenshots on the right edge.
- **FAQ:** strip current accordion chrome down to plain rows with hairline dividers and `+` icons that rotate to `×`.
- **Footer:** keep current dark footer but increase padding and simplify to brand-mark + tagline + 2 link columns + socials, matching Surveva's calmer footer.
- **Animations:** very light — fade-in-on-scroll, no glow pulses, no parallax cards.

Files touched:
- `src/pages/Landing.tsx` (major rewrite of section composition + classes)
- `src/index.css` and/or `src/brand-overrides.css` (add `--pb-paper`, `--pb-paper-warm`, editorial display font scale, hairline divider tokens)
- Possibly add 1–2 lightweight illustration assets in `src/assets/` (or use existing hero composite if you prefer)
- Possibly tweak `src/components/layout/MarketingLayout.tsx` for the floating-pill nav

### Direction B — Lighter pass

Keep the dark theme, but borrow *only* Surveva's typographic rhythm (huge headlines, eyebrow + subtitle + heading pattern, more whitespace, calmer cards, plain `+` FAQ, alternating how-it-works rows). No background color change, no nav change, no illustrations.

This is faster (1 file, mostly class changes) but won't really feel like Surveva — Surveva's warmth comes mostly from the cream background and the quiet, single-accent palette.

## Questions before I start

1. **Direction A or B?** (A truly matches "make it look/feel like surveva.com").
2. **Background:** if A, are you OK moving the marketing site from dark navy to a warm cream/paper (still using our violet as the single accent)? Or do you want to keep the dark navy and try to evoke Surveva on top of it?
3. **Illustration:** do you want me to generate a custom hand-drawn-style hero illustration (premium image gen), reuse existing hero assets, or use a stylized phone mockup?
4. **Scope:** apply the new look to the *whole* Landing page in one pass, or roll it out section-by-section so you can react after each?

Once you answer those I'll implement.
