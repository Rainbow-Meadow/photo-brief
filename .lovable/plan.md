
## Problem

The interactive hero demo has three issues:

1. **Phone bezels resize** as content fills them — the `minHeight: 520` lets the container grow with content, breaking the illusion of a real device.
2. **Missing business-side opening steps** — the demo starts at the customer capturing photos. In reality, the business first picks a saved template and sends the link.
3. **No customer submit step** — photos complete and the flow just ends. Real PhotoBrief has a review-and-send screen.

## Plan

### 1. Lock phone dimensions

Change `PhoneMockup` from `minHeight: 520` to a fixed height (~520px) with `overflow-y: auto` on the content area. This keeps both phones the same size throughout the entire flow regardless of what's inside.

### 2. Add business-side opening steps (new flow phases)

Replace the current two-state model with a multi-phase state machine:

```text
Phase 0: TEMPLATE_SELECT   — Business picks "Garage Cleanout" from saved templates
Phase 1: SEND_LINK         — Business enters customer phone/name, taps Send
Phase 2: LINK_SENT         — Business sees "Sent, waiting…" (existing LinkSentScreen)
Phase 3: CAPTURING          — Customer captures photos (existing flow + blurry retake)
Phase 4: CUSTOMER_REVIEW    — Customer sees review screen with thumbnails + Submit button
Phase 5: COMPLETE           — Business sees completed brief (existing BriefCompleteScreen)
```

**Business phone shows:**
- Phase 0: Template picker card (list of 2-3 saved templates, one highlighted)
- Phase 1: Send form (customer name + phone, send button)
- Phase 2: Existing "Request sent / Waiting for customer" screen
- Phase 3: Existing in-progress screen with live photo feed
- Phase 4: Still shows in-progress (customer hasn't submitted yet)
- Phase 5: Existing brief-complete screen

**Customer phone shows:**
- Phase 0-1: Blank/off or a subtle "waiting for link" placeholder
- Phase 2: "You received a PhotoBrief request" welcome screen with Start button
- Phase 3: Existing photo capture flow (unchanged)
- Phase 4: Review screen with photo grid + "Send to business" button
- Phase 5: Confirmation "Sent!" screen

### 3. Customer review + submit screen (Phase 4)

New `CustomerReviewScreen` component showing:
- Thumbnail grid of all 4 captured photos
- Brief title "Garage cleanout quote"
- "Send to [Business]" button that advances to Phase 5

### 4. Small detail fixes

- Progress indicator text updates to reflect the active phase
- The section subtitle copy updates per phase so the user knows what to tap next
- Transition between phases uses the existing button-click pattern (user taps through)
- Business-side actions (pick template, send link) are interactive taps on the business phone, not auto-animated

### Files modified

- `src/components/marketing/InteractiveHeroBriefAssembly.tsx` — all changes in this single file
