/**
 * Shopify installer.
 *
 * Strategy: install a `script_tag` that injects a small client-side snippet.
 * The snippet finds any anchor or button whose visible text matches the
 * configured CTA label and rewrites its `href` (or surrounding link) to the
 * PhotoBrief intake URL. This works on every theme, every page, and survives
 * theme updates without editing Liquid.
 *
 * Required credentials:
 *   - shopDomain : e.g. acme.myshopify.com
 *   - token      : Admin API access token (custom app), scope `write_script_tags`
 *
 * Idempotence: lists existing script_tags and reuses the same `src` if it
 * already exists.
 */

import { fail, ok, type Installer } from "./types.js";

export const installShopify: Installer = async (ctx, creds) => {
  if (!creds.shopDomain || !creds.token) {
    return fail("missing_credentials", "Shopify shop domain and Admin API token are required.");
  }
  const base = `https://${creds.shopDomain}/admin/api/2024-10`;
  const headers = {
    "X-Shopify-Access-Token": creds.token,
    "content-type": "application/json",
  };

  // Hosted snippet served from the marketing site; encodes intake URL +
  // label as query params.
  const snippetSrc = `https://photobrief.ai/embed/cta-rewriter.js?intake=${encodeURIComponent(ctx.intakeUrl)}&label=${encodeURIComponent(ctx.ctaLabel)}`;

  // 1. List existing script tags
  const listRes = await fetch(`${base}/script_tags.json`, { headers });
  if (!listRes.ok) return fail("shopify_list_failed", `Shopify script_tags list returned ${listRes.status}.`);
  const list = await listRes.json() as { script_tags?: Array<{ id: number; src: string }> };
  const existing = (list.script_tags ?? []).find((s) => s.src.startsWith("https://photobrief.ai/embed/cta-rewriter.js"));

  if (existing && existing.src === snippetSrc) {
    return ok("Shopify script tag already installed and current.", { confirmUrl: `https://${creds.shopDomain}/admin/settings/apps` });
  }

  // 2. Remove stale tag (different intake/label) before reinstalling
  if (existing) {
    await fetch(`${base}/script_tags/${existing.id}.json`, { method: "DELETE", headers });
  }

  // 3. Create new tag
  const createRes = await fetch(`${base}/script_tags.json`, {
    method: "POST",
    headers,
    body: JSON.stringify({ script_tag: { event: "onload", src: snippetSrc, display_scope: "online_store" } }),
  });
  if (!createRes.ok) return fail("shopify_create_failed", `Shopify script_tag create returned ${createRes.status}.`);
  return ok("Installed Shopify script tag — CTA rewrites on next page load.", {
    confirmUrl: `https://${creds.shopDomain}/admin/settings/apps`,
  });
};
