
# Redesign: Dual-Phone PhotoBrief Interactive Tool

## What Changes

Replace the current flat panel layout with two realistic phone mockups sitting side-by-side, showing the customer and business perspectives simultaneously:

- **Left phone — "Customer"**: Shows the guided photo capture experience. Displays the current photo prompt, camera viewfinder-style frame, progress dots (2/4), and a "Take photo" button. Clicking through the photos progresses the capture flow.
- **Right phone — "Business"**: Shows the business dashboard receiving the brief in real-time. Displays a photo grid filling in, AI check badges, the brief summary card, and the readiness status. Updates reactively as the customer phone progresses.

Both phones share the same state — toggling a photo on the customer side updates the business side in sync.

## Visual Design

- **Phone frames**: Realistic rounded-rect device bezels (iPhone-style) with notch/dynamic island, rendered in CSS (no images needed). Dark chassis against the dark landing background.
- **Customer screen**: Light/white background to feel like a real mobile app. Shows one photo at a time with the prompt text, a progress indicator, and navigation.
- **Business screen**: Dark dashboard aesthetic matching the brand. Shows the 2x2 photo grid, verification badges, and the brief summary card.
- **Connecting element**: A subtle animated dotted line or arrow between the phones suggesting data flow from customer to business.
- **Labels**: Small "Customer" and "Your dashboard" labels above each phone.
- **Below phones**: The email capture form and lead generation stays, but styled as a clean card below the phone pair.

## Layout

- Desktop (lg+): Two phones side-by-side, roughly equal width, centered in the section.
- Tablet/Mobile: Stack vertically — customer phone on top, business phone below, each scaled to fit.
- Phone mockups will be max ~280px wide each on desktop to keep proportions realistic.

## Technical Approach

1. **Rewrite `InteractiveHeroBriefAssembly.tsx`** — new component structure with two `PhoneMockup` wrappers containing the customer and business screen content.
2. **PhoneMockup component** — a reusable CSS phone frame (rounded corners, notch, status bar) that wraps any content.
3. **Customer screen** — step-by-step photo capture UI (one photo at a time with prompt text, progress dots).
4. **Business screen** — dashboard view with photo grid, AI check results, brief summary.
5. **Shared state** — same `useState` drives both screens; clicking on customer phone updates business phone.
6. **Keep existing functionality** — the mode tabs (Capture/Check/Brief), email lead capture, and API submission logic all remain.
7. **All styling via Tailwind + existing design tokens** — no new CSS files needed. Phone bezels via border-radius, background, and pseudo-elements.

## Files Modified

- `src/components/marketing/InteractiveHeroBriefAssembly.tsx` — full rewrite with dual-phone layout
- No other files need changes (the component is self-contained and imported once in Landing.tsx)
