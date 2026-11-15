import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { outingRoutes } from './outing.routes.js';

const outingsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(outingRoutes, { prefix: '/outings' });
};

export const outingsPlugin = fp(outingsPluginImpl, {
  name: 'outings',
  dependencies: ['prisma'],
});