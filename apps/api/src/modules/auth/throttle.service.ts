import { createHash } from 'node:crypto';
import type { PrismaClient } from '@nestora/database';
import {
  IP_LOGIN_FAILURE_MAX,
  IP_LOGIN_FAILURE_WINDOW_MS,
  IP_LOGIN_LOCKOUT_MS,
} from './auth.constants.js';

function hashIp(ip: string): string {
  return createHash('sha256').update(ip, 'utf8').digest('hex');
}

export async function recordLoginFailureForIp(
  prisma: PrismaClient,
  ip: string | undefined,
): Promise<void> {
  if (!ip) {
    return;
  }
  const ipHash = hashIp(ip);
  const now = new Date();
  const row = await prisma.authIpThrottle.findUnique({ where: { ipHash } });
  if (!row) {
    await prisma.authIpThrottle.create({
      data: {
        ipHash,
        windowStartedAt: now,
        failedCount: 1,
        lockedUntil: null,
      },
    });
    return;
  }
  if (row.lockedUntil && row.lockedUntil > now) {
    return;
  }
  let windowStart = row.windowStartedAt;
  let failed = row.failedCount;
  if (now.getTime() - windowStart.getTime() > IP_LOGIN_FAILURE_WINDOW_MS) {
    failed = 1;
    windowStart = now;
  } else {
    failed += 1;
  }
  let lockedUntil: Date | null = row.lockedUntil;
  if (failed >= IP_LOGIN_FAILURE_MAX) {
    lockedUntil = new Date(now.getTime() + IP_LOGIN_LOCKOUT_MS);
    failed = 0;
    windowStart = now;
  }
  await prisma.authIpThrottle.update({
    where: { ipHash },
    data: { failedCount: failed, windowStartedAt: windowStart, lockedUntil },
  });
}

export async function clearLoginFailureForIp(
  prisma: PrismaClient,
  ip: string | undefined,
): Promise<void> {
  if (!ip) {
    return;
  }
  const ipHash = hashIp(ip);
  await prisma.authIpThrottle.updateMany({
    where: { ipHash },
    data: { failedCount: 0, lockedUntil: null, windowStartedAt: new Date() },
  });
}

export async function isIpLoginLocked(
  prisma: PrismaClient,
  ip: string | undefined,
): Promise<boolean> {
  if (!ip) {
    return false;
  }
  const row = await prisma.authIpThrottle.findUnique({ where: { ipHash: hashIp(ip) } });
  if (!row?.lockedUntil) {
    return false;
  }
  return row.lockedUntil > new Date();
}
