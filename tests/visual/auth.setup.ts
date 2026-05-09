import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * Logs each seed tier in once and persists Supabase auth state (localStorage)
 * to tests/visual/.auth/<tier>.json. Authed specs reuse these via storageState.
 *
 * Credentials live in mem://seed-users. They are intentionally checked in here
 * because they only grant access to throwaway test workspaces.
 */
const SEEDS = [
  { tier: "business", email: "seed.business@photobrief.test", password: "Seed!Business2026" },
  // Add more tiers here if you want per-plan visual coverage.
] as const;

const AUTH_DIR = path.resolve("tests/visual/.auth");
fs.mkdirSync(AUTH_DIR, { recursive: true });

for (const seed of SEEDS) {
  setup(`authenticate ${seed.tier}`, async ({ page }) => {
    await page.goto("/auth");
    await page.getByLabel(/email/i).first().fill(seed.email);
    await page.getByLabel(/password/i).first().fill(seed.password);
    await page.getByRole("button", { name: /sign in|log in/i }).first().click();

    // Wait until the auth provider has redirected us into the app shell.
    await page.waitForURL(
      (url) => !url.pathname.startsWith("/auth") && !url.pathname.startsWith("/forgot-password"),
      { timeout: 30_000 },
    );

    // Make sure the session token actually landed in storage.
    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && k.startsWith("sb-") && k.endsWith("-auth-token")) return true;
            }
            return false;
          }),
        { timeout: 10_000 },
      )
      .toBe(true);

    await page.context().storageState({ path: path.join(AUTH_DIR, `${seed.tier}.json`) });
  });
}
