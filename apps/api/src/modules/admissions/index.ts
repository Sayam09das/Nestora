import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { admissionsRoutes } from './admissions.routes.js';

const admissionsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(admissionsRoutes, { prefix: '/admissions' });
};

export const admissionsPlugin = fp(admissionsPluginImpl, {
  name: 'admissions',
  dependencies: ['prisma'],
});