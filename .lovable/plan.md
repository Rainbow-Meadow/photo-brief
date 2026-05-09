## Audit results

I walked every public page outside the dashboard and intake/recipient flows. Most are already on-brand from the earlier passes. Three pages still carry the old "cosmic" landing skin (lavender/violet/mint, `rounded-2xl`/`rounded-full`, glass panels) and one auth-adjacent page still uses the pre-editorial `GlassPanel`.

### Already on the Field Manual style (no changes)
- `pages/Landing.tsx`, `pages/Pricing.tsx`, `pages/Privacy.tsx`, `pages/Terms.tsx`, `pages/Unsubscribe.tsx`, `pages/NotFound.tsx`, `pages/IntakeBadge.tsx`
- Auth set: `Auth.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx` (already use `EditorialAuthShell`)
- All capture/recipient surfaces (refactored in the previous turn)

### Pages to refactor

**1. `src/pages/ForAiAgents.tsx`**
- Replace every `pb-card rounded-2xl` with `border border-border bg-card` (square 1px hairline).
- Eyebrows → existing editorial pattern: hairline + `[ XX ]` amber numeral + label (drop `pb-eyebrow`).
- Headings → `text-foreground` + `tracking-tight`; drop `pb-section-title`/`text-white`.
- Body copy → `text-muted-foreground`; drop `pb-copy`.
- Inline `<code>` chips → mono cream-on-card border (`border-border bg-background text-foreground`); drop the lavender chip color, keep amber only for accents.
- Code blocks (cURL/JS/Python tabs, MCP, x402) → `border border-border bg-card`, mono numerals on the header row, amber underscore on the active tab; drop `pb-ink`/`pb-line` token use here.
- Discovery list → hairline tiles with mono link labels and an amber chevron on hover; drop lavender hover tint.
- FAQ accordion → match the Pricing FAQ pattern (`border border-border bg-card px-4 sm:px-6`, no `pb-command-panel`).
- Hero button row keeps current `Button` variants but switches to the Pricing/Landing CTA: amber primary + `border-border` secondary, both squared with `rounded-[0.25rem]` and uppercase tracked label.
- Drop the `pb-lens-field` cosmic gradient background — Field Manual hero uses just the editorial canvas.

**2. `src/pages/BetaWelcome.tsx`** (largest piece)
Confirmation state (`done === true`):
- Drop the violet blur halo and `pb-lens-field`; use a clean `EditorialAuthShell`-style frame with mono `[ OK ]` plate.
- "We've got everything we need" success icon → square hairline box with amber check (matching the recipient confirmation pattern).
- "What happens now" card → hairline `border border-border bg-card`; numerals become mono `01`/`02`/`03` plates instead of lavender circles.

Form state:
- Hero "You're in." block: drop violet blur + `pb-lens-field` + `pb-hero-title`; use the Pricing hero pattern (mono `[ 00 ]` eyebrow, large `text-foreground` headline, muted subheading).
- Benefits grid: hairline cards with mono index plates and amber icons (same pattern as Pricing's beta-offer grid).
- "How it works" timeline: hairline column with mono `01`–`05` numerals and a 1px amber connector line; drop the lavender ring/circle treatment.
- Form section: convert section subheadings (Business basics / Brand & identity / Photo workflow / First template ideas) to mono all-caps tracked plates, drop `pb-card` wrappers in favor of hairline groups.
- Inputs: drop `inputClass` (white/12 glass) → use the editorial input style already in `PublicIntakePage`: `h-12 rounded-none border border-border bg-background text-foreground` with amber focus ring (`outline-[hsl(var(--ring))]`). Same pattern for `<select>` and `<Textarea>`.
- Required marker `*`: amber instead of lavender.
- Submit CTA → amber primary with mono uppercase tracked label, square corners (`rounded-[0.25rem]`).
- Inline mailto links → amber `text-[hsl(var(--accent-kinetic))]`.

**3. `src/pages/Signup.tsx`** (invite acceptance)
- Replace the three `GlassPanel variant="modal"` blocks with an `EditorialAuthShell` frame for each state (`loading`, `invalid`, `valid`).
  - `loading` → numeral `00`, eyebrow "Verifying invite", spinner + muted line.
  - `invalid` → numeral `ER`, eyebrow "Invite not accepted", reason title/body, two stacked CTAs (amber primary "Apply for beta", outline "Sign in").
  - `valid` → numeral `01`, eyebrow "Invite verified", title "Create your workspace", subline showing the locked email; form below.
- Drop the `rounded-full bg-destructive/10` icon circle → use a square hairline box with the amber alert glyph (`AlertTriangle`).
- Drop the `bg-ambient-mesh` overlay; the shell's `bg-ambient-sky` band is sufficient and matches the rest of the editorial auth set.
- Form inputs already use the shadcn `Input`; align the email-locked field to `bg-muted/40` is fine, but switch the helper text to mono tracked muted (matches the rest of the shell).
- Replace the `<Label>` markup with the same compact mono uppercase label style used by `BetaWelcome`/`PublicIntakePage` for visual consistency across auth-adjacent forms.

### Out of scope
- No copy changes beyond casing required by the editorial style.
- No business logic, no route changes, no schema changes.
- Marketing primitives (`MarketingHero`, `MarketingSection`, `pb-eyebrow` etc.) keep working — we just stop using the legacy classes inline on these three pages.
- `EditorialAuthShell` is reused as-is; if the Signup loading/invalid states need a tighter footer, we'll add an optional `tone` prop only if necessary (will avoid if possible).

### Verification
- `bun run build` clean.
- Run `bunx vitest run` — all 47 contract tests should still pass (no token, brand-mark, or landing-typography changes expected).
- Visual walk in the preview at 440px and 1280px for `/for-ai-agents`, `/welcome`, `/signup?token=...` (invalid token branch is the easiest to land on visually).
- Post-edit `rg "pb-card|pb-eyebrow|pb-section-title|pb-lavender|pb-mint|pb-violet|rounded-2xl|GlassPanel" src/pages/ForAiAgents.tsx src/pages/BetaWelcome.tsx src/pages/Signup.tsx` should return zero hits.
