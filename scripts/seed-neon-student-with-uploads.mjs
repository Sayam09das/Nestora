/**
 * Admin-less dev helper: uploads to Neon buckets, then creates a student via API service
 * (uses first ACTIVE University Administrator in DB as actor).
 * Run from repo root: node --env-file=apps/api/.env --import tsx/esm scripts/seed-neon-student-with-uploads.mjs
 */
import { randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Files } from 'files-sdk';
import { neon } from 'files-sdk/neon';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

const { prisma } = await import('@nestora/database');
const { loadEnv } = await import('../apps/api/src/config/env.js');
const studentsService = await import('../apps/api/src/modules/students/students.service.js');

const env = loadEnv(process.env);

const admin = await prisma.user.findFirst({
  where: { role: 'UNIVERSITY_ADMINISTRATOR', status: 'ACTIVE' },
  orderBy: { createdAt: 'asc' },
});

if (!admin) {
  console.error('No ACTIVE University Administrator found. Log in as admin via the UI first.');
  process.exit(1);
}

const stamp = Date.now();
const folder = randomUUID();
const publicBucket = env.S3_BUCKET_PUBLIC;
const privateBucket = env.S3_BUCKET_PRIVATE;
const photoKey = `${folder}/profile.png`;
const docKey = `${folder}/admission.pdf`;

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGBg+A8AAQUBAZY8pAAAAABJRU5ErkJggg==',
  'base64',
);
const PDF = Buffer.from(
  `%PDF-1.4\n% Demo admission ${stamp}\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n%%EOF\n`,
);

const publicFiles = new Files({ adapter: neon({ bucket: publicBucket }) });
const privateFiles = new Files({ adapter: neon({ bucket: privateBucket }) });

await publicFiles.upload(photoKey, PNG, { contentType: 'image/png' });
await privateFiles.upload(docKey, PDF, { contentType: 'application/pdf' });

const body = {
  firstName: 'Aarav',
  lastName: `NeonDemo${stamp}`,
  dateOfBirth: '2004-03-12',
  gender: 'Male',
  phone: '9123456789',
  contactEmail: `aarav.demo.${stamp}@nestora.test`,
  loginEmail: `aarav.login.${stamp}@nestora.test`,
  registrationNumber: `NEON-${stamp}`,
  admissionDate: '2025-08-01',
  course: 'B.Tech CSE',
  academicYear: '2025',
  college: 'Nestora College',
  fullAddress: '12 Demo Street',
  city: 'Ranchi',
  state: 'Jharkhand',
  pinCode: '834001',
  country: 'India',
  guardianName: 'Demo Guardian',
  relationship: 'Parent',
  guardianPhone: '9123456780',
  profilePhotoObjectKey: photoKey,
  documentUploads: [
    {
      objectKey: docKey,
      fileName: 'admission.pdf',
      mimeType: 'application/pdf',
      fileSize: PDF.length,
    },
  ],
};

const result = await studentsService.registerStudentByAdmin(
  prisma,
  env,
  admin.id,
  admin.role,
  body,
  undefined,
);

console.log('Student created:', result.userId);
console.log('Registration:', result.registrationNumber);
console.log('Profile photo key (public bucket):', photoKey);
console.log('Document key (private bucket):', docKey);

const user = await prisma.user.findUnique({
  where: { id: result.userId },
  select: { profilePhotoKey: true },
});
const docs = await prisma.studentDocument.findMany({
  where: { studentId: result.studentId },
  select: { objectKey: true, fileName: true },
});

console.log('DB profilePhotoKey:', user?.profilePhotoKey ?? '(none)');
console.log('DB documents:', docs.map((d) => d.objectKey).join(', ') || '(none)');

await prisma.$disconnect();
