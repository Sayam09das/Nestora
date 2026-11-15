import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { uploadsRoutes } from './uploads.routes.js';

const uploadsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(uploadsRoutes, { prefix: '/uploads' });
};

export const uploadsPlugin = fp(uploadsPluginImpl, {
  name: 'uploads',
  dependencies: ['prisma', 'config'],
});