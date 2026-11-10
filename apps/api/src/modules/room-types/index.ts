import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { roomTypesRoutes } from './room-types.routes.js';

const roomTypesPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(roomTypesRoutes, { prefix: '/room-types' });
};

export const roomTypesPlugin = fp(roomTypesPluginImpl, {
  name: 'room-types',
  dependencies: ['prisma'],
});
