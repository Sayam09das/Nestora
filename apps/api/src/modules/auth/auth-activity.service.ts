import type { PrismaClient } from '@nestora/database';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';
import { AUTH_ACTIVITY_ACTIONS } from './auth-activity.constants.js';

export type AuthActivityQuery = {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
};

export async function listAuthActivityForAdmin(
  prisma: PrismaClient,
  query: AuthActivityQuery,
): Promise<{
  events: Array<{
    id: string;
    actorUserId: string | null;
    actorRole: string;
    actionName: string;
    entityType: string;
    entityId: string;
    ipAddress: string | null;
    timestamp: Date;
  }>;
  pagination: ReturnType<typeof buildPaginationMeta>;
}> {
  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
  const { page: safePage, limit: safeLimit, skip } = normalizePagination(page, limit);

  const actions = query.action ? [query.action] : [...AUTH_ACTIVITY_ACTIONS];

  const where = {
    actionName: { in: [...actions] },
    ...(query.userId
      ? {
          OR: [{ actorUserId: query.userId }, { entityType: 'User', entityId: query.userId }],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { timestamp: 'desc' },
      select: {
        id: true,
        actorUserId: true,
        actorRole: true,
        actionName: true,
        entityType: true,
        entityId: true,
        ipAddress: true,
        timestamp: true,
      },
    }),
  ]);

  return {
    events: rows,
    pagination: buildPaginationMeta(safePage, safeLimit, total),
  };
}
