import { test } from "@playwright/test";
import { snapshot } from "./helpers";

/**
 * Multi-step wizards. We snapshot the initial render of each entry point and
 * — where a "Next" action is reachable without backend-dependent state — walk
 * forward step by step.
 */

test("wizard — create request, step setup", async ({ page }) => {
  await page.goto("/requests/new", { waitUntil: "domcontentloaded" });
  await snapshot(page, "request-wizard-01-setup");
});

test("wizard — website intake, initial", async ({ page }) => {
  await page.goto("/intake", { waitUntil: "domcontentloaded" });
  await snapshot(page, "website-intake-01-initial");
});

test("wizard — guide builder, initial", async ({ page }) => {
  await page.goto("/guides/new", { waitUntil: "domcontentloaded" });
  await snapshot(page, "guide-builder-01-initial");
});
