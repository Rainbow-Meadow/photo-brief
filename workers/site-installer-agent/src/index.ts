/**
 * PhotoBrief Site Installer Agent — Phases 1–3
 *
 * Stateful Cloudflare Agent that installs Smart Intake on a customer's
 * marketing site and verifies the install on the live site.
 *
 *   Phase 1: platform detection + browser-rendering verification.
 *   Phase 2: API installers for Webflow, Shopify, WordPress.com, Wix, Zapier.
 *   Phase 3: browser-driven installer for Carrd (template for GoDaddy /
 *            Squarespace next).
 *
 * Credentials are captured per session, stored only in Durable Object
 * SQLite-backed state, and wiped from state once the install reaches a
 * terminal status (`installed_verified` or `gave_up`).
 */

import { Agent } from "agents";
import type { Installer, InstallerCredentials, InstallContext, InstallStepOut, InstallOutcome } from "./installers/types.js";
import { installWebflow } from "./installers/webflow.js";
import { installShopify } from "./installers/shopify.js";
import { installWordPress } from "./installers/wordpress.js";
import { installWix } from "./installers/wix.js";
import { installZapier } from "./installers/zapier.js";
import { installCarrd } from "./installers/carrd.js";
import {
  declareRole,
  emitAgentEvent,
  handleDispatch,
  type AgentEventQueue,
} from "../../_shared/agent-shim";
import { makeEvent } from "../../_shared/roles";

declareRole("install_engineer");

interface Env {
  SITE_INSTALLER_AGENT: DurableObjectNamespace;
  BROWSER: Fetcher;
  AI: { run: (model: string, input: unknown) => Promise<any> };
  SITE_URL: string;
  AGENT_EVENTS?: AgentEventQueue;
}

type Platform =
  | "webflow" | "shopify" | "wix" | "wix_studio" | "squarespace"
  | "wordpress" | "carrd" | "godaddy" | "framer" | "static_html" | "unknown";

type InstallMode = "auto_api" | "auto_browser" | "manual_paste";

type StepKind = "info" | "ask" | "action_required" | "verify_pass" | "verify_fail" | "complete";

interface InstallStep {
  kind: StepKind;
  message: string;
  detail?: string;
  at: string;
}

type InstallStatus =
  | "draft"
  | "detecting"
  | "awaiting_credentials"
  | "installing"
  | "installed_unverified"
  | "installed_verified"
  | "gave_up";

interface MonitorCheck {
  at: string;
  ok: boolean;
  reason: string;
}

interface MonitoringState {
  enabled: boolean;
  /** Cron expression used for the recurring re-verify. */
  cron: string;
  /** ID returned by `this.schedule()`, used for cancellation. */
  scheduleId: string | null;
  lastCheckAt: string | null;
  lastOk: boolean | null;
  /** Most recent N checks (newest first). Capped to 20. */
  history: MonitorCheck[];
}

interface AgentState {
  sessionId: string;
  workspaceId: string | null;
  intakeToken: string | null;
  ctaLabel: string;
  siteUrl: string | null;
  platform: Platform;
  mode: InstallMode;
  status: InstallStatus;
  steps: InstallStep[];
  installed: boolean;
  verified: boolean;
  /** Wiped on terminal status. Never logged. */
  credentials: InstallerCredentials | null;
  /** Confirmation URL the user can open to inspect the change in their CMS. */
  confirmUrl: string | null;
  monitoring: MonitoringState;
  updatedAt: string;
}

/** Phase 4: re-verify each install once a day at a session-stable minute. */
const DEFAULT_MONITOR_CRON = "17 9 * * *";

