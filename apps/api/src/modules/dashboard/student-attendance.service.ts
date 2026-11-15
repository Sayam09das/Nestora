import type { AttendanceStatus, PrismaClient } from '@nestora/database';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';

export type StudentAttendanceDayStatus = 'PRESENT' | 'ABSENT' | 'ON_LEAVE';

export type StudentAttendanceDesk = {
  generatedAt: string;
  profileLinked: boolean;
  month: string;
  monthLabel: string;
  summary: {
    percent: number | null;
    present: number;
    absent: number;
    onLeave: number;
    recordedDays: number;
    daysInMonth: number;
    standing: string;
  };
  today: {
    date: string;
    status: StudentAttendanceDayStatus | null;
    recordedAt: string | null;
  };
  calendar: Array<{
    date: string;
    dayOfMonth: number;
    weekdayShort: string;
    isToday: boolean;
    isFuture: boolean;
    status: StudentAttendanceDayStatus | null;
  }>;
  history: Array<{
    id: string;
    date: string;
    dateLabel: string;
    status: StudentAttendanceDayStatus;
    statusLabel: string;
    recordedAt: string;
  }>;
};

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function endOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function toIsoDate(date: Date): string {
  return startOfUtcDay(date).toISOString().slice(0, 10);
}

function attendanceStanding(percent: number | null): string {
  if (percent == null) return 'No records yet';
  if (percent >= 90) return 'Good standing';
  if (percent >= 75) return 'Needs attention';
  return 'Below threshold';
}

function statusLabel(status: AttendanceStatus): string {
  if (status === 'PRESENT') return 'Present';
  if (status === 'ABSENT') return 'Absent';
  return 'On leave';
}

/** Parse `YYYY-MM` for desk month; defaults to current UTC month. */
export function parseStudentAttendanceMonthParam(value: unknown): Date {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}$/.test(value)) {
    return startOfUtcMonth(new Date());
  }
  const [year, month] = value.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) {
    return startOfUtcMonth(new Date());
  }
  return new Date(Date.UTC(year, month - 1, 1));
}

export async function getStudentAttendanceDesk(
  prisma: PrismaClient,
  userId: string,
  monthAnchor: Date,
): Promise<StudentAttendanceDesk> {
  const now = new Date();
  await ensureStudentProfileForUser(prisma, userId);

  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  const monthStart = startOfUtcMonth(monthAnchor);
  const monthEnd = endOfUtcMonth(monthAnchor);
  const month = `${monthStart.getUTCFullYear()}-${String(monthStart.getUTCMonth() + 1).padStart(2, '0')}`;
  const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    monthStart,
  );
  const todayStart = startOfUtcDay(now);
  const daysInMonth = monthEnd.getUTCDate();

  if (!student) {
    const calendar = buildEmptyCalendar(monthStart, monthEnd, todayStart, new Map());
    return {
      generatedAt: now.toISOString(),
      profileLinked: false,
      month,
      monthLabel,
      summary: {
        percent: null,
        present: 0,
        absent: 0,
        onLeave: 0,
        recordedDays: 0,
        daysInMonth,
        standing: 'No records yet',
      },
      today: { date: toIsoDate(todayStart), status: null, recordedAt: null },
      calendar,
      history: [],
    };
  }

  const rows = await prisma.attendanceRecord.findMany({
    where: {
      studentId: student.id,
      attendanceDate: { gte: monthStart, lte: monthEnd },
    },
    orderBy: { attendanceDate: 'desc' },
    select: {
      id: true,
      attendanceDate: true,
      status: true,
      recordedAt: true,
    },
  });

  const byDate = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    byDate.set(toIsoDate(row.attendanceDate), row);
  }

  const present = rows.filter((r) => r.status === 'PRESENT').length;
  const absent = rows.filter((r) => r.status === 'ABSENT').length;
  const onLeave = rows.filter((r) => r.status === 'ON_LEAVE').length;
  const recordedDays = rows.length;
  const percent = recordedDays > 0 ? Math.round((present / recordedDays) * 1000) / 10 : null;

  const todayKey = toIsoDate(todayStart);
  const todayRow = byDate.get(todayKey);

  const history = rows.map((row) => ({
    id: row.id,
    date: toIsoDate(row.attendanceDate),
    dateLabel: new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(row.attendanceDate),
    status: row.status as StudentAttendanceDayStatus,
    statusLabel: statusLabel(row.status),
    recordedAt: row.recordedAt.toISOString(),
  }));

  return {
    generatedAt: now.toISOString(),
    profileLinked: true,
    month,
    monthLabel,
    summary: {
      percent,
      present,
      absent,
      onLeave,
      recordedDays,
      daysInMonth,
      standing: attendanceStanding(percent),
    },
    today: {
      date: todayKey,
      status: todayRow ? (todayRow.status as StudentAttendanceDayStatus) : null,
      recordedAt: todayRow?.recordedAt.toISOString() ?? null,
    },
    calendar: buildEmptyCalendar(monthStart, monthEnd, todayStart, byDate),
    history,
  };
}

function buildEmptyCalendar(
  monthStart: Date,
  monthEnd: Date,
  todayStart: Date,
  byDate: Map<string, { status: AttendanceStatus }>,
) {
  const calendar: StudentAttendanceDesk['calendar'] = [];
  const weekdayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' });

  for (let day = 1; day <= monthEnd.getUTCDate(); day += 1) {
    const date = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), day));
    const iso = toIsoDate(date);
    const record = byDate.get(iso);
    const isFuture = date.getTime() > todayStart.getTime();
    const isToday = iso === toIsoDate(todayStart);

    calendar.push({
      date: iso,
      dayOfMonth: day,
      weekdayShort: weekdayFmt.format(date),
      isToday,
      isFuture,
      status: record ? (record.status as StudentAttendanceDayStatus) : null,
    });
  }

  return calendar;
}