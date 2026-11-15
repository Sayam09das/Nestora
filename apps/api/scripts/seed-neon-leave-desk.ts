/**
 * Idempotent leave desk seed for warden queue / registry.
 *
 *   pnpm neon:seed-leave
 */
import { prisma } from '@nestora/database';

const LEAVE_TEMPLATES = [
  { type: 'Family', destination: 'Pune, Maharashtra', reason: 'Family function; guardian accompanying.' },
  { type: 'Medical', destination: 'City Hospital', reason: 'Specialist follow-up appointment.' },
  { type: 'Academic', destination: 'State capital', reason: 'University seminar and lab visit.' },
  { type: 'Emergency', destination: 'Home town', reason: 'Urgent family matter.' },
  { type: 'Personal', destination: 'Nearby city', reason: 'Personal errands and documentation.' },
] as const;

function utcDate(offsetDays: number): Date {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d;
}

async function resolveWardenId(): Promise<string | null> {
  const warden = await prisma.user.findFirst({
    where: { role: 'HOSTEL_WARDEN', status: 'ACTIVE' },
    select: { id: true },
  });
  return warden?.id ?? null;
}

async function main(): Promise<void> {
  const existing = await prisma.leaveApplication.count();
  if (existing >= 10) {
    console.log(`Leave desk seed skipped (${existing} applications already present).`);
    return;
  }

  const wardenId = await resolveWardenId();

  const allocations = await prisma.allocationRecord.findMany({
    where: { status: 'ACTIVE' },
    take: 22,
    include: {
      student: { select: { id: true, guardianPhone: true } },
      bed: {
        include: {
          room: {
            select: {
              floor: {
                include: {
                  block: {
                    include: {
                      building: { include: { hostel: { select: { id: true } } } },
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

  if (allocations.length < 8) {
    console.log('Not enough active allocations — run neon:seed-students-allocate first.');
    return;
  }

  const scenarios: Array<{
    status: string;
    depOffset: number;
    retOffset: number;
    withPass?: boolean;
    withExtension?: boolean;
    lateReturn?: boolean;
  }> = [
    { status: 'SUBMITTED', depOffset: 3, retOffset: 6 },
    { status: 'SUBMITTED', depOffset: 5, retOffset: 8 },
    { status: 'SUBMITTED', depOffset: 2, retOffset: 4 },
    { status: 'SUBMITTED', depOffset: 7, retOffset: 10 },
    { status: 'APPROVED', depOffset: -2, retOffset: 4 },
    { status: 'APPROVED', depOffset: -1, retOffset: 3 },
    { status: 'APPROVED', depOffset: -3, retOffset: 2 },
    { status: 'APPROVED', depOffset: -5, retOffset: 1 },
    { status: 'APPROVED', depOffset: -1, retOffset: 0, withPass: true },
    { status: 'APPROVED', depOffset: -2, retOffset: 0, withPass: true },
    { status: 'APPROVED', depOffset: -1, retOffset: 0, withPass: true },
    { status: 'APPROVED', depOffset: -1, retOffset: 0, withPass: true },
    { status: 'APPROVED', depOffset: -1, retOffset: 0, withPass: true },
    { status: 'APPROVED', depOffset: -1, retOffset: 0, withPass: true },
    { status: 'APPROVED', depOffset: -4, retOffset: -1, withPass: true, lateReturn: true },
    { status: 'REJECTED', depOffset: 4, retOffset: 7 },
    { status: 'APPROVED', depOffset: -6, retOffset: -2, withPass: true, withExtension: true },
    { status: 'APPROVED', depOffset: -3, retOffset: 1, withPass: true, withExtension: true },
  ];

  let created = 0;

  for (const [index, alloc] of allocations.entries()) {
    if (index >= scenarios.length) break;
    const scenario = scenarios[index]!;
    const template = LEAVE_TEMPLATES[index % LEAVE_TEMPLATES.length]!;
    const hostelId = alloc.bed.room.floor.block.building.hostel.id;

    const departureDate = utcDate(scenario.depOffset);
    const expectedReturnDate = utcDate(scenario.retOffset);
    const createdAt = utcDate(-(index % 6));

    const leave = await prisma.leaveApplication.create({
      data: {
        studentId: alloc.student.id,
        hostelId,
        leaveType: template.type,
        departureDate,
        expectedReturnDate,
        destination: template.destination,
        reason: template.reason,
        emergencyContact: alloc.student.guardianPhone,
        status: scenario.status,
        reviewedBy:
          scenario.status === 'APPROVED' || scenario.status === 'REJECTED' ? wardenId : undefined,
        reviewedAt:
          scenario.status === 'APPROVED' || scenario.status === 'REJECTED'
            ? utcDate(-(index % 3))
            : undefined,
        createdAt,
      },
    });

    if (scenario.withPass && wardenId) {
      const token = `GP-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
      const pass = await prisma.gatePass.create({
        data: {
          passToken: token,
          studentId: alloc.student.id,
          leaveId: leave.id,
          validFrom: utcDate(scenario.depOffset - 1),
          validUntil: utcDate(scenario.retOffset + 1),
        },
      });

      if (scenario.lateReturn) {
        await prisma.gateMovementLog.create({
          data: {
            passId: pass.id,
            studentId: alloc.student.id,
            hostelId,
            securityGuardId: wardenId,
            actualDeparture: utcDate(scenario.depOffset),
            isLateReturn: true,
            remarks: 'FR-043 sample late return',
          },
        });
      }
    }

    if (scenario.withExtension) {
      await prisma.leaveExtension.create({
        data: {
          leaveId: leave.id,
          newReturnDate: utcDate(scenario.retOffset + 2),
          reason: 'Travel delay — FR-041 extension sample.',
          status: 'PENDING',
        },
      });
    }

    created += 1;
  }

  console.log(`Leave desk seed complete (${created} applications).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
