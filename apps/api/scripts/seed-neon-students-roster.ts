/**
 * Purges Neon/integration demo students and seeds 50 realistic roster students
 * with profile photos (Neon public bucket), documents (private), and ACTIVE accounts.
 *
 *   pnpm --filter @nestora/api seed:neon-students-roster
 */
import { randomUUID } from 'node:crypto';
import { Files } from 'files-sdk';
import { neon } from 'files-sdk/neon';
import type { StudentGender } from '@nestora/database';
import { prisma } from '@nestora/database';
import * as argon2 from 'argon2';
import { loadEnv } from '../src/config/env.js';
import { argon2ParamsFromEnv } from '../src/modules/auth/password.service.js';
import { assertObjectExists } from '../src/modules/storage/storage.service.js';

const env = loadEnv(process.env);
const SEED_PASSWORD = 'NestoraStudent@2026!';

const ROSTER: { firstName: string; lastName: string }[] = [
  { firstName: 'Rahul', lastName: 'Sharma' },
  { firstName: 'Arjun', lastName: 'Verma' },
  { firstName: 'Aditya', lastName: 'Singh' },
  { firstName: 'Rohan', lastName: 'Das' },
  { firstName: 'Karan', lastName: 'Mehta' },
  { firstName: 'Vikram', lastName: 'Yadav' },
  { firstName: 'Siddharth', lastName: 'Gupta' },
  { firstName: 'Aman', lastName: 'Mishra' },
  { firstName: 'Nikhil', lastName: 'Pandey' },
  { firstName: 'Harsh', lastName: 'Jha' },
  { firstName: 'Ankit', lastName: 'Kumar' },
  { firstName: 'Prateek', lastName: 'Roy' },
  { firstName: 'Dev', lastName: 'Sinha' },
  { firstName: 'Yash', lastName: 'Choudhary' },
  { firstName: 'Rishabh', lastName: 'Tiwari' },
  { firstName: 'Abhishek', lastName: 'Sahu' },
  { firstName: 'Mohit', lastName: 'Raj' },
  { firstName: 'Saurabh', lastName: 'Bharti' },
  { firstName: 'Akash', lastName: 'Thakur' },
  { firstName: 'Utkarsh', lastName: 'Srivastava' },
  { firstName: 'Varun', lastName: 'Tripathi' },
  { firstName: 'Kunal', lastName: 'Dubey' },
  { firstName: 'Shubham', lastName: 'Pathak' },
  { firstName: 'Gaurav', lastName: 'Maurya' },
  { firstName: 'Ayush', lastName: 'Bose' },
  { firstName: 'Ravi', lastName: 'Mandal' },
  { firstName: 'Suresh', lastName: 'Hembram' },
  { firstName: 'Manish', lastName: 'Topno' },
  { firstName: 'Pankaj', lastName: 'Kerketta' },
  { firstName: 'Deepak', lastName: 'Minz' },
  { firstName: 'Sanjay', lastName: 'Herenz' },
  { firstName: 'Vivek', lastName: 'Baa' },
  { firstName: 'Nitish', lastName: 'Horo' },
  { firstName: 'Ashish', lastName: 'Oraon' },
  { firstName: 'Rajesh', lastName: 'Munda' },
  { firstName: 'Amit', lastName: 'Kujur' },
  { firstName: 'Rakesh', lastName: 'Soreng' },
  { firstName: 'Dinesh', lastName: 'Tirkey' },
  { firstName: 'Manoj', lastName: 'Ekka' },
  { firstName: 'Sunil', lastName: 'Gagrai' },
  { firstName: 'Anil', lastName: 'Sangram' },
  { firstName: 'Vinod', lastName: 'Barla' },
  { firstName: 'Prem', lastName: 'Konwar' },
  { firstName: 'Bikash', lastName: 'Lakra' },
  { firstName: 'Suman', lastName: 'Kerketta' },
  { firstName: 'Chandan', lastName: 'Bhengra' },
  { firstName: 'Priyanshu', lastName: 'Bedia' },
  { firstName: 'Ishaan', lastName: 'Kispotta' },
  { firstName: 'Tanmay', lastName: 'Purty' },
  { firstName: 'Sameer', lastName: 'Kullu' },
  { firstName: 'Farhan', lastName: 'Ansari' },
];

const COURSES = [
  'BCA',
  'B.Tech CSE',
  'B.Tech ECE',
  'BBA',
  'B.Sc IT',
  'B.Com',
] as const;

