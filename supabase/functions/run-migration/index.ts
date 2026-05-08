// run-migration — Platform-admin only edge function.
// Accepts { sql, name? } and executes the SQL against the database
// using a direct Postgres connection (supports DDL).
// Logs every execution to admin_migration_log for auditability.
// Idempotent: if the same sql_hash was already applied successfully,
// returns early with { ok: true, already_applied: true }.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_SQL_BYTES = 512_000; // 500 KB

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const DB_URL = Deno.env.get("SUPABASE_DB_URL");

  if (!DB_URL) {
    return json({ error: "Database connection not configured" }, 500);
  }

  // ── 1. Auth: require a signed-in platform admin ──────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Sign in required." }, 401);

  const userClient = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: u } = await userClient.auth.getUser();
  if (!u?.user) return json({ error: "Sign in required." }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: adminRow } = await admin
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", u.user.id)
    .maybeSingle();
  if (!adminRow) return json({ error: "Forbidden" }, 403);

  // ── 2. Parse & validate body ─────────────────────────────────────
  let body: { sql?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const sql = (body.sql ?? "").trim();
  if (!sql) return json({ error: "sql is required" }, 400);

  if (new TextEncoder().encode(sql).length > MAX_SQL_BYTES) {
    return json({ error: `SQL exceeds ${MAX_SQL_BYTES} byte limit` }, 400);
  }

  const name = (body.name ?? "unnamed").slice(0, 255);
  const sqlHash = await sha256(sql);

  // ── 3. Idempotency check ─────────────────────────────────────────
  const { data: existing } = await admin
    .from("admin_migration_log")
    .select("id, status")
    .eq("sql_hash", sqlHash)
    .eq("status", "success")
    .maybeSingle();

  if (existing) {
    return json({
      ok: true,
      already_applied: true,
      log_id: existing.id,
      name,
      sql_hash: sqlHash,
    });
  }

  // ── 4. Execute the SQL via direct Postgres connection ────────────
  // Dynamic import so the module is only loaded when needed.
  const { Client } = await import(
    "https://deno.land/x/postgres@v0.19.3/mod.ts"
  );

  let logId: string | null = null;
  try {
    // Insert a pending log entry first.
    const { data: logRow } = await admin
      .from("admin_migration_log")
      .insert({
        name,
        sql_hash: sqlHash,
        executed_by: u.user.id,
        status: "pending",
      })
      .select("id")
      .single();
    logId = logRow?.id ?? null;

    // Connect and run.
    const client = new Client(DB_URL);
    await client.connect();

    let rowCount = 0;
    try {
      await client.queryObject("BEGIN");
      const result = await client.queryObject(sql);
      rowCount =
        result.rowCount != null ? Number(result.rowCount) : 0;
      await client.queryObject("COMMIT");
    } catch (execErr) {
      try {
        await client.queryObject("ROLLBACK");
      } catch { /* ignore rollback failure */ }
      throw execErr;
    } finally {
      try {
        await client.end();
      } catch { /* ignore close failure */ }
    }

    // Mark success.
    if (logId) {
      await admin
        .from("admin_migration_log")
        .update({ status: "success" })
        .eq("id", logId);
    }

    return json({
      ok: true,
      already_applied: false,
      log_id: logId,
      name,
      sql_hash: sqlHash,
      rows_affected: rowCount,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    // Mark failure in the log.
    if (logId) {
      await admin
        .from("admin_migration_log")
        .update({ status: "error", error_msg: msg.slice(0, 4000) })
        .eq("id", logId);
    }

    return json({ ok: false, error: msg, log_id: logId }, 500);
  }
});
