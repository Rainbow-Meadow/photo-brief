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
    .select("id, workspace_id, status, claimed_at, claimed_by_user_id, claimed_workspace_id, expires_at, url, created_at")
    .eq("id", demoSessionId)
    .maybeSingle();
  if (!session) {
    return json({
      error: "demo_session_not_found",
      message: "We couldn't find that demo. It may have expired and been cleaned up.",
    }, 404);
  }

  const s = session as any;
  const nowMs = Date.now();
  const expiresMs = s.expires_at ? new Date(s.expires_at).getTime() : 0;
  const claimedMs = s.claimed_at ? new Date(s.claimed_at).getTime() : 0;

  // Idempotent: if THIS user already claimed THIS session, return success
  // instead of erroring. Prevents double-submits / refreshes from breaking.
  if (s.claimed_at && s.claimed_by_user_id === user.id && s.claimed_workspace_id) {
    return json({
      ok: true,
      workspaceId: s.claimed_workspace_id,
      alreadyClaimed: true,
      message: "This demo was already imported into your workspace.",
    });
  }

  if (s.claimed_at) {
    return json({
      error: "already_claimed",
      message: "This demo was already imported by another account. Start a new scan to import a fresh setup.",
      claimedAt: s.claimed_at,
      claimedAgoMinutes: Math.round((nowMs - claimedMs) / 60000),
    }, 409);
  }

  if (s.status !== "ready") {
    return json({
      error: "demo_not_ready",
      message: s.status === "scanning"
        ? "We're still building your demo. Give it a few more seconds and try again."
        : s.status === "failed"
        ? "This demo scan failed. Start a fresh scan to try again."
        : `Demo is in '${s.status}' state and cannot be imported.`,
      status: s.status,
    }, 409);
  }

  if (expiresMs && expiresMs < nowMs) {
    return json({
      error: "demo_expired",
      message: "This demo expired. Demos are kept for 24 hours — start a fresh scan to import a new one.",
      expiredAt: s.expires_at,
      expiredAgoMinutes: Math.round((nowMs - expiresMs) / 60000),
    }, 410);
  }

  const demoWorkspaceId = s.workspace_id as string;

  // Prevent the same user from importing a second demo on top of an existing
  // claim. They should start fresh from inside their workspace instead.
  const { data: priorClaims } = await admin
    .from("demo_sessions")
    .select("id, claimed_workspace_id, claimed_at")
    .eq("claimed_by_user_id", user.id)
    .not("claimed_at", "is", null)
    .limit(1);
  if (priorClaims && priorClaims.length > 0) {
    const prior = priorClaims[0] as any;
    return json({
      error: "user_already_claimed_demo",
      message: "You've already imported a demo into your account. Start a fresh scan from inside your workspace.",
      existingWorkspaceId: prior.claimed_workspace_id,
      claimedAt: prior.claimed_at,
    }, 409);
  }

  // Verify demo workspace is actually a demo (cannot hijack a live workspace).
  const { data: demoWs } = await admin
    .from("business_workspaces")
    .select("id, is_demo, owner_id")
    .eq("id", demoWorkspaceId)
    .maybeSingle();
  if (!demoWs || !(demoWs as any).is_demo) {
    return json({
      error: "invalid_demo_workspace",
      message: "This demo's workspace is no longer valid. Start a fresh scan.",
    }, 400);
  }

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

  // Atomically reserve the claim BEFORE mutating workspaces. If another
  // concurrent request already flipped claimed_at, this UPDATE returns 0 rows
  // and we abort safely without touching the workspace.
  const claimedAtIso = new Date().toISOString();
  const { data: reserved, error: reserveErr } = await admin
    .from("demo_sessions")
    .update({
      claimed_at: claimedAtIso,
      claimed_by_user_id: user.id,
      status: "claiming",
    })
    .eq("id", demoSessionId)
    .is("claimed_at", null)
    .select("id")
    .maybeSingle();
  if (reserveErr) return json({ error: "claim_reserve_failed", message: reserveErr.message }, 500);
  if (!reserved) {
    return json({
      error: "already_claimed",
      message: "This demo was just claimed by another request. Refresh and try again.",
    }, 409);
  }

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
  if (wsUpdateErr) {
    // Best-effort rollback so the user can retry.
    await admin.from("demo_sessions").update({
      claimed_at: null, claimed_by_user_id: null, status: "ready",
    }).eq("id", demoSessionId);
    return json({ error: "workspace_transfer_failed", message: wsUpdateErr.message }, 500);
  }

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
