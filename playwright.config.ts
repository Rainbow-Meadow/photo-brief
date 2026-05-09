import { defineConfig, devices } from "@playwright/test";

/**
 * Visual regression suite for PhotoBrief.
 *
 * Targets the published preview at PHOTOBRIEF_BASE_URL (defaults to the public
 * published lovable.app URL). Auth uses the permanent per-tier seed users
 * documented in mem://seed-users — see tests/visual/auth.setup.ts.
 *
 * Run locally:
 *   bun run test:visual                 # run all visual tests against published URL
 *   bun run test:visual:update          # update baseline snapshots
 *   bun run test:visual -- --project="public-mobile"
 *
 * Snapshots are stored alongside specs in tests/visual/__screenshots__/.
 */
const BASE_URL = process.env.PHOTOBRIEF_BASE_URL ?? "https://photo-brief.lovable.app";

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

export default defineConfig({
  testDir: "./tests/visual",
  outputDir: "./tests/visual/.results",
  snapshotDir: "./tests/visual/__screenshots__",
  snapshotPathTemplate: "{snapshotDir}/{testFilePath}/{arg}-{projectName}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never", outputFolder: "tests/visual/.report" }]]
    : [["list"], ["html", { open: "never", outputFolder: "tests/visual/.report" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Disable animations + caret blinking globally for stable diffs.
    launchOptions: { args: ["--font-render-hinting=none"] },
  },
  expect: {
    // Allow ~0.2% pixel drift (sub-pixel font rendering, image loading jitter).
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  projects: [
    // ---- Public (no auth) ------------------------------------------------
    {
      name: "public-mobile",
      testMatch: /public\.spec\.ts/,
      use: { ...devices["Pixel 7"], viewport: MOBILE },
    },
    {
      name: "public-desktop",
      testMatch: /public\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: DESKTOP },
    },

    // ---- Auth setup (logs each seed tier in once, persists storageState) -
    {
      name: "auth-setup",
      testMatch: /auth\.setup\.ts/,
      use: { viewport: DESKTOP },
    },

    // ---- Authed dashboard (uses business-tier — broadest plan gates) -----
    {
      name: "authed-mobile",
      testMatch: /authed\.spec\.ts/,
      dependencies: ["auth-setup"],
      use: {
        ...devices["Pixel 7"],
        viewport: MOBILE,
        storageState: "tests/visual/.auth/business.json",
      },
    },
    {
      name: "authed-desktop",
      testMatch: /authed\.spec\.ts/,
      dependencies: ["auth-setup"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: DESKTOP,
        storageState: "tests/visual/.auth/business.json",
      },
    },

    // ---- Wizards (multi-step — captured on desktop only to keep matrix sane)
    {
      name: "wizards-desktop",
      testMatch: /wizards\.spec\.ts/,
      dependencies: ["auth-setup"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: DESKTOP,
        storageState: "tests/visual/.auth/business.json",
      },
    },
    {
      name: "wizards-mobile",
      testMatch: /wizards\.spec\.ts/,
      dependencies: ["auth-setup"],
      use: {
        ...devices["Pixel 7"],
        viewport: MOBILE,
        storageState: "tests/visual/.auth/business.json",
      },
    },
  ],
});
