
# Auto-install Smart Intake via a Cloudflare Agent

## Short answer
Yes — but "fully automated" splits into two tiers. About 60–70% of customer sites can be installed end-to-end with no human edits. The rest need the agent to walk the user through one or two clicks because the site builder doesn't expose an API or locks editing behind a human session. A single **Installer Agent** (Cloudflare Durable Object) can own the whole flow and degrade gracefully per platform.

## What "install" means today
From `WebsiteIntakePage.tsx` there are two install modes:
1. **Hosted-link** — replace the destination of the site's main CTA ("Get a quote", "Contact", etc.) with `https://photobrief.ai/i/:token`. Used by Wix, Squarespace, WordPress, Webflow, Shopify, GoDaddy, Carrd, "Any website".
2. **Webhook** — keep the existing form, POST submissions to the intake webhook. Used by Zapier/Make.

So automation = (a) find the right CTA / form, (b) rewrite link or wire webhook, (c) verify.

## Architecture

New worker: `workers/site-installer-agent/` — a Durable Object Agent (same pattern as `capture-agent`, `beta-onboarding-agent`). Routes on `installer-agent.photobrief.ai`. State machine per workspace install attempt.

```text
 user clicks "Auto-install"
        │
        ▼
 Installer Agent (DO)  ──►  detect platform (fetch HTML, sniff via Workers AI)
        │
        ├─► API path        (Webflow, Shopify, WordPress.com, Wix REST, Squarespace code-inject)
        │     └─► OAuth via standard_connectors → call platform API → swap CTA / inject snippet
        │
        ├─► Browser path    (Carrd, GoDaddy, classic Wix, anything without an API)
        │     └─► Cloudflare Browser Rendering + Puppeteer: open editor in a remote
        │         session, the user logs in once via a streamed login window, agent
        │         locates the CTA with vision model, edits link, publishes.
        │
        └─► Fallback        (locked-down builder, no creds)
              └─► Agent generates a 30-second video + exact paste snippet + screenshot
                  of where to paste; logs the partial install for the user to finish.

 verify: Browser Rendering visits the live site, clicks CTA, confirms /i/:token
 loads, pings Capture Agent for handshake, marks install complete.
```

## Cloudflare primitives used
- **Agents SDK + Durable Object** for stateful, resumable installs (already used in `workers/capture-agent`, `workers/beta-onboarding-agent`).
- **Browser Rendering / Puppeteer binding** for platforms without APIs and for verification clicks.
- **Workers AI** (vision + small LLM) to identify the primary CTA from a screenshot/DOM and to pick the right page to install on.
- **Workers KV / DO storage** for per-install transcript and resume tokens.
- **Smart Placement** near Supabase to keep DB writes fast (matches existing workers).
- **Hyperdrive** to read workspace + intake-source rows (already wired in other workers).

## Per-platform reality check
| Platform | Auto-install? | How |
|---|---|---|
| Webflow | Yes | Sites API → patch button link, publish |
| Shopify | Yes | Admin API → edit theme section / add app block |
| WordPress.com | Yes | REST API + token (or PhotoBrief plugin install) |
| Wix Studio | Yes | Wix REST API (limited to enabled sites) |
| Wix classic editor | Browser-driven | Puppeteer + user login |
| Squarespace | Partial | Code-injection API for snippet; CTA edits browser-driven |
| Webflow / Framer / Carrd | Browser-driven | Puppeteer + user login |
| GoDaddy Website Builder | Browser-driven or fallback snippet | No public API |
| Static sites (HTML, Hugo, etc.) | Fallback | Snippet + PR-style instructions |
| Zapier / Make | Yes | OAuth → create Zap/Scenario from template |

## UX in PhotoBrief
On `WebsiteIntakePage`, replace the current "Open editor → paste link" walkthrough with an **"Install for me"** primary action that opens an Agent chat panel (same pattern as `BetaOnboardingAgentExperience.tsx`). The agent:
1. Asks for the site URL.
2. Detects platform, shows what it will do.
3. Triggers the right OAuth flow (via existing `standard_connectors` for supported platforms) or opens a streamed browser-login modal.
4. Performs install, streams progress.
5. Runs verification, reports success or hands back to manual paste flow.

The existing manual wizard stays as the fallback path so nothing regresses.

## Phasing

**Phase 1 — agent shell + verification** (small)
- New `workers/site-installer-agent` DO with `/install/start`, `/install/:id` SSE.
- Browser Rendering verification step (open site, click CTA, confirm `/i/:token`).
- Frontend: chat panel on `WebsiteIntakePage` that talks to the agent, manual paste flow unchanged.
- Outcome: user pastes link themselves, agent verifies it works. Useful day one.

**Phase 2 — API installers for the high-value platforms**
- Webflow, Shopify, WordPress.com, Wix, Zapier. One installer module per platform behind a common interface. OAuth via `standard_connectors`.
- Outcome: ~60% of sites install with one click.

**Phase 3 — Browser-driven installers**
- Puppeteer flows for Carrd, GoDaddy, Squarespace CTA edits, classic Wix.
- Streamed login: user authenticates in a one-time popup, session cookies stay in the DO for the duration of the install only, then discarded.
- Outcome: ~90% coverage.

**Phase 4 — Continuous monitoring**
- Daily Browser Rendering check that the CTA still points at `/i/:token`. Alert in PhotoBrief if a customer republishes their site and breaks the link.

## Risks and constraints to be honest about
- **Credentials.** Browser-driven installs need the user to log into their site builder inside our flow. We must never persist those credentials past the install — DO storage is wiped on completion.
- **Platform ToS.** Puppeteer-driving Wix/Squarespace/GoDaddy editors is a grey area; API paths are preferred wherever they exist. We will document this for compliance.
- **Detection accuracy.** Picking the "right" CTA from a marketing site is the hardest LLM task here. Phase 1's verification step is the safety net — if the wrong button got swapped, verification fails fast and we revert.
- **Cost.** Browser Rendering minutes and Workers AI vision calls aren't free. Budget per install ≈ $0.05–$0.20; price into the plan or cap by tier.
- **Cloudflare Browser Rendering quotas** are per-account; high concurrency may need the paid tier or a queue.

## What I need from you to start
1. Confirm scope: Phase 1 only (agent shell + verification + manual paste), or commit to Phase 1+2 (add Webflow/Shopify/WP/Wix API installers)?
2. Confirm we may use `standard_connectors` OAuth for Webflow / Shopify / WordPress / Wix / Zapier, and add new connectors for any missing.
3. Pick the first browser-driven target for Phase 3 (Carrd vs GoDaddy vs Squarespace) — useful to validate the Puppeteer pattern on the simplest one first.
