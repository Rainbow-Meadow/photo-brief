
## Goal

Replace the current `CreateRequestPage` (side-by-side panels, scrolling forms, mode tabs) with a fullscreen, mobile-first, single-step-per-screen wizard. The primary CTA across the app becomes **"Request a PhotoBrief"**. The flow follows the same design language as the recipient capture refactor: one question per screen, large tap targets, slim progress bar, and smooth transitions.

---

## Current Problems

- The create-request page shows a two-column desktop layout that breaks down on mobile into a long scroll.
- Mode tabs (Template vs AI) plus a draft preview panel require too much context-switching on a phone.
- The FAB in MobileTabBar says "+" with no label — unclear primary action.
- Editing steps/questions in-line is dense and not thumb-friendly.

---

## Wizard Flow (6 screens)

```text
Screen 1: HOW         "How do you want to build?"
                       [Use a saved template] / [Build with AI] / [Start blank]

Screen 2: SETUP       Template picker OR AI prompt form OR skip (blank)
                       Single purpose per screen, large cards/inputs

Screen 3: RECIPIENT   "Who is this for?"
                       Name + Email/Phone, full-width stacked inputs (h-12)

Screen 4: PHOTOS      Review & edit photo steps
                       Accordion cards, add/remove/reorder, one step visible at a time

Screen 5: QUESTIONS   Review & edit questions (optional)
                       Same accordion pattern, skip button if none

Screen 6: REVIEW      Final summary + Send
                       Read-only preview, sticky "Send PhotoBrief" button (h-14)
```

A slim progress bar (same component pattern as recipient flow) sits pinned at the top. Back arrow on each screen. Swipe/tap to advance.

---

## File Changes

### New files
- **`src/features/requests/components/CreateRequestWizard.tsx`** — Fullscreen wizard shell: manages step index, progress bar, back navigation, fade transitions (200ms opacity like recipient flow). Uses `100svh` height.
- **`src/features/requests/components/wizard/StepHow.tsx`** — Three large stacked cards for build mode selection.
- **`src/features/requests/components/wizard/StepSetup.tsx`** — Conditionally renders TemplatePicker, AI builder form, or auto-advances for blank.
- **`src/features/requests/components/wizard/StepRecipient.tsx`** — Name + contact inputs, full-width, h-12 inputs.
- **`src/features/requests/components/wizard/StepPhotos.tsx`** — Wraps `GeneratedStepEditor` in mobile-optimized accordion with 48px touch targets.
- **`src/features/requests/components/wizard/StepQuestions.tsx`** — Wraps `GeneratedQuestionEditor`, skip button if empty.
- **`src/features/requests/components/wizard/StepReview.tsx`** — Read-only summary with sticky send bar.

### Edited files
- **`src/features/requests/pages/CreateRequestPage.tsx`** — Gut the current layout; render `<CreateRequestWizard>` fullscreen. All existing logic (AI prompt handling, `handleCreate`, `handleSaveAsGuide`, plan gating) stays here as props/callbacks passed into the wizard.
- **`src/components/layout/MobileTabBar.tsx`** — Change center FAB label from bare "+" icon to include a subtle "Request" label beneath; keep the NavLink to `/requests/new`.
- **`src/components/layout/DashboardLayout.tsx`** — When route is `/requests/new`, hide the sidebar header and tab bar to give the wizard true fullscreen on mobile.

### Unchanged (reused as-is)
- `GeneratedStepEditor.tsx`, `GeneratedQuestionEditor.tsx` — rendered inside wizard steps with no API changes.
- `TemplatePicker.tsx`, `AIRequestBuilderChat.tsx` — embedded in StepSetup.
- All backend logic, `requestsService`, `aiService`, draft types — zero changes.

---

## Design Details

- **Progress bar**: Reuse the `Progress` primitive, 4px tall, pinned top, same brand primary color.
- **Transitions**: Each step wrapped in a keyed div with `transition-opacity duration-200`.
- **Tap targets**: All primary buttons min h-14 (56px), secondary h-12. Inputs h-12.
- **Back navigation**: Left-arrow button pinned top-left, calls `setStep(s => s - 1)`.
- **Fullscreen**: Wizard container uses `min-h-[100svh]` with `p-4` mobile padding, centered content `max-w-lg mx-auto`.
- **Desktop**: Same wizard renders centered in the content area (max-w-lg), no side panels. Clean on both form factors.

---

## Technical Notes

- The wizard is a controlled component receiving `draft`, `setDraft`, `onComplete` (triggers create), `onSaveAsGuide`, plus the AI/template callbacks from the parent page.
- Step state is local to the wizard (`useState<number>(0)`).
- The existing `useEffect` for `guideParam` pre-fill will set the initial step to 2 (skip How + Setup) and pre-populate the draft.
- Plan-gating (`usePlan().can()`) checks remain in `CreateRequestPage` and are passed as boolean props.
