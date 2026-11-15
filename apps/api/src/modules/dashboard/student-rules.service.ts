import type { Prisma, PrismaClient } from '@nestora/database';
import { deriveNoticeStatus, mapCategory } from '../announcements/announcements.service.js';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';

export type StudentRuleSource = 'policy' | 'notice';

export type StudentRuleItem = {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  source: StudentRuleSource;
  scope: string;
  scopeKind: 'university' | 'hostel';
  updatedAt: string;
  updatedLabel: string;
};

export type StudentRulesDesk = {
  generatedAt: string;
  profileLinked: boolean;
  hostelName: string | null;
  summary: {
    total: number;
    university: number;
    hostel: number;
    fromNotices: number;
  };
  rules: StudentRuleItem[];
};

function relativeUpdatedLabel(date: Date, now: Date): string {
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays <= 0) return 'Updated today';
  if (diffDays === 1) return 'Updated yesterday';
  if (diffDays < 30) return `Updated ${diffDays} days ago`;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function excerptFromBody(body: string): string {
  const plain = body.replace(/\s+/g, ' ').trim();
  return plain.length > 160 ? `${plain.slice(0, 157)}…` : plain;
}

function noticeWhereForStudent(hostelId: string | null, now: Date): Prisma.NoticeWhereInput {
  return {
    OR: hostelId ? [{ hostelId: null }, { hostelId }] : [{ hostelId: null }],
    AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
  };
}

function isRulesNoticeCategory(category: string): boolean {
  if (mapCategory(category) === 'Hostel Rules') return true;
  return category.toLowerCase().includes('rule');
}

function rulesWhereForStudent(hostelId: string | null): Prisma.HostelRuleWhereInput {
  return {
    OR: [
      { isUniversityWide: true },
      { hostelId: null },
      ...(hostelId ? [{ hostelId }] : []),
    ],
  };
}

const emptyDesk = (now: Date): StudentRulesDesk => ({
  generatedAt: now.toISOString(),
  profileLinked: false,
  hostelName: null,
  summary: { total: 0, university: 0, hostel: 0, fromNotices: 0 },
  rules: [],
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

export async function getStudentRulesDesk(prisma: PrismaClient, userId: string): Promise<StudentRulesDesk> {
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

  const [policyRows, noticeRows] = await Promise.all([
    prisma.hostelRule.findMany({
      where: rulesWhereForStudent(hostelId),
      orderBy: { createdAt: 'desc' },
      include: { hostel: { select: { name: true } } },
      take: 80,
    }),
    prisma.notice.findMany({
      where: {
        AND: [
          noticeWhereForStudent(hostelId, now),
          {
            OR: [
              { category: { equals: 'Hostel Rules', mode: 'insensitive' } },
              { category: { contains: 'rule', mode: 'insensitive' } },
            ],
          },
        ],
      },
      orderBy: { publishedAt: 'desc' },
      take: 40,
      include: { hostel: { select: { name: true } } },
    }),
  ]);

  const policyItems: StudentRuleItem[] = policyRows.map((row) => {
    const university = row.isUniversityWide || !row.hostelId;
    return {
      id: `policy-${row.id}`,
      title: row.ruleTitle,
      body: row.ruleText,
      excerpt: excerptFromBody(row.ruleText),
      source: 'policy',
      scope: university ? 'University-wide' : (row.hostel?.name ?? hostelName ?? 'Your hostel'),
      scopeKind: university ? 'university' : 'hostel',
      updatedAt: row.createdAt.toISOString(),
      updatedLabel: relativeUpdatedLabel(row.createdAt, now),
    };
  });

  const noticeItems: StudentRuleItem[] = noticeRows
    .filter((row) => isRulesNoticeCategory(row.category) && deriveNoticeStatus(row, now) !== 'Expired')
    .map((row) => {
      const university = !row.hostelId;
      return {
        id: `notice-${row.id}`,
        title: row.title,
        body: row.description,
        excerpt: excerptFromBody(row.description),
        source: 'notice',
        scope: university ? 'University-wide' : (row.hostel?.name ?? hostelName ?? 'Your hostel'),
        scopeKind: university ? 'university' : 'hostel',
        updatedAt: row.publishedAt.toISOString(),
        updatedLabel: `${relativeUpdatedLabel(row.publishedAt, now)} · ${formatTimestamp(row.publishedAt)}`,
      };
    });

  const seenTitles = new Set<string>();
  const rules: StudentRuleItem[] = [];
  for (const item of [...policyItems, ...noticeItems]) {
    const key = item.title.trim().toLowerCase();
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);
    rules.push(item);
  }

  rules.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return {
    generatedAt: now.toISOString(),
    profileLinked: true,
    hostelName,
    summary: {
      total: rules.length,
      university: rules.filter((r) => r.scopeKind === 'university').length,
      hostel: rules.filter((r) => r.scopeKind === 'hostel').length,
      fromNotices: rules.filter((r) => r.source === 'notice').length,
    },
    rules,
  };
}