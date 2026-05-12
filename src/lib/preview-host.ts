/**
 * Returns true when the current frontend is running on a Lovable preview /
 * automation host (or in `vite dev`). Used to:
 *   - Skip the Cloudflare Turnstile widget so headless browsers can sign in.
 *   - Reveal the dev-only "Use sample photo" affordance on /r/:token?e2e=1.
 *
 * Production hostnames (`photobrief.ai`, `www.photobrief.ai`,
 * `photo-brief.lovable.app`) intentionally return false.
 */
export function isAutomatedPreviewHost(): boolean {
  if (typeof window === "undefined") return false;

  // Vite dev / local
  try {
    if (import.meta.env?.DEV) return true;
  } catch {
    /* no-op */
  }

  const host = window.location.hostname;
  if (!host) return false;

  // Production marketing + app domains stay strict.
  const PROD_HOSTS = new Set([
    "photobrief.ai",
    "www.photobrief.ai",
    "photo-brief.lovable.app",
  ]);
  if (PROD_HOSTS.has(host)) return false;

  // Lovable preview origins
  if (host.endsWith(".lovableproject.com")) return true;
  if (host.endsWith(".lovable.app") && host.includes("preview")) return true;
  if (host.endsWith(".lovable.dev")) return true;

  return false;
}

/** True only when explicitly opted into automated E2E mode via `?e2e=1`. */
export function isE2EMode(): boolean {
  if (typeof window === "undefined") return false;
  if (!isAutomatedPreviewHost()) return false;
  try {
    return new URLSearchParams(window.location.search).get("e2e") === "1";
  } catch {
    return false;
  }
}
