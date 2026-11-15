/**
 * Ensures a SECURITY_GUARD user has a HostelAssignment (required for /guard gate console scope).
 *
 *   pnpm --filter @nestora/api seed:ensure-guard-assignment
 *   GUARD_EMAIL=anil.singh@nestora.test pnpm --filter @nestora/api seed:ensure-guard-assignment
 */
import { prisma } from '@nestora/database';

const DEFAULT_HOSTEL_NAME = 'Boys Hostel A';
const guardEmail = process.env.GUARD_EMAIL?.trim().toLowerCase();

const guard = guardEmail
  ? await prisma.user.findUnique({
      where: { email: guardEmail },
      select: { id: true, email: true, role: true, status: true },
    })
  : await prisma.user.findFirst({
      where: { role: 'SECURITY_GUARD', status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, role: true, status: true },
    });

if (!guard) {
  console.error(
    'No SECURITY_GUARD user found. Create one via Admin → Staff or run: pnpm neon:seed-workforce-roster',
  );
  process.exit(1);
}

if (guard.role !== 'SECURITY_GUARD') {
  console.error(`User ${guard.email} is not SECURITY_GUARD (role=${guard.role}).`);
  process.exit(1);
}

const hostel = await prisma.hostel.findFirst({
  where: { name: DEFAULT_HOSTEL_NAME, isActive: true },
  select: { id: true, name: true },
});

if (!hostel) {
  console.error(`Hostel "${DEFAULT_HOSTEL_NAME}" not found. Seed infrastructure first.`);
  process.exit(1);
}

const existing = await prisma.hostelAssignment.findFirst({
  where: { userId: guard.id, hostelId: hostel.id },
  select: { id: true },
});

if (!existing) {
  await prisma.hostelAssignment.create({
    data: { userId: guard.id, hostelId: hostel.id },
  });
  console.log(`Assigned ${guard.email} → ${hostel.name}`);
} else {
  console.log(`Already assigned: ${guard.email} → ${hostel.name}`);
}

const all = await prisma.hostelAssignment.findMany({
  where: { userId: guard.id },
  include: { hostel: { select: { name: true } } },
});
console.log(
  'Guard scope:',
  all.map((a) => a.hostel.name).join(', ') || '(none)',
);
console.log('\nSign in on http://localhost:3000/guard with this guard account.');

await prisma.$disconnect();