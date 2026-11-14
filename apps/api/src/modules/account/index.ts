import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { accountRoutes } from './account.routes.js';

const accountPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(accountRoutes, { prefix: '/account' });
};

export const accountPlugin = fp(accountPluginImpl, {
  name: 'account-desk',
  dependencies: ['prisma'],
});
