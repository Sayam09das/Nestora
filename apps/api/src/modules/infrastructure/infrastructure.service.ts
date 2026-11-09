import type { PrismaClient } from '@nestora/database';
import type { SessionUser } from '@nestora/types';
import {
  createBedBodySchema,
  createBlockBodySchema,
  createBuildingBodySchema,
  createFloorBodySchema,
  createHostelBodySchema,
  createRoomBodySchema,
  createUniversityBodySchema,
  infrastructurePaginationQuerySchema,
  updateBedBodySchema,
  updateBlockBodySchema,
  updateBuildingBodySchema,
  updateFloorBodySchema,
  updateHostelBodySchema,
  updateRoomBodySchema,
  updateUniversityBodySchema,
} from '@nestora/validators';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { BadRequestError, NotFoundError } from '../../common/errors/index.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';
import * as auditService from '../audit/audit.service.js';
import {
  auditJsonState,
  defaultBedNumbers,
  rethrowPrismaMutation,
} from './infrastructure.helpers.js';
import * as repository from './infrastructure.repository.js';
import {
  assertAdminOrWarden,
  assertHostelScope,
  assertUniversityAdministrator,
  resolveHostelIdForBed,
  resolveHostelIdForBlock,
  resolveHostelIdForBuilding,
  resolveHostelIdForFloor,
  resolveHostelIdForRoom,
  wardenHostelFilter,
} from './infrastructure-scope.js';

function paginate(query: { page?: number; limit?: number }) {
  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
  const normalized = normalizePagination(page, limit);
  return { ...normalized, meta: buildPaginationMeta(normalized.page, normalized.limit, 0) };
}

async function logInfraAudit(
  tx: Pick<PrismaClient, 'auditLog'>,
  actor: SessionUser,
  actionName: string,
  entityType: string,
  entityId: string,
  ip: string | undefined,
  newState?: unknown,
  previousState?: unknown,
) {
  await auditService.logAuditEventInTransaction(tx, {
    actorUserId: actor.id,
    actorRole: actor.role,
    actionName,
    entityType,
    entityId,
    newState: newState === undefined ? undefined : auditJsonState(newState),
    previousState: previousState === undefined ? undefined : auditJsonState(previousState),
    ipAddress: ip ?? null,
  });
}

// —— University (admin only) ——

export async function listUniversitiesService(prisma: PrismaClient, actor: SessionUser) {
  assertUniversityAdministrator(actor);
  return repository.listUniversities(prisma);
}

export async function getUniversityService(
  prisma: PrismaClient,
  actor: SessionUser,
  universityId: string,
) {
  assertUniversityAdministrator(actor);
  const row = await repository.findUniversityById(prisma, universityId);
  if (!row) {
    throw new NotFoundError('University not found.');
  }
  return row;
}

