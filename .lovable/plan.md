# Sync remaining 3 secrets to Cloudflare Secrets Store

## Context

Previous sync pushed 17/20 manifest entries to store `default_secrets_store` (`c6c05c6c4b8747e18e31a3f88c5781a4`). Three were skipped because they were not present in the sandbox env:

- `SUPABASE_PUBLISHABLE_KEYS`
- `SUPABASE_SECRET_KEYS`
- `SUPABASE_JWKS`

These exist in the project's Supabase secrets list, but are not exposed as sandbox env vars, and the sync script reads from `process.env` (via `--from-env`) or a local `.env.secrets` file. I cannot read your local file from here, so you need to supply the values once.

## Blocker — need values from you

Pick one of the two paths below. **The plan can't execute until values are available to the script.**

**Option A — Paste into a temporary `.env.secrets` (preferred for one-off):**
You provide the three values in chat (or via the secret form) and I write them to `.env.secrets` (already gitignored), run the sync, then delete the file.

**Option B — Run the GitHub Action:**
You trigger `.github/workflows/sync-secrets.yml` manually with `ENV_SECRETS_DOTENV` containing only:
```
SUPABASE_PUBLISHABLE_KEYS=...
SUPABASE_SECRET_KEYS=...
SUPABASE_JWKS=...
```
No further action from me is needed.

## Execution steps (Option A)

1. Write the three `KEY=VALUE` lines to `./.env.secrets`.
2. Dry-run filtered to the three names:
   ```
   node scripts/sync-secrets-to-cloudflare.mjs --dry-run \
     --only=SUPABASE_PUBLISHABLE_KEYS,SUPABASE_SECRET_KEYS,SUPABASE_JWKS
   ```
   (Add `--only` support if not present — small flag, ~5 lines.) If `--only` exists, use it; otherwise run unfiltered — the sync is idempotent and will skip the 17 already-present secrets unless their values changed.
3. Live run (same flags minus `--dry-run`).
4. Verify via Cloudflare API that all 20 manifest names exist in store `c6c05c6c4b8747e18e31a3f88c5781a4`; report counts.
5. Delete `./.env.secrets`.

## Out of scope

- No worker `wrangler.toml` edits (these 3 entries have empty `bindings: []` in the manifest, so no worker binding to wire up).
- No `wrangler deploy`.
- No rotation of existing 17 secrets.

## What I need from you to proceed

Tell me which option (A or B), and if A, share the three values (use the secret-input form when I request it — I will not log or echo them).
