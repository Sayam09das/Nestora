import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { checkinOutRoutes } from './checkin-out.routes.js';

const checkinOutPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(checkinOutRoutes, { prefix: '/checkin-out' });
};

export const checkinOutPlugin = fp(checkinOutPluginImpl, {
  name: 'checkin-out',
  dependencies: ['prisma'],
});