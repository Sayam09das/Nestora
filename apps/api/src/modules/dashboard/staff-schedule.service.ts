import type { PrismaClient } from '@nestora/database';

export type StaffScheduleEntry = {
  id: string;
  dutyDate: string;
  shiftType: string;
  shiftLabel: string;
  timeWindow: string;
  zone: string | null;
  hostelId: string;
  hostelName: string;
};

export type StaffDutySchedule = {
  generatedAt: string;
  from: string;
  to: string;
  entries: StaffScheduleEntry[];
  dutiesToday: number;
};

const SHIFT_META: Record<string, { shiftLabel: string; timeWindow: string }> = {
  DAY: { shiftLabel: 'Day shift', timeWindow: '08:00 AM – 04:00 PM' },
  EVENING: { shiftLabel: 'Evening shift', timeWindow: '02:00 PM – 10:00 PM' },
  NIGHT: { shiftLabel: 'Night shift', timeWindow: '10:00 PM – 06:00 AM' },
};

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return startOfUtcDay(next);
}

function toIsoDate(date: Date): string {
  return startOfUtcDay(date).toISOString().slice(0, 10);
}

export function shiftDisplay(shiftType: string): { shiftLabel: string; timeWindow: string } {
  const key = shiftType.trim().toUpperCase();
  return (
    SHIFT_META[key] ?? {
      shiftLabel: shiftType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      timeWindow: '—',
    }
  );
}

export function defaultStaffScheduleRange(): { from: Date; to: Date } {
  const today = startOfUtcDay(new Date());
  return { from: addUtcDays(today, -7), to: addUtcDays(today, 20) };
}

export async function getStaffDutySchedule(
  prisma: PrismaClient,
  staffId: string,
  from: Date,
  to: Date,
): Promise<StaffDutySchedule> {
  const rangeStart = startOfUtcDay(from);
  const rangeEnd = startOfUtcDay(to);
  const today = startOfUtcDay(new Date());

  const rows = await prisma.dutyAssignment.findMany({
    where: {
      staffId,
      dutyDate: { gte: rangeStart, lte: rangeEnd },
    },
    orderBy: [{ dutyDate: 'asc' }, { shiftType: 'asc' }],
    select: {
      id: true,
      dutyDate: true,
      shiftType: true,
      zone: true,
      hostelId: true,
      hostel: { select: { name: true } },
    },
  });

  const entries: StaffScheduleEntry[] = rows.map((row) => {
    const meta = shiftDisplay(row.shiftType);
    return {
      id: row.id,
      dutyDate: toIsoDate(row.dutyDate),
      shiftType: row.shiftType,
      shiftLabel: meta.shiftLabel,
      timeWindow: meta.timeWindow,
      zone: row.zone,
      hostelId: row.hostelId,
      hostelName: row.hostel.name,
    };
  });

  const dutiesToday = rows.filter((row) => toIsoDate(row.dutyDate) === toIsoDate(today)).length;

  return {
    generatedAt: new Date().toISOString(),
    from: toIsoDate(rangeStart),
    to: toIsoDate(rangeEnd),
    entries,
    dutiesToday,
  };
}

export function parseScheduleDateParam(value: unknown, fallback: Date): Date {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return startOfUtcDay(fallback);
  }
  const parts = value.trim().split('-').map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return startOfUtcDay(new Date(Date.UTC(y, m - 1, d)));
}