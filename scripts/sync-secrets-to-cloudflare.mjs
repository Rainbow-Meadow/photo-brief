#!/usr/bin/env node
/**
 * Sync secrets from a local .env-style file into a Cloudflare Secrets Store.
 *
 * Usage:
 *   node scripts/sync-secrets-to-cloudflare.mjs --dry-run
 *   node scripts/sync-secrets-to-cloudflare.mjs
 *   node scripts/sync-secrets-to-cloudflare.mjs --print-bindings
 *
 * Required env (read from process.env):
 *   CLOUDFLARE_API_TOKEN  Token with `Secrets Store: Edit` permission.
 *   R2_ACCOUNT_ID         Cloudflare account ID (we reuse the existing var).
 *
 * Source values:
 *   Reads from `.env.secrets` at the repo root (gitignored).
 *   Each line: `NAME=value`. Values may be quoted. Lines starting with # are skipped.
 *   The Cloudflare API token alone cannot read Lovable Cloud secrets, so the
 *   operator must paste current values into `.env.secrets` before running.
 *
 * State:
 *   On first successful run, writes `scripts/.cf-secrets-store.json` with the
 *   generated `store_id`. Re-runs are idempotent and reuse it.
 *
 * Docs: https://developers.cloudflare.com/api/operations/secrets-store-create-store
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry-run");
const PRINT_BINDINGS = args.has("--print-bindings");
const FROM_ENV = args.has("--from-env");

// When --from-env, allow these aliases (manifest name → env var fallback).
const ENV_ALIASES = {
  SUPABASE_ANON_KEY: "VITE_SUPABASE_ANON_KEY",
};

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
if (!TOKEN) die("CLOUDFLARE_API_TOKEN not set");
if (!ACCOUNT_ID) die("R2_ACCOUNT_ID (or CLOUDFLARE_ACCOUNT_ID) not set");

const manifest = JSON.parse(readFileSync(resolve(__dirname, "secret-manifest.json"), "utf8"));
const STORE_NAME = manifest.store;
const SECRET_NAMES = Object.keys(manifest.secrets);

const STATE_FILE = resolve(__dirname, ".cf-secrets-store.json");
const ENV_FILE = resolve(ROOT, ".env.secrets");

const API = "https://api.cloudflare.com/client/v4";
const headers = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

async function cf(path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(`CF ${init.method || "GET"} ${path} → ${res.status}: ${JSON.stringify(body.errors || body)}`);
  }
  return body.result;
}

function parseEnvFile(path) {
  if (!existsSync(path)) die(`Missing ${path}. Create it with NAME=value lines.`);
  const out = {};
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

async function ensureStore() {
  if (existsSync(STATE_FILE)) {
    const state = JSON.parse(readFileSync(STATE_FILE, "utf8"));
    if (state.store_id) return state.store_id;
  }
  const stores = await cf(`/accounts/${ACCOUNT_ID}/secrets_store/stores`);
  const found = (stores || []).find((s) => s.name === STORE_NAME);
  let storeId;
  if (found) {
    storeId = found.id;
    log(`✓ Reusing store ${STORE_NAME} (${storeId})`);
  } else {
    if (DRY) {
      log(`(dry-run) Would create store ${STORE_NAME}`);
      return "DRY_RUN_STORE_ID";
    }
    const created = await cf(`/accounts/${ACCOUNT_ID}/secrets_store/stores`, {
      method: "POST",
      body: JSON.stringify({ name: STORE_NAME }),
    });
    storeId = created.id;
    log(`✓ Created store ${STORE_NAME} (${storeId})`);
  }
  writeFileSync(STATE_FILE, JSON.stringify({ store_id: storeId, store_name: STORE_NAME, updated_at: new Date().toISOString() }, null, 2));
  return storeId;
}

async function listSecrets(storeId) {
  if (storeId === "DRY_RUN_STORE_ID") return [];
  const r = await cf(`/accounts/${ACCOUNT_ID}/secrets_store/stores/${storeId}/secrets`);
  return r || [];
}

async function upsertSecret(storeId, name, value, existing) {
  const payload = [{ name, value, scopes: ["workers"], comment: `Synced ${new Date().toISOString()}` }];
  if (DRY) {
    log(`  (dry-run) ${existing ? "UPDATE" : "CREATE"} ${name}`);
    return;
  }
  if (existing) {
    await cf(`/accounts/${ACCOUNT_ID}/secrets_store/stores/${storeId}/secrets/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ value, comment: `Synced ${new Date().toISOString()}` }),
    });
    log(`  ✓ updated ${name}`);
  } else {
    await cf(`/accounts/${ACCOUNT_ID}/secrets_store/stores/${storeId}/secrets`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    log(`  ✓ created ${name}`);
  }
}

function printBindings(storeId) {
  const byWorker = {};
  for (const [name, spec] of Object.entries(manifest.secrets)) {
    for (const w of spec.bindings || []) {
      (byWorker[w] ||= []).push(name);
    }
  }
  for (const [worker, names] of Object.entries(byWorker)) {
    console.log(`\n# workers/${worker}/wrangler.toml`);
    for (const n of names) {
      console.log(`[[secrets_store_secrets]]\nbinding     = "${n}"\nstore_id    = "${storeId}"\nsecret_name = "${n}"\n`);
    }
  }
}

function log(msg) { console.log(msg); }
function die(msg) { console.error(`✗ ${msg}`); process.exit(1); }

(async () => {
  log(`Cloudflare Secrets Store sync — account ${ACCOUNT_ID.slice(0, 8)}…${DRY ? " [DRY RUN]" : ""}`);

  const storeId = await ensureStore();

  if (PRINT_BINDINGS) {
    printBindings(storeId);
    return;
  }

  const values = FROM_ENV
    ? Object.fromEntries(
        SECRET_NAMES
          .map((n) => [n, process.env[n] ?? process.env[ENV_ALIASES[n] ?? ""] ?? ""])
          .filter(([, v]) => v !== ""),
      )
    : parseEnvFile(ENV_FILE);
  const missing = SECRET_NAMES.filter((n) => !(n in values) || values[n] === "");
  if (missing.length) {
    log(`! ${missing.length} secret(s) absent from ${FROM_ENV ? "process.env" : ENV_FILE} — will be skipped:`);
    for (const m of missing) log(`    - ${m}`);
  }

  const existing = await listSecrets(storeId);
  const existingByName = Object.fromEntries(existing.map((s) => [s.name, s]));

  log(`Syncing ${SECRET_NAMES.length - missing.length} secret(s) to ${STORE_NAME}…`);
  for (const name of SECRET_NAMES) {
    if (!(name in values) || values[name] === "") continue;
    await upsertSecret(storeId, name, values[name], existingByName[name]);
  }

  log(`\nDone. Store id: ${storeId}`);
  log(`Print wrangler bindings: node scripts/sync-secrets-to-cloudflare.mjs --print-bindings`);
})().catch((e) => die(e.message || String(e)));
