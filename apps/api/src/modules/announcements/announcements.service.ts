import type { Prisma, PrismaClient } from '@nestora/database';
import type { AnnouncementsDeskListQuery } from '@nestora/validators';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';
import { hostelNameInScope } from '../../common/helpers/warden-hostel-scope.js';

export type NoticeUiStatus = 'Live' | 'Scheduled' | 'Expired' | 'Draft';
export type NoticeUiCategory = 'General' | 'Hostel Rules' | 'Fees' | 'Maintenance' | 'Emergency' | 'Events';

export type AnnouncementDeskRecord = {
  id: string;
  noticeRef: string;
  title: string;
  excerpt: string;
  body: string;
  category: NoticeUiCategory;
  scope: string;
  status: NoticeUiStatus;
  publishedAt: string;
  expiresAt: string | null;
  publishedBy: string;
  requiresAcknowledgement: boolean;
  acknowledgedCount: number;
  targetCount: number;
  hasAttachment: boolean;
  pinned: boolean;
};

export type AnnouncementsDeskSummary = {
  generatedAt: string;
  liveNow: number;
  scheduled: number;
  ackPending: number;
  avgReadRate: number;
  emergencyActive: number;
  publishedThisMonth: number;
  facets: {
    scopes: string[];
    categories: NoticeUiCategory[];
  };
};

const noticeInclude = {
  hostel: { select: { name: true } },
  attachments: { select: { id: true }, take: 1 },
  acknowledgements: { select: { id: true } },
} satisfies Prisma.NoticeInclude;

type NoticeRow = Prisma.NoticeGetPayload<{ include: typeof noticeInclude }>;

const UI_CATEGORIES: NoticeUiCategory[] = [
  'General',
  'Hostel Rules',
  'Fees',
  'Maintenance',
  'Emergency',
  'Events',
];

export function mapCategory(raw: string): NoticeUiCategory {
  const direct = UI_CATEGORIES.find((c) => c.toLowerCase() === raw.trim().toLowerCase());
  if (direct) return direct;
  const key = raw.toLowerCase();
  if (key.includes('fee')) return 'Fees';
  if (key.includes('rule')) return 'Hostel Rules';
  if (key.includes('maint')) return 'Maintenance';
  if (key.includes('emerg')) return 'Emergency';
  if (key.includes('event')) return 'Events';
  return 'General';
}

export function deriveNoticeStatus(
  row: Pick<NoticeRow, 'publishedAt' | 'expiresAt'>,
  now = new Date(),
): NoticeUiStatus {
  if (row.publishedAt.getTime() > now.getTime()) return 'Scheduled';
  if (row.expiresAt && row.expiresAt.getTime() <= now.getTime()) return 'Expired';
  return 'Live';
}

function noticeRef(row: NoticeRow, seq: number): string {
  return `NOT-${row.publishedAt.getUTCFullYear()}-${String(seq).padStart(4, '0')}`;
}

function excerptFromBody(body: string): string {
  const plain = body.replace(/\s+/g, ' ').trim();
  return plain.length > 160 ? `${plain.slice(0, 157)}…` : plain;
}

function scopeLabel(row: NoticeRow): string {
  return row.hostel?.name ?? 'University-wide';
}

function hostelScopeWhere(scopeHostelNames?: string[]): Prisma.NoticeWhereInput | undefined {
  if (!scopeHostelNames?.length) return undefined;
  return {
    OR: [{ hostelId: null }, { hostel: { name: { in: scopeHostelNames } } }],
  };
}

async function audienceCount(prisma: PrismaClient, hostelId: string | null): Promise<number> {
  if (!hostelId) {
    return prisma.allocationRecord.count({ where: { status: 'ACTIVE' } });
  }
  return prisma.allocationRecord.count({
    where: {
      status: 'ACTIVE',
      bed: { room: { floor: { block: { building: { hostelId } } } } },
    },
  });
}

