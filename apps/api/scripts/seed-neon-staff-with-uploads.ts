import { randomUUID } from 'node:crypto';
import { Files } from 'files-sdk';
import { neon } from 'files-sdk/neon';
import { prisma } from '@nestora/database';
import { loadEnv } from '../src/config/env.js';
import * as staffService from '../src/modules/staff/staff.service.js';

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

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGBg+A8AAQUBAZY8pAAAAABJRU5ErkJggg==',
  'base64',
);

const staffPublic = env.S3_BUCKET_STAFF_PUBLIC;
const staffPrivate = env.S3_BUCKET_STAFF_PRIVATE;

const hostel = await prisma.hostel.findFirst({
  where: { isActive: true },
  orderBy: { name: 'asc' },
  select: { name: true },
});

const samples = [
  {
    employeeNumber: `STF-SEED-W${stamp % 1000}`,
    jobTitle: 'Warden',
    department: 'Hostel Operations',
    loginEmail: `warden.seed.${stamp}@nestora.test`,
    firstName: 'Riya',
    lastName: 'Verma',
  },
  {
    employeeNumber: `STF-SEED-S${stamp % 1000}`,
    jobTitle: 'Security Guard',
    department: 'Security',
    loginEmail: `guard.seed.${stamp}@nestora.test`,
    firstName: 'Vikram',
    lastName: 'Singh',
  },
  {
    employeeNumber: `STF-SEED-A${stamp % 1000}`,
    jobTitle: 'Accountant',
    department: 'Finance',
    loginEmail: `accounts.seed.${stamp}@nestora.test`,
    firstName: 'Neha',
    lastName: 'Patel',
  },
] as const;

for (const row of samples) {
  const folder = randomUUID();
  const photoKey = `${folder}/profile.png`;
  const idDocKey = `${folder}/identity.pdf`;
  const PDF = Buffer.from(
    `%PDF-1.4\n% Staff identity ${row.employeeNumber}\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n%%EOF\n`,
  );

  await new Files({ adapter: neon({ bucket: staffPublic }) }).upload(photoKey, PNG, {
    contentType: 'image/png',
  });
  await new Files({ adapter: neon({ bucket: staffPrivate }) }).upload(idDocKey, PDF, {
    contentType: 'application/pdf',
  });

  const body = {
    firstName: row.firstName,
    lastName: row.lastName,
    dateOfBirth: '1990-06-15',
    phone: '9123456789',
    contactEmail: row.loginEmail,
    loginEmail: row.loginEmail,
    employeeNumber: row.employeeNumber,
    jobTitle: row.jobTitle,
    department: row.department,
    employmentType: 'Full-time',
    joiningDate: '2025-01-10',
    workShift: 'General',
    assignedHostel: hostel?.name,
    fullAddress: '40 Staff Quarters',
    city: 'Ranchi',
    state: 'Jharkhand',
    pinCode: '834001',
    country: 'India',
    emergencyContactName: 'Emergency Contact',
    emergencyRelationship: 'Spouse',
    emergencyContactPhone: '9123456780',
    identityProofType: 'Aadhaar Card',
    identityProofNumber: 'XXXX-XXXX-1234',
    accountStatus: 'Active' as const,
    sendInvitation: false,
    profilePhotoObjectKey: photoKey,
    documentUploads: [
      {
        kind: 'IDENTITY_PROOF' as const,
        objectKey: idDocKey,
        fileName: 'identity.pdf',
        mimeType: 'application/pdf',
        fileSize: PDF.length,
      },
    ],
  };

  const result = await staffService.registerStaffByAdmin(
    prisma,
    env,
    admin.id,
    admin.role,
    body,
    undefined,
  );
  console.log(`${row.jobTitle}:`, result.userId, result.employeeNumber);
}

console.log('Buckets:', staffPublic, staffPrivate);

await prisma.staffProfile.updateMany({
  where: { joiningDate: null, employeeNumber: { startsWith: 'STF-SEED' } },
  data: {
    employmentType: 'Full-time',
    joiningDate: new Date('2025-01-10'),
    identityProofType: 'Aadhaar Card',
    identityProofNumber: 'XXXX-XXXX-1234',
    emergencyContactName: 'Emergency Contact',
    emergencyRelationship: 'Spouse',
    emergencyContactPhone: '9123456780',
    permanentAddress: '40 Staff Quarters\nRanchi, Jharkhand, 834001\nIndia',
  },
});

await prisma.$disconnect();