const SEMESTERS = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const;

const CITIES = [
  { city: 'Ranchi', state: 'Jharkhand', pin: '834001' },
  { city: 'Jamshedpur', state: 'Jharkhand', pin: '831001' },
  { city: 'Dhanbad', state: 'Jharkhand', pin: '826001' },
  { city: 'Bokaro', state: 'Jharkhand', pin: '827001' },
  { city: 'Deoghar', state: 'Jharkhand', pin: '814112' },
] as const;

const FALLBACK_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

async function fetchAvatarPng(displayName: string): Promise<Buffer> {
  const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=256&background=0D542F&color=ffffff&bold=true&format=png`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return FALLBACK_PNG;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return FALLBACK_PNG;
  }
}

function slugEmail(first: string, last: string, index: number): string {
  const base = `${first}.${last}`.toLowerCase().replace(/[^a-z0-9.]/g, '');
  return `${base}${String(index).padStart(2, '0')}@nestora.test`;
}

function formatAddress(city: string, state: string, pin: string, line: string): string {
  return [line, `${city}, ${state}, ${pin}`, 'India'].join('\n');
}

async function purgeDemoStudents(): Promise<number> {
  const demoUsers = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      OR: [
        { lastName: { contains: 'NeonDemo', mode: 'insensitive' } },
        { firstName: 'Aarav', lastName: { contains: 'NeonDemo', mode: 'insensitive' } },
        { email: { contains: 'integration-mod01-student', mode: 'insensitive' } },
        { email: { contains: 'aarav.login.', mode: 'insensitive' } },
        { email: { contains: 'aarav.demo.', mode: 'insensitive' } },
        { student: { registrationNumber: { startsWith: 'NEON-' } } },
        { student: { registrationNumber: 'STU-B37175B9' } },
      ],
    },
    select: {
      id: true,
      email: true,
      student: { select: { id: true, registrationNumber: true } },
    },
  });

  for (const user of demoUsers) {
    const studentId = user.student?.id;
    if (studentId) {
      await prisma.allocationRecord.deleteMany({ where: { studentId } });
      await prisma.roomChangeRequest.deleteMany({ where: { studentId } });
      await prisma.attendanceRecord.deleteMany({ where: { studentId } });
      await prisma.leaveApplication.deleteMany({ where: { studentId } });
      await prisma.complaintTicket.deleteMany({ where: { studentId } });
      await prisma.visitorRecord.deleteMany({ where: { studentId } });
    }
    await prisma.user.delete({ where: { id: user.id } });
    console.log('Removed demo student:', user.email, user.student?.registrationNumber ?? '');
  }

  return demoUsers.length;
}

async function seedOneStudent(
  index: number,
  person: { firstName: string; lastName: string },
  passwordHash: string,
): Promise<'created' | 'skipped'> {
  const registrationNumber = `STU-2026-${String(index).padStart(3, '0')}`;
  const existing = await prisma.student.findUnique({
    where: { registrationNumber },
    select: { id: true },
  });
  if (existing) {
    console.log('Skip (exists):', registrationNumber, person.firstName, person.lastName);
    return 'skipped';
  }

  const loginEmail = slugEmail(person.firstName, person.lastName, index);
  const emailTaken = await prisma.user.findUnique({ where: { email: loginEmail }, select: { id: true } });
  if (emailTaken) {
    console.log('Skip (email exists):', loginEmail);
    return 'skipped';
  }

  const course = COURSES[index % COURSES.length]!;
  const semester = SEMESTERS[index % SEMESTERS.length]!;
  const place = CITIES[index % CITIES.length]!;
  const academicYear = index % 3 === 0 ? '2024' : '2025';
  const phone = `91${String(7000000000 + index).slice(-10)}`;
  const guardianPhone = `91${String(8000000000 + index).slice(-10)}`;
  const dobYear = 2004 - (index % SEMESTERS.length);
  const dateOfBirth = `${dobYear}-${String((index % 12) + 1).padStart(2, '0')}-15`;

  const displayName = `${person.firstName} ${person.lastName}`;
  const folder = randomUUID();
  const photoKey = `${folder}/profile.png`;
  const admissionKey = `${folder}/admission-letter.pdf`;
  const idProofKey = `${folder}/id-proof.pdf`;
  const addressProofKey = `${folder}/address-proof.pdf`;

  const avatar = await fetchAvatarPng(displayName);
  const admissionPdf = Buffer.from(
    `%PDF-1.4\n% Admission letter ${registrationNumber}\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n%%EOF\n`,
  );
  const idPdf = Buffer.from(
    `%PDF-1.4\n% ID proof ${registrationNumber}\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n%%EOF\n`,
  );
  const addressPdf = Buffer.from(
    `%PDF-1.4\n% Address proof ${registrationNumber}\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n%%EOF\n`,
  );

  const publicBucket = env.S3_BUCKET_PUBLIC;
  const privateBucket = env.S3_BUCKET_PRIVATE;
  const filesPublic = new Files({ adapter: neon({ bucket: publicBucket }) });
  const filesPrivate = new Files({ adapter: neon({ bucket: privateBucket }) });

  await filesPublic.upload(photoKey, avatar, { contentType: 'image/png' });
  await filesPrivate.upload(admissionKey, admissionPdf, { contentType: 'application/pdf' });
  await filesPrivate.upload(idProofKey, idPdf, { contentType: 'application/pdf' });
  await filesPrivate.upload(addressProofKey, addressPdf, { contentType: 'application/pdf' });

  await assertObjectExists(env, 'public', photoKey);
  await assertObjectExists(env, 'private', admissionKey);

  const permanentAddress = formatAddress(
    place.city,
    place.state,
    place.pin,
    `${index + 12}, Hostel Road, Near Campus Gate`,
  );

  const documents = [
    { objectKey: admissionKey, fileName: 'admission-letter.pdf', mimeType: 'application/pdf', fileSize: admissionPdf.length },
    { objectKey: idProofKey, fileName: 'id-proof.pdf', mimeType: 'application/pdf', fileSize: idPdf.length },
    {
      objectKey: addressProofKey,
      fileName: 'address-proof.pdf',
      mimeType: 'application/pdf',
      fileSize: addressPdf.length,
    },
  ];

  const gender: StudentGender = 'MALE';
  const dob = new Date(`${dateOfBirth}T00:00:00.000Z`);

  await prisma.$transaction(
    async (tx) => {
    const user = await tx.user.create({
      data: {
        email: loginEmail,
        passwordHash,
        role: 'STUDENT',
        firstName: person.firstName,
        lastName: person.lastName,
        phoneNumber: phone,
        status: 'ACTIVE',
        isVerified: true,
        profilePhotoKey: photoKey,
      },
    });

    const student = await tx.student.create({
      data: {
        userId: user.id,
        registrationNumber,
        course,
        department: 'School of Computing & Management',
        academicYear,
        currentSemester: semester,
        gender,
        dateOfBirth: dob,
        guardianName: `${person.lastName} Guardian`,
        guardianPhone,
        guardianRelation: 'Parent',
        permanentAddress,
      },
    });

    await tx.studentDocument.createMany({
      data: documents.map((doc) => ({
        studentId: student.id,
        objectKey: doc.objectKey,
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        fileSize: doc.fileSize,
      })),
    });
  },
    { maxWait: 60_000, timeout: 120_000 },
  );

  console.log('Created:', registrationNumber, displayName, loginEmail);
  return 'created';
}

const admin = await prisma.user.findFirst({
  where: { role: 'UNIVERSITY_ADMINISTRATOR', status: 'ACTIVE' },
  orderBy: { createdAt: 'asc' },
});

if (!admin) {
  console.error('No ACTIVE University Administrator found.');
  process.exit(1);
}

const removed = await purgeDemoStudents();
console.log(`Purged ${removed} demo student(s).`);

const passwordHash = await argon2.hash(SEED_PASSWORD, argon2ParamsFromEnv(env));

let created = 0;
let skipped = 0;

for (let i = 0; i < ROSTER.length; i++) {
  const result = await seedOneStudent(i + 1, ROSTER[i]!, passwordHash);
  if (result === 'created') created += 1;
  else skipped += 1;
}

console.log('\n--- Roster seed complete ---');
console.log(`Created: ${created}, Skipped: ${skipped}, Total roster: ${ROSTER.length}`);
console.log(`Default login password for new students: ${SEED_PASSWORD}`);
console.log('Sample logins:');
console.log('  rahul.sharma01@nestora.test (STU-2026-001)');
console.log('  arjun.verma02@nestora.test (STU-2026-002)');

await prisma.$disconnect();
