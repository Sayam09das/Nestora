import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { financeRoutes } from './finance.routes.js';

const financePluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(financeRoutes, { prefix: '/finance' });
};

export const financePlugin = fp(financePluginImpl, {
  name: 'finance-desk',
  dependencies: ['prisma'],
});
