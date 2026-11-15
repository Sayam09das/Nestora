import type { PrismaClient } from '@nestora/database';
import type { NotificationRow } from './notification.service.js';
import { loadEnv } from '../../config/env.js';
import { sendTransactionalNotificationEmail } from '../auth/mail.service.js';

type EmailCategoryKey = 'leave' | 'complaint' | 'incident' | 'notice' | 'fee' | 'movement';

function preferenceAllows(
  prefs: {
    emailLeaves: boolean;
    emailMaintenance: boolean;
    emailFees: boolean;
    emailNotices: boolean;
  },
  category: EmailCategoryKey,
): boolean {
  switch (category) {
    case 'leave':
      return prefs.emailLeaves;
    case 'complaint':
      return prefs.emailMaintenance;
    case 'fee':
      return prefs.emailFees;
    case 'incident':
    case 'notice':
    case 'movement':
    default:
      return prefs.emailNotices;
  }
}

function mapNotificationCategory(category: string): EmailCategoryKey {
  const c = category.toLowerCase();
  if (c.includes('leave')) return 'leave';
  if (c.includes('complaint') || c.includes('maintenance')) return 'complaint';
  if (c.includes('fee')) return 'fee';
  if (c.includes('incident') || c.includes('emergency')) return 'incident';
  if (c.includes('movement') || c.includes('gate')) return 'movement';
  return 'notice';
}

/**
 * In-process async email dispatch (MOD-07). For heavier load, move to a dedicated worker process.
 */
export function scheduleNotificationEmails(
  prisma: PrismaClient,
  notifications: NotificationRow[],
  fallbackCategory: EmailCategoryKey,
): void {
  if (notifications.length === 0) return;

  void (async () => {
    let env: ReturnType<typeof loadEnv>;
    try {
      env = loadEnv(process.env);
    } catch {
      return;
    }
    if (!env.SMTP_USER || !env.SMTP_PASS) return;

    for (const notification of notifications) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: notification.userId },
          select: {
            email: true,
            status: true,
            notificationPreference: true,
          },
        });
        if (!user || user.status !== 'ACTIVE') continue;

        const prefs = user.notificationPreference ?? {
          emailLeaves: true,
          emailMaintenance: true,
          emailFees: true,
          emailNotices: true,
        };

        const emailKey = mapNotificationCategory(notification.category) ?? fallbackCategory;
        if (!preferenceAllows(prefs, emailKey)) continue;

        const link = notification.actionLink
          ? notification.actionLink.startsWith('http')
            ? notification.actionLink
            : `${env.WEB_URL}${notification.actionLink}`
          : env.WEB_URL;

        await sendTransactionalNotificationEmail(env, user.email, {
          title: notification.title,
          message: notification.message,
          actionUrl: link,
        });
      } catch (err) {
        console.error('[notifications] email dispatch failed', err);
      }
    }
  })();
}