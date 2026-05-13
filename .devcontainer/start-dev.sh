#!/usr/bin/env bash
set -euo pipefail

if [ "${CODESPACES:-}" != "true" ]; then
  exit 0
fi

cat <<'MSG'

PhotoBrief Codespace ready.

Common commands:
  npm run dev -- --host 0.0.0.0    Start the Vite app
  npm run lint                     Run ESLint
  npm run typecheck                Run TypeScript checks
  npm test                         Run Vitest
  npm run hosting:validate          Validate hosting assumptions
  npm run functions:check           Check Supabase Edge Functions
  supabase start                    Start local Supabase stack
  npx wrangler dev                  Run a Cloudflare Worker locally from its worker directory

Environment:
  .env was created from .env.example if it did not already exist.
  Use Codespaces secrets or edit .env locally for non-production values.
  Never commit real .env files.

MSG
