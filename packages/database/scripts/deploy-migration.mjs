#!/usr/bin/env node
/**
 * Applies Prisma migrations to PostgreSQL (Neon or local).
 * Strips channel_binding from DATABASE_URL — it often breaks Prisma/Node TLS on Neon.
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(packageRoot, '.env');

/** Shell-provided URLs must win over packages/database/.env (incl. DIRECT_DATABASE_URL). */
const explicitDatabaseUrl = process.env.DATABASE_URL;
const explicitDirectUrl = process.env.DIRECT_DATABASE_URL;

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return;
  }
  const text = readFileSync(path, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function normalizeDatabaseUrl(url) {
  if (!url) {
    return url;
  }
  return url
    .replace(/([?&])channel_binding=require&/g, '$1')
    .replace(/([?&])channel_binding=require$/g, '')
    .replace(/\?&/, '?')
    .replace(/\?$/, '');
}

loadEnvFile(envPath);

if (explicitDatabaseUrl !== undefined) {
  process.env.DATABASE_URL = explicitDatabaseUrl;
  if (explicitDirectUrl === undefined) {
    process.env.DIRECT_DATABASE_URL = explicitDatabaseUrl;
  }
}
if (explicitDirectUrl !== undefined) {
  process.env.DIRECT_DATABASE_URL = explicitDirectUrl;
}

const direct = normalizeDatabaseUrl(process.env.DIRECT_DATABASE_URL);
const primary = normalizeDatabaseUrl(process.env.DATABASE_URL);

if (direct) {
  process.env.DIRECT_DATABASE_URL = direct;
}
if (primary) {
  process.env.DATABASE_URL = primary;
}

// Migrations must use the non-pooler host on Neon.
if (!process.env.DIRECT_DATABASE_URL && process.env.DATABASE_URL?.includes('-pooler.')) {
  process.env.DIRECT_DATABASE_URL = process.env.DATABASE_URL.replace('-pooler.', '.');
  process.env.DATABASE_URL = process.env.DIRECT_DATABASE_URL;
  console.warn(
    'DATABASE_URL pointed at Neon pooler; using direct host for migrate deploy.',
  );
}

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is missing. Copy packages/database/.env.example to packages/database/.env and set your Neon connection string.',
  );
  process.exit(1);
}

if (!process.env.DIRECT_DATABASE_URL) {
  process.env.DIRECT_DATABASE_URL = process.env.DATABASE_URL;
}

const schema = join(packageRoot, 'prisma', 'schema.prisma');

console.log('Applying migrations…');
execSync(`pnpm exec prisma migrate deploy --schema "${schema}"`, {
  cwd: packageRoot,
  stdio: 'inherit',
  env: process.env,
});

console.log('Migration status:');
execSync(`pnpm exec prisma migrate status --schema "${schema}"`, {
  cwd: packageRoot,
  stdio: 'inherit',
  env: process.env,
});
