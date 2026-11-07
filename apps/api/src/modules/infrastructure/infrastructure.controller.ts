import type { SessionUser } from '@nestora/types';
import {
  bedIdParamsSchema,
  blockIdParamsSchema,
  buildingIdParamsSchema,
  floorIdParamsSchema,
  hostelIdParamsSchema,
  listHostelsQuerySchema,
  roomIdParamsSchema,
  universityIdParamsSchema,
} from '@nestora/validators';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { paginatedSuccessResponse, successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import * as service from './infrastructure.service.js';

function ip(request: FastifyRequest): string | undefined {
  return typeof request.ip === 'string' ? request.ip : undefined;
}

function actor(request: FastifyRequest): SessionUser {
  return requireAuth(request);
}

export async function getUniversities(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const rows = await service.listUniversitiesService(request.server.prisma, actor(request));
  reply.send(successResponse({ universities: rows }, 'Universities loaded.'));
}

export async function getUniversityById(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { universityId } = universityIdParamsSchema.parse(request.params);
  const row = await service.getUniversityService(
    request.server.prisma,
    actor(request),
    universityId,
  );
  reply.send(successResponse({ university: row }, 'University loaded.'));
}

export async function postUniversity(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const created = await service.createUniversityService(
    request.server.prisma,
    actor(request),
    request.body,
    ip(request),
  );
  reply.status(201).send(successResponse({ university: created }, 'University created.'));
}

export async function patchUniversity(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { universityId } = universityIdParamsSchema.parse(request.params);
  const updated = await service.updateUniversityService(
    request.server.prisma,
    actor(request),
    universityId,
    request.body,
    ip(request),
  );
  reply.send(successResponse({ university: updated }, 'University updated.'));
}

export async function deleteUniversity(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { universityId } = universityIdParamsSchema.parse(request.params);
  await service.deleteUniversityService(
    request.server.prisma,
    actor(request),
    universityId,
    ip(request),
  );
  reply.send(successResponse({}, 'University deleted.'));
}

export async function getHostels(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = listHostelsQuerySchema.parse(request.query);
  const result = await service.listHostelsService(request.server.prisma, actor(request), query);
  reply.send(
    paginatedSuccessResponse({ hostels: result.hostels }, 'Hostels loaded.', result.pagination),
  );
}

export async function getHostelById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { hostelId } = hostelIdParamsSchema.parse(request.params);
  const row = await service.getHostelService(request.server.prisma, actor(request), hostelId);
  reply.send(successResponse({ hostel: row }, 'Hostel loaded.'));
}

export async function postHostel(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { universityId } = universityIdParamsSchema.parse(request.params);
  const created = await service.createHostelService(
    request.server.prisma,
    actor(request),
    universityId,
    request.body,
    ip(request),
  );
  reply.status(201).send(successResponse({ hostel: created }, 'Hostel created.'));
}

export async function patchHostel(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { hostelId } = hostelIdParamsSchema.parse(request.params);
  const updated = await service.updateHostelService(
    request.server.prisma,
    actor(request),
    hostelId,
    request.body,
    ip(request),
  );
  reply.send(successResponse({ hostel: updated }, 'Hostel updated.'));
}

export async function deleteHostel(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { hostelId } = hostelIdParamsSchema.parse(request.params);
  await service.deleteHostelService(request.server.prisma, actor(request), hostelId, ip(request));
  reply.send(successResponse({}, 'Hostel deleted.'));
}

export async function getBuildings(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { hostelId } = hostelIdParamsSchema.parse(request.params);
  const result = await service.listBuildingsService(
    request.server.prisma,
    actor(request),
    hostelId,
    request.query,
  );
  reply.send(
    paginatedSuccessResponse(
      { buildings: result.buildings },
      'Buildings loaded.',
      result.pagination,
    ),
  );
}

export async function getBuildingById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { buildingId } = buildingIdParamsSchema.parse(request.params);
  const row = await service.getBuildingService(request.server.prisma, actor(request), buildingId);
  reply.send(successResponse({ building: row }, 'Building loaded.'));
}

export async function postBuilding(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { hostelId } = hostelIdParamsSchema.parse(request.params);
  const created = await service.createBuildingService(
    request.server.prisma,
    actor(request),
    hostelId,
    request.body,
    ip(request),
  );
  reply.status(201).send(successResponse({ building: created }, 'Building created.'));
}

export async function patchBuilding(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { buildingId } = buildingIdParamsSchema.parse(request.params);
  const updated = await service.updateBuildingService(
    request.server.prisma,
    actor(request),
    buildingId,
    request.body,
    ip(request),
  );
  reply.send(successResponse({ building: updated }, 'Building updated.'));
}

export async function deleteBuilding(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { buildingId } = buildingIdParamsSchema.parse(request.params);
  await service.deleteBuildingService(
    request.server.prisma,
    actor(request),
    buildingId,
    ip(request),
  );
  reply.send(successResponse({}, 'Building deleted.'));
}

export async function getBlocks(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { buildingId } = buildingIdParamsSchema.parse(request.params);
  const result = await service.listBlocksService(
    request.server.prisma,
    actor(request),
    buildingId,
    request.query,
  );
  reply.send(
    paginatedSuccessResponse({ blocks: result.blocks }, 'Blocks loaded.', result.pagination),
  );
}

export async function getBlockById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { blockId } = blockIdParamsSchema.parse(request.params);
  const row = await service.getBlockService(request.server.prisma, actor(request), blockId);
  reply.send(successResponse({ block: row }, 'Block loaded.'));
}

