import type { PrismaClient } from '@nestora/database';
import type { StudentNotificationPreferencesBody } from '@nestora/validators';

export type OperatorNotificationPreferences = {
  emailLeaves: boolean;
  emailMaintenance: boolean;
  emailFees: boolean;
  emailNotices: boolean;
};

export async function getOperatorNotificationPreferences(
  prisma: PrismaClient,
  userId: string,
): Promise<OperatorNotificationPreferences> {
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

export async function patchOperatorNotificationPreferences(
  prisma: PrismaClient,
  userId: string,
  body: StudentNotificationPreferencesBody,
): Promise<OperatorNotificationPreferences> {
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