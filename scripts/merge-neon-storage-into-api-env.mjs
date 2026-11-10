/**
 * Merge Neon storage-related keys from a pulled env file into apps/api/.env
 * without touching DATABASE_URL, SMTP, COOKIE_SECRET, etc.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(root, process.env.NEON_ENV_SOURCE ?? '.env.neon-pulled');
const targetPath = resolve(root, 'apps/api/.env');

const STORAGE_KEYS = new Set([
  'STORAGE_DRIVER',
  'S3_BUCKET_PUBLIC',
  'S3_BUCKET_PRIVATE',
  'S3_BUCKET_NAME',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_ENDPOINT_URL_S3',
  'AWS_REGION',
  'S3_REGION',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
]);

function parseEnv(content) {
  const map = new Map();
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    map.set(trimmed.slice(0, eq).trim(), trimmed.slice(eq + 1).trim());
  }
  return map;
}

if (!existsSync(sourcePath)) {
  console.error(`Missing ${sourcePath}. Run: npx neon env pull --file .env.neon-pulled`);
  process.exit(1);
}
if (!existsSync(targetPath)) {
  console.error(`Missing ${targetPath}`);
  process.exit(1);
}

const pulled = parseEnv(readFileSync(sourcePath, 'utf8'));
const targetLines = readFileSync(targetPath, 'utf8').split('\n');
const seen = new Set();

const merged = targetLines.map((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return line;
  const eq = trimmed.indexOf('=');
  if (eq === -1) return line;
  const key = trimmed.slice(0, eq).trim();
  if (STORAGE_KEYS.has(key) && pulled.has(key)) {
    seen.add(key);
    return `${key}=${pulled.get(key)}`;
  }
  return line;
});

for (const key of STORAGE_KEYS) {
  if (pulled.has(key) && !seen.has(key) && !merged.some((l) => l.startsWith(`${key}=`))) {
    merged.push(`${key}=${pulled.get(key)}`);
    seen.add(key);
  }
}

if (pulled.has('AWS_ENDPOINT_URL_S3')) {
  const idx = merged.findIndex((l) => l.startsWith('STORAGE_DRIVER='));
  if (idx >= 0) {
    merged[idx] = 'STORAGE_DRIVER=neon';
  } else {
    merged.push('STORAGE_DRIVER=neon');
  }
  seen.add('STORAGE_DRIVER');
}

writeFileSync(targetPath, `${merged.join('\n').replace(/\n*$/, '')}\n`);
console.log(`Merged storage keys into apps/api/.env: ${[...seen].sort().join(', ')}`);
if (!seen.has('AWS_ENDPOINT_URL_S3')) {
  console.warn('Warning: AWS_ENDPOINT_URL_S3 was not in the pulled file.');
}
