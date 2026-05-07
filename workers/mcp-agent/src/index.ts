/**
 * photobrief-mcp — Stateless Cloudflare Workers MCP server.
 *
 * Exposes PhotoBrief's API as MCP tools so any MCP-capable AI agent
 * (Claude Code, Cursor, Windsurf, OpenCode, etc.) can create photo
 * requests, look up pricing, and read the FAQ natively.
 *
 * Phase 4: x402 Agentic Payments — paid tools return HTTP 402 with
 * payment requirements when called without auth. Agents can pay
 * per-call using the x402 protocol for machine-to-machine billing.
 */

import { createMcpHandler } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getPaymentRequirement,
  build402Response,
  validatePayment,
  type X402Config,
} from "./x402";

interface Env {
  API_BASE_URL: string;
  SITE_URL: string;
  /** x402 payment receiver address (wallet or account ID) */
  X402_PAY_TO?: string;
  /** x402 network identifier (default: "base-sepolia" for testnet) */
  X402_NETWORK?: string;
}

/* ── Pricing data (mirrors /llms-full.txt) ─────────────────────────── */

const PRICING_TABLE = `
| Plan      | Monthly | Annual (eff.) | Included photos | Users | Fit |
|-----------|---------|---------------|-----------------|-------|-----|
| Free      | $0      | $0            | 10/mo           | 1     | Testing the core capture flow |
| Starter   | $19     | $15           | 100/mo          | 1     | Solo operators, branding basics |
| Pro       | $49     | $40           | 500/mo          | 3     | High-volume solo & small crews |
| Team      | $99     | $80           | 1,500/mo        | 10    | Shared inbox & assignments |
| Business  | $199+   | custom        | 5,000+/mo       | 25+   | Multi-location, API, custom domain |

Unit: 1 submitted/analyzed customer photo = 1 PhotoBrief Credit.
First-pass follow-up photos requested by PhotoBrief do not consume credits.
AI quality checks and summaries are bundled into the photo-credit model.
API keys (prefix pb_) are issued on the Business plan.

## Agentic payments (x402)
Agents without a pb_ API key can pay per-call using the x402 protocol.
Pricing: create_request = $0.10 USD per call (1 PhotoBrief Credit).
lookup_pricing and read_faq are free and require no payment.
`.trim();

/* ── FAQ data ──────────────────────────────────────────────────────── */

const FAQ = [
  { q: "What is PhotoBrief?", a: "A visual intake layer for small businesses. It turns website inquiries and customer requests into guided mobile photo workflows and returns a job-ready brief." },
  { q: "How does Website Intake work?", a: "A business uses a hosted PhotoBrief intake link or connects an existing website form with a webhook. PhotoBrief normalizes the lead, chooses a saved template using routing rules or AI fallback, creates/reuses a customer profile, creates the request, and sends the customer into photo capture." },
  { q: "Can I use my existing website form?", a: "Yes. PhotoBrief provides a universal webhook and field mapping for existing forms, Zapier, Make, Webflow, WordPress plugins, and custom sites." },
  { q: "How does pricing work?", a: "Per-photo credits. 1 submitted/analyzed customer photo = 1 PhotoBrief Credit. Plans also differ by branding, storage term, and team size." },
  { q: "Do customers need an account?", a: "No. They open a link in a mobile browser and submit photos. No app install required." },
  { q: "What happens if a photo needs to be redone?", a: "First-pass follow-up photos requested by PhotoBrief do not consume credits." },
  { q: "What AI checks does PhotoBrief run?", a: "Six standard checks: wrong subject, too dark, blurry, label unreadable, glare, too close or cropped. Customer feedback is proportional: looks good, usable but could be clearer, or probably needs a retake." },
  { q: "Can I show my own logo to customers?", a: "Yes. Paid plans add logo, brand color, and custom messages. Higher plans support removing PhotoBrief branding." },
  { q: "How do agentic payments work?", a: "AI agents without a pb_ API key can pay per-call using the x402 protocol. When an agent calls a paid tool without auth, it receives HTTP 402 with payment requirements. The agent's payment layer sends an X-Payment header, and PhotoBrief processes the request." },
];

