/**
 * WordPress.com installer.
 *
 * Strategy: register a Custom CSS / Custom HTML widget via the WP REST API
 * that injects the same CTA-rewriter snippet used by the Shopify installer.
 * Self-hosted WordPress (wp-admin) is out of scope for the API path — those
 * users get the manual paste fallback or the future PhotoBrief plugin.
 *
 * Required credentials:
 *   - wpSite : full site URL (e.g. https://acme.com) OR numeric site ID
 *   - token  : OAuth access token from public-api.wordpress.com
 */

import { fail, ok, type Installer } from "./types.js";

export const installWordPress: Installer = async (ctx, creds) => {
  if (!creds.wpSite || !creds.token) {
    return fail("missing_credentials", "WordPress.com site URL and access token are required.");
  }
  const site = encodeURIComponent(creds.wpSite.replace(/^https?:\/\//, "").replace(/\/$/, ""));
  const base = `https://public-api.wordpress.com/wp/v2/sites/${site}`;
  const headers = {
    Authorization: `Bearer ${creds.token}`,
    "content-type": "application/json",
  };

  const snippet = `<script async src="https://photobrief.ai/embed/cta-rewriter.js?intake=${encodeURIComponent(ctx.intakeUrl)}&label=${encodeURIComponent(ctx.ctaLabel)}"></script>`;

  // 1. Find an existing PhotoBrief HTML widget (custom post type 'wp_block').
  const listRes = await fetch(`${base}/blocks?search=photobrief-cta`, { headers });
  if (listRes.ok) {
    const blocks = await listRes.json() as Array<{ id: number; content: { raw: string } }>;
    const match = Array.isArray(blocks) ? blocks.find((b) => b.content?.raw?.includes("photobrief.ai/embed/cta-rewriter.js")) : null;
    if (match) {
      const updateRes = await fetch(`${base}/blocks/${match.id}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ title: "photobrief-cta", content: snippet, status: "publish" }),
      });
      if (!updateRes.ok) return fail("wp_update_failed", `WordPress block update returned ${updateRes.status}.`);
      return ok("Updated existing PhotoBrief CTA snippet on WordPress.");
    }
  }

  // 2. Create a new reusable block + tell user to add it to the header.
  const createRes = await fetch(`${base}/blocks`, {
    method: "POST",
    headers,
    body: JSON.stringify({ title: "photobrief-cta", content: snippet, status: "publish" }),
  });
  if (!createRes.ok) return fail("wp_create_failed", `WordPress block create returned ${createRes.status}.`);
  return {
    ok: true,
    reason: "installed_partial",
    steps: [
      { kind: "verify_pass", message: "Created the PhotoBrief snippet block in WordPress." },
      { kind: "action_required", message: "Drop the 'photobrief-cta' reusable block into your header or footer once.", detail: "WordPress requires a one-time placement; after that updates apply automatically." },
    ],
    confirmUrl: `${creds.wpSite.replace(/\/$/, "")}/wp-admin/edit.php?post_type=wp_block`,
  };
};
