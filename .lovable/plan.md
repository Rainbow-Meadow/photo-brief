# Centralize secrets in Cloudflare Secrets Store

Use the existing `CLOUDFLARE_API_TOKEN` to push every Lovable Cloud secret into a single account-level **Cloudflare Secrets Store**, then bind those secrets into each of the 5 Workers via `wrangler.toml`. Supabase remains the runtime source for edge functions; Cloudflare becomes the single source of truth for everything Worker-side and the canonical mirror for ops/rotation.

## Inventory (exportable secrets)

From the project's secret list, in scope:

**Cloudflare / R2 infra**
- `CLOUDFLARE_API_TOKEN`, `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`

**Supabase service**
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PUBLISHABLE_KEYS`, `SUPABASE_SECRET_KEYS`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWKS`, `SUPABASE_DB_URL`

**Third-party / app**
- `OPENAI_API_KEY`, `LOVABLE_API_KEY`, `TURNSTILE_SECRET_KEY`, `INTEGRATION_TOKEN_SECRET`, `GOOGLE_CLIENT_ID`, `FOUNDER_NOTIFY_EMAIL`, `DEMO_WORKSPACE_ID`

**Excluded (cannot export — managed by Lovable connectors):**
`GOOGLE_DRIVE_API_KEY`, `GOOGLE_SHEETS_API_KEY`, `GOOGLE_MAIL_API_KEY`, `ELEVENLABS_API_KEY`, `FIRECRAWL_API_KEY`. These will continue to be injected by the Lovable connector gateway.

## Architecture

```text
                ┌───────────────────────────────┐
                │ Cloudflare Secrets Store      │
                │ store: photobrief-prod        │
                │  ├─ SUPABASE_SERVICE_ROLE_KEY │
                │  ├─ R2_SECRET_ACCESS_KEY      │
                │  ├─ OPENAI_API_KEY  …         │
                └──────────────┬────────────────┘
                               │ [[secrets_store_secrets]] bindings
        ┌──────────┬───────────┼────────────┬────────────────────┐
        ▼          ▼           ▼            ▼                    ▼
  router    capture-agent  mcp-agent  assistant-agent   beta-onboarding-agent
```

Supabase Edge Functions keep reading from `Deno.env` (Lovable Cloud secrets) — the CF Secrets Store is a *mirror*, not a runtime fetch, so we don't add cold-start latency or a bootstrap token.

## Deliverables

### 1. Bootstrap script — `scripts/sync-secrets-to-cloudflare.mjs`

One-shot Node script (run locally or in CI) that:
- Reads the canonical secret list from a new `scripts/secret-manifest.json` (names + which workers should bind each one).
- Pulls current values from Lovable Cloud via `supabase--fetch_secrets` equivalents (in practice: prompts the operator to paste, or reads from a local `.env.secrets` file that is gitignored — the CF API token alone cannot read Lovable secrets).
- Creates the Secrets Store (`POST /accounts/{R2_ACCOUNT_ID}/secrets_store/stores`) named `photobrief-prod` if missing.
- Upserts each secret (`PUT /accounts/{id}/secrets_store/stores/{store_id}/secrets`).
- Idempotent: safe to re-run for rotations.

### 2. `secret-manifest.json`

Single source of truth mapping secret → workers that need it. Example:

```json
{
  "store": "photobrief-prod",
  "secrets": {
    "SUPABASE_SERVICE_ROLE_KEY": ["router", "capture-agent", "assistant-agent", "beta-onboarding-agent", "mcp-agent"],
    "R2_SECRET_ACCESS_KEY":      ["mcp-agent"],
    "R2_ACCESS_KEY_ID":          ["mcp-agent"],
    "OPENAI_API_KEY":            ["capture-agent", "assistant-agent"],
    "LOVABLE_API_KEY":           ["capture-agent", "assistant-agent", "beta-onboarding-agent"],
    "TURNSTILE_SECRET_KEY":      ["router"],
    "INTEGRATION_TOKEN_SECRET":  ["mcp-agent"]
  }
}
```

### 3. Worker `wrangler.toml` updates

Add a `[[secrets_store_secrets]]` block per worker for the secrets that worker needs. Example for `workers/capture-agent/wrangler.toml`:

```toml
[[secrets_store_secrets]]
binding   = "SUPABASE_SERVICE_ROLE_KEY"
store_id  = "<store-id-from-step-1>"
secret_name = "SUPABASE_SERVICE_ROLE_KEY"

[[secrets_store_secrets]]
binding   = "OPENAI_API_KEY"
store_id  = "<store-id>"
secret_name = "OPENAI_API_KEY"
```

Workers read them as `env.SUPABASE_SERVICE_ROLE_KEY` (no code changes needed if names match — verify each worker's current `env.*` access).

### 4. Rotation runbook — `docs/secrets-rotation.md`

- How to rotate a secret (update Lovable Cloud → re-run sync script → CF auto-fans-out to bound workers on next deploy).
- Which secrets are CF-canonical (R2, CF API token) vs Supabase-canonical (everything else).
- Note that connector-managed keys are out of scope and rotated through the Lovable Connectors UI.

### 5. CI hook (optional, deferred)

Add a manual `workflow_dispatch` GitHub Action `.github/workflows/sync-secrets.yml` that runs the script using a repo secret `CLOUDFLARE_API_TOKEN` — for ops to push rotations without local setup.

## Out of scope

- Reading secrets from CF at Worker runtime via API (rejected: Secrets Store bindings are the supported path and are zero-latency).
- Migrating Supabase Edge Functions off Lovable Cloud secrets (no benefit; would add cold-start fetch + a bootstrap token problem).
- Connector-managed keys (Google/ElevenLabs/Firecrawl) — owned by Lovable connector gateway.

## Verification

1. Run script with `--dry-run` → prints planned create/update operations.
2. Run for real → `curl` the CF API to list secrets in the store, confirm count matches manifest.
3. `wrangler deploy --dry-run` per worker → confirms bindings resolve.
4. Deploy one worker (router) → hit a route that uses `TURNSTILE_SECRET_KEY` → confirm 200.
