#!/usr/bin/env bash
set -euo pipefail

printf '\n==> Installing PhotoBrief dependencies...\n'
npm ci

if [ ! -f .env ]; then
  cp .env.example .env
  printf '\n==> Created .env from .env.example. Fill in real local values before testing Supabase-backed flows.\n'
else
  printf '\n==> Existing .env found; leaving it untouched.\n'
fi

printf '\n==> Installing Supabase CLI...\n'
npm install --global supabase@latest

printf '\n==> Installing Wrangler CLI...\n'
npm install --global wrangler@latest

printf '\n==> Running fast validation checks...\n'
npm run lint
npm run typecheck
npm test
npm run hosting:validate
npm run functions:check

printf '\nCodespace bootstrap complete. Run npm run dev -- --host 0.0.0.0 to start the app.\n'
