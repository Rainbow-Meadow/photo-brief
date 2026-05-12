// finalize-intake-attachment
// Marks an intake attachment as ready after the browser completes the R2 PUT,
// and increments the parent intake brief's photo counters. Verifies the upload
// landed in R2 via a HEAD request before crediting the brief.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { headR2Object } from "../_shared/r2Storage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-intake-session-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Body {
  attachmentId: string;
  intakeSessionId: string;
  sessionToken: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const sessionToken = body.sessionToken ?? req.headers.get("x-intake-session-token") ?? "";
  if (!body.attachmentId || !body.intakeSessionId || !sessionToken) {
    return json({ error: "attachmentId, intakeSessionId and sessionToken are required" }, 400);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: session } = await admin
    .from("intake_sessions")
    .select("id, public_session_token")
    .eq("id", body.intakeSessionId)
    .maybeSingle();
  if (!session || (session as any).public_session_token !== sessionToken) {
    return json({ error: "Invalid intake session token" }, 403);
  }

  const { data: attachment, error: aErr } = await admin
    .from("intake_attachments")
    .select("id, intake_session_id, intake_brief_id, workspace_id, storage_key, status, mime_type, size_bytes")
    .eq("id", body.attachmentId)
    .maybeSingle();
  if (aErr) return json({ error: aErr.message }, 500);
  if (!attachment || (attachment as any).intake_session_id !== body.intakeSessionId) {
    return json({ error: "Attachment not found for this intake session" }, 404);
  }
  if ((attachment as any).status === "ready") {
    return json({ ok: true, alreadyFinalized: true });
  }

  const head = await headR2Object((attachment as any).storage_key);
  if (!head) {
    await admin.from("intake_attachments").update({ status: "failed" }).eq("id", body.attachmentId);
    return json({ error: "Upload not found in storage" }, 422);
  }

  await admin
    .from("intake_attachments")
    .update({
      status: "ready",
      finalized_at: new Date().toISOString(),
      size_bytes: head.contentLength || (attachment as any).size_bytes,
      checksum_sha256: head.etag ?? null,
    })
    .eq("id", body.attachmentId);

  // Recount ready attachments for this brief and update photos_provided/photo_count.
  const { count } = await admin
    .from("intake_attachments")
    .select("id", { count: "exact", head: true })
    .eq("intake_brief_id", (attachment as any).intake_brief_id)
    .eq("status", "ready");

  const photoCount = count ?? 0;
  await admin
    .from("intake_briefs")
    .update({
      photo_count: photoCount,
      photos_provided: photoCount > 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", (attachment as any).intake_brief_id);

  return json({ ok: true, photoCount });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
