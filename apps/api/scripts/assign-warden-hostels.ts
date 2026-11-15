/**
 * Assign extra hostel(s) to a warden via hostel_assignments (for multi-hostel switcher).
 *
 * Usage:
 *   pnpm --filter @nestora/api exec tsx scripts/assign-warden-hostels.ts suman.chatterjee@nestora.test "Boys Hostel A"
 */
import { prisma } from '@nestora/database';

const [wardenEmail, ...hostelNames] = process.argv.slice(2);

if (!wardenEmail || hostelNames.length === 0) {
  console.error('Usage: tsx scripts/assign-warden-hostels.ts <warden-email> <hostel name> [hostel name...]');
  process.exit(1);
}

const warden = await prisma.user.findFirst({
  where: { email: { equals: wardenEmail, mode: 'insensitive' }, role: 'HOSTEL_WARDEN' },
  select: { id: true, email: true },
});

if (!warden) {
  console.error(`No HOSTEL_WARDEN user found for ${wardenEmail}`);
  process.exit(1);
}

const admin = await prisma.user.findFirst({
  where: { role: 'UNIVERSITY_ADMINISTRATOR', status: 'ACTIVE' },
  orderBy: { createdAt: 'asc' },
  select: { id: true },
});

if (!admin) {
  console.error('No active university administrator found (required as assignedBy).');
  process.exit(1);
}

for (const name of hostelNames) {
  const hostel = await prisma.hostel.findFirst({
    where: { name: { equals: name.trim(), mode: 'insensitive' }, isActive: true },
    select: { id: true, name: true },
  });
  if (!hostel) {
    console.warn(`Skip — hostel not found: ${name}`);
    continue;
  }

  await prisma.hostelAssignment.upsert({
    where: { userId_hostelId: { userId: warden.id, hostelId: hostel.id } },
    create: { userId: warden.id, hostelId: hostel.id, assignedBy: admin.id },
    update: {},
  });
  console.log(`Assigned ${warden.email} → ${hostel.name}`);
}

const scope = await prisma.hostelAssignment.findMany({
  where: { userId: warden.id },
  include: { hostel: { select: { name: true } } },
  orderBy: { hostel: { name: 'asc' } },
});
console.log('Current assignments:', scope.map((r) => r.hostel.name).join(', '));

await prisma.$disconnect();
