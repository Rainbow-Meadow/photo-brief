
## Restructure interactive demo to website intake flow + fake brand

### Concept

Replace the "business manually sends a link" story with the automated website intake story. A fake junk removal brand — **ClearPath Junk Removal** — provides the industry context and shows how PhotoBrief branding appears alongside the customer's own brand.

### Fake brand

- **Name**: ClearPath Junk Removal
- **Tagline**: "We haul it all."
- **Brand color**: Teal/green (#0d9488 or similar)
- **Logo**: Text-based with a truck or recycle icon from Lucide
- Used on: the customer-facing welcome screen, question screens, and the business phone idle state

### New phase flow

1. **CUSTOMER_REQUEST** — Customer phone shows a simple branded intake form on ClearPath's "website": name, service type dropdown (Garage cleanout selected), short message. Business phone shows an idle state — ClearPath dashboard with "no new requests." Customer taps "Request service."

2. **ROUTING** — Brief transition. Customer phone shows "Setting up your photo brief..." with the ClearPath + PhotoBrief branding. Business phone shows a subtle "New lead" toast/notification.

3. **QUESTIONS** — Customer phone shows 2-3 context questions branded with ClearPath's color: "What needs removing?" (chips: Furniture, Appliances, Boxes, Yard waste), "Approximate volume?" (Small / Medium / Large), "Any stairs or tight access?" (Yes / No). Business phone stays idle. Customer taps "Continue to photos."

4. **CAPTURING** — Same photo capture flow as today (blurry retake mechanic preserved). Business phone shows a passive "In progress" indicator.

5. **CUSTOMER_REVIEW** — Customer reviews photos + answers, taps Submit. Business phone still idle.

6. **COMPLETE** — Customer sees branded confirmation ("ClearPath has your photos"). Business phone lights up with the full brief: customer answers, photos, AI checks, summary, "Ready to quote" button. The payoff: the business didn't do anything.

### Phase hints

- CUSTOMER_REQUEST: "The customer finds ClearPath online and submits a service request."
- ROUTING: "PhotoBrief matches the request to the right template automatically."
- QUESTIONS: "The customer answers a few quick questions first."
- CAPTURING: "Now the customer captures photos, one at a time."
- CUSTOMER_REVIEW: "The customer reviews everything before sending."
- COMPLETE: "The complete brief arrives on the business phone — ready to quote."

### Screen changes

**New screens:**
- `CustomerRequestScreen` — Branded ClearPath intake form (name, service, message, submit button)
- `CustomerQuestionsScreen` — 2-3 questions with chip/toggle inputs, ClearPath header
- `BusinessIdleScreen` — ClearPath dashboard showing "No new requests" initially, then "New lead" notification after routing, then "Customer in progress" during capture
- `CustomerConfirmationScreen` — Updated to show ClearPath brand in the confirmation

**Removed screens:**
- `TemplateSelectScreen` — No longer needed (automated)
- `SendLinkScreen` — No longer needed (automated)
- `LinkSentScreen` — No longer needed (automated)
- `CustomerIdleScreen` — No longer needed (customer initiates)
- `CustomerWelcomeScreen` — Merged into the routing/questions transition

**Kept mostly as-is:**
- `CustomerCaptureScreen` — Same photo flow, add ClearPath header branding
- `CustomerReviewScreen` — Same, add customer answers summary
- `BriefCompleteScreen` — Enhanced with customer answers section

### Branding details

The customer-facing screens show ClearPath's teal brand color in headers and buttons, with a small "Powered by PhotoBrief" badge at the bottom. This demonstrates how PhotoBrief white-labels for the business while keeping its attribution.

### Files changed

- `src/components/marketing/InteractiveHeroBriefAssembly.tsx` — Full rewrite of phases, screen components, and phase machine. Same file, same exports.

### What stays the same

- `PhoneMockup` component, `ConnectionLine`, photo data array, blurry retake mechanic, lead capture form at the end, all phone bezel styling, API integration for lead capture.
