/**
 * PhotoBrief Site Installer Agent — Phase 1
 *
 * Stateful Cloudflare Agent that helps a customer install Smart Intake on
 * their website. Phase 1 ships:
 *   - Platform detection (HTML sniff + Workers AI fallback)
 *   - Step-by-step install transcript per workspace install attempt
 *   - Browser-Rendering verification: load the live site, confirm the
 *     primary CTA points at https://photobrief.ai/i/:token
 *
 * Phase 2 will add per-platform API installers (Webflow, Shopify, WP, Wix,
 * Zapier). Phase 3 adds Puppeteer-driven flows for Carrd / GoDaddy /
 * Squarespace. The state machine is stable across phases — only new
 * `kind` values are added to InstallStep.
 */

import { Agent } from "agents";

interface Env {
  SITE_INSTALLER_AGENT: DurableObjectNamespace;
  BROWSER: Fetcher; // Cloudflare Browser Rendering binding
  AI: { run: (model: string, input: unknown) => Promise<any> };
  SITE_URL: string;
}

type Platform =
  | "webflow"
  | "shopify"
  | "wix"
  | "wix_studio"
  | "squarespace"
  | "wordpress"
  | "carrd"
  | "godaddy"
  | "framer"
  | "static_html"
  | "unknown";

type InstallMode = "auto_api" | "auto_browser" | "manual_paste";

type StepKind =
  | "info"
  | "ask"
  | "action_required"
  | "verify_pass"
  | "verify_fail"
  | "complete";

interface InstallStep {
  kind: StepKind;
  message: string;
  detail?: string;
  at: string;
}

interface AgentState {
  sessionId: string;
  workspaceId: string | null;
  intakeToken: string | null;
  siteUrl: string | null;
  platform: Platform;
  mode: InstallMode;
  steps: InstallStep[];
  installed: boolean;
  verified: boolean;
  updatedAt: string;
}

