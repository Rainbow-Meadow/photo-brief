// get-media-url
// Returns a short-lived signed read URL for a captured media object. Supports
// R2-backed rows first and legacy Supabase Storage fallback.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { presignR2Url } from "../_shared/r2Storage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-request-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

type Variant = "full" | "preview" | "thumb" | "original";

interface Body {
  capturedMediaId: string;
  variant?: Variant;
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
  const { data: media, error } = await admin
    .from("captured_media")
    .select("id, file_url, storage_provider, original_storage_key, processed_storage_key, preview_storage_key, thumbnail_storage_key, submissions!inner(id, workspace_id, request_id)")
    .eq("id", body.capturedMediaId)
    .maybeSingle();
  if (error) return json({ error: error.message }, 500);
  if (!media) return json({ error: "Captured media not found" }, 404);

  const submission: any = (media as any).submissions;
  const workspaceId = submission?.workspace_id as string | undefined;
  const requestId = submission?.request_id as string | undefined;
  if (!workspaceId || !requestId) return json({ error: "Captured media is missing request context" }, 400);

  const authorized = await authorizeRequest(req, workspaceId, requestId);
  if (!authorized.ok) return json({ error: authorized.error }, authorized.status);

  if ((media as any).storage_provider === "r2") {
    const key = selectR2Key(media as any, body.variant ?? "full");
    if (!key) return json({ error: "No media object is available yet" }, 404);
    const url = await presignR2Url({ key, method: "GET", expiresSeconds: 900 });
    return json({ url, key, storageProvider: "r2", expiresIn: 900 });
  }

  const fileUrl = (media as any).file_url as string | null;
  if (!fileUrl) return json({ error: "No legacy media URL found" }, 404);
  if (fileUrl.startsWith("http")) {
    return json({ url: fileUrl, key: fileUrl, storageProvider: "supabase" });
  }
  const { data } = admin.storage.from("submission-media").getPublicUrl(fileUrl);
  return json({ url: data.publicUrl, key: fileUrl, storageProvider: "supabase" });
});

function selectR2Key(media: any, variant: Variant) {
  if (variant === "thumb") return media.thumbnail_storage_key ?? media.preview_storage_key ?? media.processed_storage_key ?? media.original_storage_key;
  if (variant === "preview") return media.preview_storage_key ?? media.processed_storage_key ?? media.original_storage_key;
  if (variant === "original") return media.original_storage_key ?? media.processed_storage_key;
  return media.processed_storage_key ?? media.preview_storage_key ?? media.original_storage_key;
}

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
