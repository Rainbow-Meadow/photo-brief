/**
 * siteInstallerAgentService — client for the Cloudflare Site Installer Agent
 * (workers/site-installer-agent). Phases 1–3.
 */

const AGENT_BASE_URL = "https://installer-agent.photobrief.ai";

export type InstallerPlatform =
  | "webflow" | "shopify" | "wix" | "wix_studio" | "squarespace"
  | "wordpress" | "carrd" | "godaddy" | "framer" | "static_html" | "unknown";

export type InstallerMode = "auto_api" | "auto_browser" | "manual_paste";

export type InstallerStatus =
  | "draft" | "detecting" | "awaiting_credentials" | "installing"
  | "installed_unverified" | "installed_verified" | "gave_up";

export interface InstallerStep {
  kind: "info" | "ask" | "action_required" | "verify_pass" | "verify_fail" | "complete";
  message: string;
  detail?: string;
  at: string;
}

export interface MonitorCheck {
  at: string;
  ok: boolean;
  reason: string;
}

export interface MonitoringState {
  enabled: boolean;
  cron: string;
  scheduleId: string | null;
  lastCheckAt: string | null;
  lastOk: boolean | null;
  history: MonitorCheck[];
}

export interface InstallerState {
  sessionId: string;
  workspaceId: string | null;
  intakeToken: string | null;
  ctaLabel: string;
  siteUrl: string | null;
  platform: InstallerPlatform;
  mode: InstallerMode;
  status: InstallerStatus;
  steps: InstallerStep[];
  installed: boolean;
  verified: boolean;
  hasCredentials: boolean;
  confirmUrl: string | null;
  monitoring: MonitoringState;
  updatedAt: string;
}

export interface InstallerCredentialsInput {
  token?: string;
  siteId?: string;
  shopDomain?: string;
  wpSite?: string;
  apiKey?: string;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${AGENT_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`installer_agent_${res.status}`);
  return res.json() as Promise<T>;
}

export const siteInstallerAgent = {
  start: (input: { workspaceId: string; intakeToken: string; siteUrl?: string; ctaLabel?: string; sessionId?: string }) =>
    call<InstallerState>("/sessions/start", { method: "POST", body: JSON.stringify(input) }),
  state: (sessionId: string) =>
    call<InstallerState>(`/sessions/${sessionId}/state`),
  detect: (sessionId: string, siteUrl: string) =>
    call<{ platform: InstallerPlatform; state: InstallerState }>(
      `/sessions/${sessionId}/detect`, { method: "POST", body: JSON.stringify({ siteUrl }) }),
  credentials: (sessionId: string, creds: InstallerCredentialsInput) =>
    call<InstallerState>(`/sessions/${sessionId}/credentials`, { method: "POST", body: JSON.stringify(creds) }),
  install: (sessionId: string) =>
    call<{ outcome: { ok: boolean; reason: string }; state: InstallerState }>(
      `/sessions/${sessionId}/install`, { method: "POST", body: "{}" }),
  markInstalled: (sessionId: string) =>
    call<InstallerState>(`/sessions/${sessionId}/mark-installed`, { method: "POST", body: "{}" }),
  verify: (sessionId: string) =>
    call<{ result: { ok: boolean; reason: string }; state: InstallerState }>(
      `/sessions/${sessionId}/verify`, { method: "POST", body: "{}" }),
  monitorNow: (sessionId: string) =>
    call<{ result: MonitorCheck; state: InstallerState }>(
      `/sessions/${sessionId}/monitor`, { method: "POST", body: "{}" }),
  monitorEnable: (sessionId: string, cron?: string) =>
    call<InstallerState>(`/sessions/${sessionId}/monitor/enable`, {
      method: "POST", body: JSON.stringify(cron ? { cron } : {}),
    }),
  monitorDisable: (sessionId: string) =>
    call<InstallerState>(`/sessions/${sessionId}/monitor/disable`, { method: "POST", body: "{}" }),
  giveUp: (sessionId: string) =>
    call<InstallerState>(`/sessions/${sessionId}/give-up`, { method: "POST", body: "{}" }),
};

export function credentialFieldsFor(platform: InstallerPlatform): Array<keyof InstallerCredentialsInput> {
  switch (platform) {
    case "webflow": return ["token", "siteId"];
    case "shopify": return ["shopDomain", "token"];
    case "wordpress": return ["wpSite", "token"];
    case "wix":
    case "wix_studio": return ["apiKey", "siteId"];
    case "carrd": return ["token"];
    default: return [];
  }
}
