/**
 * agent-brand — read or update a workspace's brand voice & visual identity
 * by proxying to the Orchestrator agent (which owns WORKSPACE_BRAND KV).
 *
 *   GET  /agent-brand?workspace_id=...  → { brand }
 *   PUT  /agent-brand                   → { brand }   body: { workspace_id, brand: Partial<WorkspaceBrand> }
 *
 * Authenticated via Supabase JWT; caller must be a member of the workspace.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const ORCHESTRATOR_URL =
  Deno.env.get("ORCHESTRATOR_AGENT_URL") ?? "https://orchestrator.photobrief.ai";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function assertMembership(
  authHeader: string,
  workspaceId: string,
): Promise<{ ok: true } | { ok: false; res: Response }> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { ok: false, res: json({ error: "unauthorized" }, 401) };

  const { data: member, error } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.user.id)
    .maybeSingle();
  if (error || !member) return { ok: false, res: json({ error: "forbidden" }, 403) };
  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json({ error: "missing_auth" }, 401);

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const workspaceId = url.searchParams.get("workspace_id");
      if (!workspaceId) return json({ error: "workspace_id_required" }, 400);

      const guard = await assertMembership(authHeader, workspaceId);
      if (!guard.ok) return guard.res;

      const res = await fetch(
        `${ORCHESTRATOR_URL}/w/${workspaceId}/context?workspaceId=${workspaceId}`,
        { headers: { "x-pb-workspace-id": workspaceId } },
      );
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT") {
      const body = await req.json().catch(() => ({}));
      const workspaceId = body.workspace_id;
      if (!workspaceId) return json({ error: "workspace_id_required" }, 400);
      const guard = await assertMembership(authHeader, workspaceId);
      if (!guard.ok) return guard.res;

      const res = await fetch(`${ORCHESTRATOR_URL}/w/${workspaceId}/brand`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-pb-workspace-id": workspaceId },
        body: JSON.stringify({ ...(body.brand ?? {}), workspaceId }),
      });
      const text = await res.text();
      return new Response(text, {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return json({ error: "method_not_allowed" }, 405);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
