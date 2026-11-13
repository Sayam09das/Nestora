import type { PrismaClient, Role } from '@nestora/database';
import type { UpdateSelfProfileBody } from '@nestora/validators';
import { BadRequestError, NotFoundError } from '../../common/errors/index.js';
import type { Env } from '../../config/index.js';
import * as authService from '../auth/auth.service.js';
import {
  getAdminStaffProfile,
  type AdminStaffProfile,
} from '../staff/staff.service.js';
import { isSafeObjectKey } from '../storage/object-key.js';
import { assertObjectExists } from '../storage/storage.service.js';

const SELF_PROFILE_ROLES: Role[] = ['HOSTEL_WARDEN', 'HOSTEL_STAFF', 'SECURITY_GUARD', 'ACCOUNTANT'];

export type AccountDeskSession = {
  id: string;
  createdAt: string;
  lastActivityAt: string | null;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
};

export type AccountDeskPayload = {
  generatedAt: string;
  profile: AdminStaffProfile;
  sessions: AccountDeskSession[];
};

function defaultDesignation(role: Role): string {
  if (role === 'HOSTEL_WARDEN') return 'Hostel Warden';
  if (role === 'HOSTEL_STAFF') return 'Hostel Staff';
  if (role === 'SECURITY_GUARD') return 'Security Guard';
  if (role === 'ACCOUNTANT') return 'Accounts Officer';
  return 'Staff';
}

export async function getAccountDesk(
  prisma: PrismaClient,
  env: Env,
  userId: string,
  currentSessionId?: string,
): Promise<AccountDeskPayload> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || !SELF_PROFILE_ROLES.includes(user.role)) {
    throw new NotFoundError('Account profile not available for this role.');
  }

  const profile = await getAdminStaffProfile(prisma, env, userId);
  const sessionsRaw = await authService.listSessionsForUser(prisma, userId);
  const sessions: AccountDeskSession[] = sessionsRaw.map((s) => ({
    id: s.id,
    createdAt: s.createdAt.toISOString(),
    lastActivityAt: s.lastActivityAt?.toISOString() ?? null,
    expiresAt: s.expiresAt.toISOString(),
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    isCurrent: Boolean(currentSessionId && s.id === currentSessionId),
  }));

  return { generatedAt: new Date().toISOString(), profile, sessions };
}

export async function updateSelfAccountProfile(
  prisma: PrismaClient,
  env: Env,
  userId: string,
  body: UpdateSelfProfileBody,
): Promise<AdminStaffProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { staffProfile: true },
  });
  if (!user || !SELF_PROFILE_ROLES.includes(user.role)) {
    throw new NotFoundError('Account profile not available for this role.');
  }

  const userPatch: { phoneNumber?: string | null; profilePhotoKey?: string | null } = {};
  if (body.phone !== undefined) {
    userPatch.phoneNumber = body.phone.trim() || null;
  }
  if (body.profilePhotoObjectKey !== undefined) {
    const key = body.profilePhotoObjectKey.trim();
    if (key) {
      if (!isSafeObjectKey(key)) {
        throw new BadRequestError('Invalid profile photo reference.');
      }
      await assertObjectExists(env, 'staffPublic', key);
      userPatch.profilePhotoKey = key;
    } else {
      userPatch.profilePhotoKey = null;
    }
  }

  const emergencyTouched =
    body.emergencyContactName !== undefined ||
    body.emergencyRelationship !== undefined ||
    body.emergencyContactPhone !== undefined;

  await prisma.$transaction(async (tx) => {
    if (Object.keys(userPatch).length > 0) {
      await tx.user.update({ where: { id: userId }, data: userPatch });
    }

    if (emergencyTouched) {
      const emergency = {
        emergencyContactName:
          body.emergencyContactName !== undefined
            ? body.emergencyContactName.trim() || null
            : user.staffProfile?.emergencyContactName ?? null,
        emergencyRelationship:
          body.emergencyRelationship !== undefined
            ? body.emergencyRelationship.trim() || null
            : user.staffProfile?.emergencyRelationship ?? null,
        emergencyContactPhone:
          body.emergencyContactPhone !== undefined
            ? body.emergencyContactPhone.trim() || null
            : user.staffProfile?.emergencyContactPhone ?? null,
      };

      if (user.staffProfile) {
        await tx.staffProfile.update({
          where: { id: user.staffProfile.id },
          data: emergency,
        });
      } else {
        await tx.staffProfile.create({
          data: {
            userId,
            department: 'Hostel Administration',
            designation: defaultDesignation(user.role),
            ...emergency,
          },
        });
      }
    }
  });

  return getAdminStaffProfile(prisma, env, userId);
}
