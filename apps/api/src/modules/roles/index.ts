import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { rolesDeskRoutes } from './roles.routes.js';

const rolesDeskPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(rolesDeskRoutes, { prefix: '/roles' });
};

export const rolesDeskPlugin = fp(rolesDeskPluginImpl, {
  name: 'roles-desk',
  dependencies: ['prisma'],
});
