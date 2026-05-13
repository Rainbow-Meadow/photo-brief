/**
 * Installer module contract.
 *
 * Each platform installer receives the customer's credentials + the install
 * target (intake URL), performs the platform-specific work (rewrite a CTA
 * link, inject a snippet, register a Zap, …), and returns a step transcript
 * the agent appends to its public state.
 *
 * Installers MUST be idempotent: rerunning the same install with the same
 * inputs should not duplicate buttons, scripts, menu items, or Zaps. They
 * MUST NOT throw — return an `ok: false` outcome with a human-readable
 * `reason` instead so the agent can fall back to manual paste.
 */

export interface InstallContext {
  intakeUrl: string;          // e.g. https://photobrief.ai/i/<token>
  ctaLabel: string;           // e.g. "Get a quote"
  siteUrl: string | null;     // customer marketing site, when known
}

export interface InstallStepOut {
  kind: "info" | "action_required" | "verify_pass" | "verify_fail";
  message: string;
  detail?: string;
}

export interface InstallOutcome {
  ok: boolean;
  reason: string;
  steps: InstallStepOut[];
  /** Optional: URL the user can open to confirm the change in their CMS. */
  confirmUrl?: string;
}

export interface InstallerCredentials {
  /** Generic API token / personal access token */
  token?: string;
  /** Wix / Shopify shop / Webflow site identifier */
  siteId?: string;
  /** Shopify shop domain like acme.myshopify.com */
  shopDomain?: string;
  /** WordPress.com site URL or numeric ID */
  wpSite?: string;
  /** Wix account API key alternative */
  apiKey?: string;
}

export type Installer = (
  ctx: InstallContext,
  creds: InstallerCredentials,
) => Promise<InstallOutcome>;

export function ok(message: string, extra: Partial<InstallOutcome> = {}): InstallOutcome {
  return { ok: true, reason: "installed", steps: [{ kind: "verify_pass", message }], ...extra };
}

export function fail(reason: string, message: string, detail?: string): InstallOutcome {
  return { ok: false, reason, steps: [{ kind: "verify_fail", message, detail }] };
}
