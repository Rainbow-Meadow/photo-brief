// create-intake-attachment-upload
// Public endpoint for the Smart Intake (/i/:token) confirmation screen to upload
// optional or recommended photos. Auth is established via the intake session's
// public_session_token returned to the browser only after a successful intake
// submission. Returns a short-lived R2 PUT URL bound to a fixed object key.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { buildIntakeAttachmentKey, presignR2Url, sanitizeExt } from "../_shared/r2Storage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-intake-session-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const MAX_PER_BRIEF = 12;

interface Body {
  intakeSessionId: string;
  intakeBriefId: string;
  sessionToken: string;
  contentType: string;
  ext?: string | null;
  sizeBytes?: number | null;
  filename?: string | null;
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
  if (!body.intakeSessionId || !body.intakeBriefId || !sessionToken || !body.contentType) {
    return json({ error: "intakeSessionId, intakeBriefId, sessionToken and contentType are required" }, 400);
  }
  if (!ALLOWED_MIME.has(body.contentType.toLowerCase())) {
    return json({ error: "Only JPEG, PNG, WebP or HEIC images are accepted" }, 400);
  }
  if (body.sizeBytes != null && (body.sizeBytes <= 0 || body.sizeBytes > MAX_BYTES)) {
    return json({ error: `Image must be under ${Math.round(MAX_BYTES / 1024 / 1024)} MB` }, 400);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: session, error: sessionErr } = await admin
    .from("intake_sessions")
    .select("id, workspace_id, intake_source_id, public_session_token")
    .eq("id", body.intakeSessionId)
    .maybeSingle();
  if (sessionErr) return json({ error: sessionErr.message }, 500);
  if (!session || (session as any).public_session_token !== sessionToken) {
    return json({ error: "Invalid intake session token" }, 403);
  }

  const { data: brief, error: briefErr } = await admin
    .from("intake_briefs")
    .select("id, workspace_id, intake_session_id, intake_source_id, photo_policy, photo_count")
    .eq("id", body.intakeBriefId)
    .maybeSingle();
  if (briefErr) return json({ error: briefErr.message }, 500);
  if (!brief || (brief as any).intake_session_id !== body.intakeSessionId) {
    return json({ error: "Brief not found for this intake session" }, 404);
  }
  if ((brief as any).photo_policy === "not_needed") {
    return json({ error: "Photos are not accepted for this request" }, 403);
  }
  if (((brief as any).photo_count ?? 0) >= MAX_PER_BRIEF) {
    return json({ error: `Photo limit of ${MAX_PER_BRIEF} reached` }, 409);
  }

  const ext = sanitizeExt(body.ext ?? body.contentType.split("/")[1] ?? "jpg");
  const workspaceId = (session as any).workspace_id as string;

  const { data: attachment, error: insertErr } = await admin
    .from("intake_attachments")
    .insert({
      workspace_id: workspaceId,
      intake_session_id: body.intakeSessionId,
      intake_brief_id: body.intakeBriefId,
      intake_source_id: (session as any).intake_source_id ?? (brief as any).intake_source_id ?? null,
      storage_provider: "r2",
      storage_key: "pending",
      original_filename: body.filename ?? null,
      mime_type: body.contentType,
      size_bytes: body.sizeBytes ?? null,
      status: "pending",
    })
    .select("id")
    .single();
  if (insertErr || !attachment) return json({ error: insertErr?.message ?? "Could not reserve attachment" }, 500);

  const storageKey = buildIntakeAttachmentKey({
    workspaceId,
    intakeBriefId: body.intakeBriefId,
    attachmentId: (attachment as any).id,
    ext,
  });

  const { error: updateErr } = await admin
    .from("intake_attachments")
    .update({ storage_key: storageKey })
    .eq("id", (attachment as any).id);
  if (updateErr) return json({ error: updateErr.message }, 500);

  const uploadUrl = await presignR2Url({
    key: storageKey,
    method: "PUT",
    contentType: body.contentType,
    expiresSeconds: 600,
  });

  return json({
    attachmentId: (attachment as any).id,
    uploadUrl,
    storageKey,
    expiresIn: 600,
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
