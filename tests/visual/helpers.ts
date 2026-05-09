import { expect, type Page } from "@playwright/test";

/**
 * Wait for the page to settle visually:
 *  - all fonts loaded
 *  - all images decoded (or marked broken)
 *  - lazy/Suspense fallback spinners gone
 *  - no in-flight network for 500ms
 */
export async function waitForStable(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle").catch(() => {
    // Some pages keep long-lived sockets (realtime). Ignore — we still settle below.
  });

  await page.evaluate(async () => {
    // Fonts
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    // Images
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
      ),
    );
  });

  // Wait until the global Suspense fallback spinner unmounts.
  await page
    .locator(".animate-spin")
    .first()
    .waitFor({ state: "detached", timeout: 5_000 })
    .catch(() => {});

  // Final settle frame.
  await page.waitForTimeout(250);
}

/**
 * Mask volatile regions (relative time, live counters, avatars, charts) so they
 * don't blow up the diff. Pass extra selectors per-test.
 */
export const VOLATILE_SELECTORS = [
  '[data-testid="relative-time"]',
  "time",
  '[data-volatile="true"]',
  "canvas",
  "video",
  // Sonner toasts can pop in late
  "[data-sonner-toaster]",
];

export async function snapshot(page: Page, name: string, extraMask: string[] = []) {
  await waitForStable(page);
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: true,
    mask: [...VOLATILE_SELECTORS, ...extraMask].map((s) => page.locator(s)),
  });
}
