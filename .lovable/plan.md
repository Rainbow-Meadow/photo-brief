
# Mobile-First Redesign: Customer Capture + Company Dashboard & Templates

Two parallel tracks: (A) the recipient capture flow and (B) the business-side dashboard, request builder, inbox, and template pages. Both follow the same mobile-first principles: one action per screen where possible, large tap targets (min 48px), generous spacing, progress indicators, vertical layouts, and minimal scrolling per step.

---

## Part A: Recipient Capture Flow (one-step-per-screen)

### A1. PublicRecipientPage.tsx -- Major refactor

Replace the scrolling card-stack with a **single visible step** pattern. The `useChatFlow` hook is unchanged; only the presentation layer changes.

- **Welcome screen**: Full viewport height. Business name, photo/question count badge, time estimate, single 56px "Start" CTA. No scroll needed.
- **Photo capture screens**: Each step fills the viewport. Top: thin progress bar + "Photo 2 of 5" label. Center: step title + short instruction text. Bottom: stacked "Take photo" (56px) and "Choose from library" (48px) buttons. Skip link below if optional.
- **AI feedback / retake**: Photo preview with verdict overlay. Two vertically stacked buttons (Retake / Keep), always full-width -- no side-by-side grid.
- **Question screens**: One question per screen. Choice options render as full-width vertical buttons (48px+ each). Free-text gets a large input with "Continue" pinned at bottom.
- **Review screen**: Only screen that scrolls. 2-column photo grid, answer list, large "Send" button.
- **Confirmation**: Centered success state.
- Remove the `CompletedStrip` thumbnail row from the step view (visible only in Review).
- Add a subtle 200ms opacity fade transition between steps using a key-based remount.

### A2. WorkflowProgress -- Slim top bar

Replace the current sticky card with a thin progress bar pinned to top. Just the bar, step label ("Photo 2 of 5"), and fraction counter. No card border or heavy padding.

### A3. Component touch-target updates

| Component | Change |
|-----------|--------|
| `CaptureUploadCard.tsx` | Button heights to 56px/48px, more vertical spacing |
| `QuestionCard.tsx` | Choice options as full-width stacked buttons (48px height), not inline chips |
| `RetakeDecisionCard.tsx` | Always stack buttons vertically, remove `sm:grid-cols-2` |
| `AIFeedbackMessage.tsx` | Slightly larger text (15px) and padding |
| `ReviewSummaryCard.tsx` | 2-col photo grid on narrow screens (`grid-cols-2` default, `grid-cols-3` on sm+) |

### A4. PublicRequestLayout.tsx

- Reduce mobile padding (`py-6` to `py-3`)
- Use `min-h-[calc(100svh-3.5rem)]` with flexbox centering so shorter steps sit mid-screen

---

## Part B: Company Dashboard & Workflow Pages

### B1. DashboardPage.tsx -- Mobile-optimized action hub

- **Primary focus card**: Make the big number + CTA card full-bleed on mobile (remove rounded corners, stretch to edges). CTA button full-width and 48px+ tall.
- **Metric cards**: Change from 2x2 grid to horizontal scroll strip on mobile (`flex overflow-x-auto snap-x` instead of `grid`). Each card is a fixed-width snap item so users can swipe.
- **Dashboard lists** (Ready to review / Needs action): Each list item gets larger touch targets (min 48px row height). The reminder bell and chevron get 44px hit areas. Add active states for tap feedback.
- **Assistant panel**: Keep the bottom sheet on mobile as-is (already good).
- Remove the desktop `New request` button that's `hidden sm:inline-flex` and rely on the MobileTabBar FAB.

### B2. RequestsInboxPage.tsx -- Mobile card list polish

- Increase mobile list item padding and height (py-3 to py-4, min-height 64px).
- Make the checkbox larger on mobile (24px) and add more gap from content.
- Status badge and readiness score: stack vertically instead of inline on narrow screens.
- Bulk action bar: Make buttons full-width stacked when viewport is narrow, with 44px height.
- Filter bar: If `InboxFilters` uses horizontal chips, ensure they scroll horizontally with snap behavior.

### B3. CreateRequestPage.tsx -- Mobile step flow

This is the biggest mobile pain point. The current side-by-side layout (template picker + draft preview) doesn't work on phones.

- **Mobile layout** (below `lg`): Convert to a sequential flow:
  1. First screen: Mode tabs (AI / Template) + the picker/chat. Full width.
  2. When a draft is generated/selected, auto-scroll to the draft preview section below (or show it as a new "screen" with a back button).
  3. Draft preview: full-width, large "Send request" button (56px), form fields with 48px height inputs.
- **Desktop**: Keep the current side-by-side grid.
- The "Start blank" button should be more prominent on mobile (full-width, above the template list).

### B4. GuideLibraryPage.tsx -- Template cards

- Template cards: increase tap target to fill the full card area. On mobile, single-column layout (`grid-cols-1` below `sm`).
- The explainer card at top: collapse to a simpler banner on mobile (hide the two detail cards, keep just the headline and "1-2-3" pills).
- "New template" button: full-width on mobile.

### B5. GuideBuilderPage.tsx -- Form usability

- All form inputs: min height 48px, generous label spacing.
- Step editor cards: increase padding, make drag handles larger (44px touch target).
- "Save template" button: full-width and sticky at bottom on mobile.

### B6. DashboardLayout.tsx -- Minor tweaks

- Reduce main content horizontal padding on mobile (`px-4` to `px-3`) for more breathing room.
- Ensure `pb-24` bottom padding accounts for the MobileTabBar height + safe area.

### B7. MobileTabBar.tsx -- Polish

- Already well-structured. Increase icon size slightly from `h-5 w-5` to `h-6 w-6` for easier tapping.
- Add haptic-style active state (`active:scale-95`) to all tab links.

---

## Files changed summary

| File | Scope |
|------|-------|
| `src/features/capture/pages/PublicRecipientPage.tsx` | Major: one-step-per-screen layout |
| `src/features/capture/components/CaptureUploadCard.tsx` | Touch targets |
| `src/features/capture/components/QuestionCard.tsx` | Vertical stacked options |
| `src/features/capture/components/RetakeDecisionCard.tsx` | Always vertical buttons |
| `src/features/capture/components/AIFeedbackMessage.tsx` | Larger text/padding |
| `src/features/capture/components/ReviewSummaryCard.tsx` | Responsive grid |
| `src/components/layout/PublicRequestLayout.tsx` | Reduced padding, flex centering |
| `src/features/workspace/pages/DashboardPage.tsx` | Mobile metric scroll, larger touch targets |
| `src/features/requests/pages/RequestsInboxPage.tsx` | Mobile list polish |
| `src/features/requests/pages/CreateRequestPage.tsx` | Sequential mobile flow |
| `src/features/guides/pages/GuideLibraryPage.tsx` | Single-col cards, simpler banner |
| `src/features/guides/pages/GuideBuilderPage.tsx` | Form usability, sticky save |
| `src/components/layout/DashboardLayout.tsx` | Padding tweaks |
| `src/components/layout/MobileTabBar.tsx` | Larger icons, active states |

## What stays the same

- `useChatFlow.ts` -- all flow logic, phases, and state management unchanged
- All backend logic, upload, AI analysis, submission
- Database schema and RLS policies
- Desktop layouts remain functional (changes are mobile-first, not mobile-only)