const PLATFORM_FINGERPRINTS: Array<{ platform: Platform; needles: string[] }> = [
  { platform: "webflow", needles: ["webflow.com", "data-wf-page", "wf-domain"] },
  { platform: "shopify", needles: ["cdn.shopify.com", "shopify.theme", "shopify-section"] },
  { platform: "wix_studio", needles: ["wixstudio", "static.wixstatic.com"] },
  { platform: "wix", needles: ["wix.com", "wixstatic.com", "_wixCIDX"] },
  { platform: "squarespace", needles: ["squarespace.com", "static1.squarespace.com", "Static.SQUARESPACE"] },
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
    siteUrl: null,
    platform: "unknown",
    mode: "manual_paste",
    steps: [],
    installed: false,
    verified: false,
    updatedAt: new Date().toISOString(),
  };

  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(request) });
    const originError = rejectUntrustedOrigin(request);
    if (originError) return originError;

    const url = new URL(request.url);
    try {
      if (request.method === "GET" && url.pathname === "/state") return json(this.publicState(), 200, request);

      if (request.method === "POST" && url.pathname === "/start") {
        const body = await readJson(request);
        const sessionId = clean(body.sessionId) || this.state.sessionId || crypto.randomUUID();
        const workspaceId = clean(body.workspaceId);
        const intakeToken = clean(body.intakeToken);
        const siteUrl = normalizeUrl(clean(body.siteUrl));
        if (!workspaceId || !intakeToken) return json({ error: "workspaceId and intakeToken are required." }, 400, request);

        this.setState({
          ...this.state,
          sessionId,
          workspaceId,
          intakeToken,
          siteUrl,
          platform: "unknown",
          mode: "manual_paste",
          steps: [step("info", "Install session started.")],
          installed: false,
          verified: false,
          updatedAt: new Date().toISOString(),
        });

        if (siteUrl) await this.detectPlatform();
        return json(this.publicState(), 200, request);
      }

      if (request.method === "POST" && url.pathname === "/detect") {
        const body = await readJson(request);
        const siteUrl = normalizeUrl(clean(body.siteUrl)) || this.state.siteUrl;
        if (!siteUrl) return json({ error: "siteUrl is required." }, 400, request);
        this.setState({ ...this.state, siteUrl });
        const platform = await this.detectPlatform();
        return json({ platform, state: this.publicState() }, 200, request);
      }

      if (request.method === "POST" && url.pathname === "/mark-installed") {
        // The user pasted the hosted link manually. Record it; verification
        // happens next.
        this.appendStep(step("action_required", "User reports manual install complete."));
        this.setState({ ...this.state, installed: true, updatedAt: new Date().toISOString() });
        return json(this.publicState(), 200, request);
      }

      if (request.method === "POST" && url.pathname === "/verify") {
        if (!this.state.siteUrl || !this.state.intakeToken) {
          return json({ error: "siteUrl and intakeToken must be set before verifying." }, 400, request);
        }
        const result = await this.verifyInstall();
        return json({ result, state: this.publicState() }, 200, request);
      }

      return json({ error: "Use /start, /state, /detect, /mark-installed, or /verify." }, 404, request);
    } catch (error) {
      console.error("site installer agent error", error);
      return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500, request);
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
      if (fp.needles.some((n) => lower.includes(n.toLowerCase()))) {
        platform = fp.platform;
        break;
      }
    }
    if (platform === "unknown" && /<html/.test(lower)) platform = "static_html";

    const mode = chooseMode(platform);
    this.setState({
      ...this.state,
      platform,
      mode,
      steps: [...this.state.steps, step("info", `Detected platform: ${platform}.`, `Suggested mode: ${mode}.`)],
      updatedAt: new Date().toISOString(),
    });
    return platform;
  }

  private async verifyInstall(): Promise<{ ok: boolean; reason: string }> {
    const expectedHost = "photobrief.ai";
    const expectedPath = `/i/${this.state.intakeToken}`;
    const siteUrl = this.state.siteUrl!;
    let foundLinks: string[] = [];

    // Strategy A: cheap HTML scan first.
    try {
      const res = await fetch(siteUrl, {
        headers: { "user-agent": "Mozilla/5.0 PhotoBriefInstaller/1.0" },
      });
      const html = await res.text();
      const matches = html.match(/https?:\/\/[^"'<> )]+\/i\/[A-Za-z0-9_-]+/g) ?? [];
      foundLinks = matches.filter((m) => m.includes(expectedHost) && m.includes(expectedPath));
    } catch {
      /* fall through to browser rendering */
    }

    // Strategy B: Browser Rendering for SPA / JS-rendered CTA.
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
      this.setState({ ...this.state, verified: true, installed: true, updatedAt: new Date().toISOString() });
      return { ok: true, reason: foundLinks[0] };
    }

    this.appendStep(step(
      "verify_fail",
      "Could not find the PhotoBrief intake link on the live site.",
      `Looked for ${expectedHost}${expectedPath}.`,
    ));
    this.setState({ ...this.state, verified: false, updatedAt: new Date().toISOString() });
    return { ok: false, reason: "intake_link_not_found" };
  }

  private appendStep(s: InstallStep) {
    this.setState({ ...this.state, steps: [...this.state.steps, s], updatedAt: new Date().toISOString() });
  }

  private publicState() {
    return { ...this.state };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(request) });
    const originError = rejectUntrustedOrigin(request);
    if (originError) return originError;

    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      return json({ ok: true, name: "PhotoBrief Site Installer Agent", version: "1.0.0" }, 200, request);
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

    const match = url.pathname.match(/^\/sessions\/([^/]+)\/(state|detect|mark-installed|verify)$/);
    if (!match) return json({ error: "Use /sessions/start or /sessions/:sessionId/state|detect|mark-installed|verify." }, 404, request);

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
    case "wix_studio":
      return "auto_api";
    case "wix":
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
  // Cloudflare Browser Rendering REST: /content endpoint returns the
  // fully-hydrated HTML of the rendered page.
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
  try {
    const u = new URL(value.startsWith("http") ? value : `https://${value}`);
    return u.toString();
  } catch {
    return null;
  }
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
  const allowed = origin && (ALLOWED_ORIGINS.has(origin) || /\.lovable\.app$/.test(new URL(origin).hostname))
    ? origin
    : "https://photobrief.ai";
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
