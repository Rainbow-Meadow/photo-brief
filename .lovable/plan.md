# Execute the secrets sync end-to-end

All in-scope secrets except 3 (`SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEYS`, `SUPABASE_SECRET_KEYS`, `SUPABASE_JWKS`) are already present as env vars in this sandbox. I can run the full provisioning without you having to paste anything into `.env.secrets`.

## Steps I'll run

1. **Teach the sync script to read sandbox env directly** when `.env.secrets` is absent (small `--from-env` flag). Map `SUPABASE_ANON_KEY ← VITE_SUPABASE_ANON_KEY` as a fallback so we capture it too.
2. **Dry run** against the Cloudflare API: prints the planned create/update for each secret without writing.
3. **Real run**: creates the `photobrief-prod` Secrets Store under account `R2_ACCOUNT_ID`, then upserts each available secret. Persists the generated `store_id` to `scripts/.cf-secrets-store.json`.
4. **Patch `workers/assistant-agent/wrangler.toml`** — uncomment the `[[secrets_store_secrets]]` block and substitute the real `store_id` so the only worker that consumes a Secrets Store binding (`SUPABASE_SERVICE_ROLE_KEY`) ships correctly on the next deploy.
5. **Verify** by listing the store contents through the CF API (`GET /accounts/{id}/secrets_store/stores/{store_id}/secrets`) and counting against the manifest. Report which 3–4 secrets were skipped and where to paste them later.

## What I won't do

- Won't deploy the assistant-agent worker — the binding edit is the last manual touchpoint, and you should redeploy it on your next worker deploy cycle.
- Won't write the four absent secrets (`SUPABASE_PUBLISHABLE_KEYS`, `SUPABASE_SECRET_KEYS`, `SUPABASE_JWKS`, possibly `SUPABASE_ANON_KEY` if the VITE alias isn't acceptable). I'll leave them as gaps in the report; you can either paste them into `.env.secrets` and re-run, or use the GitHub Action workflow with `ENV_SECRETS_DOTENV` containing just those three.

## Risk

- Idempotent: re-running the script PATCHes existing secrets in place, no duplication.
- The Secrets Store is created fresh and isolated; no existing CF resources are touched.
- No `wrangler deploy` happens automatically — Worker behaviour does not change until you redeploy.