const PLATFORM_FINGERPRINTS: Array<{ platform: Platform; needles: string[] }> = [
  { platform: "webflow", needles: ["webflow.com", "data-wf-page", "wf-domain"] },
  { platform: "shopify", needles: ["cdn.shopify.com", "shopify.theme", "shopify-section"] },
  { platform: "wix_studio", needles: ["wixstudio", "static.wixstatic.com"] },
  { platform: "wix", needles: ["wix.com", "wixstatic.com", "_wixCIDX"] },
  { platform: "squarespace", needles: ["squarespace.com", "static1.squarespace.com"] },
  { platform: "wordpress", needles: ["wp-content", "wp-includes", "wp-json"] },
  { platform: "carrd", needles: ["carrd.co", "/carrd/"] },
  { platform: "godaddy", needles: ["godaddy", "img1.wsimg.com"] },
  { platform: "framer", needles: ["framer.com", "framerusercontent.com"] },
];

export class SiteInstallerAgent extends Agent<Env, AgentState> {
  initialState: AgentState = {
    sessionId: "",
    workspaceId: null,
    intakeToken: null,
    ctaLabel: "Get a quote",
    siteUrl: null,
    platform: "unknown",
    mode: "manual_paste",
    status: "draft",
    steps: [],
    installed: false,
    verified: false,
    credentials: null,
    confirmUrl: null,
    monitoring: {
      enabled: false,
      cron: DEFAULT_MONITOR_CRON,
      scheduleId: null,
      lastCheckAt: null,
      lastOk: null,
      history: [],
    },
    updatedAt: new Date().toISOString(),
  };

  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(request) });
    const originError = rejectUntrustedOrigin(request);
    if (originError) return originError;

    const url = new URL(request.url);
    try {
      if (request.method === "GET" && url.pathname === "/state") return json(this.publicState(), 200, request);

      if (request.method === "POST" && url.pathname === "/start") return this.handleStart(request);
      if (request.method === "POST" && url.pathname === "/detect") return this.handleDetect(request);
      if (request.method === "POST" && url.pathname === "/credentials") return this.handleCredentials(request);
      if (request.method === "POST" && url.pathname === "/install") return this.handleInstall(request);
      if (request.method === "POST" && url.pathname === "/mark-installed") return this.handleMarkInstalled(request);
      if (request.method === "POST" && url.pathname === "/verify") return this.handleVerify(request);
      if (request.method === "POST" && url.pathname === "/give-up") return this.handleGiveUp(request);
      if (request.method === "POST" && url.pathname === "/monitor") return this.handleMonitorNow(request);
      if (request.method === "POST" && url.pathname === "/monitor/enable") return this.handleMonitorEnable(request);
      if (request.method === "POST" && url.pathname === "/monitor/disable") return this.handleMonitorDisable(request);

      return json({ error: "Use /start, /state, /detect, /credentials, /install, /mark-installed, /verify, /monitor, /monitor/enable, /monitor/disable, /give-up." }, 404, request);
    } catch (error) {
      console.error("site installer agent error", error);
      return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500, request);
    }
  }

  // ---- handlers ------------------------------------------------------------

  private async handleStart(request: Request) {
    const body = await readJson(request);
    const sessionId = clean(body.sessionId) || this.state.sessionId || crypto.randomUUID();
    const workspaceId = clean(body.workspaceId);
    const intakeToken = clean(body.intakeToken);
    const siteUrl = normalizeUrl(clean(body.siteUrl));
    const ctaLabel = clean(body.ctaLabel) || "Get a quote";
    if (!workspaceId || !intakeToken) return json({ error: "workspaceId and intakeToken are required." }, 400, request);

    this.setState({
      ...this.state,
      sessionId,
      workspaceId,
      intakeToken,
      ctaLabel,
      siteUrl,
      platform: "unknown",
      mode: "manual_paste",
      status: siteUrl ? "detecting" : "draft",
      steps: [step("info", "Install session started.")],
      installed: false,
      verified: false,
      credentials: null,
      confirmUrl: null,
      updatedAt: new Date().toISOString(),
    });

    if (siteUrl) await this.detectPlatform();
    return json(this.publicState(), 200, request);
  }

  private async handleDetect(request: Request) {
    const body = await readJson(request);
    const siteUrl = normalizeUrl(clean(body.siteUrl)) || this.state.siteUrl;
    if (!siteUrl) return json({ error: "siteUrl is required." }, 400, request);
    this.setState({ ...this.state, siteUrl, status: "detecting" });
    const platform = await this.detectPlatform();
    return json({ platform, state: this.publicState() }, 200, request);
  }

  private async handleCredentials(request: Request) {
    const body = await readJson(request);
    const merged: InstallerCredentials = {
      ...(this.state.credentials ?? {}),
      ...(typeof body.token === "string" ? { token: body.token.trim() } : {}),
      ...(typeof body.siteId === "string" ? { siteId: body.siteId.trim() } : {}),
      ...(typeof body.shopDomain === "string" ? { shopDomain: body.shopDomain.trim() } : {}),
      ...(typeof body.wpSite === "string" ? { wpSite: body.wpSite.trim() } : {}),
      ...(typeof body.apiKey === "string" ? { apiKey: body.apiKey.trim() } : {}),
    };
    this.setState({
      ...this.state,
      credentials: merged,
      status: this.state.status === "draft" || this.state.status === "detecting" ? "awaiting_credentials" : this.state.status,
      steps: [...this.state.steps, step("info", "Credentials received (kept transiently in this session).")],
      updatedAt: new Date().toISOString(),
    });
    return json(this.publicState(), 200, request);
  }

  private async handleInstall(request: Request) {
    const installer = this.installerFor(this.state.platform);
    if (!installer) {
      this.appendStep(step("action_required", "This platform doesn't support auto-install yet — paste the link manually and run Verify."));
      this.setState({ ...this.state, status: "awaiting_credentials" });
      return json(this.publicState(), 200, request);
    }
    if (!this.state.intakeToken) return json({ error: "intakeToken missing on session." }, 400, request);

    this.setState({ ...this.state, status: "installing", updatedAt: new Date().toISOString() });

    const ctx: InstallContext = {
      intakeUrl: `${this.env.SITE_URL}/i/${this.state.intakeToken}`,
      ctaLabel: this.state.ctaLabel,
      siteUrl: this.state.siteUrl,
    };
    const outcome = await installer(ctx, this.state.credentials ?? {});
    this.appendOutcome(outcome);

    if (outcome.ok) {
      this.setState({
        ...this.state,
        installed: true,
        confirmUrl: outcome.confirmUrl ?? this.state.confirmUrl,
        status: "installed_unverified",
        updatedAt: new Date().toISOString(),
      });
      // Best-effort verify right away.
      await this.verifyInstall();
    } else {
      this.setState({ ...this.state, status: "awaiting_credentials", updatedAt: new Date().toISOString() });
    }
    return json({ outcome, state: this.publicState() }, 200, request);
  }

  private async handleMarkInstalled(_request: Request) {
    this.appendStep(step("action_required", "User reports manual install complete."));
    this.setState({ ...this.state, installed: true, status: "installed_unverified", updatedAt: new Date().toISOString() });
    return json(this.publicState(), 200, _request);
  }

  private async handleVerify(request: Request) {
    if (!this.state.siteUrl || !this.state.intakeToken) {
      return json({ error: "siteUrl and intakeToken must be set before verifying." }, 400, request);
    }
    const result = await this.verifyInstall();
    return json({ result, state: this.publicState() }, 200, request);
  }

  private async handleGiveUp(_request: Request) {
    await this.cancelMonitoring();
    this.setState({
      ...this.state,
      status: "gave_up",
      credentials: null,
      monitoring: { ...this.state.monitoring, enabled: false, scheduleId: null },
      steps: [...this.state.steps, step("info", "Session closed. Credentials wiped. Monitoring stopped.")],
      updatedAt: new Date().toISOString(),
    });
    return json(this.publicState(), 200, _request);
  }

  // ---- Phase 4: monitoring ------------------------------------------------

  private async handleMonitorNow(request: Request) {
    if (!this.state.siteUrl || !this.state.intakeToken) {
      return json({ error: "siteUrl and intakeToken must be set before monitoring." }, 400, request);
    }
    const result = await this.runMonitorCheck("manual");
    return json({ result, state: this.publicState() }, 200, request);
  }

  private async handleMonitorEnable(request: Request) {
    const body = await readJson(request);
    const cron = clean(body.cron) || this.state.monitoring.cron || DEFAULT_MONITOR_CRON;
    await this.enableMonitoring(cron);
    return json(this.publicState(), 200, request);
  }

  private async handleMonitorDisable(request: Request) {
    await this.cancelMonitoring();
    this.setState({
      ...this.state,
      monitoring: { ...this.state.monitoring, enabled: false, scheduleId: null },
      steps: [...this.state.steps, step("info", "Monitoring disabled.")],
      updatedAt: new Date().toISOString(),
    });
    return json(this.publicState(), 200, request);
  }

  private async enableMonitoring(cron: string) {
    await this.cancelMonitoring();
    let scheduleId: string | null = null;
    try {
      // Agents SDK: schedule a recurring task by cron, dispatched to `monitorTick`.
      const handle = await (this as any).schedule(cron, "monitorTick", {});
      scheduleId = handle?.id ?? handle ?? null;
    } catch (e) {
      this.appendStep(step("verify_fail", "Could not schedule monitoring.", asString(e)));
    }
    this.setState({
      ...this.state,
      monitoring: {
        ...this.state.monitoring,
        enabled: true,
        cron,
        scheduleId,
      },
      steps: [...this.state.steps, step("info", `Monitoring enabled (${cron}).`)],
      updatedAt: new Date().toISOString(),
    });
  }

  private async cancelMonitoring() {
    const id = this.state.monitoring.scheduleId;
    if (!id) return;
    try { await (this as any).cancelSchedule?.(id); } catch { /* ignore */ }
  }

  /**
   * Scheduled callback invoked by the Agents runtime on the configured cron.
   * Must be public so the SDK can dispatch to it by name.
   */
  async monitorTick() {
    if (!this.state.monitoring.enabled) return;
    if (!this.state.siteUrl || !this.state.intakeToken) return;
    await this.runMonitorCheck("scheduled");
  }

  private async runMonitorCheck(trigger: "manual" | "scheduled"): Promise<MonitorCheck> {
    const result = await this.verifyInstall();
    const check: MonitorCheck = {
      at: new Date().toISOString(),
      ok: result.ok,
      reason: result.reason,
    };
    const history = [check, ...this.state.monitoring.history].slice(0, 20);
    this.setState({
      ...this.state,
      monitoring: {
        ...this.state.monitoring,
        lastCheckAt: check.at,
        lastOk: check.ok,
        history,
      },
      steps: [
        ...this.state.steps,
        step(check.ok ? "verify_pass" : "verify_fail", `Monitor (${trigger}): ${check.ok ? "intake link still live." : "intake link missing."}`, check.reason),
      ],
      updatedAt: new Date().toISOString(),
    });
    return check;
  }

  // ---- core ---------------------------------------------------------------

  private installerFor(platform: Platform): Installer | null {
    switch (platform) {
      case "webflow": return installWebflow;
      case "shopify": return installShopify;
      case "wordpress": return installWordPress;
      case "wix":
      case "wix_studio": return installWix;
      case "carrd": return installCarrd({ BROWSER: this.env.BROWSER });
      case "static_html":
      case "godaddy":
      case "squarespace":
      case "framer":
      case "unknown":
        return null;
      default:
        return installZapier; // never hit; here to keep TS exhaustive
    }
  }

  private async detectPlatform(): Promise<Platform> {
    const siteUrl = this.state.siteUrl;
    if (!siteUrl) return "unknown";
    let html = "";
    try {
      const res = await fetch(siteUrl, {
        headers: { "user-agent": "Mozilla/5.0 PhotoBriefInstaller/1.0" },
        cf: { cacheTtl: 60 },
      });
      html = (await res.text()).slice(0, 200_000);
    } catch (e) {
      this.appendStep(step("verify_fail", `Could not fetch ${siteUrl}.`, asString(e)));
      return "unknown";
    }
    const lower = html.toLowerCase();
    let platform: Platform = "unknown";
    for (const fp of PLATFORM_FINGERPRINTS) {
      if (fp.needles.some((n) => lower.includes(n.toLowerCase()))) { platform = fp.platform; break; }
    }
    if (platform === "unknown" && /<html/.test(lower)) platform = "static_html";

    const mode = chooseMode(platform);
    this.setState({
      ...this.state,
      platform,
      mode,
      status: this.installerFor(platform) ? "awaiting_credentials" : "awaiting_credentials",
      steps: [...this.state.steps, step("info", `Detected platform: ${platform}.`, `Mode: ${mode}.`)],
      updatedAt: new Date().toISOString(),
    });
    return platform;
  }

  private async verifyInstall(): Promise<{ ok: boolean; reason: string }> {
    const expectedHost = "photobrief.ai";
    const expectedPath = `/i/${this.state.intakeToken}`;
    const siteUrl = this.state.siteUrl!;
    let foundLinks: string[] = [];

    try {
      const res = await fetch(siteUrl, {
        headers: { "user-agent": "Mozilla/5.0 PhotoBriefInstaller/1.0" },
      });
      const html = await res.text();
      const matches = html.match(/https?:\/\/[^"'<> )]+\/i\/[A-Za-z0-9_-]+/g) ?? [];
      foundLinks = matches.filter((m) => m.includes(expectedHost) && m.includes(expectedPath));
    } catch { /* fall through to browser rendering */ }

    if (foundLinks.length === 0) {
      try {
        const rendered = await renderPage(this.env, siteUrl);
        const matches = rendered.match(/https?:\/\/[^"'<> )]+\/i\/[A-Za-z0-9_-]+/g) ?? [];
        foundLinks = matches.filter((m) => m.includes(expectedHost) && m.includes(expectedPath));
      } catch (e) {
        this.appendStep(step("verify_fail", "Browser rendering failed.", asString(e)));
      }
    }

    if (foundLinks.length > 0) {
      this.appendStep(step("verify_pass", `Found ${foundLinks.length} link(s) to ${expectedPath}.`));
      this.setState({
        ...this.state,
        verified: true,
        installed: true,
        status: "installed_verified",
        credentials: null, // wipe credentials on success
        updatedAt: new Date().toISOString(),
      });
      // Phase 4: kick off recurring re-verification on first success.
      if (!this.state.monitoring.enabled) {
        await this.enableMonitoring(this.state.monitoring.cron || DEFAULT_MONITOR_CRON);
      }
      // Notify the Conductor so the Account Strategist can celebrate.
      if (this.state.workspaceId) {
        await emitAgentEvent(this.env as unknown as { AGENT_EVENTS?: AgentEventQueue }, makeEvent({
          type: "install_verified",
          workspaceId: this.state.workspaceId,
          from: "install_engineer",
          siteUrl,
          sessionId: this.state.sessionId,
        }));
      }
      return { ok: true, reason: foundLinks[0] };
    }

    this.appendStep(step(
      "verify_fail",
      "Could not find the PhotoBrief intake link on the live site.",
      `Looked for ${expectedHost}${expectedPath}. If you just published, give the CDN ~30s and try Verify again.`,
    ));
    this.setState({ ...this.state, verified: false, updatedAt: new Date().toISOString() });
    return { ok: false, reason: "intake_link_not_found" };
  }

  // ---- helpers ------------------------------------------------------------

  private appendStep(s: InstallStep) {
    this.setState({ ...this.state, steps: [...this.state.steps, s], updatedAt: new Date().toISOString() });
  }

  private appendOutcome(outcome: InstallOutcome) {
    const next: InstallStep[] = [
      ...this.state.steps,
      ...outcome.steps.map((o: InstallStepOut): InstallStep => ({ kind: o.kind, message: o.message, detail: o.detail, at: new Date().toISOString() })),
    ];
    this.setState({ ...this.state, steps: next, updatedAt: new Date().toISOString() });
  }

  private publicState() {
    // Never expose raw credentials over the wire.
    const { credentials, ...rest } = this.state;
    return { ...rest, hasCredentials: Boolean(credentials && Object.keys(credentials).length) };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(request) });
    const originError = rejectUntrustedOrigin(request);
    if (originError) return originError;

    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      return json({ ok: true, name: "PhotoBrief Site Installer Agent", version: "1.3.0" }, 200, request);
    }

    if (request.method === "POST" && url.pathname === "/sessions/start") {
      const body = await readJson(request);
      const clientSessionId = clean(body.sessionId);
      const sessionId = isSafeSessionId(clientSessionId) ? clientSessionId : crypto.randomUUID();
      const id = env.SITE_INSTALLER_AGENT.idFromName(sessionId);
      const stub = env.SITE_INSTALLER_AGENT.get(id);
      return stub.fetch(new Request(new URL("/start", url.origin), {
        method: "POST",
        headers: request.headers,
        body: JSON.stringify({ ...body, sessionId }),
      }));
    }

    const match = url.pathname.match(/^\/sessions\/([^/]+)\/(state|detect|credentials|install|mark-installed|verify|give-up|monitor|monitor\/enable|monitor\/disable)$/);
    if (!match) return json({ error: "Unknown route." }, 404, request);

    const [, rawSessionId, action] = match;
    const sessionId = decodeURIComponent(rawSessionId);
    if (!isSafeSessionId(sessionId)) return json({ error: "Invalid session id." }, 400, request);
    const id = env.SITE_INSTALLER_AGENT.idFromName(sessionId);
    const stub = env.SITE_INSTALLER_AGENT.get(id);
    const method = action === "state" ? "GET" : "POST";
    return stub.fetch(new Request(new URL(`/${action}`, url.origin), {
      method,
      headers: request.headers,
      body: method === "GET" ? undefined : request.body,
    }));
  },
};

