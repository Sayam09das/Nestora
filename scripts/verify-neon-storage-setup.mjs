/**
 * Verify Neon link, buckets, and apps/api/.env storage vars (no secret values printed).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contextPath = existsSync(resolve(root, '.neon/context.json'))
  ? resolve(root, '.neon/context.json')
  : resolve(root, '.neon');
const apiEnv = resolve(root, 'apps/api/.env');

const requiredVars = [
  'STORAGE_DRIVER',
  'S3_BUCKET_PUBLIC',
  'S3_BUCKET_PRIVATE',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_ENDPOINT_URL_S3',
  'AWS_REGION',
];

const buckets = [
  'nestora-student-profiles',
  'nestora-student-documents',
  'nestora-staff-profiles',
  'nestora-staff-documents',
  'uploads',
];

console.log('=== neon.ts buckets (expected) ===');
console.log('  nestora-student-profiles (public_read)');
console.log('  nestora-student-documents (private)');
console.log('  uploads (private)');

console.log('\n=== Project link (.neon/context.json) ===');
if (!existsSync(contextPath)) {
  console.log('  MISSING — run: npx neon link --project-id young-thunder-95270917 --branch production');
} else {
  const ctx = JSON.parse(readFileSync(contextPath, 'utf8'));
  const pid = ctx.project_id ?? ctx.projectId ?? ctx.project;
  const branchName = ctx.branch_id ?? ctx.branchId ?? ctx.branch;
  console.log(`  project: ${pid ?? '(unknown)'}`);
  console.log(`  branch: ${branchName ?? '(unknown)'}`);
  const ok = String(pid) === 'young-thunder-95270917';
  console.log(`  matches young-thunder-95270917: ${ok ? 'yes' : 'CHECK MANUALLY'}`);
}

console.log('\n=== apps/api/.env storage vars (set / missing only) ===');
if (!existsSync(apiEnv)) {
  console.log('  apps/api/.env not found');
} else {
  const lines = readFileSync(apiEnv, 'utf8');
  for (const key of requiredVars) {
    const re = new RegExp(`^${key}=(.+)$`, 'm');
    const m = lines.match(re);
    const val = m?.[1]?.trim() ?? '';
    const set = val.length > 0 && val !== '""' && val !== "''";
    console.log(`  ${key}: ${set ? 'set' : 'MISSING'}`);
  }
}

console.log('\n=== Neon CLI bucket list ===');
try {
  const out = execSync('npx neon@latest bucket list -o json', {
    cwd: root,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const data = JSON.parse(out);
  const names = (Array.isArray(data) ? data : data.buckets ?? []).map(
    (b) => b.name ?? b.bucket_name ?? b,
  );
  for (const name of buckets) {
    console.log(`  ${name}: ${names.includes(name) ? 'exists' : 'NOT FOUND'}`);
  }
} catch (e) {
  const msg = e.stderr?.toString() || e.message;
  console.log('  Could not list buckets (login/link/deploy may be required).');
  console.log(`  ${msg.split('\n')[0]}`);
}