export async function postBlock(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { buildingId } = buildingIdParamsSchema.parse(request.params);
  const created = await service.createBlockService(
    request.server.prisma,
    actor(request),
    buildingId,
    request.body,
    ip(request),
  );
  reply.status(201).send(successResponse({ block: created }, 'Block created.'));
}

export async function patchBlock(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { blockId } = blockIdParamsSchema.parse(request.params);
  const updated = await service.updateBlockService(
    request.server.prisma,
    actor(request),
    blockId,
    request.body,
    ip(request),
  );
  reply.send(successResponse({ block: updated }, 'Block updated.'));
}

export async function deleteBlock(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { blockId } = blockIdParamsSchema.parse(request.params);
  await service.deleteBlockService(request.server.prisma, actor(request), blockId, ip(request));
  reply.send(successResponse({}, 'Block deleted.'));
}

export async function getFloors(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { blockId } = blockIdParamsSchema.parse(request.params);
  const result = await service.listFloorsService(
    request.server.prisma,
    actor(request),
    blockId,
    request.query,
  );
  reply.send(
    paginatedSuccessResponse({ floors: result.floors }, 'Floors loaded.', result.pagination),
  );
}

export async function getFloorById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { floorId } = floorIdParamsSchema.parse(request.params);
  const row = await service.getFloorService(request.server.prisma, actor(request), floorId);
  reply.send(successResponse({ floor: row }, 'Floor loaded.'));
}

export async function postFloor(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { blockId } = blockIdParamsSchema.parse(request.params);
  const created = await service.createFloorService(
    request.server.prisma,
    actor(request),
    blockId,
    request.body,
    ip(request),
  );
  reply.status(201).send(successResponse({ floor: created }, 'Floor created.'));
}

export async function patchFloor(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { floorId } = floorIdParamsSchema.parse(request.params);
  const updated = await service.updateFloorService(
    request.server.prisma,
    actor(request),
    floorId,
    request.body,
    ip(request),
  );
  reply.send(successResponse({ floor: updated }, 'Floor updated.'));
}

export async function deleteFloor(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { floorId } = floorIdParamsSchema.parse(request.params);
  await service.deleteFloorService(request.server.prisma, actor(request), floorId, ip(request));
  reply.send(successResponse({}, 'Floor deleted.'));
}

export async function getRoomConfigurations(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const rows = await service.listRoomConfigurationsService(request.server.prisma, actor(request));
  reply.send(successResponse({ roomConfigurations: rows }, 'Room configurations loaded.'));
}

export async function getRooms(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { floorId } = floorIdParamsSchema.parse(request.params);
  const result = await service.listRoomsService(
    request.server.prisma,
    actor(request),
    floorId,
    request.query,
  );
  reply.send(paginatedSuccessResponse({ rooms: result.rooms }, 'Rooms loaded.', result.pagination));
}

export async function getRoomById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { roomId } = roomIdParamsSchema.parse(request.params);
  const row = await service.getRoomService(request.server.prisma, actor(request), roomId);
  reply.send(successResponse({ room: row }, 'Room loaded.'));
}

export async function postRoom(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { floorId } = floorIdParamsSchema.parse(request.params);
  const created = await service.createRoomService(
    request.server.prisma,
    actor(request),
    floorId,
    request.body,
    ip(request),
  );
  reply.status(201).send(successResponse({ room: created }, 'Room created.'));
}

export async function patchRoom(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { roomId } = roomIdParamsSchema.parse(request.params);
  const updated = await service.updateRoomService(
    request.server.prisma,
    actor(request),
    roomId,
    request.body,
    ip(request),
  );
  reply.send(successResponse({ room: updated }, 'Room updated.'));
}

export async function deleteRoom(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { roomId } = roomIdParamsSchema.parse(request.params);
  await service.deleteRoomService(request.server.prisma, actor(request), roomId, ip(request));
  reply.send(successResponse({}, 'Room deleted.'));
}

export async function getBeds(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { roomId } = roomIdParamsSchema.parse(request.params);
  const result = await service.listBedsService(
    request.server.prisma,
    actor(request),
    roomId,
    request.query,
  );
  reply.send(paginatedSuccessResponse({ beds: result.beds }, 'Beds loaded.', result.pagination));
}

export async function getBedById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { bedId } = bedIdParamsSchema.parse(request.params);
  const row = await service.getBedService(request.server.prisma, actor(request), bedId);
  reply.send(successResponse({ bed: row }, 'Bed loaded.'));
}

export async function postBed(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { roomId } = roomIdParamsSchema.parse(request.params);
  const created = await service.createBedService(
    request.server.prisma,
    actor(request),
    roomId,
    request.body,
    ip(request),
  );
  reply.status(201).send(successResponse({ bed: created }, 'Bed created.'));
}

export async function patchBed(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { bedId } = bedIdParamsSchema.parse(request.params);
  const updated = await service.updateBedService(
    request.server.prisma,
    actor(request),
    bedId,
    request.body,
    ip(request),
  );
  reply.send(successResponse({ bed: updated }, 'Bed updated.'));
}

export async function deleteBed(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { bedId } = bedIdParamsSchema.parse(request.params);
  await service.deleteBedService(request.server.prisma, actor(request), bedId, ip(request));
  reply.send(successResponse({}, 'Bed deleted.'));
}