export async function createUniversityService(
  prisma: PrismaClient,
  actor: SessionUser,
  body: unknown,
  ip: string | undefined,
) {
  assertUniversityAdministrator(actor);
  const parsed = createUniversityBodySchema.parse(body);
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await repository.createUniversity(tx, parsed);
      await logInfraAudit(tx, actor, 'UNIVERSITY_CREATED', 'University', created.id, ip, created);
      return created;
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

export async function updateUniversityService(
  prisma: PrismaClient,
  actor: SessionUser,
  universityId: string,
  body: unknown,
  ip: string | undefined,
) {
  assertUniversityAdministrator(actor);
  const parsed = updateUniversityBodySchema.parse(body);
  const before = await repository.findUniversityById(prisma, universityId);
  if (!before) {
    throw new NotFoundError('University not found.');
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const updated = await repository.updateUniversity(tx, universityId, parsed);
      await logInfraAudit(
        tx,
        actor,
        'UNIVERSITY_UPDATED',
        'University',
        universityId,
        ip,
        updated,
        before,
      );
      return updated;
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

export async function deleteUniversityService(
  prisma: PrismaClient,
  actor: SessionUser,
  universityId: string,
  ip: string | undefined,
) {
  assertUniversityAdministrator(actor);
  const before = await repository.findUniversityById(prisma, universityId);
  if (!before) {
    throw new NotFoundError('University not found.');
  }
  try {
    await prisma.$transaction(async (tx) => {
      await repository.deleteUniversity(tx, universityId);
      await logInfraAudit(
        tx,
        actor,
        'UNIVERSITY_DELETED',
        'University',
        universityId,
        ip,
        null,
        before,
      );
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

// —— Hostel ——

export async function listHostelsService(
  prisma: PrismaClient,
  actor: SessionUser,
  query: { universityId?: string; page?: number; limit?: number },
) {
  assertAdminOrWarden(actor);
  const assigned = wardenHostelFilter(actor);
  const { skip, limit, page } = paginate(query);
  const where = {
    ...(query.universityId ? { universityId: query.universityId } : {}),
    ...(assigned ? { id: { in: assigned } } : {}),
  };
  const [total, rows] = await Promise.all([
    repository.countHostels(prisma, where),
    repository.listHostels(prisma, where, skip, limit),
  ]);
  return { hostels: rows, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getHostelService(prisma: PrismaClient, actor: SessionUser, hostelId: string) {
  assertAdminOrWarden(actor);
  const row = await repository.findHostelById(prisma, hostelId);
  if (!row) {
    throw new NotFoundError('Hostel not found.');
  }
  assertHostelScope(actor, row.id);
  return row;
}

export async function createHostelService(
  prisma: PrismaClient,
  actor: SessionUser,
  universityId: string,
  body: unknown,
  ip: string | undefined,
) {
  assertUniversityAdministrator(actor);
  const parsed = createHostelBodySchema.parse(body);
  const university = await repository.findUniversityById(prisma, universityId);
  if (!university) {
    throw new NotFoundError('University not found.');
  }
  if (parsed.wardenInCharge) {
    const warden = await prisma.user.findUnique({ where: { id: parsed.wardenInCharge } });
    if (warden?.role !== 'HOSTEL_WARDEN') {
      throw new BadRequestError('wardenInCharge must be a Hostel Warden user.');
    }
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await repository.createHostel(tx, {
        universityId,
        name: parsed.name,
        code: parsed.code,
        genderCategory: parsed.genderCategory,
        wardenInCharge: parsed.wardenInCharge,
        isActive: parsed.isActive,
      });
      await logInfraAudit(tx, actor, 'HOSTEL_CREATED', 'Hostel', created.id, ip, created);
      return created;
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

export async function updateHostelService(
  prisma: PrismaClient,
  actor: SessionUser,
  hostelId: string,
  body: unknown,
  ip: string | undefined,
) {
  assertUniversityAdministrator(actor);
  const parsed = updateHostelBodySchema.parse(body);
  const before = await repository.findHostelById(prisma, hostelId);
  if (!before) {
    throw new NotFoundError('Hostel not found.');
  }
  if (parsed.wardenInCharge) {
    const warden = await prisma.user.findUnique({ where: { id: parsed.wardenInCharge } });
    if (warden?.role !== 'HOSTEL_WARDEN') {
      throw new BadRequestError('wardenInCharge must be a Hostel Warden user.');
    }
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const updated = await repository.updateHostel(tx, hostelId, parsed);
      await logInfraAudit(tx, actor, 'HOSTEL_UPDATED', 'Hostel', hostelId, ip, updated, before);
      return updated;
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

export async function deleteHostelService(
  prisma: PrismaClient,
  actor: SessionUser,
  hostelId: string,
  ip: string | undefined,
) {
  assertUniversityAdministrator(actor);
  const before = await repository.findHostelById(prisma, hostelId);
  if (!before) {
    throw new NotFoundError('Hostel not found.');
  }
  try {
    await prisma.$transaction(async (tx) => {
      await repository.deleteHostel(tx, hostelId);
      await logInfraAudit(tx, actor, 'HOSTEL_DELETED', 'Hostel', hostelId, ip, null, before);
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

// —— Building ——

export async function listBuildingsService(
  prisma: PrismaClient,
  actor: SessionUser,
  hostelId: string,
  query: unknown,
) {
  assertAdminOrWarden(actor);
  assertHostelScope(actor, hostelId);
  const q = infrastructurePaginationQuerySchema.parse(query);
  const { skip, limit, page } = paginate(q);
  const where = { hostelId };
  const [total, rows] = await Promise.all([
    repository.countBuildings(prisma, where),
    repository.listBuildings(prisma, where, skip, limit),
  ]);
  return { buildings: rows, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getBuildingService(
  prisma: PrismaClient,
  actor: SessionUser,
  buildingId: string,
) {
  assertAdminOrWarden(actor);
  const row = await repository.findBuildingById(prisma, buildingId);
  if (!row) {
    throw new NotFoundError('Building not found.');
  }
  assertHostelScope(actor, row.hostelId);
  return row;
}

export async function createBuildingService(
  prisma: PrismaClient,
  actor: SessionUser,
  hostelId: string,
  body: unknown,
  ip: string | undefined,
) {
  assertAdminOrWarden(actor);
  assertHostelScope(actor, hostelId);
  const parsed = createBuildingBodySchema.parse(body);
  if (!(await repository.findHostelById(prisma, hostelId))) {
    throw new NotFoundError('Hostel not found.');
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await repository.createBuilding(tx, { hostelId, ...parsed });
      await logInfraAudit(tx, actor, 'BUILDING_CREATED', 'Building', created.id, ip, created);
      return created;
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

export async function updateBuildingService(
  prisma: PrismaClient,
  actor: SessionUser,
  buildingId: string,
  body: unknown,
  ip: string | undefined,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForBuilding(prisma, buildingId);
  assertHostelScope(actor, hostelId);
  const parsed = updateBuildingBodySchema.parse(body);
  const before = await repository.findBuildingById(prisma, buildingId);
  if (!before) {
    throw new NotFoundError('Building not found.');
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const updated = await repository.updateBuilding(tx, buildingId, parsed);
      await logInfraAudit(
        tx,
        actor,
        'BUILDING_UPDATED',
        'Building',
        buildingId,
        ip,
        updated,
        before,
      );
      return updated;
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

export async function deleteBuildingService(
  prisma: PrismaClient,
  actor: SessionUser,
  buildingId: string,
  ip: string | undefined,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForBuilding(prisma, buildingId);
  assertHostelScope(actor, hostelId);
  const before = await repository.findBuildingById(prisma, buildingId);
  if (!before) {
    throw new NotFoundError('Building not found.');
  }
  try {
    await prisma.$transaction(async (tx) => {
      await repository.deleteBuilding(tx, buildingId);
      await logInfraAudit(tx, actor, 'BUILDING_DELETED', 'Building', buildingId, ip, null, before);
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

// —— Block ——

export async function listBlocksService(
  prisma: PrismaClient,
  actor: SessionUser,
  buildingId: string,
  query: unknown,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForBuilding(prisma, buildingId);
  assertHostelScope(actor, hostelId);
  const q = infrastructurePaginationQuerySchema.parse(query);
  const { skip, limit, page } = paginate(q);
  const where = { buildingId };
  const [total, rows] = await Promise.all([
    repository.countBlocks(prisma, where),
    repository.listBlocks(prisma, where, skip, limit),
  ]);
  return { blocks: rows, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getBlockService(prisma: PrismaClient, actor: SessionUser, blockId: string) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForBlock(prisma, blockId);
  assertHostelScope(actor, hostelId);
  const row = await repository.findBlockById(prisma, blockId);
  if (!row) {
    throw new NotFoundError('Block not found.');
  }
  return row;
}

export async function createBlockService(
  prisma: PrismaClient,
  actor: SessionUser,
  buildingId: string,
  body: unknown,
  ip: string | undefined,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForBuilding(prisma, buildingId);
  assertHostelScope(actor, hostelId);
  const parsed = createBlockBodySchema.parse(body);
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await repository.createBlock(tx, { buildingId, name: parsed.name });
      await logInfraAudit(tx, actor, 'BLOCK_CREATED', 'Block', created.id, ip, created);
      return created;
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

export async function updateBlockService(
  prisma: PrismaClient,
  actor: SessionUser,
  blockId: string,
  body: unknown,
  ip: string | undefined,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForBlock(prisma, blockId);
  assertHostelScope(actor, hostelId);
  const parsed = updateBlockBodySchema.parse(body);
  const before = await repository.findBlockById(prisma, blockId);
  if (!before) {
    throw new NotFoundError('Block not found.');
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const updated = await repository.updateBlock(tx, blockId, parsed);
      await logInfraAudit(tx, actor, 'BLOCK_UPDATED', 'Block', blockId, ip, updated, before);
      return updated;
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

export async function deleteBlockService(
  prisma: PrismaClient,
  actor: SessionUser,
  blockId: string,
  ip: string | undefined,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForBlock(prisma, blockId);
  assertHostelScope(actor, hostelId);
  const before = await repository.findBlockById(prisma, blockId);
  if (!before) {
    throw new NotFoundError('Block not found.');
  }
  try {
    await prisma.$transaction(async (tx) => {
      await repository.deleteBlock(tx, blockId);
      await logInfraAudit(tx, actor, 'BLOCK_DELETED', 'Block', blockId, ip, null, before);
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

// —— Floor ——

export async function listFloorsService(
  prisma: PrismaClient,
  actor: SessionUser,
  blockId: string,
  query: unknown,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForBlock(prisma, blockId);
  assertHostelScope(actor, hostelId);
  const q = infrastructurePaginationQuerySchema.parse(query);
  const { skip, limit, page } = paginate(q);
  const where = { blockId };
  const [total, rows] = await Promise.all([
    repository.countFloors(prisma, where),
    repository.listFloors(prisma, where, skip, limit),
  ]);
  return { floors: rows, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getFloorService(prisma: PrismaClient, actor: SessionUser, floorId: string) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForFloor(prisma, floorId);
  assertHostelScope(actor, hostelId);
  const row = await repository.findFloorById(prisma, floorId);
  if (!row) {
    throw new NotFoundError('Floor not found.');
  }
  return row;
}

export async function createFloorService(
  prisma: PrismaClient,
  actor: SessionUser,
  blockId: string,
  body: unknown,
  ip: string | undefined,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForBlock(prisma, blockId);
  assertHostelScope(actor, hostelId);
  const parsed = createFloorBodySchema.parse(body);
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await repository.createFloor(tx, {
        blockId,
        floorNumber: parsed.floorNumber,
        name: parsed.name,
      });
      await logInfraAudit(tx, actor, 'FLOOR_CREATED', 'Floor', created.id, ip, created);
      return created;
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

export async function updateFloorService(
  prisma: PrismaClient,
  actor: SessionUser,
  floorId: string,
  body: unknown,
  ip: string | undefined,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForFloor(prisma, floorId);
  assertHostelScope(actor, hostelId);
  const parsed = updateFloorBodySchema.parse(body);
  const before = await repository.findFloorById(prisma, floorId);
  if (!before) {
    throw new NotFoundError('Floor not found.');
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const updated = await repository.updateFloor(tx, floorId, parsed);
      await logInfraAudit(tx, actor, 'FLOOR_UPDATED', 'Floor', floorId, ip, updated, before);
      return updated;
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

export async function deleteFloorService(
  prisma: PrismaClient,
  actor: SessionUser,
  floorId: string,
  ip: string | undefined,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForFloor(prisma, floorId);
  assertHostelScope(actor, hostelId);
  const before = await repository.findFloorById(prisma, floorId);
  if (!before) {
    throw new NotFoundError('Floor not found.');
  }
  try {
    await prisma.$transaction(async (tx) => {
      await repository.deleteFloor(tx, floorId);
      await logInfraAudit(tx, actor, 'FLOOR_DELETED', 'Floor', floorId, ip, null, before);
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

// —— Room configurations ——

export async function listRoomConfigurationsService(prisma: PrismaClient, actor: SessionUser) {
  assertAdminOrWarden(actor);
  return repository.listRoomConfigurations(prisma);
}

// —— Room ——

export async function listRoomsService(
  prisma: PrismaClient,
  actor: SessionUser,
  floorId: string,
  query: unknown,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForFloor(prisma, floorId);
  assertHostelScope(actor, hostelId);
  const q = infrastructurePaginationQuerySchema.parse(query);
  const { skip, limit, page } = paginate(q);
  const where = { floorId };
  const [total, rows] = await Promise.all([
    repository.countRooms(prisma, where),
    repository.listRooms(prisma, where, skip, limit),
  ]);
  return { rooms: rows, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getRoomService(prisma: PrismaClient, actor: SessionUser, roomId: string) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForRoom(prisma, roomId);
  assertHostelScope(actor, hostelId);
  const row = await repository.findRoomById(prisma, roomId);
  if (!row) {
    throw new NotFoundError('Room not found.');
  }
  return row;
}

export async function createRoomService(
  prisma: PrismaClient,
  actor: SessionUser,
  floorId: string,
  body: unknown,
  ip: string | undefined,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForFloor(prisma, floorId);
  assertHostelScope(actor, hostelId);
  const parsed = createRoomBodySchema.parse(body);
  const config = await repository.findRoomConfigurationById(prisma, parsed.configId);
  if (!config) {
    throw new BadRequestError(
      'Invalid room configuration. Choose one of the six standard configurations.',
    );
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await repository.createRoom(tx, {
        floorId,
        configId: parsed.configId,
        roomNumber: parsed.roomNumber,
        status: parsed.status,
      });
      const beds = defaultBedNumbers(config.capacity).map((bedNumber) => ({
        roomId: created.id,
        bedNumber,
        status: 'AVAILABLE' as const,
      }));
      await repository.createBedsMany(tx, beds);
      const full = await repository.findRoomById(tx, created.id);
      await logInfraAudit(tx, actor, 'ROOM_CREATED', 'Room', created.id, ip, full);
      return full;
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

export async function updateRoomService(
  prisma: PrismaClient,
  actor: SessionUser,
  roomId: string,
  body: unknown,
  ip: string | undefined,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForRoom(prisma, roomId);
  assertHostelScope(actor, hostelId);
  const parsed = updateRoomBodySchema.parse(body);
  const before = await repository.findRoomById(prisma, roomId);
  if (!before) {
    throw new NotFoundError('Room not found.');
  }
  if (parsed.configId && parsed.configId !== before.configId) {
    const config = await repository.findRoomConfigurationById(prisma, parsed.configId);
    if (!config) {
      throw new BadRequestError('Invalid room configuration.');
    }
    const bedCount = await repository.countBedsInRoom(prisma, roomId);
    if (bedCount > config.capacity) {
      throw new BadRequestError(
        `Cannot assign a configuration with capacity ${config.capacity}; room has ${bedCount} beds.`,
      );
    }
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const updated = await repository.updateRoom(tx, roomId, parsed);
      await logInfraAudit(tx, actor, 'ROOM_UPDATED', 'Room', roomId, ip, updated, before);
      return updated;
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

export async function deleteRoomService(
  prisma: PrismaClient,
  actor: SessionUser,
  roomId: string,
  ip: string | undefined,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForRoom(prisma, roomId);
  assertHostelScope(actor, hostelId);
  const before = await repository.findRoomById(prisma, roomId);
  if (!before) {
    throw new NotFoundError('Room not found.');
  }
  const occupied = before.beds.some((b) => b.status === 'OCCUPIED' || b.status === 'RESERVED');
  if (occupied) {
    throw new BadRequestError('Cannot delete a room with occupied or reserved beds.');
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.bed.deleteMany({ where: { roomId } });
      await repository.deleteRoom(tx, roomId);
      await logInfraAudit(tx, actor, 'ROOM_DELETED', 'Room', roomId, ip, null, before);
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

// —— Bed ——

export async function listBedsService(
  prisma: PrismaClient,
  actor: SessionUser,
  roomId: string,
  query: unknown,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForRoom(prisma, roomId);
  assertHostelScope(actor, hostelId);
  const q = infrastructurePaginationQuerySchema.parse(query);
  const { skip, limit, page } = paginate(q);
  const where = { roomId };
  const [total, rows] = await Promise.all([
    repository.countBeds(prisma, where),
    repository.listBeds(prisma, where, skip, limit),
  ]);
  return { beds: rows, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getBedService(prisma: PrismaClient, actor: SessionUser, bedId: string) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForBed(prisma, bedId);
  assertHostelScope(actor, hostelId);
  const row = await repository.findBedById(prisma, bedId);
  if (!row) {
    throw new NotFoundError('Bed not found.');
  }
  return row;
}

export async function createBedService(
  prisma: PrismaClient,
  actor: SessionUser,
  roomId: string,
  body: unknown,
  ip: string | undefined,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForRoom(prisma, roomId);
  assertHostelScope(actor, hostelId);
  const parsed = createBedBodySchema.parse(body);
  const room = await repository.findRoomById(prisma, roomId);
  if (!room) {
    throw new NotFoundError('Room not found.');
  }
  const bedCount = await repository.countBedsInRoom(prisma, roomId);
  if (bedCount >= room.config.capacity) {
    throw new BadRequestError('Room has reached the bed capacity for its configuration.');
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await repository.createBed(tx, {
        roomId,
        bedNumber: parsed.bedNumber,
        status: parsed.status,
      });
      await logInfraAudit(tx, actor, 'BED_CREATED', 'Bed', created.id, ip, created);
      return created;
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

export async function updateBedService(
  prisma: PrismaClient,
  actor: SessionUser,
  bedId: string,
  body: unknown,
  ip: string | undefined,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForBed(prisma, bedId);
  assertHostelScope(actor, hostelId);
  const parsed = updateBedBodySchema.parse(body);
  const before = await repository.findBedById(prisma, bedId);
  if (!before) {
    throw new NotFoundError('Bed not found.');
  }
  if (parsed.status && before.status === 'OCCUPIED' && parsed.status !== 'OCCUPIED') {
    throw new BadRequestError('Cannot change status of an occupied bed from this endpoint.');
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const updated = await repository.updateBed(tx, bedId, parsed);
      await logInfraAudit(tx, actor, 'BED_UPDATED', 'Bed', bedId, ip, updated, before);
      return updated;
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}

export async function deleteBedService(
  prisma: PrismaClient,
  actor: SessionUser,
  bedId: string,
  ip: string | undefined,
) {
  assertAdminOrWarden(actor);
  const hostelId = await resolveHostelIdForBed(prisma, bedId);
  assertHostelScope(actor, hostelId);
  const before = await repository.findBedById(prisma, bedId);
  if (!before) {
    throw new NotFoundError('Bed not found.');
  }
  if (before.status === 'OCCUPIED' || before.status === 'RESERVED') {
    throw new BadRequestError('Cannot delete an occupied or reserved bed.');
  }
  try {
    await prisma.$transaction(async (tx) => {
      await repository.deleteBed(tx, bedId);
      await logInfraAudit(tx, actor, 'BED_DELETED', 'Bed', bedId, ip, null, before);
    });
  } catch (error) {
    rethrowPrismaMutation(error);
  }
}
