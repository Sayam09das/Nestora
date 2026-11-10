#!/usr/bin/env bash
# Provision Neon Object Storage buckets for Nestora (run after `npx neon login`).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_ID="young-thunder-95270917"
BRANCH="production"

echo "Linking project ${PROJECT_ID} branch ${BRANCH}..."
npx neon@latest link --project-id "$PROJECT_ID" --branch "$BRANCH"

echo "Config status:"
npx neon@latest config status

echo "Applying neon.ts (deploy)..."
npx neon@latest deploy

echo "Pulling env to .env.neon-pulled (storage + postgres vars)..."
npx neon@latest env pull --file .env.neon-pulled

echo "Merging storage keys into apps/api/.env..."
pnpm neon:merge-api-env

echo "Buckets:"
npx neon@latest bucket list

echo "Verification (no secrets printed):"
pnpm neon:verify-setup
