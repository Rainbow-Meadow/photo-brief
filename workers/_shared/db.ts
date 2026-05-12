/**
 * Shared Hyperdrive-backed Postgres helper for PhotoBrief Workers.
 *
 * Hyperdrive sits in front of the Supabase Postgres pooler (see
 * `docs/hybrid-hosting.md` → "Data plane split"). Workers should use this for
 * READ paths only when RLS context is not required — writes that depend on
 * `auth.uid()` MUST still go through the Supabase JS client with the user's
 * JWT so policies fire. The service role still works through Hyperdrive when
 * the worker is acting as a trusted server.
 *
 * Usage:
 *   import postgres from "postgres";
 *   import { sqlFromHyperdrive } from "../../_shared/db";
 *   const sql = sqlFromHyperdrive(env.HYPERDRIVE);
 *   const rows = await sql`select id from photo_brief_requests where token = ${token} limit 1`;
 *
 * Add to wrangler.toml:
 *   [[hyperdrive]]
 *   binding = "HYPERDRIVE"
 *   id      = "cea7652fc3924714826c43a4090de08a"
 *
 * Add to package.json: `"postgres": "3.4.4"`.
 */

// Minimal structural type so this file does not require @cloudflare/workers-types.
export interface HyperdriveBinding {
  connectionString: string;
}

type PostgresFactory = (connectionString: string, opts?: Record<string, unknown>) => unknown;

/**
 * Build a `postgres` client targeting Hyperdrive. Caller owns the lifecycle:
 * always `await sql.end({ timeout: 5 })` in `ctx.waitUntil` for long-running
 * fetch handlers, or rely on Workers' isolate teardown for short ones.
 */
export function buildSql(factory: PostgresFactory, hyperdrive: HyperdriveBinding) {
  // `postgres` package: fetch/HTTP-friendly options. Hyperdrive expects a
  // single connection per request from the Worker side; let Hyperdrive itself
  // do the pooling on the Cloudflare network.
  return factory(hyperdrive.connectionString, {
    max: 5,
    fetch_types: false,
    prepare: false, // Hyperdrive does not support extended query prepare caching.
  });
}

/**
 * Convenience: lazy-import `postgres` so workers that don't use Hyperdrive
 * don't pay the bundle cost.
 */
export async function sqlFromHyperdrive(hyperdrive: HyperdriveBinding) {
  const mod = await import("postgres");
  const factory = (mod.default ?? mod) as PostgresFactory;
  return buildSql(factory, hyperdrive);
}
