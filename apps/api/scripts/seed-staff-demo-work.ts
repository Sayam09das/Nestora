/**
 * Assigns open complaint tickets + today's duty to a staff login for dashboard demos.
 *   pnpm --filter @nestora/api exec node --env-file=.env --import tsx/esm scripts/seed-staff-demo-work.ts
 * Optional: STAFF_EMAIL=lakshmi.hk@nestora.test
 */
import { prisma } from '@nestora/database';

const STAFF_EMAIL = (process.env.STAFF_EMAIL ?? 'lakshmi.hk@nestora.test').trim().toLowerCase();

const staffUser = await prisma.user.findUnique({
  where: { email: STAFF_EMAIL },
  select: { id: true, firstName: true, lastName: true },
});

if (!staffUser) {
  console.error(`Staff user not found: ${STAFF_EMAIL}`);
  process.exit(1);
}

const admin = await prisma.user.findFirst({
  where: { role: 'UNIVERSITY_ADMINISTRATOR', status: 'ACTIVE' },
  orderBy: { createdAt: 'asc' },
  select: { id: true },
});

if (!admin) {
  console.error('No active admin user to record assignedBy.');
  process.exit(1);
}

const hostelLink = await prisma.hostelAssignment.findFirst({
  where: { userId: staffUser.id },
  select: { hostelId: true, hostel: { select: { name: true } } },
});

if (!hostelLink) {
  console.error('Staff user has no hostel assignment.');
  process.exit(1);
}

const today = new Date();
today.setUTCHours(0, 0, 0, 0);

const existingDuties = await prisma.dutyAssignment.count({
  where: { staffId: staffUser.id, dutyDate: today },
});

if (existingDuties === 0) {
  await prisma.dutyAssignment.create({
    data: {
      staffId: staffUser.id,
      hostelId: hostelLink.hostelId,
      dutyDate: today,
      shiftType: 'DAY',
      zone: 'Main gate & reception',
      assignedBy: admin.id,
    },
  });
  console.log('Created duty assignment for today.');
}

const openTickets = await prisma.complaintTicket.findMany({
  where: {
    hostelId: hostelLink.hostelId,
    status: { notIn: ['RESOLVED', 'CLOSED', 'REJECTED'] },
  },
  orderBy: { createdAt: 'desc' },
  take: 8,
  select: { id: true, ticketNumber: true, title: true, status: true },
});

const activeAssignments = await prisma.ticketAssignment.count({
  where: { staffId: staffUser.id, isActive: true },
});

const target = Math.min(5, openTickets.length);
let created = 0;

for (let i = 0; i < openTickets.length && created < target; i++) {
  const ticket = openTickets[i]!;
  const already = await prisma.ticketAssignment.findFirst({
    where: { ticketId: ticket.id, staffId: staffUser.id, isActive: true },
  });
  if (already) continue;

  const nextStatus =
    i === 0 ? 'RESOLVED' : i % 3 === 1 ? 'IN_PROGRESS' : i === 2 ? 'ASSIGNED' : 'ASSIGNED';

  await prisma.$transaction([
    prisma.ticketAssignment.create({
      data: {
        ticketId: ticket.id,
        staffId: staffUser.id,
        assignedBy: admin.id,
        isActive: nextStatus !== 'RESOLVED',
      },
    }),
    prisma.complaintTicket.update({
      where: { id: ticket.id },
      data: { status: nextStatus },
    }),
    prisma.ticketStatusHistory.create({
      data: {
        ticketId: ticket.id,
        status: nextStatus,
        changedBy: admin.id,
        notes: `Demo assignment for ${STAFF_EMAIL}`,
      },
    }),
  ]);

  console.log(`Assigned ${ticket.ticketNumber} → ${nextStatus}`);
  created++;
}

let attendanceSeeded = 0;
for (let offset = 0; offset < 6; offset++) {
  const workDate = new Date(today);
  workDate.setUTCDate(workDate.getUTCDate() - offset);
  const existing = await prisma.staffAttendance.findFirst({
    where: { staffId: staffUser.id, workDate },
  });
  if (existing) continue;
  const status = offset === 0 ? 'PRESENT' : offset === 2 ? 'ON_LEAVE' : offset === 4 ? 'ABSENT' : 'PRESENT';
  await prisma.staffAttendance.create({
    data: {
      staffId: staffUser.id,
      hostelId: hostelLink.hostelId,
      workDate,
      status,
      recordedBy: admin.id,
    },
  });
  attendanceSeeded++;
}

console.log(
  JSON.stringify(
    {
      staff: STAFF_EMAIL,
      hostel: hostelLink.hostel.name,
      dutiesToday: existingDuties + (existingDuties === 0 ? 1 : 0),
      newTicketAssignments: created,
      activeAssignmentsBefore: activeAssignments,
      attendanceRecordsSeeded: attendanceSeeded,
    },
    null,
    2,
  ),
);

await prisma.$disconnect();