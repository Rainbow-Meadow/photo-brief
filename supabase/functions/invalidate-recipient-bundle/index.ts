// invalidate-recipient-bundle — drops the Cloudflare KV cache for one or
// more recipient tokens whenever the underlying request, brand, or guide
// changes. Holds the service-role secret that the worker requires; the
// browser only needs an authenticated session to call this function.
//
// Body shapes (any one):
//   { token: "abc..." }                — invalidate exactly one token
//   { workspace_id: "uuid" }           — invalidate every token in a workspace
//   { guide_id: "uuid" }               — invalidate every token using a guide
//
// All cache deletes are best-effort; the worker's 1h TTL is the safety net.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const ASSISTANT_BASE_URL = "https://assistant.photobrief.ai";

interface Body {
  token?: string;
  workspace_id?: string;
  guide_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "POST required" }, 405);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!SERVICE_ROLE) return json({ error: "service role not configured" }, 500);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }

  const tokens = new Set<string>();
  const supa = createClient(SUPABASE_URL, SERVICE_ROLE);

  if (body.token) tokens.add(body.token);

  if (body.workspace_id) {
    const { data } = await supa
      .from("photo_brief_requests")
      .select("token")
      .eq("workspace_id", body.workspace_id);
    for (const r of data ?? []) if (r?.token) tokens.add(r.token);
  }

  if (body.guide_id) {
    const { data } = await supa
      .from("photo_brief_requests")
      .select("token")
      .eq("guide_id", body.guide_id);
    for (const r of data ?? []) if (r?.token) tokens.add(r.token);
  }

  if (tokens.size === 0) {
    return json({ ok: true, invalidated: 0 });
  }

  // Fan-out to the worker. Best-effort, parallel, capped at 50 to avoid
  // accidental thundering-herd from a workspace with thousands of links.
  const list = [...tokens].slice(0, 50);
  const results = await Promise.allSettled(
    list.map((t) =>
      fetch(`${ASSISTANT_BASE_URL}/recipient/${encodeURIComponent(t)}/invalidate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${SERVICE_ROLE}` },
      }),
    ),
  );
  const ok = results.filter((r) => r.status === "fulfilled" && (r.value as Response).ok).length;
  return json({ ok: true, invalidated: ok, attempted: list.length });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
