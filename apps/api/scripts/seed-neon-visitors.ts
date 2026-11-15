/**
 * Seed sample visitor_records for warden desk testing.
 *
 * Usage:
 *   pnpm --filter @nestora/api exec node --env-file=.env --import tsx/esm scripts/seed-neon-visitors.ts
 *   pnpm --filter @nestora/api exec node --env-file=.env --import tsx/esm scripts/seed-neon-visitors.ts "Boys Hostel A" 9
 */
import { prisma } from '@nestora/database';

const hostelNameArg = process.argv[2]?.trim() || 'Boys Hostel A';
const countArg = Number(process.argv[3] ?? 9);
const targetCount = Number.isFinite(countArg) ? Math.min(Math.max(countArg, 1), 20) : 9;

const SAMPLE_VISITORS = [
  { visitorName: 'Ramesh Patel', visitorPhone: '+91 98765 40101', purpose: 'Family visit — parents' },
  { visitorName: 'Anita Sharma', visitorPhone: '+91 98112 40202', purpose: 'Deliver documents and laptop charger' },
  { visitorName: 'Vikram Singh', visitorPhone: '+91 99009 40303', purpose: 'Counselling follow-up with guardian' },
  { visitorName: 'Meera Iyer', visitorPhone: '+91 98400 40404', purpose: 'Weekend stay — sister' },
  { visitorName: 'Joseph Thomas', visitorPhone: '+91 98111 40505', purpose: 'Medical appointment escort' },
  { visitorName: 'Kavita Naidu', visitorPhone: '+91 98220 40606', purpose: 'Festival celebration visit' },
  { visitorName: 'Arun Kumar', visitorPhone: '+91 98330 40707', purpose: 'Project discussion with mentor' },
  { visitorName: 'Fatima Khan', visitorPhone: '+91 98440 40808', purpose: 'Personal belongings pickup' },
  { visitorName: 'David Fernandes', visitorPhone: '+91 98550 40909', purpose: 'Alumni meet — cousin' },
];

const hostel = await prisma.hostel.findFirst({
  where: { name: { contains: hostelNameArg, mode: 'insensitive' }, isActive: true },
  select: { id: true, name: true },
});

if (!hostel) {
  console.error(`Hostel not found: ${hostelNameArg}`);
  process.exit(1);
}

const guardUser =
  (await prisma.user.findFirst({
    where: { role: 'SECURITY_GUARD', status: 'ACTIVE' },
    select: { id: true, email: true },
  })) ??
  (await prisma.user.findFirst({
    where: { role: 'HOSTEL_WARDEN', status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true },
  }));

if (!guardUser) {
  console.error('No SECURITY_GUARD or HOSTEL_WARDEN user for guardId.');
  process.exit(1);
}

const wardenUser = await prisma.user.findFirst({
  where: { role: 'HOSTEL_WARDEN', status: 'ACTIVE' },
  orderBy: { createdAt: 'asc' },
  select: { id: true, email: true },
});

const allocations = await prisma.allocationRecord.findMany({
  where: {
    status: 'ACTIVE',
    bed: {
      room: {
        floor: {
          block: {
            building: { hostelId: hostel.id },
          },
        },
      },
    },
  },
  take: targetCount,
  orderBy: { allocatedAt: 'desc' },
  select: { studentId: true, student: { select: { registrationNumber: true, user: { select: { firstName: true, lastName: true } } } } },
});

if (allocations.length === 0) {
  console.error(`No active allocations in ${hostel.name}. Run seed:neon-rooms / allocate students first.`);
  process.exit(1);
}

const now = new Date();
const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

type StatusPlan = {
  status: string;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  approvedBy: string | null;
};

const statusPlan: StatusPlan[] = [
  { status: 'PENDING_APPROVAL', checkInTime: null, checkOutTime: null, approvedBy: null },
  { status: 'PENDING_APPROVAL', checkInTime: null, checkOutTime: null, approvedBy: null },
  { status: 'APPROVED', checkInTime: null, checkOutTime: null, approvedBy: wardenUser?.id ?? null },
  { status: 'APPROVED', checkInTime: null, checkOutTime: null, approvedBy: wardenUser?.id ?? null },
  { status: 'CHECKED_IN', checkInTime: hourAgo, checkOutTime: null, approvedBy: wardenUser?.id ?? null },
  { status: 'CHECKED_IN', checkInTime: twoHoursAgo, checkOutTime: null, approvedBy: wardenUser?.id ?? null },
  { status: 'CHECKED_OUT', checkInTime: twoHoursAgo, checkOutTime: hourAgo, approvedBy: wardenUser?.id ?? null },
  { status: 'CHECKED_OUT', checkInTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), checkOutTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), approvedBy: wardenUser?.id ?? null },
  { status: 'REJECTED', checkInTime: null, checkOutTime: null, approvedBy: wardenUser?.id ?? null },
];

let created = 0;
for (let i = 0; i < Math.min(targetCount, allocations.length, SAMPLE_VISITORS.length); i += 1) {
  const alloc = allocations[i]!;
  const sample = SAMPLE_VISITORS[i]!;
  const plan = statusPlan[i] ?? statusPlan[0]!;

  const existing = await prisma.visitorRecord.findFirst({
    where: {
      studentId: alloc.studentId,
      visitorName: sample.visitorName,
      createdAt: { gte: today },
    },
    select: { id: true },
  });
  if (existing) {
    console.log(`Skip (exists today): ${sample.visitorName}`);
    continue;
  }

  await prisma.visitorRecord.create({
    data: {
      hostelId: hostel.id,
      studentId: alloc.studentId,
      visitorName: sample.visitorName,
      visitorPhone: sample.visitorPhone,
      idProofType: i % 2 === 0 ? 'Aadhaar' : 'Driving Licence',
      idProofNumber: `DEMO-${1000 + i}`,
      purpose: sample.purpose,
      status: plan.status,
      approvedBy: plan.approvedBy,
      checkInTime: plan.checkInTime,
      checkOutTime: plan.checkOutTime,
      guardId: guardUser.id,
      isException: i === 4,
    },
  });

  const resident = `${alloc.student.user.firstName} ${alloc.student.user.lastName}`.trim();
  console.log(`+ ${sample.visitorName} → ${resident} (${plan.status})`);
  created += 1;
}

console.log(`\nCreated ${created} visitors in ${hostel.name} (guard: ${guardUser.email}).`);
await prisma.$disconnect();
