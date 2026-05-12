/**
 * analytics-aggregate — proxy AE SQL queries for the admin dashboard.
 *
 * The admin command center calls this with a SQL query (against the
 * pb_usage_events Analytics Engine dataset). We forward to the
 * assistant-agent worker which holds the Cloudflare API token, so the
 * browser never sees it.
 *
 * Auth: must be a platform admin.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ASSISTANT_AGENT_URL =
  Deno.env.get("ASSISTANT_AGENT_URL") ?? "https://assistant.photobrief.ai";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Unauthorized" }, 401);
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: claims, error: claimsErr } = await userClient.auth.getClaims(
    authHeader.replace("Bearer ", ""),
  );
  if (claimsErr || !claims?.claims?.sub) {
    return json({ error: "Unauthorized" }, 401);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: isAdminRow } = await admin
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", claims.claims.sub)
    .maybeSingle();
  if (!isAdminRow) {
    return json({ error: "Forbidden" }, 403);
  }

  let query: string;
  try {
    const body = await req.json();
    query = String(body.query ?? "");
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (!query) return json({ error: "query required" }, 400);

  const res = await fetch(`${ASSISTANT_AGENT_URL}/telemetry/aggregate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_ROLE}`,
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
