
# Coordinated, brand-specific agent team

Goal: turn the six existing Cloudflare agents (router, capture, assistant, beta-onboarding, site-installer, mcp) into a coordinated team where one **Orchestrator** owns workspace context, every agent has a named **role + charter**, and every outbound surface (copy, visuals) is **branded per workspace**.

## 1. Role charters (the contract)

Add `workers/_shared/roles.ts` — single source of truth for who does what, what they may emit, and what they hand off.

| Agent worker | Role name | Owns | Hands off to |
|---|---|---|---|
| `assistant-agent` | **Account Strategist** | per-workspace state, digests, health, upgrade nudges | Orchestrator (events), Install Engineer (site issues) |
| `capture-agent` | **Capture Coach** | live recipient session, nudges, redo prompts | Quality Reviewer on submission_completed |
| `site-installer-agent` | **Install Engineer** | platform detect, install, daily monitor | Account Strategist on install_verified / monitor_failed |
| `beta-onboarding-agent` | **Growth Steward** | beta qualification, founding-partner nurture | Account Strategist on activation |
| `mcp-agent` | **Agent Gateway** | external MCP/x402 surface | Orchestrator (audit log) |
| `router` | **Edge Traffic** | host/bot routing | n/a (stateless) |
| **NEW** `orchestrator-agent` | **Conductor** | one DO per workspace; routes events, enforces brand voice, fans out tasks, aggregates state | all of the above |

A new `docs/agent-roles.md` mirrors the table for humans.

## 2. New `orchestrator-agent` worker

`workers/orchestrator-agent/` — Durable Object, one instance per `workspace_id`.

Responsibilities:
- Subscribes to a shared event bus (Cloudflare **Queue** `pb-agent-events`).
- Holds the canonical **WorkspaceContext** (brand, voice, plan tier, vertical, working hours, on-call routing).
- Exposes `dispatch(roleName, task)` RPC so any agent can request work from a specialist without knowing its DO binding.
- Records every cross-agent handoff in SQLite-backed history → surfaced to the Account Strategist for digests.
- Schedules cross-cutting jobs (e.g. nightly "team standup": pulls capture stats, install monitor results, beta progress → one digest).

Endpoints: `/dispatch`, `/context`, `/history`, `/health`, plus Queue consumer.

## 3. Shared brand layer

Add `workers/_shared/brand.ts` with two pieces:

**A. `loadWorkspaceBrand(workspaceId)`** — reads from existing `WORKSPACE_BRAND` KV (already bound on router) + Supabase `workspaces` row. Returns:
```ts
{ name, logoUrl, accentHsl, voice: { tone, signature, language },
  vertical, contactPolicy: { hours, channels, escalateTo } }
```

**B. `brandedPrompt(role, brand, task)`** — wraps any LLM call with a system preamble that injects role charter + brand voice. Every agent that talks to Workers AI / Lovable AI Gateway routes through this helper instead of raw prompts.

Visual identity: extend `public/embed/cta-rewriter.js`, recipient bundle, and PDF service to read brand from the same context object so install screens, recipient pages, and digests all match.

## 4. Wiring existing agents

Minimal, non-breaking edits to each worker:
- Import `roles.ts` and self-declare role on boot.
- Replace direct prompt strings with `brandedPrompt(...)`.
- Replace direct cross-agent fetches with `orchestrator.dispatch(...)` (or queue publish for fire-and-forget).
- Capture agent emits `submission_completed` → orchestrator routes to Quality Reviewer logic in assistant.
- Site-installer emits `install_verified` and `monitor_failed` → orchestrator notifies Account Strategist, which nudges the user in-app.
- Beta-onboarding emits `beta_activated` → orchestrator hands workspace to Account Strategist for first digest.

## 5. Frontend surface

One small addition: an **Agent Team** panel on the workspace settings page that:
- Lists the six roles with status (idle / working / paused) pulled from `orchestrator/context`.
- Shows last 20 handoffs from `orchestrator/history`.
- Lets the user edit brand voice (tone, signature, language) — writes back to `WORKSPACE_BRAND` KV via a new `agent-brand` edge function.

New files: `src/services/agentTeamService.ts`, `src/features/workspace/components/AgentTeamPanel.tsx`, mounted in existing `WorkspaceSettingsPage`.

## 6. CI / deploy

- `.github/workflows/deploy-cloudflare.yml`: add `orchestrator-agent` to the deploy matrix.
- `wrangler.toml` for orchestrator: bind `WORKSPACE_BRAND` KV, `pb-agent-events` Queue (producer + consumer), Supabase URL/key, and DO namespaces for the other five agents.
- Queue created via wrangler config; no DB migration required (state lives in DO SQLite + existing KV).

## Technical notes

```text
                       ┌──────────────────────┐
   user / browser ───► │  router (Edge Traffic)│
                       └──────────┬───────────┘
                                  ▼
                ┌──────────────────────────────────┐
                │  orchestrator-agent (Conductor)   │
                │  - WorkspaceContext               │
                │  - dispatch() / event bus         │
                └─┬───────┬───────┬──────┬────────┬─┘
                  ▼       ▼       ▼      ▼        ▼
              capture  assistant install beta    mcp
              (Coach) (Strategist)(Eng) (Steward)(Gateway)
```

- Event bus = Cloudflare Queue `pb-agent-events`; payload shape lives in `_shared/roles.ts` as `AgentEvent` discriminated union.
- Orchestrator is the only writer of `WORKSPACE_BRAND` KV at runtime; other agents read-only.
- No changes to Supabase schema; brand voice fields already exist on `workspaces`.
- Backwards compatible: existing direct endpoints on each agent stay live during rollout; orchestrator dispatch is added alongside.

## Deliverables (scope = 5)

1. `workers/_shared/roles.ts`, `workers/_shared/brand.ts`
2. `workers/orchestrator-agent/` (DO + Queue consumer + wrangler.toml + tsconfig)
3. Edits to all five existing agents to adopt roles + brandedPrompt + dispatch
4. `docs/agent-roles.md`
5. `src/services/agentTeamService.ts` + `AgentTeamPanel.tsx` + settings mount
6. `agent-brand` edge function (writes brand voice back to KV via worker)
7. CI deploy entry + smoke test in `scripts/smoke-public-endpoints.mjs`
