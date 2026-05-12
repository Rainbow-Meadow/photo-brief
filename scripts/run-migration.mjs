#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// run-migration.mjs — Apply a .sql migration file to Lovable Cloud
// via the run-migration edge function.
//
// Usage:
//   node scripts/run-migration.mjs supabase/migrations/20260508_my_change.sql
//   node scripts/run-migration.mjs supabase/migrations/*.sql   # apply several
//
// Required env vars:
//   ADMIN_EMAIL                              — platform admin email
//   ADMIN_PASSWORD                           — platform admin password
//   SUPABASE_URL or VITE_SUPABASE_URL       — e.g. https://xyz.supabase.co
//   SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY — publishable anon key
// ─────────────────────────────────────────────────────────────
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;

const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL) {
  console.error(
    "Error: SUPABASE_URL or VITE_SUPABASE_URL environment variable is required."
  );
  process.exit(1);
}

if (!ANON_KEY) {
  console.error(
    "Error: SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY environment variable is required."
  );
  process.exit(1);
}

const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error(
    "Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required."
  );
  process.exit(1);
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node scripts/run-migration.mjs <file.sql> [...]");
  process.exit(1);
}

// ── Authenticate ────────────────────────────────────────────
async function getAccessToken() {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
      },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Auth failed (${res.status}): ${body}`);
  }
  const data = await res.json();
  return data.access_token;
}

// ── Apply one migration ─────────────────────────────────────
async function applyMigration(token, filePath) {
  const sql = readFileSync(filePath, "utf-8");
  const name = basename(filePath);

  console.log(`\n⏳  Applying ${name} (${sql.length} chars)…`);

  const res = await fetch(`${SUPABASE_URL}/functions/v1/run-migration`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ sql, name }),
  });

  const body = await res.json();

  if (body.ok) {
    if (body.already_applied) {
      console.log(`⏭️   Already applied (hash match). Skipping.`);
    } else {
      console.log(
        `✅  Success — rows affected: ${body.rows_affected ?? "n/a"}, log: ${body.log_id}`
      );
    }
  } else {
    console.error(`❌  Failed: ${body.error}`);
    process.exitCode = 1;
  }
}

// ── Main ────────────────────────────────────────────────────
const token = await getAccessToken();
console.log("🔑  Authenticated as platform admin.");

for (const file of files) {
  await applyMigration(token, file);
}

console.log("\nDone.");