/* ── Server factory ────────────────────────────────────────────────── */

function createServer(env: Env) {
  const server = new McpServer({
    name: "PhotoBrief",
    version: "1.1.0",
  });

  /* ── Tool: create_request ────────────────────────────────────────── */
  server.registerTool(
    "create_request",
    {
      description:
        "Create a guided photo request and return a recipient URL the business can forward via SMS or email. Requires a workspace API key (prefix pb_) on the Business plan, OR x402 per-call payment.",
      inputSchema: {
        recipient_name: z.string().describe("Display name shown to the recipient."),
        recipient_email: z
          .string()
          .email()
          .optional()
          .describe("Recipient email. Either email or phone is required."),
        recipient_phone: z
          .string()
          .optional()
          .describe("Recipient phone in E.164. Either email or phone is required."),
        guide_id: z
          .string()
          .uuid()
          .optional()
          .describe("Optional ID of a workspace photo guide/template."),
        custom_message: z
          .string()
          .optional()
          .describe("Optional intro message shown to the recipient."),
        due_date: z
          .string()
          .optional()
          .describe("Optional ISO 8601 due date (YYYY-MM-DD)."),
        api_key: z
          .string()
          .optional()
          .describe("Workspace API key (starts with pb_). Required unless using x402 payment."),
        x_payment: z
          .string()
          .optional()
          .describe("Base64-encoded x402 payment payload. Alternative to api_key for per-call billing."),
      },
    },
    async (args) => {
      const { api_key, x_payment, ...body } = args;

      // If neither auth method provided, return payment instructions
      if (!api_key && !x_payment) {
        const x402Config = getX402Config(env);
        if (x402Config.enabled) {
          const requirement = getPaymentRequirement("create_request", x402Config);
          if (requirement) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: JSON.stringify({
                    error: "payment_required",
                    message: "This tool requires authentication (pb_ API key) or x402 payment.",
                    paymentRequirements: [requirement],
                    x402_instructions: "Base64-encode a JSON payload with { transaction, payer } fields and pass as the x_payment parameter.",
                  }, null, 2),
                },
              ],
              isError: true,
            };
          }
        }

        return {
          content: [
            {
              type: "text" as const,
              text: "Error: api_key is required. Use a workspace API key (prefix pb_) on the Business plan.",
            },
          ],
          isError: true,
        };
      }

      // Validate x402 payment if provided instead of API key
      if (x_payment && !api_key) {
        const x402Config = getX402Config(env);
        const requirement = getPaymentRequirement("create_request", x402Config);
        if (requirement) {
          const result = validatePayment(x_payment, requirement);
          if (!result.valid) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: `Payment validation failed: ${result.error}`,
                },
              ],
              isError: true,
            };
          }
          // Payment valid — proceed with a system-level API call
          // In production, this would use a service account key
          console.log(`[x402] Processing paid request from payer=${result.payer}`);
        }
      }

      const authHeader = api_key
        ? `Bearer ${api_key}`
        : "Bearer x402-payment-verified";

      const res = await fetch(`${env.API_BASE_URL}/api-create-request`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          ...(x_payment ? { "X-Payment-Method": "x402" } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json() as Record<string, unknown>;

      if (!res.ok) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error ${res.status}: ${(data as any).error ?? JSON.stringify(data)}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  );

  /* ── Tool: lookup_pricing ────────────────────────────────────────── */
  server.registerTool(
    "lookup_pricing",
    {
      description:
        "Return current PhotoBrief plans, monthly and annual prices, included PhotoBrief Credits, the per-photo credit model, and x402 agentic payment pricing. No authentication required.",
      inputSchema: {},
    },
    async () => ({
      content: [{ type: "text" as const, text: PRICING_TABLE }],
    }),
  );

  /* ── Tool: read_faq ──────────────────────────────────────────────── */
  server.registerTool(
    "read_faq",
    {
      description:
        "Return canonical FAQ answers for businesses and recipients. No authentication required.",
      inputSchema: {
        topic: z
          .string()
          .optional()
          .describe("Optional keyword to filter FAQ entries (e.g. 'pricing', 'intake', 'AI', 'x402')."),
      },
    },
    async ({ topic }) => {
      let items = FAQ;
      if (topic) {
        const lower = topic.toLowerCase();
        const filtered = FAQ.filter(
          (f) =>
            f.q.toLowerCase().includes(lower) ||
            f.a.toLowerCase().includes(lower),
        );
        if (filtered.length > 0) items = filtered;
      }

      const text = items
        .map((f) => `**${f.q}**\n${f.a}`)
        .join("\n\n");

      return { content: [{ type: "text" as const, text }] };
    },
  );

  /* ── Resource: llms-full.txt ─────────────────────────────────────── */
  server.resource(
    "llms-full",
    `${env.SITE_URL}/llms-full.txt`,
    async () => {
      const res = await fetch(`${env.SITE_URL}/llms-full.txt`);
      return {
        contents: [
          {
            uri: `${env.SITE_URL}/llms-full.txt`,
            text: await res.text(),
            mimeType: "text/plain",
          },
        ],
      };
    },
  );

  return server;
}

