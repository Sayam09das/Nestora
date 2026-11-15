import type { PrismaClient } from '@nestora/database';
import type { StudentNotificationPreferencesBody } from '@nestora/validators';

import { NotFoundError } from '../../common/errors/index.js';
import * as authService from '../auth/auth.service.js';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';

export type StudentNotificationPreferences = {
  emailLeaves: boolean;
  emailMaintenance: boolean;
  emailFees: boolean;
  emailNotices: boolean;
};

export type StudentSettingsDesk = {
  generatedAt: string;
  security: {
    mfaEnabled: boolean;
    isVerified: boolean;
    mustChangePassword: boolean;
    email: string;
    phone: string | null;
  };
  notifications: StudentNotificationPreferences;
  residence: {
    hostelName: string | null;
    roomNumber: string | null;
    bedNumber: string | null;
  };
  activity: {
    activeSessions: number;
  };
};

export type StudentSettingsSession = {
  id: string;
  createdAt: string;
  lastActivityAt: string | null;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
};

async function resolveNotificationPreferences(
  prisma: PrismaClient,
  userId: string,
): Promise<StudentNotificationPreferences> {
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

export async function getStudentSettingsDesk(
  prisma: PrismaClient,
  userId: string,
): Promise<StudentSettingsDesk> {
  await ensureStudentProfileForUser(prisma, userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      phoneNumber: true,
      isVerified: true,
      mfaEnabled: true,
      mustChangePassword: true,
      student: {
        select: {
          allocationRecords: {
            where: { status: 'ACTIVE' },
            take: 1,
            orderBy: { allocatedAt: 'desc' },
            include: {
              bed: {
                include: {
                  room: {
                    include: {
                      floor: {
                        include: {
                          block: { include: { building: { include: { hostel: { select: { name: true } } } } } },
                        },
                      },
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

  if (!user) {
    throw new NotFoundError('User not found.');
  }

  const [notifications, sessions] = await Promise.all([
    resolveNotificationPreferences(prisma, userId),
    authService.listSessionsForUser(prisma, userId),
  ]);

  const allocation = user.student?.allocationRecords[0];
  const hostel = allocation?.bed.room.floor.block.building.hostel;

  return {
    generatedAt: new Date().toISOString(),
    security: {
      mfaEnabled: user.mfaEnabled,
      isVerified: user.isVerified,
      mustChangePassword: user.mustChangePassword,
      email: user.email,
      phone: user.phoneNumber,
    },
    notifications,
    residence: {
      hostelName: hostel?.name ?? null,
      roomNumber: allocation?.bed.room.roomNumber ?? null,
      bedNumber: allocation ? allocation.bed.bedNumber.padStart(2, '0') : null,
    },
    activity: {
      activeSessions: sessions.length,
    },
  };
}

export async function updateStudentNotificationPreferences(
  prisma: PrismaClient,
  userId: string,
  body: StudentNotificationPreferencesBody,
): Promise<StudentNotificationPreferences> {
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

export async function listStudentSettingsSessions(
  prisma: PrismaClient,
  userId: string,
  currentSessionId?: string,
): Promise<StudentSettingsSession[]> {
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