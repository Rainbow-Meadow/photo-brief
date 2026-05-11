## Goal

Add 2 photorealistic images to each of the 4 public pages that currently lack imagery: Pricing, ForAiAgents, Beta, Help. 8 images total.

## Image generation (premium model, 1536×1024 unless noted)

**Pricing — `src/assets/pricing/`**
1. `pricing-cedar-owner-laptop.png` — Cedar & Sons owner at a desk reviewing the assembled brief on a laptop, with a small "Pro · Founding" plan badge visible in the app chrome. Warm office light, real photograph feel.
2. `pricing-multi-trade-fan.png` — Four phones fanned out on a clean off-white surface, each showing a brief packet for a different trade (tree care, plumbing, HVAC, junk removal). Top-down editorial shot, soft shadows.

**ForAiAgents — `src/assets/agents/`**
1. `agents-terminal-curl.png` — Photorealistic laptop screen showing a developer terminal: a `curl` POST to `https://api.photobrief.ai/v1/briefs/...` and a clean JSON response with `brief_id`, `photos[]`, `address`, `scope`. Dark IDE theme, monospace, very legible.
2. `agents-mcp-chat.png` — Phone or laptop screen showing an AI agent chat (Claude/ChatGPT-style UI, no real branding) calling a PhotoBrief MCP tool — tool call card "photobrief.get_brief({id})" with the rendered brief result inline.

**Beta — `src/assets/beta/`**
1. `beta-concierge-call.png` — Editorial photo of a partner on a video call with the PhotoBrief team during concierge setup; phone on the desk shows the in-app onboarding checklist; warm, real, no fabricated faces front-and-center (over-the-shoulder framing).
2. `beta-feedback-thread.png` — Photorealistic phone screenshot of the in-app feedback chat: a partner message "Briefs are landing in 38 sec, but can we tag urgency?" and a team reply "Shipping tonight — added an Urgent flag, you'll see it in v0.4." Clean chat UI, soft shadow.

**Help — `src/assets/help/`**
1. `help-quickstart-clipboard.png` — Top-down editorial shot of a printed quick-start checklist on a clipboard ("1. Build your first guide · 2. Send a test brief · 3. Review the result"), next to a phone open to the PhotoBrief dashboard. Warm desk surface, pen.
2. `help-support-chat.png` — Photorealistic phone screenshot of an in-app help/support thread between a user and PhotoBrief support, with a clear question and a helpful, dated reply.

## Wiring

For each page, add a single `<Section>` (or insert into an existing one) that renders the two images with `Container`, semantic alt text, `loading="lazy"`, and a short caption. Pattern reuses the editorial card frame already used in `MechanismGrid` (border, off-white background, hairline inset).

- `src/pages/Pricing.tsx` — insert a 2-up image row between the hero and the `pricingAxes` band (around line 90).
- `src/pages/ForAiAgents.tsx` — insert one image inside the API section (around line 207, before close) and one inside the MCP section (around line 257).
- `src/pages/Beta.tsx` — insert a 2-up image row inside the existing alt-tone Section around line 73 (concierge image) and the agent Section around line 107 (feedback thread).
- `src/features/help/pages/BetaGuidePage.tsx` — read the file, then insert a 2-up row near the page intro.

## QA

- After generation, view each image; regenerate any with broken UI text or off-brand visuals.
- Confirm every page renders the new images at desktop and at the current 440px mobile viewport (no overflow, no overlapping captions).

## Out of scope

- Trade illustrations in `UseCasesGrid.tsx` (still imported but not rendered — separate question).
- Legal/auth utility pages (Privacy, Terms, Auth, Signup, Forgot/Reset, Unsubscribe).
- Demo page (already has photographic content via the brief-assembly component and the Cedar mechanism grid).
