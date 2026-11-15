import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { leaveRoutes } from './leave.routes.js';

const leavePluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(leaveRoutes, { prefix: '/leave' });
};

export const leavePlugin = fp(leavePluginImpl, {
  name: 'leave-desk',
  dependencies: ['prisma'],
});
