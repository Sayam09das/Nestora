/**
 * Seeds 2 wardens + 14 staff (16 total) with Neon avatars & documents.
 *   pnpm --filter @nestora/api seed:neon-workforce-roster
 */
import { randomUUID } from 'node:crypto';
import { Files } from 'files-sdk';
import { neon } from 'files-sdk/neon';
import { prisma } from '@nestora/database';
import * as argon2 from 'argon2';
import { loadEnv } from '../src/config/env.js';
import { argon2ParamsFromEnv } from '../src/modules/auth/password.service.js';
import * as staffService from '../src/modules/staff/staff.service.js';

const env = loadEnv(process.env);
const SEED_PASSWORD = 'NestoraStaff@2026!';

type WorkforceRow = {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  assignedHostel?: string;
  emailLocal: string;
  phoneSuffix: string;
};

const WORKFORCE: WorkforceRow[] = [
  {
    employeeNumber: 'WRD-2026-001',
    firstName: 'Amitabh',
    lastName: 'Roy',
    jobTitle: 'Chief Warden',
    department: 'Hostel Operations',
    assignedHostel: 'Boys Hostel A',
    emailLocal: 'amitabh.roy',
    phoneSuffix: '01',
  },
  {
    employeeNumber: 'WRD-2026-002',
    firstName: 'Suman',
    lastName: 'Chatterjee',
    jobTitle: 'Assistant Warden',
    department: 'Hostel Operations',
    assignedHostel: 'Girls Hostel B',
    emailLocal: 'suman.chatterjee',
    phoneSuffix: '02',
  },
  {
    employeeNumber: 'STF-ADM-001',
    firstName: 'Priya',
    lastName: 'Naskar',
    jobTitle: 'Administrative Officer',
    department: 'Administration',
    assignedHostel: 'Boys Hostel A',
    emailLocal: 'priya.naskar',
    phoneSuffix: '03',
  },
  {
    employeeNumber: 'STF-ADM-002',
    firstName: 'Rohit',
    lastName: 'Banerjee',
    jobTitle: 'Administrative Officer',
    department: 'Administration',
    assignedHostel: 'Girls Hostel B',
    emailLocal: 'rohit.banerjee',
    phoneSuffix: '04',
  },
  ...['Anil', 'Vikash', 'Manoj', 'Deepak', 'Sanjay', 'Ravi'].map((first, i) => ({
    employeeNumber: `STF-SEC-${String(i + 1).padStart(2, '0')}`,
    firstName: first,
    lastName: ['Singh', 'Yadav', 'Kumar', 'Das', 'Pandey', 'Mandal'][i]!,
    jobTitle: 'Security Guard',
    department: 'Security',
    assignedHostel: i % 2 === 0 ? 'Boys Hostel A' : 'Girls Hostel B',
    emailLocal: `${first.toLowerCase()}.${['singh', 'yadav', 'kumar', 'das', 'pandey', 'mandal'][i]}`,
    phoneSuffix: String(10 + i).padStart(2, '0'),
  })),
  ...['Lakshmi', 'Sunita', 'Meena', 'Anjali'].map((first, i) => ({
    employeeNumber: `STF-HKP-${String(i + 1).padStart(2, '0')}`,
    firstName: first,
    lastName: ['Devi', 'Soren', 'Horo', 'Kerketta'][i]!,
    jobTitle: 'Housekeeping Staff',
    department: 'Housekeeping',
    assignedHostel: i < 2 ? 'Boys Hostel A' : 'Girls Hostel B',
    emailLocal: `${first.toLowerCase()}.hk`,
    phoneSuffix: String(20 + i).padStart(2, '0'),
  })),
  {
    employeeNumber: 'STF-MNT-001',
    firstName: 'Prakash',
    lastName: 'Mahato',
    jobTitle: 'Maintenance Technician',
    department: 'Maintenance',
    assignedHostel: 'Boys Hostel A',
    emailLocal: 'prakash.mahato',
    phoneSuffix: '25',
  },
  {
    employeeNumber: 'STF-MNT-002',
    firstName: 'Dilip',
    lastName: 'Topno',
    jobTitle: 'Maintenance Technician',
    department: 'Maintenance',
    assignedHostel: 'Girls Hostel B',
    emailLocal: 'dilip.topno',
    phoneSuffix: '26',
  },
];

const FALLBACK_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

