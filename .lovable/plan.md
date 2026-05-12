## Goal

Close the four findings from the Cedar & Sons E2E run: two product bugs that real recipients hit today, and two test-tooling blockers that prevented finishing the run.

---

## Fix 1 — BUG-2: recipient sees "Your business" / "Your business here"

**Root cause (verified in DB):** `business_workspaces` has only `is_workspace_member()` read policy, so the anonymous token-scoped client in `src/features/capture/recipientContext.ts` gets `ws = null`, and `businessName` falls back to the literal string `"Your business"`. That string then gets composed into the headline (`{businessName} needs a few photos`) and the default intro body (`Hi ${firstName}! ${businessName} here — …`). Brand profiles already have a token policy, but workspaces don't — so this leak hits **every** workspace whose owner hasn't manually populated `brand_profiles.intro_message`.

**Fix:**

1. **Migration** — add an anon/auth-readable policy on `public.business_workspaces`:
   ```
   CREATE POLICY "ws read by token" ON public.business_workspaces
     FOR SELECT TO anon, authenticated
     USING (EXISTS (
       SELECT 1 FROM public.photo_brief_requests r
       WHERE r.id = request_id_for_token()
         AND r.workspace_id = business_workspaces.id
     ));
   ```
2. **Defensive copy fix** in `recipientContext.ts`: keep `ws?.name` as the primary source, but if it's still null, fall back to the *guide name* rather than the literal "Your business". Strip the "here" phrasing from the default intro body so an empty business name can never produce nonsense.
3. **Test** — add a Vitest unit test asserting that no rendered intake copy can ever contain the strings `"Your business here"` or `"Your business needs"` when `businessName` is empty.

---

## Fix 2 — BUG-1: requests without a guide produce a dead recipient link

**Root cause:** `photo_brief_requests.guide_id` is nullable and the recipient route throws "missing saved template" with a generic lock-icon screen. The DB allows `status='sent'` with no guide.

**Fix:**

1. **Migration** — add a `BEFORE INSERT OR UPDATE` trigger on `photo_brief_requests` that raises `check_violation` when `status` is anything other than `'draft'` and `guide_id IS NULL`. Keep the column nullable so drafts can be saved before a template is chosen.
2. **UI guard** in `src/services/requestsService.ts` (or wherever requests transition to `sent`): refuse to send and surface a clear toast — "Pick a guide before sending this request."
3. **Recipient UX** — replace the *"This request is missing its saved template"* dead-end with a friendlier card: title "We're not quite ready", body "The sender is still finishing this request. Please ask them to resend the link.", plus a copy-link-to-clipboard button so the homeowner can ping the business. (Defensive UI even after the trigger lands, since older bad rows might still exist.)

---

## Fix 3 — BLOCK-A: Cloudflare Turnstile breaks automation on preview hosts

**Root cause:** `TurnstileWidget` always loads `challenges.cloudflare.com/turnstile/v0/api.js`. In the headless automation browser (and any host where Cloudflare's JS can't reach the iframe) the widget renders an "Unable to complete" error overlay. The auth submit code already only verifies *if a token exists*, but the visible error widget makes the form look broken and blocks confidence.

**Fix (frontend only, no secret changes):**

1. Add a small helper `isAutomatedPreviewHost()` that returns true when:
   - `import.meta.env.DEV`, **or**
   - hostname matches `id-preview--*.lovableproject.com`, `*.lovableproject.com`, or `*--lovable.app` (Lovable preview origins).
2. In `TurnstileWidget`, when that helper is true, **skip script load entirely** and render an empty `<div data-testid="turnstile-skipped" />`. Production hostnames (`photobrief.ai`, `www.photobrief.ai`, `photo-brief.lovable.app`) keep the real widget.
3. Auth submit code already tolerates a missing token, so no other changes needed.

