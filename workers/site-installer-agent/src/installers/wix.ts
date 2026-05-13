/**
 * Wix installer.
 *
 * Wix only exposes a complete CTA-edit API on Wix Studio (via the Site
 * Components API). Classic Wix Editor sites must be edited in the Editor;
 * the closest API path is registering a Custom Element via the Wix Site
 * Plugin SDK, which still requires manual placement.
 *
 * For Phase 2 we install a Custom Code snippet via the Wix Custom Code API,
 * which works on both Editor and Studio for Premium plans. The snippet uses
 * the same hosted CTA rewriter as Shopify and WordPress.
 *
 * Required credentials:
 *   - apiKey  : Wix API key (account-level)
 *   - siteId  : Wix site identifier
 */

import { fail, ok, type Installer } from "./types.js";

export const installWix: Installer = async (ctx, creds) => {
  if (!creds.apiKey || !creds.siteId) {
    return fail("missing_credentials", "Wix API key and site ID are required.");
  }
  const headers = {
    Authorization: creds.apiKey,
    "wix-site-id": creds.siteId,
    "content-type": "application/json",
  };
  const snippetSrc = `https://photobrief.ai/embed/cta-rewriter.js?intake=${encodeURIComponent(ctx.intakeUrl)}&label=${encodeURIComponent(ctx.ctaLabel)}`;

  // Wix Custom Code REST API
  const base = "https://www.wixapis.com/site-properties/v4/properties/custom-code";
  const listRes = await fetch(base, { headers });
  let existingId: string | null = null;
  if (listRes.ok) {
    const data = await listRes.json() as { customCode?: Array<{ id: string; name: string }> };
    existingId = (data.customCode ?? []).find((c) => c.name === "PhotoBrief CTA")?.id ?? null;
  }

  const body = {
    customCode: {
      name: "PhotoBrief CTA",
      type: "BODY_END",
      sourceCode: `<script async src="${snippetSrc}"></script>`,
      properties: { loadOnAllPages: true },
    },
  };

  const upsertRes = await fetch(existingId ? `${base}/${existingId}` : base, {
    method: existingId ? "PATCH" : "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!upsertRes.ok) return fail("wix_upsert_failed", `Wix Custom Code upsert returned ${upsertRes.status}.`);
  return ok(existingId ? "Updated Wix Custom Code snippet." : "Installed Wix Custom Code snippet.", {
    confirmUrl: "https://manage.wix.com/dashboard",
  });
};