async function loadPublisherNames(prisma: PrismaClient, ids: string[]): Promise<Map<string, string>> {
  if (!ids.length) return new Map();
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, firstName: true, lastName: true },
  });
  const map = new Map<string, string>();
  for (const u of users) {
    map.set(u.id, `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'Administrator');
  }
  return map;
}

async function mapNoticeRow(
  prisma: PrismaClient,
  row: NoticeRow,
  seq: number,
  publisherNames: Map<string, string>,
  audienceCache: Map<string, number>,
  now = new Date(),
): Promise<AnnouncementDeskRecord> {
  const cacheKey = row.hostelId ?? 'university';
  let targetCount = audienceCache.get(cacheKey);
  if (targetCount === undefined) {
    targetCount = await audienceCount(prisma, row.hostelId);
    audienceCache.set(cacheKey, targetCount);
  }

  const status = deriveNoticeStatus(row, now);
  const acknowledgedCount = row.acknowledgements.length;

  return {
    id: row.id,
    noticeRef: noticeRef(row, seq),
    title: row.title,
    excerpt: excerptFromBody(row.description),
    body: row.description,
    category: mapCategory(row.category),
    scope: scopeLabel(row),
    status,
    publishedAt: row.publishedAt.toISOString(),
    expiresAt: row.expiresAt?.toISOString() ?? null,
    publishedBy: publisherNames.get(row.publishedBy) ?? 'Administrator',
    requiresAcknowledgement: row.requiresAcknowledgement,
    acknowledgedCount,
    targetCount,
    hasAttachment: row.attachments.length > 0,
    pinned: mapCategory(row.category) === 'Emergency' && status === 'Live',
  };
}

function matchesQuery(record: AnnouncementDeskRecord, q?: string): boolean {
  if (!q?.trim()) return true;
  const needle = q.trim().toLowerCase();
  return (
    record.title.toLowerCase().includes(needle) ||
    record.noticeRef.toLowerCase().includes(needle) ||
    record.publishedBy.toLowerCase().includes(needle) ||
    record.excerpt.toLowerCase().includes(needle)
  );
}

async function fetchNotices(prisma: PrismaClient, scopeHostelNames?: string[]): Promise<NoticeRow[]> {
  return prisma.notice.findMany({
    where: hostelScopeWhere(scopeHostelNames),
    include: noticeInclude,
    orderBy: [{ publishedAt: 'desc' }],
    take: 500,
  });
}

function sequenceForRow(rows: NoticeRow[], id: string): number {
  const sorted = [...rows].sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime());
  const index = sorted.findIndex((r) => r.id === id);
  return index >= 0 ? index + 1 : 1;
}

export async function getAnnouncementsDeskSummary(
  prisma: PrismaClient,
  scopeHostelNames?: string[],
): Promise<AnnouncementsDeskSummary> {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const rows = await fetchNotices(prisma, scopeHostelNames);
  const audienceCache = new Map<string, number>();

  let liveNow = 0;
  let scheduled = 0;
  let ackPending = 0;
  let emergencyActive = 0;
  let publishedThisMonth = 0;
  let mandatoryAckTotal = 0;
  let mandatoryAckDone = 0;
  const categories = new Set<NoticeUiCategory>();
  const scopes = new Set<string>();

  for (const row of rows) {
    const status = deriveNoticeStatus(row, now);
    const category = mapCategory(row.category);
    categories.add(category);
    scopes.add(scopeLabel(row));

    if (status === 'Live') liveNow += 1;
    if (status === 'Scheduled') scheduled += 1;
    if (category === 'Emergency' && status === 'Live') emergencyActive += 1;
    if (row.publishedAt >= monthStart && status !== 'Scheduled') publishedThisMonth += 1;

    if (row.requiresAcknowledgement && (status === 'Live' || status === 'Scheduled')) {
      const cacheKey = row.hostelId ?? 'university';
      let target = audienceCache.get(cacheKey);
      if (target === undefined) {
        target = await audienceCount(prisma, row.hostelId);
        audienceCache.set(cacheKey, target);
      }
      const acked = row.acknowledgements.length;
      mandatoryAckTotal += target;
      mandatoryAckDone += acked;
      ackPending += Math.max(0, target - acked);
    }
  }

  const avgReadRate =
    mandatoryAckTotal > 0 ? Math.round((mandatoryAckDone / mandatoryAckTotal) * 100) : 100;

  const scopeFacets = scopeHostelNames?.length
    ? ['University-wide', ...scopeHostelNames]
    : ['University-wide', ...(await prisma.hostel.findMany({ select: { name: true } })).map((h) => h.name)];

  return {
    generatedAt: now.toISOString(),
    liveNow,
    scheduled,
    ackPending,
    avgReadRate,
    emergencyActive,
    publishedThisMonth,
    facets: {
      scopes: [...new Set(scopeFacets)].sort(),
      categories: [...categories].sort(),
    },
  };
}

export async function listAnnouncementsDesk(
  prisma: PrismaClient,
  query: AnnouncementsDeskListQuery,
  scopeHostelNames?: string[],
): Promise<{ notices: AnnouncementDeskRecord[]; pagination: ReturnType<typeof buildPaginationMeta> }> {
  const { page, limit } = normalizePagination(query.page ?? DEFAULT_PAGE, query.limit ?? DEFAULT_PAGE_LIMIT);
  const now = new Date();
  const rows = await fetchNotices(prisma, scopeHostelNames);
  const publisherIds = [...new Set(rows.map((r) => r.publishedBy))];
  const publishers = await loadPublisherNames(prisma, publisherIds);
  const audienceCache = new Map<string, number>();

  let mapped: AnnouncementDeskRecord[] = [];
  for (const row of rows) {
    mapped.push(await mapNoticeRow(prisma, row, sequenceForRow(rows, row.id), publishers, audienceCache, now));
  }

  mapped = mapped.filter((rec) => {
    if (query.category && rec.category !== query.category) return false;
    if (query.scope && query.scope !== 'All Scopes' && rec.scope !== query.scope) return false;
    if (query.status && rec.status !== query.status) return false;
    if (!matchesQuery(rec, query.q)) return false;
    return true;
  });

  const total = mapped.length;
  const start = (page - 1) * limit;
  const notices = mapped.slice(start, start + limit);

  return { notices, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getAnnouncementDeskById(
  prisma: PrismaClient,
  noticeId: string,
  scopeHostelNames?: string[],
): Promise<AnnouncementDeskRecord | null> {
  const row = await prisma.notice.findUnique({ where: { id: noticeId }, include: noticeInclude });
  if (!row) return null;
  const scope = scopeLabel(row);
  if (scopeHostelNames?.length && row.hostelId && !hostelNameInScope(scope, scopeHostelNames)) {
    return null;
  }
  const allRows = await fetchNotices(prisma, scopeHostelNames);
  const publishers = await loadPublisherNames(prisma, [row.publishedBy]);
  return mapNoticeRow(
    prisma,
    row,
    sequenceForRow(allRows, row.id),
    publishers,
    new Map(),
    new Date(),
  );
}
