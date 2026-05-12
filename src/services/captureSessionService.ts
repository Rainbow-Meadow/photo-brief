/**
 * captureSessionService — Step 3 client helper for the per-recipient
 * Durable Object autosave buffer (`CaptureSession` in capture-agent).
 *
 * Opt-in: callers gate on a feature flag (e.g. `capture_agent_do`) before
 * using this. On any failure, callers must fall back to the standard
 * `submissionsService` autosave path so capture never breaks.
 *
 * Final submit still goes through the standard edge function so RLS,
 * triggers, and credit logging fire exactly once. Call `clearDraft`
 * after a successful submit to free the DO buffer immediately.
 */

const BASE_URL = "https://capture-agent.photobrief.ai";
const TIMEOUT_MS = 4000;

export type CaptureDraft = Record<string, unknown>;

export interface CaptureDraftSnapshot {
  ok: boolean;
  draft: CaptureDraft | null;
  updated_at: string | null;
}

async function safeFetch(input: RequestInfo, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(input, {
      ...init,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return null;
  }
}

export async function loadDraft(token: string): Promise<CaptureDraftSnapshot | null> {
  const res = await safeFetch(`${BASE_URL}/capture/${token}/state`);
  if (!res || !res.ok) return null;
  return (await res.json().catch(() => null)) as CaptureDraftSnapshot | null;
}

export async function patchDraft(
  token: string,
  patch: CaptureDraft,
): Promise<CaptureDraftSnapshot | null> {
  const res = await safeFetch(`${BASE_URL}/capture/${token}/state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res || !res.ok) return null;
  return (await res.json().catch(() => null)) as CaptureDraftSnapshot | null;
}

export async function clearDraft(token: string): Promise<void> {
  await safeFetch(`${BASE_URL}/capture/${token}/clear`, { method: "POST" });
}

export async function markSubmitted(token: string): Promise<void> {
  await safeFetch(`${BASE_URL}/capture/${token}/submit`, { method: "POST" });
}
