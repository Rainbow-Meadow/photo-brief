
# Make the landing page digestible — Apple-style

The page currently has ~12 back-to-back sections with uniform visual weight. The result feels like a wall of content. This plan applies Apple's core readability techniques: **generous whitespace**, **progressive disclosure**, **visual hierarchy through contrast**, and **rhythm breaks**.

## Changes

### 1. Pain points: show 3, reveal 2
Show only the first 3 pain-point cards by default. Add a subtle "See more stats" expand button that reveals the remaining 2. This reduces initial cognitive load from 5 dense stat cards to 3.

### 2. ROI calculator: collapsed by default
Wrap the ROI calculator in a visually distinct "expand" card — a single prominent banner that says *"How much is weak intake costing you?"* with a "Calculate →" button. Clicking reveals the sliders/results. This removes a heavy interactive block from the default scroll path.

### 3. Increase spacing between major sections
Upgrade key sections from `pb-section-tight` to `pb-section` (or add custom larger padding). Specifically: Pain Points, Interactive Demo, and Founding Partner sections get more breathing room. This creates rhythm — the page "breathes" between ideas instead of stacking them.

### 4. Founding Partner section: accordion for dense details
The Founding Partner area currently renders 4 sub-blocks (benefits/expectations, detailed expectations, reward tiers, scoring rubric) as a continuous scroll. Consolidate:
- Keep benefits/expectations panel visible (it's the hook).
- Collapse **detailed expectations**, **reward tiers**, and **scoring rubric** into an `Accordion` component (3 items). Each is expandable. This cuts the visible height of this section by ~60%.

### 5. Visual rhythm breaks between sections
Add subtle horizontal dividers or gradient fades between major section groups to create visual "chapters":
- **Chapter 1**: Hero → Pain Points → ROI (the problem)
- **Chapter 2**: Interactive Demo → How It Works → Before/After (the solution)
- **Chapter 3**: Use Cases → Website Intelligence (the fit)
- **Chapter 4**: Beta Program → Application → Final CTA (the action)

These are thin gradient lines or soft spacing bumps — not heavy chrome.

### 6. Use Cases: tighten to horizontal scroll on mobile
On mobile, the 5 use-case cards stack very tall. Convert to a horizontal scroll strip on small screens (keep grid on desktop). This matches Apple's product-page card carousels.

## Files changed
- `src/pages/Landing.tsx` — all changes in this single file

## What stays the same
- All existing content, copy, and data
- SEO/PageMeta/JSON-LD
- Beta agent application
- Routing
- Responsive behavior (enhanced, not broken)
- All existing component imports and visual system
