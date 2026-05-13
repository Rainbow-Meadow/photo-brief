/**
 * siteInstallerAgentService — client for the Cloudflare Site Installer Agent
 * (workers/site-installer-agent). Phase 1: detect platform + verify install.
 */

const AGENT_BASE_URL = "https://installer-agent.photobrief.ai";

export type InstallerPlatform =
  | "webflow" | "shopify" | "wix" | "wix_studio" | "squarespace"
  | "wordpress" | "carrd" | "godaddy" | "framer" | "static_html" | "unknown";

export type InstallerMode = "auto_api" | "auto_browser" | "manual_paste";

export interface InstallerStep {
  kind: "info" | "ask" | "action_required" | "verify_pass" | "verify_fail" | "complete";
  message: string;
  detail?: string;
  at: string;
}

export interface InstallerState {
  sessionId: string;
  workspaceId: string | null;
  intakeToken: string | null;
  siteUrl: string | null;
  platform: InstallerPlatform;
  mode: InstallerMode;
  steps: InstallerStep[];
  installed: boolean;
  verified: boolean;
  updatedAt: string;
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
  start: (input: { workspaceId: string; intakeToken: string; siteUrl?: string; sessionId?: string }) =>
    call<InstallerState>("/sessions/start", { method: "POST", body: JSON.stringify(input) }),
  state: (sessionId: string) =>
    call<InstallerState>(`/sessions/${sessionId}/state`),
  detect: (sessionId: string, siteUrl: string) =>
    call<{ platform: InstallerPlatform; state: InstallerState }>(
      `/sessions/${sessionId}/detect`,
      { method: "POST", body: JSON.stringify({ siteUrl }) },
    ),
  markInstalled: (sessionId: string) =>
    call<InstallerState>(`/sessions/${sessionId}/mark-installed`, { method: "POST", body: "{}" }),
  verify: (sessionId: string) =>
    call<{ result: { ok: boolean; reason: string }; state: InstallerState }>(
      `/sessions/${sessionId}/verify`,
      { method: "POST", body: "{}" },
    ),
};
