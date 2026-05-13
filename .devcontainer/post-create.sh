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

cat <<'MSG'

Codespace bootstrap complete.

Start the app:
  npm run dev:codespaces

Run local checks before a PR:
  npm run check

Run the heavier CI-style build locally:
  npm run check:ci-local

MSG
