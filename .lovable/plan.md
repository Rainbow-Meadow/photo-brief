
# Add a Pain-Point Section Above the Fold

## What changes

Add a new **"The problem"** section between the hero CTA cluster (line ~383) and the Free Pro spotlight (line ~385). This section will immediately confront visitors with the specific, recognizable frustrations they already live with — before showing them the solution.

## Content and structure

A compact, visually distinct section with:

1. **Eyebrow + headline** — e.g. "The gap" / "Your intake process is losing you money."
2. **A grid of 4-5 pain-point cards**, each with an icon, a bold stat or claim, and one sentence of context. Draft content:

   | Icon | Stat / claim | Context |
   |------|-------------|---------|
   | Clock | **62% of first quotes are delayed** | …waiting for photos the customer forgot to send. |
   | MessageSquareWarning | **5+ back-and-forth messages** | …just to get the right angle, scale, or context. |
   | FormInput | **Forms capture text, not proof** | Generic intake forms never ask for the visual evidence your team actually needs. |
   | UserX | **75% of consumers prefer zero human contact** | They want to self-serve on their phone — not call, not email, not wait for a callback. |
   | TrendingDown | **Low-quality leads look the same as good ones** | Without photos, your team triages blind and wastes site visits on jobs that don't convert. |

3. A subtle closing line: *"PhotoBrief closes the gap between first contact and actionable information."*

The cards will use the existing `pb-card` design tokens and dark-theme palette. On mobile (440px viewport), the grid collapses to a single column. On desktop, 2-3 columns.

## Files changed

- **`src/pages/Landing.tsx`** — Add the new `<PainPointSection />` sub-component and render it between the hero section and the Free Pro spotlight section. Add any new Lucide icon imports needed (e.g. `FormInput`, `UserX`, `TrendingDown`).

No new files, no database changes, no new dependencies.

## Technical notes

- The stats/claims are directional industry figures commonly cited in field-service and home-service SaaS marketing. They are presented as illustrative, not as sourced research.
- The section uses the same `pb-section-tight`, `pb-container`, `pb-eyebrow`, `pb-card`, and `pb-copy` utility classes already used throughout the landing page for visual consistency.
- Responsive: single-column on mobile, `sm:grid-cols-2` at small breakpoint, `lg:grid-cols-3` on large screens (with the last two cards spanning a centered 2-col row).
