/**
 * Zapier installer.
 *
 * Phase 2 ships the link-only flow: we generate a Zap-template URL prefilled
 * with the customer's PhotoBrief webhook URL and Catch Hook → POST template.
 * The user clicks once, signs into Zapier, picks their existing form trigger
 * (Typeform, Google Forms, Wufoo, …), and confirms. We can't fully provision
 * the Zap without a Zapier Partner OAuth app, which is a roadmap item.
 */

import { ok, type Installer } from "./types.js";

export const installZapier: Installer = async (ctx) => {
  const webhookHint = ctx.intakeUrl.replace("/i/", "/webhook/");
  const url = `https://zapier.com/app/editor/template?utm_source=photobrief&webhook_url=${encodeURIComponent(webhookHint)}`;
  return {
    ok: true,
    reason: "template_link",
    steps: [
      { kind: "info", message: "Opened a prefilled Zap template." },
      { kind: "action_required", message: "Pick your existing form trigger in Zapier and turn the Zap on." },
    ],
    confirmUrl: url,
  };
};
