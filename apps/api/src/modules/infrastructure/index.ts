import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { infrastructureRoutes } from './infrastructure.routes.js';

const infrastructurePluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(infrastructureRoutes, { prefix: '/infrastructure' });
};

export const infrastructurePlugin = fp(infrastructurePluginImpl, {
  name: 'infrastructure',
  dependencies: ['prisma'],
});
