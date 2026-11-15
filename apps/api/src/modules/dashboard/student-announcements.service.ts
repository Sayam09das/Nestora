import type { Prisma, PrismaClient } from '@nestora/database';
import type { StudentAcknowledgeNoticeBody } from '@nestora/validators';
import { BadRequestError, NotFoundError } from '../../common/errors/index.js';
import { deriveNoticeStatus, mapCategory } from '../announcements/announcements.service.js';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';

export type StudentAnnouncementItem = {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  category: string;
  categoryLabel: string;
  scope: string;
  relativeTime: string;
  publishedAt: string;
  expiresAt: string | null;
  status: 'live' | 'scheduled' | 'expired';
  statusLabel: string;
  author: string;
  requiresAcknowledgement: boolean;
  acknowledged: boolean;
  acknowledgedAt: string | null;
  attachments: Array<{ id: string; fileName: string; fileSize: number }>;
  isEmergency: boolean;
};

export type StudentAnnouncementsDesk = {
  generatedAt: string;
  profileLinked: boolean;
  hostelName: string | null;
  summary: {
    total: number;
    mandatory: number;
    unacknowledged: number;
    emergency: number;
  };
  announcements: StudentAnnouncementItem[];
};

const noticeInclude = {
  hostel: { select: { name: true } },
  attachments: { select: { id: true, fileName: true, fileSize: true } },
  acknowledgements: { select: { studentId: true, acknowledgedAt: true } },
} satisfies Prisma.NoticeInclude;

type NoticeRow = Prisma.NoticeGetPayload<{ include: typeof noticeInclude }>;

function relativeTimeLabel(publishedAt: Date, now: Date): string {
  const diffDays = Math.floor((now.getTime() - publishedAt.getTime()) / 86_400_000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function formatPublishedAt(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function excerptFromBody(body: string): string {
  const plain = body.replace(/\s+/g, ' ').trim();
  return plain.length > 200 ? `${plain.slice(0, 197)}…` : plain;
}

function authorLabel(category: string): string {
  const trimmed = category.trim();
  return trimmed ? `Posted · ${trimmed}` : 'Posted by Administration';
}

function mapStudentNoticeStatus(ui: ReturnType<typeof deriveNoticeStatus>): {
  status: StudentAnnouncementItem['status'];
  statusLabel: string;
} {
  if (ui === 'Expired') return { status: 'expired', statusLabel: 'Expired' };
  if (ui === 'Scheduled') return { status: 'scheduled', statusLabel: 'Scheduled' };
  return { status: 'live', statusLabel: 'Live' };
}

function noticeWhereForStudent(hostelId: string | null, now: Date): Prisma.NoticeWhereInput {
  return {
    OR: hostelId ? [{ hostelId: null }, { hostelId }] : [{ hostelId: null }],
    AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
  };
}

const emptyDesk = (now: Date): StudentAnnouncementsDesk => ({
  generatedAt: now.toISOString(),
  profileLinked: false,
  hostelName: null,
  summary: { total: 0, mandatory: 0, unacknowledged: 0, emergency: 0 },
  announcements: [],
});

function mapNoticeRow(row: NoticeRow, studentId: string, now: Date): StudentAnnouncementItem {
  const categoryLabel = mapCategory(row.category);
  const uiStatus = deriveNoticeStatus(row, now);
  const mapped = mapStudentNoticeStatus(uiStatus);
  const ack = row.acknowledgements.find((a) => a.studentId === studentId);

  return {
    id: row.id,
    title: row.title,
    body: row.description,
    excerpt: excerptFromBody(row.description),
    category: row.category,
    categoryLabel,
    scope: row.hostel?.name ?? 'University-wide',
    relativeTime: relativeTimeLabel(row.publishedAt, now),
    publishedAt: formatPublishedAt(row.publishedAt),
    expiresAt: row.expiresAt ? formatPublishedAt(row.expiresAt) : null,
    status: mapped.status,
    statusLabel: mapped.statusLabel,
    author: authorLabel(row.category),
    requiresAcknowledgement: row.requiresAcknowledgement,
    acknowledged: Boolean(ack),
    acknowledgedAt: ack ? formatPublishedAt(ack.acknowledgedAt) : null,
    attachments: row.attachments.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      fileSize: a.fileSize,
    })),
    isEmergency: categoryLabel === 'Emergency',
  };
}

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

export async function getStudentAnnouncementsDesk(
  prisma: PrismaClient,
  userId: string,
): Promise<StudentAnnouncementsDesk> {
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
    where: noticeWhereForStudent(hostelId, now),
    orderBy: { publishedAt: 'desc' },
    take: 60,
    include: noticeInclude,
  });

  const announcements = rows
    .filter((row) => deriveNoticeStatus(row, now) !== 'Expired')
    .map((row) => mapNoticeRow(row, student.id, now));

  const mandatory = announcements.filter((a) => a.requiresAcknowledgement).length;
  const unacknowledged = announcements.filter((a) => a.requiresAcknowledgement && !a.acknowledged).length;
  const emergency = announcements.filter((a) => a.isEmergency).length;

  return {
    generatedAt: now.toISOString(),
    profileLinked: true,
    hostelName,
    summary: {
      total: announcements.length,
      mandatory,
      unacknowledged,
      emergency,
    },
    announcements,
  };
}

export async function acknowledgeStudentNotice(
  prisma: PrismaClient,
  userId: string,
  body: StudentAcknowledgeNoticeBody,
): Promise<StudentAnnouncementsDesk> {
  const now = new Date();
  await ensureStudentProfileForUser(prisma, userId);

  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    throw new BadRequestError('Student profile is not linked to this account.');
  }

  const { hostelId } = await resolveHostelContext(prisma, student.id);

  const notice = await prisma.notice.findFirst({
    where: {
      id: body.noticeId,
      ...noticeWhereForStudent(hostelId, now),
    },
    include: noticeInclude,
  });

  if (!notice) {
    throw new NotFoundError('Notice not found or no longer available.');
  }

  if (!notice.requiresAcknowledgement) {
    throw new BadRequestError('This notice does not require acknowledgement.');
  }

  if (deriveNoticeStatus(notice, now) === 'Expired') {
    throw new BadRequestError('This notice has expired.');
  }

  const already = notice.acknowledgements.some((a) => a.studentId === student.id);
  if (!already) {
    await prisma.noticeAcknowledgement.create({
      data: {
        noticeId: notice.id,
        studentId: student.id,
      },
    });
  }

  return getStudentAnnouncementsDesk(prisma, userId);
}