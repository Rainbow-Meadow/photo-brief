// finalize-media-upload
// Verifies the temporary original exists in R2, optionally records final WebP
// keys after browser conversion, and returns a short-lived AI read URL.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { buildProcessedKey, deleteR2Object, headR2Object, presignR2Url } from "../_shared/r2Storage.ts";

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
  capturedMediaId: string;
  processed?: {
    uploaded?: boolean;
    width?: number | null;
    height?: number | null;
    sizeBytes?: number | null;
    checksumSha256?: string | null;
  };
  deleteOriginal?: boolean;
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

  if (!body.capturedMediaId) return json({ error: "capturedMediaId is required" }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: media, error: mediaErr } = await admin
    .from("captured_media")
    .select("id, submission_id, step_id, original_storage_key, processed_storage_key, submissions!inner(id, workspace_id, request_id)")
    .eq("id", body.capturedMediaId)
    .maybeSingle();
  if (mediaErr) return json({ error: mediaErr.message }, 500);
  if (!media) return json({ error: "Captured media not found" }, 404);

  const submission: any = (media as any).submissions;
  const workspaceId = submission?.workspace_id as string | undefined;
  const requestId = submission?.request_id as string | undefined;
  const submissionId = submission?.id as string | undefined;
  if (!workspaceId || !requestId || !submissionId) return json({ error: "Captured media is missing request context" }, 400);

  const authorized = await authorizeRequest(req, workspaceId, requestId);
  if (!authorized.ok) return json({ error: authorized.error }, authorized.status);

  const originalKey = (media as any).original_storage_key as string | null;
  if (!originalKey) return json({ error: "Captured media has no original R2 key" }, 400);

  const originalHead = await headR2Object(originalKey);
  if (!originalHead) return json({ error: "Original upload was not found in R2" }, 404);

  const fullKey = buildProcessedKey({ workspaceId, requestId, submissionId, mediaId: body.capturedMediaId, variant: "full" });
  const previewKey = buildProcessedKey({ workspaceId, requestId, submissionId, mediaId: body.capturedMediaId, variant: "preview" });
  const thumbKey = buildProcessedKey({ workspaceId, requestId, submissionId, mediaId: body.capturedMediaId, variant: "thumb" });

  const patch: Record<string, unknown> = {
    storage_provider: "r2",
    uploaded_at: new Date().toISOString(),
    processing_status: body.processed?.uploaded ? "ready" : "uploaded_original",
    original_mime_type: originalHead.contentType,
    original_size_bytes: originalHead.contentLength || null,
  };

  if (body.processed?.uploaded) {
    const processedHead = await headR2Object(fullKey);
    if (!processedHead) return json({ error: "Processed WebP was not found in R2" }, 404);
    patch.processed_storage_key = fullKey;
    patch.preview_storage_key = previewKey;
    patch.thumbnail_storage_key = thumbKey;
    patch.mime_type = processedHead.contentType ?? "image/webp";
    patch.file_size_bytes = body.processed.sizeBytes ?? processedHead.contentLength ?? null;
    patch.width = body.processed.width ?? null;
    patch.height = body.processed.height ?? null;
    patch.checksum_sha256 = body.processed.checksumSha256 ?? null;
    patch.processed_at = new Date().toISOString();
    // Compatibility: file_url now points to the preferred object key.
    patch.file_url = fullKey;
  }

  const { error: updateErr } = await admin
    .from("captured_media")
    .update(patch)
    .eq("id", body.capturedMediaId);
  if (updateErr) return json({ error: updateErr.message }, 500);

  if (body.deleteOriginal && body.processed?.uploaded) {
    await deleteR2Object(originalKey).catch((err) => console.warn("delete original failed", err));
  }

  const aiReadUrl = await presignR2Url({
    key: originalKey,
    method: "GET",
    expiresSeconds: 900,
  });

  return json({
    capturedMediaId: body.capturedMediaId,
    originalStorageKey: originalKey,
    processedStorageKey: body.processed?.uploaded ? fullKey : null,
    previewStorageKey: body.processed?.uploaded ? previewKey : null,
    thumbnailStorageKey: body.processed?.uploaded ? thumbKey : null,
    aiReadUrl,
    processingStatus: patch.processing_status,
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
      .select("id")
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
