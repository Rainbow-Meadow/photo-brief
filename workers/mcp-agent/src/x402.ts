/**
 * x402 Agentic Payments middleware for PhotoBrief MCP server.
 *
 * Implements the x402 HTTP payment protocol:
 * - Tools that require auth return HTTP 402 with payment requirements
 * - Agents include an `X-Payment` header with a signed payment payload
 * - The server verifies the payment and processes the request
 *
 * Pricing:
 *   create_request → 1 credit = $0.10 USD per call
 *
 * Flow:
 * 1. Agent calls a paid MCP tool without auth → 402 + JSON payment requirements
 * 2. Agent's payment layer constructs an `X-Payment` header (JWT or signed payload)
 * 3. Agent retries the request → server verifies payment, processes tool call
 */

export interface PaymentRequirement {
  /** x402 version */
  x402Version: 1;
  /** Unique scheme identifier */
  scheme: "exact";
  /** Network for payment (e.g. "base-sepolia" for testnet, "base" for mainnet) */
  network: string;
  /** Amount in smallest unit (e.g. cents) */
  maxAmountRequired: string;
  /** Currency */
  currency: string;
  /** Resource being accessed */
  resource: string;
  /** Human-readable description */
  description: string;
  /** Payment receiver address or identifier */
  payTo: string;
  /** Required response fields */
  requiredFields: string[];
  /** Optional: expiry for the payment window */
  expiresAt?: string;
}

export interface X402Config {
  /** Payment receiver identifier */
  payTo: string;
  /** Network identifier */
  network: string;
  /** Whether x402 payments are enabled */
  enabled: boolean;
}

/** Tool-level pricing in USD cents */
const TOOL_PRICING: Record<string, { cents: number; description: string }> = {
  create_request: {
    cents: 10,
    description: "Create a guided photo request (1 PhotoBrief Credit)",
  },
};

/**
 * Check if a tool requires payment and return the 402 requirements if so.
 */
export function getPaymentRequirement(
  toolName: string,
  config: X402Config,
): PaymentRequirement | null {
  const pricing = TOOL_PRICING[toolName];
  if (!pricing) return null;

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  return {
    x402Version: 1,
    scheme: "exact",
    network: config.network,
    maxAmountRequired: pricing.cents.toString(),
    currency: "USD",
    resource: `mcp/tool/${toolName}`,
    description: pricing.description,
    payTo: config.payTo,
    requiredFields: ["transaction", "payer"],
    expiresAt,
  };
}

/**
 * Build the HTTP 402 response per the x402 spec.
 */
export function build402Response(requirement: PaymentRequirement): Response {
  return new Response(
    JSON.stringify({
      error: "payment_required",
      message: `This tool requires payment. Send an X-Payment header with a valid payment payload.`,
      paymentRequirements: [requirement],
    }),
    {
      status: 402,
      headers: {
        "Content-Type": "application/json",
        "X-Payment-Requirements": JSON.stringify([requirement]),
      },
    },
  );
}

/**
 * Validate an X-Payment header.
 *
 * In production this would verify a cryptographic signature or on-chain
 * transaction. For the initial rollout we accept a simple JSON payload
 * with { transaction: string, payer: string } and log it for reconciliation.
 */
export function validatePayment(
  xPaymentHeader: string,
  requirement: PaymentRequirement,
): { valid: boolean; payer?: string; transaction?: string; error?: string } {
  try {
    const payload = JSON.parse(atob(xPaymentHeader));

    if (!payload.transaction || !payload.payer) {
      return { valid: false, error: "Missing required fields: transaction, payer" };
    }

    // In production: verify on-chain transaction matches amount and payTo
    // For now, we log and accept any well-formed payload
    console.log(
      `[x402] Payment received: payer=${payload.payer} tx=${payload.transaction} ` +
      `amount=${requirement.maxAmountRequired} currency=${requirement.currency}`,
    );

    return {
      valid: true,
      payer: payload.payer,
      transaction: payload.transaction,
    };
  } catch {
    return { valid: false, error: "Invalid X-Payment header: expected base64-encoded JSON" };
  }
}
