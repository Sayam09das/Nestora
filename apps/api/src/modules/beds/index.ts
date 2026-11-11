import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { bedsRoutes } from './beds.routes.js';

const bedsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(bedsRoutes, { prefix: '/beds' });
};

export const bedsPlugin = fp(bedsPluginImpl, {
  name: 'beds',
  dependencies: ['prisma'],
});
