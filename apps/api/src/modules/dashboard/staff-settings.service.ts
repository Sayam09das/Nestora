import type { PrismaClient } from '@nestora/database';
import type { StaffNotificationPreferencesBody } from '@nestora/validators';

import { NotFoundError } from '../../common/errors/index.js';
import * as authService from '../auth/auth.service.js';
import { getOperationalDashboardOverview } from './operational-dashboard.service.js';

export type StaffNotificationPreferences = {
  emailLeaves: boolean;
  emailMaintenance: boolean;
  emailFees: boolean;
  emailNotices: boolean;
};

export type StaffSettingsDesk = {
  generatedAt: string;
  security: {
    mfaEnabled: boolean;
    isVerified: boolean;
    mustChangePassword: boolean;
    email: string;
  };
  notifications: StaffNotificationPreferences;
  operations: {
    dutiesToday: number;
    myAssignedTickets: number;
    openComplaints: number;
  };
  scope: {
    hostelNames: string[];
    unassigned: boolean;
  };
};

async function resolveNotificationPreferences(
  prisma: PrismaClient,
  userId: string,
): Promise<StaffNotificationPreferences> {
  const row = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (!row) {
    return {
      emailLeaves: true,
      emailMaintenance: true,
      emailFees: true,
      emailNotices: true,
    };
  }
  return {
    emailLeaves: row.emailLeaves,
    emailMaintenance: row.emailMaintenance,
    emailFees: row.emailFees,
    emailNotices: row.emailNotices,
  };
}

export async function getStaffSettingsDesk(
  prisma: PrismaClient,
  userId: string,
): Promise<StaffSettingsDesk> {
  const [user, notifications, overview] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        isVerified: true,
        mfaEnabled: true,
        mustChangePassword: true,
      },
    }),
    resolveNotificationPreferences(prisma, userId),
    getOperationalDashboardOverview(prisma, userId, 'HOSTEL_STAFF'),
  ]);

  if (!user) {
    throw new NotFoundError('User not found.');
  }

  return {
    generatedAt: new Date().toISOString(),
    security: {
      mfaEnabled: user.mfaEnabled,
      isVerified: user.isVerified,
      mustChangePassword: user.mustChangePassword,
      email: user.email,
    },
    notifications,
    operations: {
      dutiesToday: overview.operations.dutiesToday,
      myAssignedTickets: overview.operations.myAssignedTickets,
      openComplaints: overview.operations.openComplaints,
    },
    scope: overview.scope,
  };
}

export async function updateStaffNotificationPreferences(
  prisma: PrismaClient,
  userId: string,
  body: StaffNotificationPreferencesBody,
): Promise<StaffNotificationPreferences> {
  const updated = await prisma.notificationPreference.upsert({
    where: { userId },
    create: {
      userId,
      emailLeaves: body.emailLeaves ?? true,
      emailMaintenance: body.emailMaintenance ?? true,
      emailFees: body.emailFees ?? true,
      emailNotices: body.emailNotices ?? true,
    },
    update: {
      ...(body.emailLeaves !== undefined ? { emailLeaves: body.emailLeaves } : {}),
      ...(body.emailMaintenance !== undefined ? { emailMaintenance: body.emailMaintenance } : {}),
      ...(body.emailFees !== undefined ? { emailFees: body.emailFees } : {}),
      ...(body.emailNotices !== undefined ? { emailNotices: body.emailNotices } : {}),
    },
  });

  return {
    emailLeaves: updated.emailLeaves,
    emailMaintenance: updated.emailMaintenance,
    emailFees: updated.emailFees,
    emailNotices: updated.emailNotices,
  };
}

export async function listStaffSettingsSessions(prisma: PrismaClient, userId: string, currentSessionId?: string) {
  const sessionsRaw = await authService.listSessionsForUser(prisma, userId);
  return sessionsRaw.map((s) => ({
    id: s.id,
    createdAt: s.createdAt.toISOString(),
    lastActivityAt: s.lastActivityAt?.toISOString() ?? null,
    expiresAt: s.expiresAt.toISOString(),
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    isCurrent: Boolean(currentSessionId && s.id === currentSessionId),
  }));
}