This is a real product improvement too: today, if Cloudflare's CDN is degraded, anyone on those hosts sees a broken widget. After this change, the bypass is scoped to preview origins only.

---

## Fix 4 — BLOCK-B: browser tool can't upload files through the recipient stepper

**Root cause:** the recipient capture step uses a hidden `<input type="file">` triggered by "Choose from library", and the automation tool's `act()` only supports click/fill/type/press/dragAndDrop — it has no `setInputFiles` primitive.

**Fix — add a dev-only "Use sample photo" affordance to the recipient step:**

1. Ship 4 fixture JPGs in `public/e2e/`: `leaning-oak-wide.jpg`, `oak-trunk-closeup.jpg`, `house-elevation.jpg`, `driveway-access.jpg`.
2. In the capture-card component, when `isAutomatedPreviewHost()` is true **and** the URL has `?e2e=1`, render a third button: **"Use sample photo"**. It cycles through the 4 fixtures by step index, fetches the file as a Blob, and pushes it through the *same* upload + AI-check pipeline the real "Choose from library" path uses (no shortcut on the data path — only on how the file is acquired).
3. Visible only on preview hosts behind `?e2e=1`. Production users never see it.

Outcome: future automated E2E runs can complete capture → upload → AI check → submit → business review through the real backend.

---

## Out of scope (intentionally)

- Re-seeding the 18 member sub-accounts and the 2/8/20/35/50 sample requests — not needed for E2E and adds noise.
- Marketing screenshot regeneration.
- Updating `mem://seed-users` text — already accurate; will refresh after the run succeeds.

---

## Validation after implementation

Once the four fixes land:

1. Re-open `https://…/r/65e575df9583319549cb2b81ad76a1477d34` — confirm headline reads **"Apex Roofing Group needs a few photos"** and the intro body no longer contains "Your business here".
2. Try to insert a `photo_brief_requests` row with `status='sent'` and null `guide_id` — DB should reject it.
3. Sign in at `/auth` from the automation browser — Turnstile no longer renders, button works.
4. Walk the Cedar & Sons stepper at `/r/:token?e2e=1`, click "Use sample photo" through all 4 steps, answer the 2 questions, submit. Verify in DB:
   - 1 `submissions` row for the request, `submitted_at` set
   - 4 `captured_media` rows tied to the right `step_id`s
   - `usage_events` shows 4 × `submitted_photo` (1 credit each), 4 × `ai_photo_check` (1 credit each), 0 follow-up charges
   - No double-charge if a single `?e2e=1` retry happens
5. Run `lint`, `typecheck`, the unit test added in Fix 1, and the build.

---

## Files I expect to touch

```
supabase/migrations/<new>.sql        # Fix 1 policy + Fix 2 trigger
src/features/capture/recipientContext.ts   # Fix 1 fallback
src/features/capture/pages/PublicRecipientPage.tsx  # Fix 2 friendly error, Fix 4 button
src/services/requestsService.ts      # Fix 2 send guard
src/lib/preview-host.ts (new)        # isAutomatedPreviewHost()
src/components/security/TurnstileWidget.tsx  # Fix 3 bypass
src/test/recipient-copy.test.ts (new)        # Fix 1 regression test
public/e2e/*.jpg (4 files)           # Fix 4 fixtures
```

---

## Questions before I implement

1. **Existing bad rows** — there are 24 production-looking workspaces with requests already in flight. After Fix 2's trigger lands, a `UPDATE ... status='sent'` on a guide-less row will fail. Want me to (a) just add the trigger and let any existing bad rows stay as-is (only blocks *new* bad transitions), (b) also auto-flip existing guide-less `sent` rows back to `draft` in the same migration, or (c) leave existing data alone and have me list affected rows for you to review first?
2. **Fix 4 visibility** — the "Use sample photo" button is only shown on preview hosts behind `?e2e=1`. Is that scope OK, or do you want it gated more tightly (e.g. only when a specific cookie or header is present)?