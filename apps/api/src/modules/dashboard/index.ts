import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { dashboardRoutes } from './dashboard.routes.js';

const dashboardPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(dashboardRoutes, { prefix: '/dashboard' });
};

export const dashboardPlugin = fp(dashboardPluginImpl, {
  name: 'dashboard',
  dependencies: ['prisma'],
});
