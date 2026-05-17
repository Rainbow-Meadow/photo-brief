
## Problem

The demo scanned `btymaterial.com` (a landscape materials yard — mulch, stone, gravel) and recommended:

1. "Get a quote or estimate" — photos recommended
2. "Request service or repair" — photos recommended
3. "Something else" — photos optional

That's wrong. They don't do repairs. They sell bulk materials. Photos help estimate square footage for coverage but aren't required.

## Root cause

`supabase/functions/demo-scan/index.ts` builds routes with hard-coded keyword regex:

- `inferServices()` slots every page into one of 5 fixed buckets (`quote_estimate`, `service_repair`, `warranty_damage`, `product_inquiry`, `general_intake`) using shallow regex like `/quote|install|project|price|cost/` and `/repair|service|maintenance/`.
- `buildPlan()` then picks the top 3 buckets in a fixed priority order. Because any page with the word "service" or "project" matches, `service_repair` almost always wins second place even for businesses that don't do service work.
- Route labels and photo policies are hard-coded per bucket, with zero awareness of what the business actually sells or does.

The "smart" intake isn't smart — it's a five-option mad-lib.

## Fix

Replace the bucket-based `inferServices` + `buildPlan` with a single LLM step that proposes routes tailored to *this* business, then falls back to the existing keyword logic only if the LLM call fails.

This stays within project rules:
- The LLM runs at **setup time only** (demo scan), not in the live recipient `/i/:token` path.
- Uses Lovable AI Gateway (no extra API key).
- Output is config (route rows) — the live flow stays deterministic.

### New step: `inferRoutesWithAI(pages, forms, host)`

Inputs sent to the model:
- `host` (e.g. `btymaterial.com`)
- For up to 8 highest-signal pages: `url`, `page_type`, `title`, `h1`, `headings` (first 8), `text_excerpt` (first ~800 chars)
- Detected forms summary: `inferred_purpose` + `field_labels`

System prompt (anchored to PhotoBrief rules):

> You design a Smart Intake for a service business. Read the scanned pages and propose 2–4 distinct intake routes a real customer of *this specific business* would actually pick. Do not invent services the site doesn't show evidence of. Photos are conditional, not default — only require them when the team literally can't act without one. Plain words. No jargon.

Structured output (Zod / JSON schema) per route:
```
{
  label: string (≤ 50 chars, verb-led, customer voice),
  customer_description: string (≤ 140 chars),
  template_type: "quote_estimate" | "service_repair" | "warranty_damage"
                | "product_inquiry" | "delivery_pickup" | "bulk_order"
                | "general_intake",
  photo_policy: "not_needed" | "optional" | "recommended" | "required",
  photo_policy_reason: string (≤ 160 chars, explains why in plain words),
  readiness_goal: ReadinessGoal,
  match_keywords: string[] (≤ 12, derived from real page content),
  service_names: string[] (≤ 6),
  evidence_urls: string[] (1–3 URLs from the scanned pages that justify this route)
}
```

Model: `google/gemini-2.5-flash` (fast, cheap, good enough for setup-time config).

After the call, validate:
- Drop routes whose `evidence_urls` aren't in the scanned set (anti-hallucination).
- Ensure at least one `is_fallback: true` route. If the model didn't include a "Something else" path, append the existing `general_intake` fallback with `photo_policy: "optional"`.
- Map each route's `template_type` to the existing `suggestedQuestions(type)` helper for now — keeps DB shape unchanged. If the type is one of the new ones (`delivery_pickup`, `bulk_order`), use `quote_estimate`'s question set as the base.
- Clamp to max 4 routes, sort with fallback last.

Fallback chain:
1. AI call fails or returns 0 valid routes → use existing `inferServices` + `buildPlan`.
2. That returns 0 → existing single "Tell us what you need" safety route.

### Touch points (all in `supabase/functions/demo-scan/index.ts`)

- Add `inferRoutesWithAI()` helper that calls `https://ai.gateway.lovable.dev/v1/chat/completions` with `LOVABLE_API_KEY` and `response_format: { type: "json_schema", ... }`.
- Extend `suggestPhotoPolicy()` to know about `delivery_pickup` (photos optional — helps estimate coverage) and `bulk_order` (photos optional).
- Extend `suggestedQuestions()` to provide sane defaults for `delivery_pickup` ("What material and roughly how much?", "Delivery address?", "When do you need it?") and `bulk_order` (quantity, contact, timing). Keep existing types unchanged.
- In the handler, after the crawl finishes:
  - Try `inferRoutesWithAI(pageRows, formRows, hostLabel)`.
  - If it returns routes, use those for `plan.rules` and skip `inferServices`/`buildPlan` for route generation. Still run `inferServices` for the `service_catalog_items` rows (DB shape unchanged).
  - If it fails, fall through to existing `buildPlan(services, formRows)`.

### Why this works for btymaterial.com

The model sees titles/headings like "Mulch", "Stone & Gravel", "Bulk Delivery", "Pickup" and will propose routes like:
- "Get a delivery quote" — photos optional ("Photos help us estimate coverage, but aren't required")
- "Place a pickup order" — photos not needed
- "Ask about a product or price" — photos not needed
- "Something else" — fallback

…instead of inventing repair work that doesn't exist.

## Out of scope

- No DB schema changes — `intake_routing_rules.template_type` stays a string, new types just flow through.
- No change to live `/i/:token` (still config-driven, no LLM).
- No change to `website-intake` edge function or plan gates.
- Existing keyword pipeline stays intact as fallback — not deleted.

## Technical notes

- Lovable AI Gateway: `LOVABLE_API_KEY` is already injected into edge functions. No new secret.
- Handle 402 (credits) and 429 (rate limit) explicitly — log and fall through to keyword fallback.
- Cap LLM call to ~15s with `AbortController`; demo already waits ~30s.
- All prompts/output stay on the server; nothing about the LLM is exposed to the browser.
