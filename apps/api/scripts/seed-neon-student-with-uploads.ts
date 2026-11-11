import { randomUUID } from 'node:crypto';
import { Files } from 'files-sdk';
import { neon } from 'files-sdk/neon';
import { prisma } from '@nestora/database';
import { loadEnv } from '../src/config/env.js';
import * as studentsService from '../src/modules/students/students.service.js';

const env = loadEnv(process.env);

const admin = await prisma.user.findFirst({
  where: { role: 'UNIVERSITY_ADMINISTRATOR', status: 'ACTIVE' },
  orderBy: { createdAt: 'asc' },
});

if (!admin) {
  console.error('No ACTIVE University Administrator. Activate an admin account first.');
  process.exit(1);
}

const stamp = Date.now();
const folder = randomUUID();
const photoKey = `${folder}/profile.png`;
const docKey = `${folder}/admission.pdf`;

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGBg+A8AAQUBAZY8pAAAAABJRU5ErkJggg==',
  'base64',
);
const PDF = Buffer.from(
  `%PDF-1.4\n% Demo admission ${stamp}\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n%%EOF\n`,
);

await new Files({ adapter: neon({ bucket: env.S3_BUCKET_PUBLIC }) }).upload(photoKey, PNG, {
  contentType: 'image/png',
});
await new Files({ adapter: neon({ bucket: env.S3_BUCKET_PRIVATE }) }).upload(docKey, PDF, {
  contentType: 'application/pdf',
});

const body = {
  firstName: 'Aarav',
  lastName: `NeonDemo${stamp}`,
  dateOfBirth: '2004-03-12',
  gender: 'Male' as const,
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

console.log('Student userId:', result.userId);
console.log('Registration:', result.registrationNumber);
console.log('Profile key (public):', photoKey);
console.log('Document key (private):', docKey);
console.log('Console: Neon → Object Storage → nestora-student-profiles / nestora-student-documents');

await prisma.$disconnect();
