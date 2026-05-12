import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { presignR2Url } from "../_shared/r2Storage.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const briefId = typeof body?.briefId === "string" ? body.briefId : null;
    if (!briefId) return json({ error: "briefId required" }, 400);

    // RLS on intake_attachments restricts SELECT to workspace members already.
    const { data: rows, error } = await supabase
      .from("intake_attachments")
      .select("id, mime_type, size_bytes, original_filename, storage_key, status, created_at")
      .eq("intake_brief_id", briefId)
      .eq("status", "ready")
      .order("created_at", { ascending: true });

    if (error) {
      return json({ error: error.message }, 400);
    }

    const attachments = await Promise.all((rows ?? []).map(async (r) => ({
      id: r.id,
      mimeType: r.mime_type,
      sizeBytes: r.size_bytes,
      originalFilename: r.original_filename,
      createdAt: r.created_at,
      url: await presignR2Url({ key: r.storage_key, method: "GET", expiresSeconds: 600 }),
    })));

    return json({ attachments });
  } catch (e) {
    return json({ error: (e as Error).message ?? "internal_error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
