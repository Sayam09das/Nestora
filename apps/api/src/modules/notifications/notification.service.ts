import type { PrismaClient } from '@nestora/database';
import { ForbiddenError, NotFoundError } from '../../common/errors/index.js';

export type NotificationRow = {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  actionLink: string | null;
  createdAt: string;
};

export type NotificationInbox = {
  generatedAt: string;
  unreadCount: number;
  items: NotificationRow[];
  page: number;
  limit: number;
  total: number;
};

export type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  category: string;
  actionLink?: string | null;
};

export async function createNotification(
  prisma: PrismaClient,
  input: CreateNotificationInput,
): Promise<NotificationRow> {
  const row = await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title.slice(0, 150),
      message: input.message,
      category: input.category.slice(0, 50),
      actionLink: input.actionLink ?? null,
    },
  });
  return mapRow(row);
}

export async function createNotifications(
  prisma: PrismaClient,
  inputs: CreateNotificationInput[],
): Promise<NotificationRow[]> {
  if (inputs.length === 0) return [];
  const rows = await prisma.$transaction(
    inputs.map((input) =>
      prisma.notification.create({
        data: {
          userId: input.userId,
          title: input.title.slice(0, 150),
          message: input.message,
          category: input.category.slice(0, 50),
          actionLink: input.actionLink ?? null,
        },
      }),
    ),
  );
  return rows.map(mapRow);
}

function mapRow(row: {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  actionLink: string | null;
  createdAt: Date;
}): NotificationRow {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    message: row.message,
    category: row.category,
    isRead: row.isRead,
    actionLink: row.actionLink,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listNotificationsForUser(
  prisma: PrismaClient,
  userId: string,
  opts?: { page?: number; limit?: number; unreadOnly?: boolean },
): Promise<NotificationInbox> {
  const page = opts?.page ?? 1;
  const limit = opts?.limit ?? 20;
  const skip = (page - 1) * limit;
  const where = {
    userId,
    ...(opts?.unreadOnly ? { isRead: false } : {}),
  };

  const [total, unreadCount, rows] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    unreadCount,
    items: rows.map(mapRow),
    page,
    limit,
    total,
  };
}

export async function getUnreadCount(prisma: PrismaClient, userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markNotificationRead(
  prisma: PrismaClient,
  userId: string,
  notificationId: string,
): Promise<NotificationRow> {
  const row = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!row) {
    throw new NotFoundError('Notification not found.');
  }
  if (row.userId !== userId) {
    throw new ForbiddenError('You cannot modify this notification.');
  }
  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
  return mapRow(updated);
}

export async function markAllNotificationsRead(prisma: PrismaClient, userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return result.count;
}