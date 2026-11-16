#!/usr/bin/env node
/**
 * Production go-live helper: Neon migrate → optional admin:init → API health check.
 *
 * Prerequisites:
 *   packages/database/.env with DATABASE_URL + DIRECT_DATABASE_URL (Neon)
 *
 * Usage:
 *   node scripts/production-bootstrap.mjs
 *   ADMIN_INIT_EMAIL=you@university.edu API_URL=https://nestora-ptgf.onrender.com node scripts/production-bootstrap.mjs
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dbEnvPath = resolve(root, 'packages/database/.env');

function run(cmd, opts = {}) {
  console.log(`\n→ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: root, ...opts });
}

function loadDatabaseEnv() {
  if (!existsSync(dbEnvPath)) {
    console.error(`Missing ${dbEnvPath}. Copy packages/database/.env.example and set Neon URLs.`);
    process.exit(1);
  }
  const text = readFileSync(dbEnvPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

async function adminExists() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const count = await prisma.user.count({
      where: { role: 'UNIVERSITY_ADMINISTRATOR', status: 'ACTIVE' },
    });
    return count > 0;
  } finally {
    await prisma.$disconnect();
  }
}

loadDatabaseEnv();

console.log('Step 1/3 — Apply Prisma migrations to Neon');
run('pnpm --filter @nestora/database db:migrate:deploy', {
  env: process.env,
});

const initEmail = process.env.ADMIN_INIT_EMAIL?.trim();
console.log('\nStep 2/3 — Initial University Administrator');
if (!initEmail) {
  console.log('  Skipped: set ADMIN_INIT_EMAIL to create a new INACTIVE admin (activation link printed).');
} else if (await adminExists()) {
  console.log('  Skipped: at least one ACTIVE UNIVERSITY_ADMINISTRATOR already exists.');
} else {
  const webUrl = process.env.WEB_URL ?? 'http://localhost:3000';
  const safeEmail = initEmail.replace(/"/g, '');
  run(`pnpm --filter @nestora/database admin:init -- --email "${safeEmail}"`, {
    env: { ...process.env, WEB_URL: webUrl },
  });
}

const apiUrl = (process.env.API_URL ?? '').trim();
console.log('\nStep 3/3 — API health check');
if (!apiUrl) {
  console.log('  Skipped: set API_URL (e.g. https://nestora-ptgf.onrender.com) after Render deploy.');
  console.log('\nRender: Dashboard → New Blueprint → select render.yaml → fill env → wait for deploy.');
  console.log('Then: API_URL=https://<your-service>.onrender.com node scripts/verify-api-health.mjs');
  process.exit(0);
}

run(`node scripts/verify-api-health.mjs`, { env: { ...process.env, API_URL: apiUrl } });
console.log('\nBootstrap complete.');