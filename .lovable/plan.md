
# Landing Page Polish: Copy, Carousel, Tickers, and Interaction Refinement

## 1. De-duplicate repetitive copy

The following phrases repeat 4-6 times across sections and need variation:

| Phrase (overused) | Sections where it appears |
|---|---|
| "actionable lead packet(s)" | Hero, Interactive Demo, Workflow, Comparison, Use Cases, Final CTA |
| "guided visual intake" | Hero, Comparison, Pain Points closing, Final CTA |
| "right photos, notes, and context" | Hero, Interactive Demo, Final CTA |
| "vague messages" | Hero, Final CTA |

**Fix:** Rewrite each occurrence so the core idea lands but with different phrasing per section. The hero and final CTA can share a phrase (bookend effect), but everything in between should use distinct language.

## 2. Pain Points → Auto-rotating carousel

Replace the static 3-card grid + "See 2 more" button with a single-card auto-advancing carousel:

- One stat visible at a time, large and cinematic (number, label, context, citation)
- Auto-advances every 5 seconds; pauses on hover/touch
- Dot indicators + left/right tap zones
- Smooth crossfade or slide transition (CSS `transition` + `opacity`, no heavy libs)
- All 5 pain points rotate — no "show more" gate

## 3. News headline ticker bars

Add 2-3 horizontal scrolling ticker strips at chapter break points (between major sections). Content:

- **Ticker 1** (after Hero): Industry signals — e.g. "81% of forms abandoned before submit · 78% buy from whoever responds first · 4.2 hr avg response time · 60% of estimates never followed up"
- **Ticker 2** (after Comparison, before Use Cases): Product signals — e.g. "Website scan included · Hosted link or embed · No app required for customers · Lead packets, not form spam · AI photo quality checks"
- **Ticker 3** (before Final CTA): Social proof / beta — e.g. "10 founding partner seats · Free Pro for Life reward · 60-day beta · Concierge setup included"

Each ticker: single-line, infinite CSS scroll animation (`@keyframes marquee`), duplicated content for seamless loop, subtle text styling (uppercase, small, muted).

## 4. Interaction polish

- **Collapse/expand transitions**: Add `transition-all duration-300` and `overflow-hidden` to ROI calculator expand. Use `max-height` or `grid-template-rows: 0fr → 1fr` for smooth open/close instead of hard mount/unmount.
- **Section scroll memory**: When ROI calculator or pain point carousel state changes, use `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` to keep the active content in view without jarring jumps.
- **Smooth carousel transitions**: Use `transition-opacity duration-500` for crossfade between pain point cards.

## Technical details

**Files changed:** `src/pages/Landing.tsx` only (all sections are inline components).

**No new dependencies.** Carousel uses `useState` + `useEffect` interval. Tickers use pure CSS `@keyframes`. Collapse animation uses Tailwind transitions.

**New CSS** (in `src/index.css` or inline): `@keyframes marquee` for ticker infinite scroll.

Copy edits are text-only changes to existing JSX strings.
