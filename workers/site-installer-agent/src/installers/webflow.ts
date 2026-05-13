/**
 * Webflow installer.
 *
 * Strategy: locate the customer's primary CTA button across their published
 * pages, patch its `href` to the PhotoBrief intake URL, and republish the
 * site. Uses the Webflow Data API v2 (https://developers.webflow.com).
 *
 * Required credentials:
 *   - token   : Site Access Token with `pages:write` and `sites:write` scopes
 *   - siteId  : Webflow site ID
 *
 * Idempotence: the installer first checks whether the CTA already points at
 * `/i/<token>`; if so it returns ok without rewriting.
 */

import { fail, ok, type Installer, type InstallStepOut } from "./types.js";

const API = "https://api.webflow.com/v2";

export const installWebflow: Installer = async (ctx, creds) => {
  if (!creds.token || !creds.siteId) {
    return fail("missing_credentials", "Webflow site token and site ID are required.");
  }
  const headers = {
    Authorization: `Bearer ${creds.token}`,
    "accept-version": "2.0.0",
    "content-type": "application/json",
  };
  const steps: InstallStepOut[] = [];

  // 1. List pages
  const pagesRes = await fetch(`${API}/sites/${creds.siteId}/pages`, { headers });
  if (!pagesRes.ok) return fail("webflow_pages_failed", `Webflow pages list returned ${pagesRes.status}.`);
  const pagesJson = await pagesRes.json() as { pages?: Array<{ id: string; title: string }> };
  const pages = pagesJson.pages ?? [];
  if (pages.length === 0) return fail("no_pages", "Webflow site has no pages to update.");
  steps.push({ kind: "info", message: `Found ${pages.length} Webflow page(s).` });

  // 2. Walk pages, find link blocks whose label matches the CTA (case-insensitive
  //    contains). The Pages API exposes DOM nodes via `/pages/:id/dom`.
  let patched = 0;
  let alreadyOk = 0;
  for (const page of pages) {
    const domRes = await fetch(`${API}/pages/${page.id}/dom`, { headers });
    if (!domRes.ok) continue;
    const dom = await domRes.json() as { nodes?: Array<DomNode> };
    const nodes = dom.nodes ?? [];
    const targets = nodes.filter((n) => isCtaNode(n, ctx.ctaLabel));
    if (targets.length === 0) continue;
    for (const node of targets) {
      const currentHref = node.attributes?.href ?? "";
      if (currentHref === ctx.intakeUrl) { alreadyOk += 1; continue; }
      const updateRes = await fetch(`${API}/pages/${page.id}/dom`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          nodes: [{ nodeId: node.id, attributes: { href: ctx.intakeUrl, target: "_blank", rel: "noopener" } }],
        }),
      });
      if (updateRes.ok) patched += 1;
    }
  }

  if (patched === 0 && alreadyOk === 0) {
    return fail(
      "no_cta_match",
      `No link or button matching "${ctx.ctaLabel}" was found on the Webflow site.`,
      "Edit the CTA text in PhotoBrief to match the button label on your site, or rename the button to match.",
    );
  }
  steps.push({ kind: "info", message: `Patched ${patched} CTA(s); ${alreadyOk} already correct.` });

  // 3. Publish to all custom + webflow.io domains.
  const pubRes = await fetch(`${API}/sites/${creds.siteId}/publish`, {
    method: "POST",
    headers,
    body: JSON.stringify({ publishToWebflowSubdomain: true }),
  });
  if (!pubRes.ok) {
    return { ok: false, reason: "publish_failed", steps: [...steps, { kind: "verify_fail", message: `Publish failed (${pubRes.status}).` }] };
  }
  steps.push({ kind: "verify_pass", message: "Webflow site republished." });

  return { ok: true, reason: "installed", steps, confirmUrl: ctx.siteUrl ?? undefined };
};

interface DomNode {
  id: string;
  type?: string;
  text?: { html?: string; text?: string };
  attributes?: Record<string, string>;
  children?: DomNode[];
}

function isCtaNode(node: DomNode, label: string): boolean {
  if (node.type !== "Link" && node.type !== "Button") return false;
  const text = (node.text?.text || node.text?.html || "").replace(/<[^>]+>/g, "").trim().toLowerCase();
  if (!text) return false;
  return text.includes(label.toLowerCase()) || label.toLowerCase().includes(text);
}
