import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { visitorRoutes } from './visitor.routes.js';

const visitorsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(visitorRoutes, { prefix: '/visitors' });
};

export const visitorsPlugin = fp(visitorsPluginImpl, {
  name: 'visitors',
  dependencies: ['prisma'],
});
