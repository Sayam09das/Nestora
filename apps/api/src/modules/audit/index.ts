import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { auditRoutes } from './audit.routes.js';

const auditPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(auditRoutes);
};

export const auditPlugin = fp(auditPluginImpl, {
  name: 'audit',
  dependencies: ['prisma'],
});
