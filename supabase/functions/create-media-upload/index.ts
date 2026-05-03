// create-media-upload
// Creates/uses a submission, inserts a captured_media placeholder, and returns a
// short-lived signed R2 PUT URL for the browser to upload the original image.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { buildTempOriginalKey, presignR2Url, sanitizeExt } from "../_shared/r2Storage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-request-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

interface Body {
  requestId: string;
  workspaceId: string;
  stepId?: string | null;
  submissionId?: string | null;
  recipientName?: string | null;
  contentType: string;
  ext?: string | null;
  sizeBytes?: number | null;
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

  if (!body.requestId || !body.workspaceId || !body.contentType) {
    return json({ error: "requestId, workspaceId, and contentType are required" }, 400);
  }
  if (!body.contentType.startsWith("image/")) {
    return json({ error: "Only image uploads are supported" }, 400);
  }

  const authorized = await authorizeRequest(req, body.workspaceId, body.requestId);
  if (!authorized.ok) return json({ error: authorized.error }, authorized.status);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  let submissionId = body.submissionId ?? null;
  if (submissionId) {
    const { data: sub } = await admin
      .from("submissions")
      .select("id, workspace_id, request_id")
      .eq("id", submissionId)
      .eq("workspace_id", body.workspaceId)
      .eq("request_id", body.requestId)
      .maybeSingle();
    if (!sub) return json({ error: "Submission not found for this request" }, 404);
  } else {
    const { data: sub, error: subErr } = await admin
      .from("submissions")
      .insert({
        request_id: body.requestId,
        workspace_id: body.workspaceId,
        submitter_name: body.recipientName ?? null,
        status: "new",
      })
      .select("id")
      .single();
    if (subErr) return json({ error: subErr.message }, 500);
    submissionId = sub.id;
  }

  const { data: media, error: mediaErr } = await admin
    .from("captured_media")
    .insert({
      submission_id: submissionId,
      step_id: body.stepId && /^[0-9a-f-]{36}$/i.test(body.stepId) ? body.stepId : null,
      // Temporary placeholder updated to the real original key below. Kept
      // non-null for compatibility with older schemas/views that expect file_url.
      file_url: "pending-r2-upload",
      status: "analyzing",
      storage_provider: "r2",
      processing_status: "pending_upload",
      original_mime_type: body.contentType,
      original_size_bytes: body.sizeBytes ?? null,
    })
    .select("id")
    .single();
  if (mediaErr) return json({ error: mediaErr.message }, 500);

  const ext = sanitizeExt(body.ext ?? body.contentType.split("/")[1] ?? "jpg");
  const originalKey = buildTempOriginalKey({
    workspaceId: body.workspaceId,
    requestId: body.requestId,
    submissionId,
    mediaId: media.id,
    ext,
  });

  const { error: updateErr } = await admin
    .from("captured_media")
    .update({ original_storage_key: originalKey, file_url: originalKey })
    .eq("id", media.id);
  if (updateErr) return json({ error: updateErr.message }, 500);

  const uploadUrl = await presignR2Url({
    key: originalKey,
    method: "PUT",
    contentType: body.contentType,
    expiresSeconds: 600,
  });

  return json({
    submissionId,
    capturedMediaId: media.id,
    originalStorageKey: originalKey,
    uploadUrl,
    expiresIn: 600,
  });
});

async function authorizeRequest(
  req: Request,
  workspaceId: string,
  requestId: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const token = req.headers.get("x-request-token");
  if (token) {
    const { data: requestRow } = await admin
      .from("photo_brief_requests")
      .select("id, workspace_id")
      .eq("id", requestId)
      .eq("workspace_id", workspaceId)
      .eq("token", token)
      .maybeSingle();
    return requestRow ? { ok: true } : { ok: false, status: 403, error: "Invalid request token" };
  }

  const auth = req.headers.get("Authorization");
  if (!auth) return { ok: false, status: 401, error: "Authentication required" };
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: auth } },
  });
  const { data } = await userClient.auth.getUser();
  if (!data?.user) return { ok: false, status: 401, error: "Invalid auth token" };

  const { data: member } = await admin
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", data.user.id)
    .eq("status", "active")
    .maybeSingle();
  return member ? { ok: true } : { ok: false, status: 403, error: "Not a workspace member" };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
