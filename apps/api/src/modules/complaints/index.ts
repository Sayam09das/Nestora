import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { complaintsRoutes } from './complaints.routes.js';

const complaintsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(complaintsRoutes, { prefix: '/complaints' });
};

export const complaintsPlugin = fp(complaintsPluginImpl, {
  name: 'complaints-desk',
  dependencies: ['prisma'],
});
