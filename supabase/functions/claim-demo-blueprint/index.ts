// claim-demo-blueprint — Authenticated. Called right after a new user signs up
// with ?demo=<sessionId>. Transfers the per-visit demo workspace (already
// populated with their scanned routes + intake link) to the new user, and
// removes the empty workspace the signup trigger auto-created.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

  const userClient = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  let body: { demoSessionId?: string };
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const demoSessionId = (body.demoSessionId ?? "").trim();
  if (!demoSessionId) return json({ error: "missing_demo_session_id" }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: session } = await admin
    .from("demo_sessions")
    .select("id, workspace_id, status, claimed_at, expires_at, url")
    .eq("id", demoSessionId)
    .maybeSingle();
  if (!session) return json({ error: "demo_session_not_found" }, 404);
  if ((session as any).claimed_at) return json({ error: "already_claimed" }, 409);
  if ((session as any).status !== "ready") return json({ error: "demo_not_ready" }, 409);
  if (new Date((session as any).expires_at).getTime() < Date.now())
    return json({ error: "demo_expired" }, 410);

  const demoWorkspaceId = (session as any).workspace_id as string;

  // Verify demo workspace is actually a demo (cannot hijack a live workspace).
  const { data: demoWs } = await admin
    .from("business_workspaces")
    .select("id, is_demo, owner_id")
    .eq("id", demoWorkspaceId)
    .maybeSingle();
  if (!demoWs || !(demoWs as any).is_demo) return json({ error: "invalid_demo_workspace" }, 400);

  // Find the auto-created workspace from handle_new_user trigger.
  const { data: profile } = await admin
    .from("profiles")
    .select("default_workspace_id")
    .eq("id", user.id)
    .maybeSingle();
  const autoWorkspaceId = (profile as any)?.default_workspace_id as string | null;

  // Reuse existing email if any.
  const displayName =
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Workspace";

  const hostLabel = (() => {
    try { return new URL((session as any).url).hostname.replace(/^www\./, ""); }
    catch { return "Workspace"; }
  })();

  // Transfer the demo workspace to the new user.
  const { error: wsUpdateErr } = await admin
    .from("business_workspaces")
    .update({
      owner_id: user.id,
      name: hostLabel,
      is_demo: false,
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      trial_plan: "intake",
    })
    .eq("id", demoWorkspaceId);
  if (wsUpdateErr) return json({ error: "workspace_transfer_failed", message: wsUpdateErr.message }, 500);

  // Add user as owner member; remove the prior demo-owner membership so the
  // sentinel system user no longer appears in the new workspace.
  await admin.from("workspace_members").upsert(
    { workspace_id: demoWorkspaceId, user_id: user.id, role: "owner", status: "active" },
    { onConflict: "workspace_id,user_id" },
  );
  await admin
    .from("workspace_members")
    .delete()
    .eq("workspace_id", demoWorkspaceId)
    .neq("user_id", user.id);

  // Point the user's default at the claimed workspace.
  await admin.from("profiles").update({ default_workspace_id: demoWorkspaceId }).eq("id", user.id);

  // Re-create the brand_profiles / subscription rows the signup trigger normally
  // would have created — for the claimed workspace.
  await admin.from("brand_profiles").upsert(
    {
      workspace_id: demoWorkspaceId,
      intro_message: "Hi! Help us help you — a few quick photos.",
      completion_message: "Thanks! We've got everything we need.",
    },
    { onConflict: "workspace_id" },
  );
  await admin.from("subscriptions").insert({
    workspace_id: demoWorkspaceId, plan_tier: "intake", status: "trialing",
  });

  // Delete the auto-created empty workspace (CASCADE clears its brand/subscription).
  if (autoWorkspaceId && autoWorkspaceId !== demoWorkspaceId) {
    await admin.from("business_workspaces").delete().eq("id", autoWorkspaceId);
  }

  // Mark demo claimed.
  await admin.from("demo_sessions").update({
    status: "claimed",
    claimed_by_user_id: user.id,
    claimed_workspace_id: demoWorkspaceId,
    claimed_at: new Date().toISOString(),
  }).eq("id", demoSessionId);

  return json({ ok: true, workspaceId: demoWorkspaceId });
});
