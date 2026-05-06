
## Overview

Enhance `InteractiveHeroBriefAssembly` to tell a more complete product story across three phases: link sent, guided capture with a retake, and completed brief.

## Changes (all in `src/components/marketing/InteractiveHeroBriefAssembly.tsx`)

### 1. Business phone: "Link sent" confirmation state

Before any photos are captured (`captured.size === 0`), the business phone (dark variant) shows a "link sent" confirmation instead of the empty dashboard grid. Content:

- Checkmark icon with "Request sent" heading
- Recipient line: "Garage cleanout quote"
- "Sent via SMS" with a timestamp ("Just now")
- Status pill: "Waiting for customer"
- Subtle animated pulse dot to indicate live waiting

Once the customer captures their first photo, transition to the existing real-time dashboard view.

### 2. Customer phone: blurry photo + retake flow

Pick one photo (e.g. index 1, "Main pile") to simulate a failed AI check on first capture:

- Add a `retaken` state set alongside `captured`
- On first tap of that photo's "Capture" button, show the image with a CSS blur filter and an amber overlay with the message: "This looks blurry — retake for a clearer shot"
- Show a "Retake photo" button instead of "Next shot"
- On retake tap, clear the blur, mark as retaken, show the normal green checkmark
- Other photos work as before (single tap to capture, then next)

The business phone mirrors this: when the blurry photo lands, it shows an amber "Blurry" flag; after retake it flips to green "OK".

### 3. Business phone: completed brief state

When all 4 photos are captured (and the blurry one retaken), the business phone transitions from the live grid to a polished "Brief complete" view:

- Green checkmark header: "Brief ready for review"
- 2x2 thumbnail grid with all photos showing green verified badges
- Summary card: "Garage cleanout — all shots verified. Ground-level access. Ready to quote."
- A "Quote now" styled button (non-functional, decorative)

This replaces the current behavior where the dashboard just shows the grid with status labels.

### Technical notes

- All state is local React state; no new API calls or data changes
- The blurry effect uses Tailwind's `blur-sm` class on the image
- Transitions between states use the existing `transition-all duration-500` pattern
- No changes to any other files
