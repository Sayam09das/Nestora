/**
 * End-to-end: admin login → upload photo + doc via API → register student → list Neon buckets.
 *
 * Usage:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/e2e-student-neon-upload.mjs
 *
 * API must be running on API_URL (default http://localhost:4000) with Neon S3 env in apps/api/.env.
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
    if (!(key in process.env)) process.env[key] = val;
  }
}

const API_URL = (process.env.API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (admin must be ACTIVE with a real password).');
  process.exit(1);
}

if (!process.env.AWS_ENDPOINT_URL_S3) {
  console.error('Neon storage not configured in apps/api/.env (missing AWS_ENDPOINT_URL_S3).');
  process.exit(1);
}

const jar = new Map();

function parseSetCookie(headers) {
  const getSetCookie = headers.getSetCookie?.bind(headers);
  const cookies = getSetCookie ? getSetCookie() : [headers.get('set-cookie')].filter(Boolean);
  for (const raw of cookies) {
    if (!raw) continue;
    const part = raw.split(';')[0];
    const i = part.indexOf('=');
    if (i > 0) jar.set(part.slice(0, i), part.slice(i + 1));
  }
}

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}

async function apiJson(method, path, body, csrf) {
  const headers = {
    Accept: 'application/json',
    'X-Nestora-Requested-With': 'XMLHttpRequest',
  };
  if (csrf) headers['X-CSRF-Token'] = csrf;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  parseSetCookie(res.headers);
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

async function apiMultipart(path, file, csrf) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'X-Nestora-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Token': csrf,
      Cookie: cookieHeader(),
    },
    body: form,
  });
  parseSetCookie(res.headers);
  return res.json();
}

// 1x1 PNG
const PNG_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const stamp = Date.now();
const studentPayload = {
  firstName: 'Neon',
  lastName: `Test${stamp}`,
  dateOfBirth: '2004-06-15',
  gender: 'Male',
  phone: '9876543210',
  contactEmail: `neon.test.${stamp}@example.com`,
  loginEmail: `neon.login.${stamp}@example.com`,
  registrationNumber: `ROLL-${stamp}`,
  admissionDate: '2025-08-01',
  course: 'B.Tech CSE',
  academicYear: '2025',
  fullAddress: '42 Test Lane',
  city: 'Ranchi',
  state: 'Jharkhand',
  pinCode: '834001',
  country: 'India',
  guardianName: 'Guardian Test',
  relationship: 'Parent',
  guardianPhone: '9876543211',
};

console.log('Logging in as admin...');
const login = await apiJson('POST', '/api/v1/auth/login', { email, password });
if (!login.json.success) {
  console.error('Login failed:', login.json.error?.message ?? login.res.status);
  process.exit(1);
}

const csrfRes = await fetch(`${API_URL}/api/v1/auth/csrf-token`, {
  headers: { Cookie: cookieHeader(), Accept: 'application/json' },
});
parseSetCookie(csrfRes.headers);
const csrfJson = await csrfRes.json();
const csrf = csrfJson?.data?.csrfToken;
if (!csrf) {
  console.error('CSRF token missing');
  process.exit(1);
}

console.log('Uploading profile photo to API (→ Neon public bucket)...');
const photoFile = new File([PNG_BYTES], 'profile.png', { type: 'image/png' });
const photoJson = await apiMultipart('/api/v1/uploads/student-profile', photoFile, csrf);
if (!photoJson.success) {
  console.error('Photo upload failed:', photoJson.error?.message);
  process.exit(1);
}
const photoKey = photoJson.data.upload.objectKey;
console.log('  objectKey:', photoKey);

console.log('Uploading document to API (→ Neon private bucket)...');
// API only allows jpg/png/pdf — use minimal pdf header stub
const pdfFile = new File(
  ['%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n%%EOF\n'],
  'admission.pdf',
  { type: 'application/pdf' },
);
const docJson = await apiMultipart('/api/v1/uploads/student-document', pdfFile, csrf);
if (!docJson.success) {
  console.error('Document upload failed:', docJson.error?.message);
  process.exit(1);
}
const docKey = docJson.data.upload.objectKey;
console.log('  objectKey:', docKey);

console.log('Registering student...');
const reg = await apiJson(
  'POST',
  '/api/v1/students/register',
  {
    ...studentPayload,
    profilePhotoObjectKey: photoKey,
    documentUploads: [
      {
        objectKey: docKey,
        fileName: docJson.data.upload.fileName,
        mimeType: docJson.data.upload.mimeType,
        fileSize: docJson.data.upload.sizeBytes,
      },
    ],
  },
  csrf,
);
if (!reg.json.success) {
  console.error('Register failed:', reg.json.error?.message);
  process.exit(1);
}
console.log('Student userId:', reg.json.data.student.userId);

const publicBucket = process.env.S3_BUCKET_PUBLIC ?? 'nestora-student-profiles';
const privateBucket = process.env.S3_BUCKET_PRIVATE ?? 'nestora-student-documents';

async function assertInBucket(bucket, key) {
  const files = new Files({ adapter: neon({ bucket }) });
  const ok = await files.exists(key);
  console.log(`  exists(${bucket}, ${key}):`, ok);
  return ok;
}

console.log('\nVerifying objects in Neon (not local disk)...');
const pubOk = await assertInBucket(publicBucket, photoKey);
const privOk = await assertInBucket(privateBucket, docKey);

if (pubOk && privOk) {
  console.log('\nSUCCESS: Photo and document are in Neon Object Storage buckets.');
} else {
  console.error('\nFAIL: Object missing in bucket — check STORAGE_DRIVER and AWS_* in apps/api/.env');
  process.exit(1);
}
