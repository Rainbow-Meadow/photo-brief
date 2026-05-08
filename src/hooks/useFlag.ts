import { useEffect, useState } from "react";

/**
 * Edge-served feature flags from the Cloudflare router worker.
 *
 * Reads `/api/flags?ws=<workspaceId>` once per session (cached in
 * sessionStorage for 60s). The router fetches values from the
 * `ROUTER_CONFIG` KV namespace, so flags can be flipped live with
 * `wrangler kv key put` — no deploy, no Supabase round-trip.
 *
 * KV key shape:
 *   - flag:_index            → JSON array of all flag names (e.g. ["video_uploads","beta_assistant"])
 *   - flag:<name>            → "1" or "0" (global default)
 *   - flags:<workspace_id>   → JSON object of per-workspace overrides ({ video_uploads: true })
 *
 * Usage:
 *   const enabled = useFlag("video_uploads", workspaceId);
 *   if (enabled) <VideoUploadButton />
 */

type FlagsCache = { flags: Record<string, boolean>; expiresAt: number };

const CACHE_KEY = "pb_edge_flags";
const TTL_MS = 60_000;
const inflight = new Map<string, Promise<Record<string, boolean>>>();

function readCache(scope: string): Record<string, boolean> | null {
  try {
    const raw = sessionStorage.getItem(`${CACHE_KEY}:${scope}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FlagsCache;
    if (parsed.expiresAt < Date.now()) return null;
    return parsed.flags;
  } catch {
    return null;
  }
}

function writeCache(scope: string, flags: Record<string, boolean>): void {
  try {
    sessionStorage.setItem(
      `${CACHE_KEY}:${scope}`,
      JSON.stringify({ flags, expiresAt: Date.now() + TTL_MS } satisfies FlagsCache),
    );
  } catch {
    /* ignore quota errors */
  }
}

async function fetchFlags(workspaceId?: string): Promise<Record<string, boolean>> {
  const scope = workspaceId ?? "_global";
  const cached = readCache(scope);
  if (cached) return cached;
  if (inflight.has(scope)) return inflight.get(scope)!;
  const url = workspaceId
    ? `/api/flags?ws=${encodeURIComponent(workspaceId)}`
    : `/api/flags`;
  const promise = fetch(url, { credentials: "omit" })
    .then((r) => (r.ok ? r.json() : { flags: {} }))
    .then((data: { flags?: Record<string, boolean> }) => {
      const flags = data.flags ?? {};
      writeCache(scope, flags);
      return flags;
    })
    .catch(() => ({} as Record<string, boolean>))
    .finally(() => inflight.delete(scope));
  inflight.set(scope, promise);
  return promise;
}

export function useFlag(name: string, workspaceId?: string): boolean {
  const [enabled, setEnabled] = useState<boolean>(() => {
    const c = readCache(workspaceId ?? "_global");
    return c?.[name] ?? false;
  });
  useEffect(() => {
    let cancelled = false;
    fetchFlags(workspaceId).then((flags) => {
      if (!cancelled) setEnabled(!!flags[name]);
    });
    return () => {
      cancelled = true;
    };
  }, [name, workspaceId]);
  return enabled;
}

export function useFlags(workspaceId?: string): Record<string, boolean> {
  const [flags, setFlags] = useState<Record<string, boolean>>(
    () => readCache(workspaceId ?? "_global") ?? {},
  );
  useEffect(() => {
    let cancelled = false;
    fetchFlags(workspaceId).then((f) => {
      if (!cancelled) setFlags(f);
    });
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);
  return flags;
}
