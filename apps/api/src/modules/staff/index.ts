import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { staffRoutes } from './staff.routes.js';

const staffPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(staffRoutes, { prefix: '/staff' });
};

export const staffPlugin = fp(staffPluginImpl, {
  name: 'staff',
  dependencies: ['prisma'],
});
