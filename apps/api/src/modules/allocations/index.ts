import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { allocationsRoutes } from './allocations.routes.js';

const allocationsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(allocationsRoutes, { prefix: '/allocations' });
};

export const allocationsPlugin = fp(allocationsPluginImpl, {
  name: 'allocations-directory',
  dependencies: ['prisma'],
});
