import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { hostelsRoutes } from './hostels.routes.js';

const hostelsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(hostelsRoutes, { prefix: '/hostels' });
};

export const hostelsPlugin = fp(hostelsPluginImpl, {
  name: 'hostels-directory',
  dependencies: ['prisma'],
});
