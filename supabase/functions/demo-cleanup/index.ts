// demo-cleanup — Hourly cron. Purges demo-workspace requests >24h old plus
// their submissions, captured media, R2 objects, and on-the-fly guide rows.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.18";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DEMO_WORKSPACE_ID = Deno.env.get("DEMO_WORKSPACE_ID")!;

const R2_ACCOUNT_ID = Deno.env.get("R2_ACCOUNT_ID") ?? "";
const R2_BUCKET = Deno.env.get("R2_BUCKET_NAME") ?? "";
const R2_KEY = Deno.env.get("R2_ACCESS_KEY_ID") ?? "";
const R2_SECRET = Deno.env.get("R2_SECRET_ACCESS_KEY") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: requests } = await admin
    .from("photo_brief_requests")
    .select("id, guide_id")
    .eq("is_demo", true)
    .eq("workspace_id", DEMO_WORKSPACE_ID)
    .lt("created_at", cutoff);

  let r2Deleted = 0;
  const requestIds = (requests ?? []).map((r: any) => r.id);
  const guideIds = Array.from(new Set((requests ?? []).map((r: any) => r.guide_id).filter(Boolean)));

  if (requestIds.length > 0) {
    // Best-effort R2 cleanup for captured media.
    const { data: subs } = await admin
      .from("submissions")
      .select("id")
      .in("request_id", requestIds);
    const subIds = (subs ?? []).map((s: any) => s.id);
    if (subIds.length > 0 && R2_ACCOUNT_ID && R2_KEY && R2_SECRET && R2_BUCKET) {
      const { data: media } = await admin
        .from("captured_media")
        .select("original_storage_key, processed_storage_key, preview_storage_key, thumbnail_storage_key")
        .in("submission_id", subIds);
      const keys = Array.from(new Set(
        (media ?? []).flatMap((m: any) => [
          m.original_storage_key, m.processed_storage_key, m.preview_storage_key, m.thumbnail_storage_key,
        ]).filter(Boolean),
      ));
      if (keys.length > 0) {
        const aws = new AwsClient({ accessKeyId: R2_KEY, secretAccessKey: R2_SECRET, service: "s3", region: "auto" });
        for (const k of keys) {
          try {
            const url = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${encodeURIComponent(k)}`;
            const r = await aws.fetch(url, { method: "DELETE" });
            if (r.ok || r.status === 404) r2Deleted++;
          } catch (e) {
            console.error("R2 delete failed", k, e);
          }
        }
      }
    }

    // Cascade deletes (submissions/captured_media cascade off requests).
    await admin.from("photo_brief_requests").delete().in("id", requestIds);

    // Drop the on-the-fly guides we created for this batch.
    if (guideIds.length > 0) {
      await admin.from("photo_guides").delete().in("id", guideIds).eq("workspace_id", DEMO_WORKSPACE_ID);
    }
  }

  // Purge expired, unclaimed demo_sessions and their per-visit demo workspaces.
  let sessionsDeleted = 0;
  let demoWorkspacesDeleted = 0;
  const { data: expiredSessions } = await admin
    .from("demo_sessions")
    .select("id, claimed_workspace_id")
    .is("claimed_at", null)
    .lt("expires_at", new Date().toISOString());

  const sessionIds = (expiredSessions ?? []).map((s: any) => s.id);
  const demoWsIds = Array.from(new Set(
    (expiredSessions ?? []).map((s: any) => s.claimed_workspace_id).filter(Boolean),
  ));

  if (sessionIds.length > 0) {
    await admin.from("demo_sessions").delete().in("id", sessionIds);
    sessionsDeleted = sessionIds.length;
  }
  if (demoWsIds.length > 0) {
    // Only delete workspaces still flagged is_demo (never claimed into a user).
    const { data: deleted } = await admin
      .from("business_workspaces")
      .delete()
      .in("id", demoWsIds)
      .eq("is_demo", true)
      .select("id");
    demoWorkspacesDeleted = (deleted ?? []).length;
  }

  return new Response(
    JSON.stringify({
      ok: true,
      requestsDeleted: requestIds.length,
      guidesDeleted: guideIds.length,
      r2Deleted,
      sessionsDeleted,
      demoWorkspacesDeleted,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
