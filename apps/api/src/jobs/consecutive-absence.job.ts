import type { PrismaClient } from '@nestora/database';
import { scanConsecutiveAbsenceAlerts } from '../modules/attendance/attendance.service.js';
import { CONFIG_KEYS, getConfigNumber } from '../modules/settings/system-config.service.js';
import { notifyConsecutiveAbsence } from '../modules/notifications/notification-events.service.js';

const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function runConsecutiveAbsenceAlerts(prisma: PrismaClient): Promise<number> {
  const now = new Date();
  const dedupeSince = new Date(now.getTime() - DEDUPE_WINDOW_MS);
  const threshold = await getConfigNumber(prisma, CONFIG_KEYS.absence_threshold);
  const alerts = await scanConsecutiveAbsenceAlerts(prisma, threshold);

  let dispatched = 0;
  for (const alert of alerts) {
    dispatched += await notifyConsecutiveAbsence(prisma, {
      hostelId: alert.hostelId,
      studentName: alert.studentName,
      streak: alert.streak,
      threshold,
      dedupeSince,
    });
  }
  return dispatched;
}