function chooseMode(p: Platform): InstallMode {
  switch (p) {
    case "webflow":
    case "shopify":
    case "wordpress":
    case "wix":
    case "wix_studio":
      return "auto_api";
    case "squarespace":
    case "carrd":
    case "godaddy":
    case "framer":
      return "auto_browser";
    default:
      return "manual_paste";
  }
}

async function renderPage(env: Env, url: string): Promise<string> {
  const res = await env.BROWSER.fetch("https://browser-rendering.cf/content", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url, gotoOptions: { waitUntil: "networkidle0", timeout: 20_000 } }),
  });
  if (!res.ok) throw new Error(`browser_rendering_${res.status}`);
  return res.text();
}

function step(kind: StepKind, message: string, detail?: string): InstallStep {
  return { kind, message, detail, at: new Date().toISOString() };
}

function normalizeUrl(value: string | undefined): string | null {
  if (!value) return null;
  try { return new URL(value.startsWith("http") ? value : `https://${value}`).toString(); } catch { return null; }
}
function isSafeSessionId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{16,96}$/.test(value);
}
async function readJson(request: Request): Promise<Record<string, any>> {
  return request.body ? request.json().catch(() => ({})) : {};
}
function clean(value: unknown, max = 500) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}
function asString(e: unknown) { return e instanceof Error ? e.message : String(e); }

const ALLOWED_ORIGINS = new Set([
  "https://photobrief.ai",
  "https://www.photobrief.ai",
  "https://photo-brief.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
]);

function corsHeaders(request: Request) {
  const origin = request.headers.get("Origin");
  let allowed = "https://photobrief.ai";
  if (origin) {
    try {
      const host = new URL(origin).hostname;
      if (ALLOWED_ORIGINS.has(origin) || /\.lovable\.app$/.test(host)) allowed = origin;
    } catch { /* ignore */ }
  }
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };
}

function rejectUntrustedOrigin(request: Request) {
  if (request.method === "GET" || request.method === "HEAD") return null;
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  try {
    const host = new URL(origin).hostname;
    if (ALLOWED_ORIGINS.has(origin) || /\.lovable\.app$/.test(host)) return null;
  } catch { /* fall through */ }
  return json({ error: "origin_not_allowed" }, 403, request);
}

function json(body: unknown, status = 200, request?: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...(request ? corsHeaders(request) : {}), "Content-Type": "application/json" },
  });
}