async function fetchAvatarPng(name: string): Promise<Buffer> {
  const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=0D542F&color=ffffff&bold=true&format=png`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return FALLBACK_PNG;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return FALLBACK_PNG;
  }
}

async function purgeDemoWorkforce(): Promise<number> {
  const demos = await prisma.user.findMany({
    where: {
      role: { in: ['HOSTEL_WARDEN', 'HOSTEL_STAFF', 'SECURITY_GUARD', 'ACCOUNTANT'] },
      OR: [
        { email: { contains: '.seed.', mode: 'insensitive' } },
        { staffProfile: { employeeNumber: { startsWith: 'STF-SEED' } } },
      ],
    },
    select: { id: true, email: true, staffProfile: { select: { id: true } } },
  });
  for (const u of demos) {
    await prisma.user.delete({ where: { id: u.id } });
    console.log('Removed demo staff:', u.email);
  }
  return demos.length;
}

const admin = await prisma.user.findFirst({
  where: { role: 'UNIVERSITY_ADMINISTRATOR', status: 'ACTIVE' },
  orderBy: { createdAt: 'asc' },
});

if (!admin) {
  console.error('No active university administrator.');
  process.exit(1);
}

const removed = await purgeDemoWorkforce();
console.log(`Purged ${removed} demo staff account(s).`);

const staffPublic = env.S3_BUCKET_STAFF_PUBLIC;
const staffPrivate = env.S3_BUCKET_STAFF_PRIVATE;
let created = 0;
let skipped = 0;

for (const row of WORKFORCE) {
  const exists = await prisma.staffProfile.findUnique({
    where: { employeeNumber: row.employeeNumber },
    select: { id: true },
  });
  if (exists) {
    console.log('Skip (exists):', row.employeeNumber, row.firstName, row.lastName);
    skipped += 1;
    continue;
  }

  const loginEmail = `${row.emailLocal}@nestora.test`;
  const emailTaken = await prisma.user.findUnique({ where: { email: loginEmail }, select: { id: true } });
  if (emailTaken) {
    console.log('Skip (email):', loginEmail);
    skipped += 1;
    continue;
  }

  const displayName = `${row.firstName} ${row.lastName}`;
  const folder = randomUUID();
  const photoKey = `${folder}/profile.png`;
  const identityKey = `${folder}/identity-proof.pdf`;
  const appointmentKey = `${folder}/appointment-letter.pdf`;
  const qualificationKey = `${folder}/qualification.pdf`;

  const avatar = await fetchAvatarPng(displayName);
  const mkPdf = (title: string) =>
    Buffer.from(
      `%PDF-1.4\n% ${title} ${row.employeeNumber}\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n%%EOF\n`,
    );

  const filesPublic = new Files({ adapter: neon({ bucket: staffPublic }) });
  const filesPrivate = new Files({ adapter: neon({ bucket: staffPrivate }) });

  await filesPublic.upload(photoKey, avatar, { contentType: 'image/png' });
  await filesPrivate.upload(identityKey, mkPdf('Identity'), { contentType: 'application/pdf' });
  await filesPrivate.upload(appointmentKey, mkPdf('Appointment'), { contentType: 'application/pdf' });
  await filesPrivate.upload(qualificationKey, mkPdf('Qualification'), {
    contentType: 'application/pdf',
  });

  const body = {
    firstName: row.firstName,
    lastName: row.lastName,
    dateOfBirth: '1988-05-20',
    phone: `9198765432${row.phoneSuffix}`,
    contactEmail: loginEmail,
    loginEmail,
    employeeNumber: row.employeeNumber,
    jobTitle: row.jobTitle,
    department: row.department,
    employmentType: 'Full-time',
    joiningDate: '2025-07-01',
    workShift: row.jobTitle.includes('Security') ? 'Rotational' : 'General',
    assignedHostel: row.assignedHostel,
    fullAddress: 'Nestora Staff Quarters, Campus Road',
    city: 'Ranchi',
    state: 'Jharkhand',
    pinCode: '834001',
    country: 'India',
    emergencyContactName: `${row.lastName} Family`,
    emergencyRelationship: 'Spouse',
    emergencyContactPhone: '919800000111',
    identityProofType: 'Aadhaar Card',
    identityProofNumber: `XXXX-XXXX-${row.phoneSuffix}${row.phoneSuffix}`,
    accountStatus: 'Active' as const,
    sendInvitation: false,
    profilePhotoObjectKey: photoKey,
    documentUploads: [
      {
        kind: 'IDENTITY_PROOF' as const,
        objectKey: identityKey,
        fileName: 'identity-proof.pdf',
        mimeType: 'application/pdf',
        fileSize: mkPdf('Identity').length,
      },
      {
        kind: 'APPOINTMENT' as const,
        objectKey: appointmentKey,
        fileName: 'appointment-letter.pdf',
        mimeType: 'application/pdf',
        fileSize: mkPdf('Appointment').length,
      },
      {
        kind: 'QUALIFICATION' as const,
        objectKey: qualificationKey,
        fileName: 'qualification.pdf',
        mimeType: 'application/pdf',
        fileSize: mkPdf('Qualification').length,
      },
    ],
  };

  const result = await staffService.registerStaffByAdmin(prisma, env, admin.id, admin.role, body, undefined);
  const passwordHash = await argon2.hash(SEED_PASSWORD, argon2ParamsFromEnv(env));
  await prisma.user.update({
    where: { id: result.userId },
    data: { passwordHash, status: 'ACTIVE', isVerified: true },
  });
  console.log('Created:', row.employeeNumber, displayName, row.jobTitle, '→', loginEmail);
  created += 1;
}

console.log('\n--- Workforce roster complete ---');
console.log(`Created: ${created}, Skipped: ${skipped}, Target: ${WORKFORCE.length}`);
console.log(`Login password for all seeded workforce: ${SEED_PASSWORD}`);

await prisma.$disconnect();
