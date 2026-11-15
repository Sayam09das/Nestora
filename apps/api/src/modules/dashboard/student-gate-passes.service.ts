import type { PrismaClient } from '@nestora/database';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';

export type StudentGatePassRow = {
  id: string;
  passToken: string;
  leaveId: string | null;
  leaveType: string | null;
  destination: string | null;
  dateRange: string;
  validFrom: string;
  validUntil: string;
  isUsed: boolean;
  status: 'active' | 'expired' | 'used';
  statusLabel: string;
};

export type StudentGatePassesDesk = {
  generatedAt: string;
  profileLinked: boolean;
  hostelName: string | null;
  summary: {
    active: number;
    expired: number;
    used: number;
  };
  passes: StudentGatePassRow[];
};

function formatRange(start: Date, end: Date): string {
  const a = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(start);
  const b = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(end);
  return `${a} – ${b}`;
}

function resolvePassStatus(
  pass: { isUsed: boolean; validUntil: Date },
  now: Date,
): { status: StudentGatePassRow['status']; statusLabel: string } {
  if (pass.isUsed) {
    return { status: 'used', statusLabel: 'Used at gate' };
  }
  if (pass.validUntil.getTime() < now.getTime()) {
    return { status: 'expired', statusLabel: 'Expired' };
  }
  return { status: 'active', statusLabel: 'Valid — show at gate' };
}

const emptyDesk = (now: Date): StudentGatePassesDesk => ({
  generatedAt: now.toISOString(),
  profileLinked: false,
  hostelName: null,
  summary: { active: 0, expired: 0, used: 0 },
  passes: [],
});

export async function getStudentGatePassesDesk(
  prisma: PrismaClient,
  userId: string,
): Promise<StudentGatePassesDesk> {
  const now = new Date();
  await ensureStudentProfileForUser(prisma, userId);

  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    return emptyDesk(now);
  }

  const allocation = await prisma.allocationRecord.findFirst({
    where: { studentId: student.id, status: 'ACTIVE' },
    orderBy: { allocatedAt: 'desc' },
    include: {
      bed: {
        include: {
          room: {
            include: {
              floor: {
                include: {
                  block: { include: { building: { include: { hostel: { select: { name: true } } } } } },
                },
              },
            },
          },
        },
      },
    },
  });

  const hostelName = allocation?.bed.room.floor.block.building.hostel.name ?? null;

  const rows = await prisma.gatePass.findMany({
    where: { studentId: student.id },
    orderBy: { validFrom: 'desc' },
    take: 40,
    include: {
      leave: {
        select: {
          id: true,
          leaveType: true,
          destination: true,
          departureDate: true,
          expectedReturnDate: true,
        },
      },
    },
  });

  const passes: StudentGatePassRow[] = rows.map((row) => {
    const { status, statusLabel } = resolvePassStatus(row, now);
    const leave = row.leave;
    return {
      id: row.id,
      passToken: row.passToken,
      leaveId: leave?.id ?? row.leaveId,
      leaveType: leave?.leaveType ?? null,
      destination: leave?.destination ?? null,
      dateRange: leave
        ? formatRange(leave.departureDate, leave.expectedReturnDate)
        : formatRange(row.validFrom, row.validUntil),
      validFrom: row.validFrom.toISOString(),
      validUntil: row.validUntil.toISOString(),
      isUsed: row.isUsed,
      status,
      statusLabel,
    };
  });

  const summary = {
    active: passes.filter((p) => p.status === 'active').length,
    expired: passes.filter((p) => p.status === 'expired').length,
    used: passes.filter((p) => p.status === 'used').length,
  };

  return {
    generatedAt: now.toISOString(),
    profileLinked: true,
    hostelName,
    summary,
    passes,
  };
}