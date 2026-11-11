import type { Prisma, PrismaClient } from '@nestora/database';
import type { SessionUser } from '@nestora/types';
import type { RoleCode } from '../../middleware/authorize.js';
import { ForbiddenError } from '../errors/index.js';
import { resolveHostelScope } from '../../modules/dashboard/operational-dashboard.service.js';

export type HostelOperationalRole = Extract<RoleCode, 'HOSTEL_WARDEN' | 'HOSTEL_STAFF'>;

export function isHostelOperationalRole(role: string): role is HostelOperationalRole {
  return role === 'HOSTEL_WARDEN' || role === 'HOSTEL_STAFF';
}

export function hostelNameInScope(hostelName: string, scopeNames: string[]): boolean {
  const normalized = hostelName.trim().toLowerCase();
  return scopeNames.some((name) => name.trim().toLowerCase() === normalized);
}

export async function resolveWardenHostelNames(
  prisma: PrismaClient,
  user: SessionUser,
): Promise<string[]> {
  return resolveOperationalHostelNames(prisma, user);
}

export async function resolveOperationalHostelNames(
  prisma: PrismaClient,
  user: SessionUser,
): Promise<string[]> {
  if (!isHostelOperationalRole(user.role)) {
    return [];
  }
  const { hostelNames } = await resolveHostelScope(prisma, user.id, user.role);
  return hostelNames;
}

export function assertHostelFilterInScope(
  hostel: string | undefined,
  scopeNames: string[],
): void {
  const hostelFilter = hostel?.trim();
  if (
    hostelFilter &&
    hostelFilter !== 'All Hostels' &&
    !hostelNameInScope(hostelFilter, scopeNames)
  ) {
    throw new ForbiddenError('You are not authorized for this hostel scope.');
  }
}

function hostelNameFilter(hostelNames: string[]): Prisma.HostelWhereInput['name'] {
  if (hostelNames.length === 1) {
    return { equals: hostelNames[0], mode: 'insensitive' };
  }
  return { in: hostelNames, mode: 'insensitive' };
}

export function prismaHostelNamesOnRoom(hostelNames: string[]): Prisma.RoomWhereInput {
  if (hostelNames.length === 0) {
    return { id: { equals: '00000000-0000-0000-0000-000000000000' } };
  }
  return {
    floor: { block: { building: { hostel: { name: hostelNameFilter(hostelNames) } } } },
  };
}

export function prismaHostelNamesOnBed(hostelNames: string[]): Prisma.BedWhereInput {
  if (hostelNames.length === 0) {
    return { id: { equals: '00000000-0000-0000-0000-000000000000' } };
  }
  return {
    room: { floor: { block: { building: { hostel: { name: hostelNameFilter(hostelNames) } } } } },
  };
}
