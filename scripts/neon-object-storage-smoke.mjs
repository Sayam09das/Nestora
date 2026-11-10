/**
 * Smoke test for Neon Object Storage via Files SDK.
 * Run after: neon login && neon link ... && neon deploy
 *
 *   node --env-file=apps/api/.env scripts/neon-object-storage-smoke.mjs
 */
import { Files } from 'files-sdk';
import { neon } from 'files-sdk/neon';

const bucket = process.env.NEON_SMOKE_BUCKET ?? 'uploads';
const key = `smoke/${Date.now()}-nestora.txt`;
const body = `Nestora Neon Object Storage smoke test at ${new Date().toISOString()}\n`;

const files = new Files({ adapter: neon({ bucket }) });

console.log(`Uploading to bucket "${bucket}" key "${key}"...`);
await files.upload(key, body, { contentType: 'text/plain' });

console.log('\nList (prefix smoke/):');
const listed = await files.list({ prefix: 'smoke/' });
for (const item of listed) {
  console.log(`  - ${item.key} (${item.size ?? '?'} bytes)`);
}

const file = await files.download(key);
const text = await file.text();
console.log('\nDownloaded object contents:');
console.log(text);

const exists = await files.exists(key);
console.log(`\nexists("${key}"):`, exists);
console.log('\nSmoke test passed.');
