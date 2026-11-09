import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  deleteBed,
  deleteBlock,
  deleteBuilding,
  deleteFloor,
  deleteHostel,
  deleteRoom,
  deleteUniversity,
  getBedById,
  getBeds,
  getBlockById,
  getBlocks,
  getBuildingById,
  getBuildings,
  getFloorById,
  getFloors,
  getHostelById,
  getHostels,
  getRoomById,
  getRoomConfigurations,
  getRooms,
  getUniversities,
  getUniversityById,
  patchBed,
  patchBlock,
  patchBuilding,
  patchFloor,
  patchHostel,
  patchRoom,
  patchUniversity,
  postBed,
  postBlock,
  postBuilding,
  postFloor,
  postHostel,
  postRoom,
  postUniversity,
} from './infrastructure.controller.js';

function withAuth(...roles: Parameters<typeof requireRoles>) {
  return {
    preHandler: [
      async (request: FastifyRequest) => {
        requireAuth(request);
      },
      requireRoles(...roles),
    ],
  };
}

const adminOnly = withAuth('UNIVERSITY_ADMINISTRATOR');
const adminOrWarden = withAuth('UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN');

export const infrastructureRoutes: FastifyPluginAsync = async (app) => {
  app.get('/room-configurations', adminOrWarden, getRoomConfigurations);

  app.get('/universities', adminOnly, getUniversities);
  app.get('/universities/:universityId', adminOnly, getUniversityById);
  app.post('/universities', adminOnly, postUniversity);
  app.patch('/universities/:universityId', adminOnly, patchUniversity);
  app.delete('/universities/:universityId', adminOnly, deleteUniversity);

  app.get('/hostels', adminOrWarden, getHostels);
  app.get('/hostels/:hostelId', adminOrWarden, getHostelById);
  app.post('/universities/:universityId/hostels', adminOnly, postHostel);
  app.patch('/hostels/:hostelId', adminOnly, patchHostel);
  app.delete('/hostels/:hostelId', adminOnly, deleteHostel);

  app.get('/hostels/:hostelId/buildings', adminOrWarden, getBuildings);
  app.get('/buildings/:buildingId', adminOrWarden, getBuildingById);
  app.post('/hostels/:hostelId/buildings', adminOrWarden, postBuilding);
  app.patch('/buildings/:buildingId', adminOrWarden, patchBuilding);
  app.delete('/buildings/:buildingId', adminOrWarden, deleteBuilding);

  app.get('/buildings/:buildingId/blocks', adminOrWarden, getBlocks);
  app.get('/blocks/:blockId', adminOrWarden, getBlockById);
  app.post('/buildings/:buildingId/blocks', adminOrWarden, postBlock);
  app.patch('/blocks/:blockId', adminOrWarden, patchBlock);
  app.delete('/blocks/:blockId', adminOrWarden, deleteBlock);

  app.get('/blocks/:blockId/floors', adminOrWarden, getFloors);
  app.get('/floors/:floorId', adminOrWarden, getFloorById);
  app.post('/blocks/:blockId/floors', adminOrWarden, postFloor);
  app.patch('/floors/:floorId', adminOrWarden, patchFloor);
  app.delete('/floors/:floorId', adminOrWarden, deleteFloor);

  app.get('/floors/:floorId/rooms', adminOrWarden, getRooms);
  app.get('/rooms/:roomId', adminOrWarden, getRoomById);
  app.post('/floors/:floorId/rooms', adminOrWarden, postRoom);
  app.patch('/rooms/:roomId', adminOrWarden, patchRoom);
  app.delete('/rooms/:roomId', adminOrWarden, deleteRoom);

  app.get('/rooms/:roomId/beds', adminOrWarden, getBeds);
  app.get('/beds/:bedId', adminOrWarden, getBedById);
  app.post('/rooms/:roomId/beds', adminOrWarden, postBed);
  app.patch('/beds/:bedId', adminOrWarden, patchBed);
  app.delete('/beds/:bedId', adminOrWarden, deleteBed);
};
