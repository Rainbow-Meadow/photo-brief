# Agent Decision Logic Reference

Produce a single structured Markdown document that walks through every agent in the project and documents its **end-to-end decision logic** — not just what it owns, but exactly *what input causes what branch, what output, and what handoff*.

Output: `/mnt/documents/agent-decision-logic.md` (delivered as a downloadable artifact). Nothing in the repo gets modified.

## Source of truth

I'll read the actual worker source rather than repeat `docs/agent-roles.md`:

- `workers/router/src/index.ts` (Edge Traffic, 424 lines)
- `workers/orchestrator-agent/src/index.ts` (Conductor, 465 lines)
- `workers/assistant-agent/src/index.ts` (Account Strategist, 695 lines)
- `workers/capture-agent/src/index.ts` (Capture Coach, 479 lines)
- `workers/site-installer-agent/src/index.ts` (Install Engineer, 666 lines) + 6 platform installers
- `workers/beta-onboarding-agent/src/index.ts` (Growth Steward, 378 lines)
- `workers/mcp-agent/src/index.ts` + `x402.ts` (Agent Gateway, 542 lines)
- Shared contracts: `workers/_shared/{roles,brand,agent-shim,ai,ae,db,kv-bundle,recipient-bundle}.ts`

Each agent section uses this fixed schema so the doc is scannable and diff-able:

```text
## <Role name> — <worker dir>
1. Identity & charter        (role const, voicePreamble, hands-off targets)
2. Inputs                    (HTTP routes, queue subscriptions, scheduled triggers, DO alarms)
3. State                     (DO SQLite tables, KV reads/writes, Supabase tables touched)
4. Decision tree             (numbered branches: trigger → condition → action → emitted event / handoff)
5. LLM calls                 (which prompts, which model via brandedPrompt, fallbacks)
6. Outputs                   (HTTP responses, AGENT_EVENTS payloads, dispatch calls, side effects)
7. Failure modes             (timeouts, retries, dead-letter, what gets logged)
```

For the Conductor I'll add a global section showing the **event → handler matrix** (every `AgentEvent.type` and which downstream `dispatch(intent)` it triggers) plus the nightly standup composition logic.

For the Install Engineer I'll include a sub-table covering each platform installer (`carrd / shopify / webflow / wix / wordpress / zapier`) with: detection signal, install method, verification probe, failure surface.

The doc opens with:
- A one-page system map (ASCII) showing edges: HTTP, Queue, Dispatch RPC, KV reads.
- The shared event vocabulary (every `AgentEvent` variant, when it's emitted, who listens).
- The brand/voice envelope (`brandedPrompt` flow, what gets injected, how recipient-facing flows bypass LLM entirely per the "no LLM in live recipient path" rule).

Closes with:
- Cross-cutting invariants (workspace isolation, plan-tier gates, photo-policy enforcement points, beta clock).
- A "where decisions are NOT made by agents" appendix — i.e. the `/i/:token` and `/r/:token` runtime paths that are configuration-driven.

## Method

1. Read each worker file end-to-end (parallel batch reads).
2. Trace each exported handler: enumerate routes from the `fetch` switch, queue consumer cases, alarm handlers, and `handleDispatch` intents.
3. For every conditional branch that changes outbound behavior (event emit, dispatch, DB write, KV write, LLM call), record it as a numbered decision node.
4. Cross-reference `AGENT_CHARTERS` and `AgentEvent` union to verify no emitted/consumed event is undocumented.
5. Render the Markdown, write to `/mnt/documents/agent-decision-logic.md`, emit a `presentation-artifact` tag.

## Out of scope

- No code changes, no new tests, no diagrams beyond ASCII.
- Not documenting Supabase edge functions or React services — only the 7 Cloudflare workers and their shared contracts. (Happy to add a follow-up doc for edge functions if you want.)
- Not a security audit; I'll note auth checks where they gate a branch but won't grade them.

Estimated length: ~1,500–2,500 lines of Markdown.
