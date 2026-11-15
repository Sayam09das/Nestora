import type { Prisma, PrismaClient } from '@nestora/database';
import { deriveNoticeStatus, mapCategory } from '../announcements/announcements.service.js';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';

export type StudentEventTiming = 'upcoming' | 'ongoing' | 'past';

export type StudentEventItem = {
  id: string;
  title: string;
  description: string;
  excerpt: string;
  scope: string;
  location: string;
  scheduleLabel: string;
  day: string;
  month: string;
  eventAt: string;
  eventAtDisplay: string;
  endsAt: string | null;
  timing: StudentEventTiming;
  timingLabel: string;
  requiresAcknowledgement: boolean;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  publishedLabel: string;
};

export type StudentEventsDesk = {
  generatedAt: string;
  profileLinked: boolean;
  hostelName: string | null;
  summary: {
    total: number;
    upcoming: number;
    ongoing: number;
    needsAck: number;
  };
  events: StudentEventItem[];
};

const noticeInclude = {
  hostel: { select: { name: true } },
  acknowledgements: { select: { studentId: true, acknowledgedAt: true } },
} satisfies Prisma.NoticeInclude;

type NoticeRow = Prisma.NoticeGetPayload<{ include: typeof noticeInclude }>;

export function isEventNoticeCategory(category: string): boolean {
  if (mapCategory(category) === 'Events') return true;
  return category.toLowerCase().includes('event');
}

function noticeWhereForStudent(hostelId: string | null, now: Date): Prisma.NoticeWhereInput {
  return {
    OR: hostelId ? [{ hostelId: null }, { hostelId }] : [{ hostelId: null }],
    AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
  };
}

function eventCategoryWhere(): Prisma.NoticeWhereInput {
  return {
    OR: [
      { category: { equals: 'Events', mode: 'insensitive' } },
      { category: { contains: 'event', mode: 'insensitive' } },
    ],
  };
}

function parseEventVenue(description: string): string {
  const lines = description.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const match = line.match(/^(?:venue|location|where)\s*[:\-–]\s*(.+)$/i);
    if (match?.[1]) return match[1].trim();
  }
  const scoped = lines.find((line) => /^@/.test(line));
  if (scoped) return scoped.replace(/^@\s*/, '');
  return 'See event details';
}

function formatEventDisplay(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatEventTime(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function eventTiming(row: NoticeRow, now: Date): { timing: StudentEventTiming; timingLabel: string } {
  const starts = row.publishedAt.getTime();
  const ends = row.expiresAt?.getTime() ?? null;
  if (ends !== null && ends <= now.getTime()) {
    return { timing: 'past', timingLabel: 'Ended' };
  }
  if (starts > now.getTime()) {
    return { timing: 'upcoming', timingLabel: 'Upcoming' };
  }
  if (ends === null || ends > now.getTime()) {
    return { timing: 'ongoing', timingLabel: 'Happening now' };
  }
  return { timing: 'past', timingLabel: 'Ended' };
}

function excerptFromBody(body: string): string {
  const plain = body.replace(/\s+/g, ' ').trim();
  return plain.length > 180 ? `${plain.slice(0, 177)}…` : plain;
}

const emptyDesk = (now: Date): StudentEventsDesk => ({
  generatedAt: now.toISOString(),
  profileLinked: false,
  hostelName: null,
  summary: { total: 0, upcoming: 0, ongoing: 0, needsAck: 0 },
  events: [],
});

async function resolveHostelContext(
  prisma: PrismaClient,
  studentId: string,
): Promise<{ hostelId: string | null; hostelName: string | null }> {
  const allocation = await prisma.allocationRecord.findFirst({
    where: { studentId, status: 'ACTIVE' },
    orderBy: { allocatedAt: 'desc' },
    include: {
      bed: {
        include: {
          room: {
            include: {
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

  const hostel = allocation?.bed.room.floor.block.building.hostel;
  return { hostelId: hostel?.id ?? null, hostelName: hostel?.name ?? null };
}

function mapEventRow(row: NoticeRow, studentId: string, now: Date): StudentEventItem {
  const venue = parseEventVenue(row.description);
  const { timing, timingLabel } = eventTiming(row, now);
  const ack = row.acknowledgements.find((a) => a.studentId === studentId);

  const day = String(row.publishedAt.getDate()).padStart(2, '0');
  const month = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(row.publishedAt).toUpperCase();

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    excerpt: excerptFromBody(row.description),
    scope: row.hostel?.name ?? 'University-wide',
    location: venue,
    scheduleLabel: `${formatEventTime(row.publishedAt)} · ${venue}`,
    day,
    month,
    eventAt: row.publishedAt.toISOString(),
    eventAtDisplay: formatEventDisplay(row.publishedAt),
    endsAt: row.expiresAt ? formatEventDisplay(row.expiresAt) : null,
    timing,
    timingLabel,
    requiresAcknowledgement: row.requiresAcknowledgement,
    acknowledged: Boolean(ack),
    acknowledgedAt: ack
      ? new Intl.DateTimeFormat('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(ack.acknowledgedAt)
      : null,
    publishedLabel: formatEventDisplay(row.publishedAt),
  };
}

export function mapStudentDashboardEvent(row: {
  id: string;
  title: string;
  description: string;
  publishedAt: Date;
}): { id: string; day: string; month: string; title: string; schedule: string } {
  const venue = parseEventVenue(row.description);
  const day = String(row.publishedAt.getDate()).padStart(2, '0');
  const month = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(row.publishedAt).toUpperCase();
  return {
    id: row.id,
    day,
    month,
    title: row.title,
    schedule: `${formatEventTime(row.publishedAt)} · ${venue}`,
  };
}

export async function getStudentEventsDesk(prisma: PrismaClient, userId: string): Promise<StudentEventsDesk> {
  const now = new Date();
  await ensureStudentProfileForUser(prisma, userId);

  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    return emptyDesk(now);
  }

  const { hostelId, hostelName } = await resolveHostelContext(prisma, student.id);

  const rows = await prisma.notice.findMany({
    where: {
      AND: [noticeWhereForStudent(hostelId, now), eventCategoryWhere()],
    },
    orderBy: { publishedAt: 'asc' },
    take: 80,
    include: noticeInclude,
  });

  const events = rows
    .filter((row) => isEventNoticeCategory(row.category) && deriveNoticeStatus(row, now) !== 'Expired')
    .map((row) => mapEventRow(row, student.id, now));

  const upcoming = events.filter((e) => e.timing === 'upcoming').length;
  const ongoing = events.filter((e) => e.timing === 'ongoing').length;
  const needsAck = events.filter((e) => e.requiresAcknowledgement && !e.acknowledged).length;

  return {
    generatedAt: now.toISOString(),
    profileLinked: true,
    hostelName,
    summary: {
      total: events.length,
      upcoming,
      ongoing,
      needsAck,
    },
    events,
  };
}