import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/**
 * Recover from stale chunk hashes after a deploy.
 *
 * When the prerendered HTML / cached main bundle references a route chunk
 * whose hashed filename no longer exists on the CDN, dynamic `import()` calls
 * throw "Importing a module script failed" / Vite emits `vite:preloadError`.
 * We force a single hard reload (guarded by sessionStorage so we never loop)
 * to fetch the fresh HTML and the new chunk hashes.
 */
const RELOAD_GUARD_KEY = "pb:chunk-reload-attempted";

function handleStaleChunk(reason: unknown) {
  try {
    if (sessionStorage.getItem(RELOAD_GUARD_KEY)) return;
    sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable (private mode etc.) — best-effort reload.
  }
  // eslint-disable-next-line no-console
  console.warn("[main] Stale chunk detected, reloading once:", reason);
  window.location.reload();
}

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  handleStaleChunk((event as Event & { payload?: unknown }).payload ?? event);
});

window.addEventListener("error", (event) => {
  const msg = String(event.message ?? "");
  if (
    msg.includes("Importing a module script failed") ||
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("error loading dynamically imported module")
  ) {
    handleStaleChunk(event.error ?? msg);
  }
});

window.addEventListener("unhandledrejection", (event) => {
  const msg = String((event.reason as { message?: string } | null)?.message ?? event.reason ?? "");
  if (
    msg.includes("Importing a module script failed") ||
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("error loading dynamically imported module")
  ) {
    handleStaleChunk(event.reason);
  }
});

// Clear the guard once the app has successfully mounted so a future stale
// chunk after the next deploy can also self-heal.
try {
  if (sessionStorage.getItem(RELOAD_GUARD_KEY)) {
    setTimeout(() => sessionStorage.removeItem(RELOAD_GUARD_KEY), 5000);
  }
} catch {
  /* noop */
}

createRoot(document.getElementById("root")!).render(<App />);