/* ── x402 config helper ────────────────────────────────────────────── */

function getX402Config(env: Env): X402Config {
  return {
    payTo: env.X402_PAY_TO ?? "photobrief.eth",
    network: env.X402_NETWORK ?? "base-sepolia",
    enabled: true,
  };
}

/* ── Worker entrypoint ─────────────────────────────────────────────── */

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          ok: true,
          name: "PhotoBrief MCP Server",
          version: "1.1.0",
          x402: { enabled: true, network: env.X402_NETWORK ?? "base-sepolia" },
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    // x402 payment requirements endpoint (standalone, outside MCP)
    if (url.pathname === "/x402/requirements") {
      const x402Config = getX402Config(env);
      const toolName = url.searchParams.get("tool") ?? "create_request";
      const requirement = getPaymentRequirement(toolName, x402Config);

      if (!requirement) {
        return new Response(
          JSON.stringify({ error: "Tool is free or does not exist", tool: toolName }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(JSON.stringify({ paymentRequirements: [requirement] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // x402 payment flow on direct REST endpoint
    if (url.pathname === "/x402/pay" && request.method === "POST") {
      const x402Config = getX402Config(env);
      const xPaymentHeader = request.headers.get("X-Payment");

      if (!xPaymentHeader) {
        const requirement = getPaymentRequirement("create_request", x402Config);
        if (requirement) {
          return build402Response(requirement);
        }
      }

      // Has payment header — validate and proxy
      if (xPaymentHeader) {
        const requirement = getPaymentRequirement("create_request", x402Config)!;
        const result = validatePayment(xPaymentHeader, requirement);

        if (!result.valid) {
          return new Response(
            JSON.stringify({ error: "payment_invalid", message: result.error }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        // Proxy to the Supabase edge function
        const body = await request.json();
        const res = await fetch(`${env.API_BASE_URL}/api-create-request`, {
          method: "POST",
          headers: {
            Authorization: "Bearer x402-payment-verified",
            "Content-Type": "application/json",
            "X-Payment-Method": "x402",
            "X-Payment-Payer": result.payer!,
            "X-Payment-Tx": result.transaction!,
          },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        return new Response(JSON.stringify(data), {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response("Bad request", { status: 400 });
    }

    // MCP endpoint at /mcp (Streamable HTTP)
    if (url.pathname === "/mcp" || url.pathname === "/mcp/") {
      const server = createServer(env);
      return createMcpHandler(server)(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};
