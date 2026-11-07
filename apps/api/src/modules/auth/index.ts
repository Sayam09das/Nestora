import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { authRoutes } from './auth.routes.js';

const authPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(authRoutes, { prefix: '/auth' });
};

export const authPlugin = fp(authPluginImpl, {
  name: 'auth',
  dependencies: ['prisma', 'config'],
});
