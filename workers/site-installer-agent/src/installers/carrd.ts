/**
 * Carrd installer (browser-driven, Phase 3).
 *
 * Carrd has no API. We drive their editor with @cloudflare/puppeteer:
 *   1. Open https://carrd.co/dashboard with the customer's session cookie
 *      (collected via a one-time login redirect, stored transiently in DO).
 *   2. Open the site editor.
 *   3. Find the primary CTA element by text match.
 *   4. Patch its link.
 *   5. Click "Publish".
 *
 * Required credentials:
 *   - token : opaque session bundle the agent collected during the login
 *             redirect; we set it as a cookie on the puppeteer context.
 *
 * If anything goes wrong (Carrd UI changed, login expired, no CTA found),
 * we fall back gracefully to manual paste.
 */

import puppeteer from "@cloudflare/puppeteer";
import { fail, type Installer } from "./types.js";

export interface CarrdEnv {
  BROWSER: Fetcher;
}

export function installCarrd(env: CarrdEnv): Installer {
  return async (ctx, creds) => {
    if (!creds.token) {
      return fail("missing_credentials", "Carrd login token is required (sign in via the Auto-install panel).");
    }
    if (!ctx.siteUrl) {
      return fail("missing_site_url", "Carrd installer needs the live site URL.");
    }

    let browser: any;
    try {
      browser = await puppeteer.launch(env.BROWSER as any);
      const page = await browser.newPage();

      // Apply session cookie. Carrd uses `carrd_session` on .carrd.co.
      await page.setCookie({ name: "carrd_session", value: creds.token, domain: ".carrd.co", path: "/" });

      await page.goto("https://carrd.co/dashboard", { waitUntil: "networkidle0", timeout: 20_000 });
      // Pick the site that matches the customer's domain.
      const siteHost = new URL(ctx.siteUrl).hostname;
      const link = await page.$(`a[href*="${siteHost}"]`) ?? await page.$("a.site-edit");
      if (!link) {
        await browser.close();
        return fail("dashboard_no_site", "Could not find the site in your Carrd dashboard.");
      }
      await link.click();
      await page.waitForSelector(".editor", { timeout: 20_000 }).catch(() => null);

      // Locate the CTA. Carrd elements are <a> with text content.
      const ctaHandle = await page.evaluateHandle((label: string) => {
        const els = Array.from(document.querySelectorAll<HTMLAnchorElement>("a, button"));
        return els.find((el) => (el.textContent || "").trim().toLowerCase().includes(label.toLowerCase())) ?? null;
      }, ctx.ctaLabel);
      const cta = ctaHandle.asElement();
      if (!cta) {
        await browser.close();
        return fail("no_cta_match", `No element matching "${ctx.ctaLabel}" found in the Carrd editor.`);
      }
      await cta.click();

      // Open the link inspector and rewrite the URL.
      const linkInput = await page.waitForSelector('input[name="url"], input[placeholder*="URL"]', { timeout: 10_000 });
      if (!linkInput) {
        await browser.close();
        return fail("no_link_field", "Could not find the link field in Carrd's inspector.");
      }
      await linkInput.click({ clickCount: 3 });
      await linkInput.type(ctx.intakeUrl);
      await page.keyboard.press("Tab");

      // Publish. Carrd has a "Publish" button in the top toolbar.
      const publish = await page.$('button[aria-label="Publish"], button.publish');
      if (publish) await publish.click();

      await page.waitForNetworkIdle({ timeout: 15_000 }).catch(() => null);
      await browser.close();

      return {
        ok: true,
        reason: "installed",
        steps: [
          { kind: "verify_pass", message: "Updated Carrd CTA and clicked Publish." },
          { kind: "info", message: "Carrd republishes within ~15 seconds. Run Verify to confirm." },
        ],
        confirmUrl: ctx.siteUrl,
      };
    } catch (e) {
      try { if (browser) await browser.close(); } catch { /* ignore */ }
      return fail("carrd_browser_error", "Browser-driven install failed.", e instanceof Error ? e.message : String(e));
    }
  };
}
