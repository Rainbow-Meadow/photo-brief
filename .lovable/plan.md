
# Cloudflare Agents for PhotoBrief

## What Cloudflare Agents Are

Cloudflare Agents SDK lets you build **stateful, long-running AI agents** that run on Durable Objects. Each agent instance gets:

- **Built-in SQLite database** — persistent state that survives restarts, deploys, and hibernation
- **WebSocket connections** — real-time bidirectional communication with clients
- **Scheduled tasks** — cron, delay, date-based scheduling that wakes agents autonomously
- **Tool calling** — server-side tools, client-side tools, and human-in-the-loop approval
- **MCP server/client** — expose tools via Model Context Protocol or consume external MCP servers
- **Browser automation** — Chrome DevTools Protocol access for scraping/screenshots
- **Voice** — real-time speech-to-text/text-to-speech over WebSocket
- **Email** — send and receive email natively
- **Sub-agents** — spawn child agents with isolated storage and typed RPC
- **Durable execution** — work that survives eviction with crash recovery
- **Agentic payments** — accept/make machine-to-machine payments (x402, MPP)

You already have `CLOUDFLARE_API_TOKEN` configured, and the existing Cloudflare Worker (`photobrief-router`) provides infrastructure to deploy alongside.

---

## High-Value Use Cases for PhotoBrief

### 1. Live MCP Server (replace the "planned" stub)

`public/mcp.json` currently says `"status": "planned"` with a fallback to the REST endpoint. A Cloudflare Agent running `McpAgent` would make PhotoBrief's MCP endpoint real — any AI coding tool (Claude Code, Cursor, Windsurf, OpenCode) could `create_request`, `lookup_pricing`, and `read_faq` natively.

**Why Cloudflare Agents vs. a Supabase edge function:** MCP uses Streamable HTTP with SSE, which maps naturally to the Agent's built-in transport. The Agent handles session state, auth, and tool registration out of the box.

### 2. Per-Customer Photo Request Agent

Each photo request could be backed by an agent instance (keyed by request token). The agent would:
- Track the recipient's capture session state in real time
- Run AI quality checks as photos arrive (calling the existing `ai-analyze-media` edge function)
- Send follow-up nudges on a schedule if photos haven't been submitted
- Provide a WebSocket connection so the business dashboard shows live capture progress

### 3. Proactive Business Assistant Agent

A per-workspace agent that:
- Monitors submission quality trends and sends digest notifications
- Auto-generates guide suggestions based on customer photo patterns
- Handles scheduled reminders (request due dates, follow-ups)
- Answers workspace-specific questions using RAG over their guides/templates

### 4. Website Intake Orchestrator

Replace the current stateless `website-intake` edge function with an agent that:
- Maintains a conversation with the lead (multi-turn intake via chat or SMS)
- Uses AI to classify the request type and match templates with persistent context
- Queues and retries delivery (SMS/email) with built-in retry logic
- Tracks conversion funnels with per-lead state

### 5. Agentic Payments for API Credits

When the API goes live on Business plans, Cloudflare's x402 protocol could let AI agents pay per-API-call without traditional billing setup — a machine calls `create_request`, pays per credit automatically.

---

## Recommended Phased Approach

### Phase 1: Live MCP Server (highest impact, lowest effort)

Deploy a Cloudflare Agent as a remote MCP server at `mcp.photobrief.ai` that exposes the three tools already defined in `public/mcp.json`. It proxies to the existing Supabase edge functions, so no backend changes needed.

**Technical work:**
- New `workers/mcp-agent/` directory with a `McpAgent` class
- Three tool definitions: `create_request`, `lookup_pricing`, `read_faq`
- OAuth/bearer auth using existing `pb_` API keys
- Update `public/mcp.json` status to `"active"` with the real endpoint
- Add wrangler config and GitHub Actions deploy step
- Update the `/for-ai-agents` page to show the live MCP endpoint

### Phase 2: Real-Time Capture Agent

Per-request Durable Object agent that provides WebSocket-based live status to the business dashboard during photo capture.

### Phase 3: Business Assistant Agent

Per-workspace agent with scheduling, RAG, and proactive notifications.

### Phase 4: Agentic Payments

x402 payment support on the MCP tools for machine-to-machine billing.

---

## What I'd Build Now

If you approve, I'll start with **Phase 1: the live MCP server**. This involves:

1. Creating `workers/mcp-agent/` with wrangler config and the McpAgent class
2. Implementing the three MCP tools that proxy to existing edge functions
3. Adding bearer token auth validation
4. Adding a deploy step to the existing Cloudflare GitHub Actions workflow
5. Updating `public/mcp.json` and the `/for-ai-agents` marketing page

This makes PhotoBrief one of the first field-service tools with a real, production MCP endpoint — a strong differentiator for the AI agent discovery story you've already built with `agent.json`, `ai-plugin.json`, `llms.txt`, and `openapi.json`.
