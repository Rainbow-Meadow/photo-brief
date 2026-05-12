# Secrets rotation runbook

PhotoBrief mirrors all non-connector secrets into a single **Cloudflare Secrets Store**
(`photobrief-prod`) so we have one canonical store for ops, rotation, and Worker bindings.

## Topology

| Surface | Source of truth | How it reads |
|---|---|---|
| Supabase Edge Functions | Lovable Cloud (Supabase) secrets | `Deno.env.get(...)` |
| Cloudflare Workers (router, capture-agent, mcp-agent, assistant-agent, beta-onboarding-agent) | **Cloudflare Secrets Store** | `[[secrets_store_secrets]]` bindings → `env.NAME` |
| CI / scripts | `CLOUDFLARE_API_TOKEN` repo secret | Cloudflare API |
| Connector keys (Google, ElevenLabs, Firecrawl) | **Lovable Connectors UI** | Auto-injected by gateway |

The Secrets Store is a **mirror** of Supabase secrets — it does not change runtime
behaviour for edge functions. Workers consume the store directly (zero-latency
binding, no API call on cold start).

## One-time provisioning

1. Create `.env.secrets` at the repo root (gitignored). Fill it with current
   values pulled from **Lovable Cloud → Project Settings → Secrets**:
   ```
   CLOUDFLARE_API_TOKEN=...
   R2_ACCOUNT_ID=...
   SUPABASE_SERVICE_ROLE_KEY=...
   OPENAI_API_KEY=...
   # ...everything in scripts/secret-manifest.json
   ```
2. Export the two bootstrap creds in your shell:
   ```bash
   export CLOUDFLARE_API_TOKEN=...
   export R2_ACCOUNT_ID=...
   ```
3. Dry run, then real run:
   ```bash
   node scripts/sync-secrets-to-cloudflare.mjs --dry-run
   node scripts/sync-secrets-to-cloudflare.mjs
   ```
4. The script writes `scripts/.cf-secrets-store.json` with the generated
   `store_id`. Print the wrangler binding snippets:
   ```bash
   node scripts/sync-secrets-to-cloudflare.mjs --print-bindings
   ```
5. Paste the snippet into the relevant `workers/<name>/wrangler.toml` (currently
   only `assistant-agent` consumes a Secrets Store secret — the binding is
   pre-scaffolded as a comment with `REPLACE_WITH_STORE_ID`). Then redeploy that
   worker.

## Rotation

1. Update the secret value in **Lovable Cloud** (or in Cloudflare for the
   `R2_*` / `CLOUDFLARE_API_TOKEN` group — those are CF-canonical).
2. Update `.env.secrets` locally.
3. Re-run `node scripts/sync-secrets-to-cloudflare.mjs` — it patches existing
   secrets in place. Workers using `[[secrets_store_secrets]]` pick up the new
   value on their next request (no redeploy needed).

## Adding a new secret

1. Add `NAME: { "bindings": ["worker-a", "worker-b"], "canonical": "supabase" }`
   to `scripts/secret-manifest.json`.
2. Add the value to `.env.secrets`.
3. Run the sync script.
4. Run `--print-bindings` and paste new entries into the listed workers'
   `wrangler.toml`.

## CI

`.github/workflows/sync-secrets.yml` exposes a manual `workflow_dispatch` trigger
that runs the sync script using the repo's `CLOUDFLARE_API_TOKEN` and a
GitHub-Actions secret named `ENV_SECRETS_DOTENV` (multi-line value matching the
local `.env.secrets` format). Use this for hands-off rotations.

## Out of scope

- **Connector-managed keys** (Google Drive/Sheets/Mail, ElevenLabs, Firecrawl)
  are owned by the Lovable connector gateway and rotated through the Lovable
  Connectors UI. They are listed under `excluded` in the manifest.
- **Runtime fetch from CF in Supabase Edge Functions** — explicitly rejected;
  would add cold-start latency and a bootstrap-token problem.
