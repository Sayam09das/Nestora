/**
 * Idempotent maintenance ticket seed for the complaints command center.
 *
 *   pnpm neon:seed-complaints
 */
import { prisma } from '@nestora/database';

const TEMPLATES = [
  { category: 'Electrical', title: 'Power fluctuation in corridor', priority: 'High' },
  { category: 'Electrical', title: 'Tube light flicker · common bath', priority: 'Medium' },
  { category: 'Plumbing', title: 'Low water pressure', priority: 'High' },
  { category: 'Plumbing', title: 'Leaking tap in wash area', priority: 'Medium' },
  { category: 'Carpentry', title: 'Cupboard hinge broken', priority: 'Low' },
  { category: 'Cleaning', title: 'Washroom hygiene follow-up', priority: 'Medium' },
  { category: 'Civil', title: 'Crack in wall plaster', priority: 'Low' },
] as const;

const STATUS_CYCLE = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'REOPENED',
] as const;

async function resolveAdminId(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: { role: 'UNIVERSITY_ADMINISTRATOR', status: 'ACTIVE' },
    select: { id: true },
  });
  if (!admin) throw new Error('No active administrator user found.');
  return admin.id;
}

async function resolveStaffId(): Promise<string | null> {
  const staff = await prisma.user.findFirst({
    where: { role: 'HOSTEL_STAFF', status: 'ACTIVE' },
    select: { id: true },
  });
  return staff?.id ?? null;
}

async function main(): Promise<void> {
  const existing = await prisma.complaintTicket.count();
  if (existing >= 12) {
    console.log(`Complaints seed skipped (${existing} tickets already present).`);
    return;
  }

  const adminId = await resolveAdminId();
  const staffId = await resolveStaffId();

  const allocations = await prisma.allocationRecord.findMany({
    where: { status: 'ACTIVE' },
    take: 18,
    include: {
      student: { select: { id: true } },
      bed: {
        include: {
          room: {
            select: {
              roomNumber: true,
              floor: {
                include: {
                  block: {
                    include: {
                      building: { include: { hostel: { select: { id: true, name: true } } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!allocations.length) {
    console.log('No active allocations — run neon:seed-students-allocate first.');
    return;
  }

  let seq = existing + 1;

  for (const [index, alloc] of allocations.entries()) {
    const template = TEMPLATES[index % TEMPLATES.length]!;
    const status = STATUS_CYCLE[index % STATUS_CYCLE.length]!;
    const hostelId = alloc.bed.room.floor.block.building.hostel.id;
    const hostelName = alloc.bed.room.floor.block.building.hostel.name;
    const block = alloc.bed.room.floor.block.name;
    const room = alloc.bed.room.roomNumber;

    const createdAt = new Date();
    createdAt.setUTCDate(createdAt.getUTCDate() - (index % 10));

    const ticket = await prisma.complaintTicket.create({
      data: {
        ticketNumber: `CMP-2026-${String(seq).padStart(4, '0')}`,
        hostelId,
        studentId: alloc.student.id,
        category: template.category,
        title: template.title,
        description: `${template.title} reported from ${hostelName}, ${block}, room ${room}.`,
        location: `${block} · Room ${room}`,
        suggestedPriority: template.priority.toUpperCase(),
        finalPriority: index % 3 === 0 ? template.priority.toUpperCase() : null,
        status,
        createdAt,
        updatedAt: status === 'RESOLVED' ? new Date() : createdAt,
        statusHistory: {
          create: {
            status,
            changedBy: adminId,
            notes: status === 'ASSIGNED' ? 'Assigned to maintenance staff.' : null,
            createdAt,
          },
        },
        ...(status === 'ASSIGNED' || status === 'IN_PROGRESS'
          ? staffId
            ? {
                assignments: {
                  create: {
                    staffId,
                    assignedBy: adminId,
                    isActive: true,
                  },
                },
              }
            : {}
          : {}),
      },
    });

    void ticket;
    seq += 1;
  }

  console.log(`Complaints desk seed complete (${allocations.length} tickets).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
