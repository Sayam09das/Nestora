import type { PrismaClient } from '@nestora/database';
import type { SessionUser } from '@nestora/types';
import { ForbiddenError, NotFoundError } from '../../common/errors/index.js';
import { assertRole } from '../../middleware/authorize.js';
import { userCanAccessHostel } from '../../middleware/tenant-scope.js';

export function assertUniversityAdministrator(actor: SessionUser): void {
  assertRole(actor, 'UNIVERSITY_ADMINISTRATOR');
}

export function assertAdminOrWarden(actor: SessionUser): void {
  assertRole(actor, 'UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN');
}

export function assertHostelScope(actor: SessionUser, hostelId: string): void {
  if (actor.role === 'UNIVERSITY_ADMINISTRATOR') {
    return;
  }
  if (actor.role === 'HOSTEL_WARDEN' && userCanAccessHostel(actor, hostelId)) {
    return;
  }
  throw new ForbiddenError('You are not authorized for this hostel scope.');
}

export function wardenHostelFilter(actor: SessionUser): string[] | undefined {
  if (actor.role === 'UNIVERSITY_ADMINISTRATOR') {
    return undefined;
  }
  if (actor.role === 'HOSTEL_WARDEN') {
    return actor.assignedHostelIds;
  }
  throw new ForbiddenError('You do not have permission to perform this action.');
}

export async function resolveHostelIdForBuilding(
  prisma: PrismaClient,
  buildingId: string,
): Promise<string> {
  const row = await prisma.building.findUnique({
    where: { id: buildingId },
    select: { hostelId: true },
  });
  if (!row) {
    throw new NotFoundError('Building not found.');
  }
  return row.hostelId;
}

export async function resolveHostelIdForBlock(
  prisma: PrismaClient,
  blockId: string,
): Promise<string> {
  const row = await prisma.block.findUnique({
    where: { id: blockId },
    select: { building: { select: { hostelId: true } } },
  });
  if (!row) {
    throw new NotFoundError('Block not found.');
  }
  return row.building.hostelId;
}

export async function resolveHostelIdForFloor(
  prisma: PrismaClient,
  floorId: string,
): Promise<string> {
  const row = await prisma.floor.findUnique({
    where: { id: floorId },
    select: { block: { select: { building: { select: { hostelId: true } } } } },
  });
  if (!row) {
    throw new NotFoundError('Floor not found.');
  }
  return row.block.building.hostelId;
}

export async function resolveHostelIdForRoom(
  prisma: PrismaClient,
  roomId: string,
): Promise<string> {
  const row = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      floor: { select: { block: { select: { building: { select: { hostelId: true } } } } } },
    },
  });
  if (!row) {
    throw new NotFoundError('Room not found.');
  }
  return row.floor.block.building.hostelId;
}

export async function resolveHostelIdForBed(prisma: PrismaClient, bedId: string): Promise<string> {
  const row = await prisma.bed.findUnique({
    where: { id: bedId },
    select: {
      room: {
        select: {
          floor: { select: { block: { select: { building: { select: { hostelId: true } } } } } },
        },
      },
    },
  });
  if (!row) {
    throw new NotFoundError('Bed not found.');
  }
  return row.room.floor.block.building.hostelId;
}
