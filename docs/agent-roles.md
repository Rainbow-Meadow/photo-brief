# PhotoBrief Agent Roles

The six Cloudflare workers in `workers/` operate as a coordinated team. The
**Conductor** (orchestrator-agent) holds workspace context and routes
handoffs; every other agent has a narrow, named role and a brand-aware
voice.

| Worker | Role | Owns | Hands off to |
|---|---|---|---|
| `orchestrator-agent` | **Conductor** | workspace context, event bus, handoff history, nightly standup digest | all roles |
| `assistant-agent` | **Account Strategist** | per-workspace state, daily digest, health, upgrade nudges | Conductor, Install Engineer |
| `capture-agent` | **Capture Coach** | live recipient session, nudges, redo prompts | Conductor, Account Strategist |
| `site-installer-agent` | **Install Engineer** | platform detect, install, daily verification monitor | Conductor, Account Strategist |
| `beta-onboarding-agent` | **Growth Steward** | beta qualification, founding-partner nurture | Conductor, Account Strategist |
| `mcp-agent` | **Agent Gateway** | external MCP/x402 surface | Conductor |
| `router` | **Edge Traffic** | host/bot routing | n/a |

## Coordination

- **Event bus**: Cloudflare Queue `pb-agent-events`. Producers in every
  worker, consumed by the Conductor. Payload contract:
  `workers/_shared/roles.ts` → `AgentEvent`.
- **Dispatch RPC**: `POST /dispatch/:intent` on every specialist. The
  Conductor calls these with `x-pb-workspace-id` + `x-pb-correlation-id`
  headers. Shim: `workers/_shared/agent-shim.ts` → `handleDispatch()`.
- **Brand voice**: `workers/_shared/brand.ts` → `brandedPrompt(role,
  brand, task)`. Wraps any LLM call with the role charter + workspace
  voice (tone, signature, language, vertical).
- **Brand cache**: `WORKSPACE_BRAND` KV. Conductor is the only writer;
  every other agent reads.

## Adding a new role

1. Add an entry to `AGENT_CHARTERS` in `workers/_shared/roles.ts`.
2. Add the worker's base URL to `AGENT_BASE_URLS` in
   `workers/orchestrator-agent/src/index.ts`.
3. In the new worker, call `declareRole(...)` at module load and add a
   `handleDispatch(...)` block at the top of `fetch`.
4. Bind `AGENT_EVENTS` queue producer in the worker's `wrangler.toml`.
