import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { reportsRoutes } from './reports.routes.js';

const reportsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(reportsRoutes, { prefix: '/reports' });
};

export const reportsPlugin = fp(reportsPluginImpl, {
  name: 'reports-desk',
  dependencies: ['prisma'],
});
