/**
 * List objects in student profile + document buckets (Neon Object Storage).
 * Requires Neon Object Storage vars in apps/api/.env (AWS_* from neon env pull) — no secrets printed.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Files } from 'files-sdk';
import { neon } from 'files-sdk/neon';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, 'apps/api/.env');

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
}

const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_ENDPOINT_URL_S3', 'AWS_REGION'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error('Neon Object Storage env vars missing in apps/api/.env:', missing.join(', '));
  console.error('Run: npx neon login && npx neon link --project-id young-thunder-95270917 --branch production');
  console.error('Then: npx neon deploy && npx neon env pull');
  console.error('Merge Neon storage vars into apps/api/.env and set STORAGE_DRIVER=neon.');
  process.exit(1);
}

const buckets = [
  process.env.S3_BUCKET_PUBLIC ?? 'nestora-student-profiles',
  process.env.S3_BUCKET_PRIVATE ?? 'nestora-student-documents',
];

for (const bucket of buckets) {
  console.log(`\n=== Bucket: ${bucket} ===`);
  const files = new Files({ adapter: neon({ bucket }) });
  try {
    const listed = await files.list({ limit: 50 });
    const items = listed.items ?? [];
    if (!items.length) {
      console.log('(empty)');
      continue;
    }
    for (const obj of items) {
      console.log(`  ${obj.key}  ${obj.size ?? '?'} bytes`);
    }
  } catch (err) {
    console.error('List failed:', err instanceof Error ? err.message : err);
  }
}
