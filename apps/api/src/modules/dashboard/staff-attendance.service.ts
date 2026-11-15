import type { PrismaClient } from '@nestora/database';
import { BadRequestError, ConflictError } from '../../common/errors/index.js';
import { resolveHostelScope } from './operational-dashboard.service.js';
import { parseScheduleDateParam, shiftDisplay } from './staff-schedule.service.js';

export type StaffAttendanceRecord = {
  id: string;
  workDate: string;
  status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE';
  hostelName: string;
};

export type StaffAttendanceDesk = {
  generatedAt: string;
  from: string;
  to: string;
  summary: {
    present: number;
    absent: number;
    onLeave: number;
    total: number;
    percent: number | null;
  };
  today: {
    status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE' | null;
    dutyScheduled: boolean;
    shiftLabel: string | null;
    shiftWindow: string | null;
    zone: string | null;
    hostelName: string | null;
  };
  records: StaffAttendanceRecord[];
  hostelStudentsToday: {
    present: number;
    absent: number;
    onLeave: number;
    percent: number | null;
  };
};

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function toIsoDate(date: Date): string {
  return startOfUtcDay(date).toISOString().slice(0, 10);
}

function attendanceRatePercent(present: number, absent: number, onLeave: number): number | null {
  const total = present + absent + onLeave;
  if (total === 0) return null;
  return Math.round((present / total) * 1000) / 10;
}

export function defaultStaffAttendanceRange(): { from: Date; to: Date } {
  const today = startOfUtcDay(new Date());
  const from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  return { from, to: today };
}

export async function getStaffAttendanceDesk(
  prisma: PrismaClient,
  staffId: string,
  from: Date,
  to: Date,
): Promise<StaffAttendanceDesk> {
  const rangeStart = startOfUtcDay(from);
  const rangeEnd = startOfUtcDay(to);
  const today = startOfUtcDay(new Date());
  const { hostelIds } = await resolveHostelScope(prisma, staffId, 'HOSTEL_STAFF');
  const hostelWhere = hostelIds.length === 1 ? hostelIds[0] : { in: hostelIds };

  const [rows, dutyToday, attendanceGroups] = await Promise.all([
    prisma.staffAttendance.findMany({
      where: {
        staffId,
        workDate: { gte: rangeStart, lte: rangeEnd },
      },
      orderBy: { workDate: 'desc' },
      select: {
        id: true,
        workDate: true,
        status: true,
        hostel: { select: { name: true } },
      },
    }),
    prisma.dutyAssignment.findFirst({
      where: { staffId, dutyDate: today },
      select: {
        shiftType: true,
        zone: true,
        hostel: { select: { name: true } },
      },
    }),
    hostelIds.length === 0
      ? Promise.resolve([])
      : prisma.attendanceRecord.groupBy({
          by: ['status'],
          where: { hostelId: hostelWhere, attendanceDate: today },
          _count: { _all: true },
        }),
  ]);

  const records: StaffAttendanceRecord[] = rows.map((row) => ({
    id: row.id,
    workDate: toIsoDate(row.workDate),
    status: row.status,
    hostelName: row.hostel.name,
  }));

  const present = records.filter((r) => r.status === 'PRESENT').length;
  const absent = records.filter((r) => r.status === 'ABSENT').length;
  const onLeave = records.filter((r) => r.status === 'ON_LEAVE').length;
  const total = records.length;

  const todayRow = records.find((r) => r.workDate === toIsoDate(today));
  const shiftMeta = dutyToday ? shiftDisplay(dutyToday.shiftType) : null;

  const attendanceMap = new Map(attendanceGroups.map((g) => [g.status, g._count._all]));
  const studentsPresent = attendanceMap.get('PRESENT') ?? 0;
  const studentsAbsent = attendanceMap.get('ABSENT') ?? 0;
  const studentsOnLeave = attendanceMap.get('ON_LEAVE') ?? 0;

  return {
    generatedAt: new Date().toISOString(),
    from: toIsoDate(rangeStart),
    to: toIsoDate(rangeEnd),
    summary: {
      present,
      absent,
      onLeave,
      total,
      percent: attendanceRatePercent(present, absent, onLeave),
    },
    today: {
      status: todayRow?.status ?? null,
      dutyScheduled: Boolean(dutyToday),
      shiftLabel: shiftMeta?.shiftLabel ?? null,
      shiftWindow: shiftMeta?.timeWindow ?? null,
      zone: dutyToday?.zone ?? null,
      hostelName: dutyToday?.hostel.name ?? todayRow?.hostelName ?? null,
    },
    records,
    hostelStudentsToday: {
      present: studentsPresent,
      absent: studentsAbsent,
      onLeave: studentsOnLeave,
      percent: attendanceRatePercent(studentsPresent, studentsAbsent, studentsOnLeave),
    },
  };
}

export { parseScheduleDateParam as parseAttendanceDateParam };

export async function recordStaffShiftCheckIn(
  prisma: PrismaClient,
  staffUserId: string,
): Promise<StaffAttendanceDesk> {
  const today = startOfUtcDay(new Date());

  const dutyToday = await prisma.dutyAssignment.findFirst({
    where: { staffId: staffUserId, dutyDate: today },
    select: { hostelId: true },
  });
  if (!dutyToday) {
    throw new BadRequestError('No duty assignment scheduled for today — check-in is not available.');
  }

  const existing = await prisma.staffAttendance.findFirst({
    where: { staffId: staffUserId, workDate: today },
  });
  if (existing?.status === 'PRESENT') {
    throw new ConflictError('You have already checked in for today.');
  }
  if (existing) {
    await prisma.staffAttendance.update({
      where: { id: existing.id },
      data: { status: 'PRESENT', recordedBy: staffUserId, hostelId: dutyToday.hostelId },
    });
  } else {
    await prisma.staffAttendance.create({
      data: {
        staffId: staffUserId,
        hostelId: dutyToday.hostelId,
        workDate: today,
        status: 'PRESENT',
        recordedBy: staffUserId,
      },
    });
  }

  const defaults = defaultStaffAttendanceRange();
  return getStaffAttendanceDesk(prisma, staffUserId, defaults.from, defaults.to);
}