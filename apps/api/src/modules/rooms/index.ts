import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { roomsRoutes } from './rooms.routes.js';

const roomsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(roomsRoutes, { prefix: '/rooms' });
};

export const roomsPlugin = fp(roomsPluginImpl, {
  name: 'rooms',
  dependencies: ['prisma'],
});
