## Goal

Bring `InteractiveHeroBriefAssembly` in line with the locked Field Manual visual contract (cream-on-dark, amber single accent, monospace all-caps labels, 1px hairlines, no glow). Today it still leans on violet/lavender accents, soft white blobs, and rounded glow shadows from the old direction.

## Scope

Single component: `src/components/marketing/InteractiveHeroBriefAssembly.tsx` (1,197 lines, 12 sub-components). No business-logic changes — phases, capture flow, lead-submit edge function call, and copy stay as-is. UI tokens only.

## Edits

### 1. Section frame

- Eyebrow `Interactive demo` → monospace all-caps, tracked +160, amber underline rule (matches plate captions).
- Heading + sub-copy stay, but switch the sub-copy color to `text-foreground/55` and add a small mono plate code (e.g. `PLT.D.01 / FIELD-MANUAL`) above the eyebrow for continuity with the illustration plates.

### 2. PhoneMockup chrome

- Bezel: replace heavy drop shadow + inset ring with a 1px cream hairline (`border-foreground/15`) and a 2.5px outer contour ring (no blur).
- Status bar: monospace digits, cream/40.
- Add a faint 1px construction-grid background behind both phones (same grid asset/style used in plates) inside the section, not inside the bezel.

### 3. ConnectionLine + mobile separator

- Dashed lines → solid cream hairlines.
- Arrow chip: amber stroke ring instead of violet fill; arrow icon amber.
- Label "Live sync" → "LIVE SYNC" monospace, tracked +200, cream/45.
- Mobile separator: same swap (violet → amber, hairline lines).

### 4. Business (dark) screens

- Replace every `bg-white/[0.04|0.06]` card with `border border-foreground/10` + transparent fill (hairline boxes, not soft blobs).
- Section labels (`Recent requests`, `Answers`, `AI summary`) → monospace all-caps, tracked +160, cream/45.
- "New lead" pulse dot: amber instead of emerald.
- "Capturing photos…" status row: amber pulse dot + amber mono text (already amber — just tighten to mono + tracking).
- ROUTING spinner row: cream `Loader2`, mono "ROUTING TO TEMPLATE…".
- "Active" website-intake pill: amber-on-dark hairline pill, mono caps.
- BriefCompleteScreen "Ready" badge + "Quote now" button: amber (replace emerald). Keep a single amber accent per visible state — drop the duplicate amber on the photo-grid "OK" chips, switch those to cream `OK` mono.

### 5. Customer (light) screens

- Customer phone surface stays cream paper (`#F4F1EA`) — that contrast IS the editorial story. Swap interior fills from `bg-black/[0.04]` blobs to 1px ink hairline boxes (`border-foreground/15` on cream).
- All field labels and section captions → monospace all-caps tracked +160, ink/55.
- Buttons (Submit request, Continue, Send to ClearPath, etc.): solid ink fill with cream label + a 4px amber accent bar on the left edge (single-accent rule), no rounded glow.
- `MiniPoweredBy` "Powered by PhotoBrief": replace with the canonical `PoweredByBadge` import in compact/mono mode so it matches every other surface.

### 6. ClearPath fictional brand

Keep ClearPath's teal as-is. The white-label story (their brand stays theirs) reads stronger when ClearPath is visibly NOT amber. Only PhotoBrief chrome (status row, eyebrow, connection line, submit button) goes amber; ClearPath's `Truck` icon, `colorLight` hero panel, and brand mark stay teal.

### 7. Lead-capture form (post-COMPLETE)

- Card border `border-white/[0.08]` → `border-foreground/15` hairline, no `backdrop-blur`.
- Email input focus ring: violet → amber.
- Submit button: violet → amber, mono caps "SEND".
- "Open your request →" link: amber instead of lavender.

## Out of scope

- No phase/flow changes, no copy rewrites beyond casing.
- Junk-removal photos (`wide-garage`, `pile-closeup`, `appliances`, `driveway-access`) stay — they're real customer-style photography, the same exception used in the plate system.
- No new image assets.

## Verification

1. `bun run build` clean.
2. Visual snapshot at 440px (current viewport) and 1280px through the preview, walking through all 6 phases.
3. `bun test src/test/landing-visual-contract.test.ts` and `brand-mark-contract.test.ts` still green.
4. Quick `rg "pb-violet|pb-lavender|emerald-|teal-" src/components/marketing/InteractiveHeroBriefAssembly.tsx` after the edit — only the intentional ClearPath teal references should remain.
