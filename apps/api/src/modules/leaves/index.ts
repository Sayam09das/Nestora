import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { leaveRoutes } from './leave.routes.js';

const leavesPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(leaveRoutes, { prefix: '/leaves' });
};

export const leavesPlugin = fp(leavesPluginImpl, {
  name: 'leaves',
  dependencies: ['prisma'],
});
