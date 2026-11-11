/**
 * Upload sample profile + document to Neon buckets (same buckets as Add Student UI).
 * Does not print credentials. Lists objects after upload.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Files } from 'files-sdk';
import { neon } from 'files-sdk/neon';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, 'apps/api/.env');

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
  process.env[key] = val;
}

const stamp = Date.now();
const photoKey = `demo/${stamp}-profile.png`;
const docKey = `demo/${stamp}-admission.pdf`;

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
const PDF = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n%%EOF\n';

const publicBucket = process.env.S3_BUCKET_PUBLIC ?? 'nestora-student-profiles';
const privateBucket = process.env.S3_BUCKET_PRIVATE ?? 'nestora-student-documents';

const publicFiles = new Files({ adapter: neon({ bucket: publicBucket }) });
const privateFiles = new Files({ adapter: neon({ bucket: privateBucket }) });

console.log(`Uploading profile → ${publicBucket} / ${photoKey}`);
await publicFiles.upload(photoKey, PNG, { contentType: 'image/png' });

console.log(`Uploading document → ${privateBucket} / ${docKey}`);
await privateFiles.upload(docKey, PDF, { contentType: 'application/pdf' });

console.log('\nObjects in public bucket (demo/):');
for (const o of await publicFiles.list({ prefix: 'demo/' })) {
  console.log(`  ${o.key} (${o.size ?? '?'} bytes)`);
}

console.log('\nObjects in private bucket (demo/):');
for (const o of await privateFiles.list({ prefix: 'demo/' })) {
  console.log(`  ${o.key} (${o.size ?? '?'} bytes)`);
}

const text = await (await privateFiles.download(docKey)).text();
console.log('\nRead-back document (first line):', text.split('\n')[0]);
console.log('\nDone. Keys for registration (if using API):');
console.log('  profilePhotoObjectKey:', photoKey);
console.log('  documentObjectKey:', docKey);
