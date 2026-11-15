import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { settingsRoutes } from './settings.routes.js';

const settingsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(settingsRoutes, { prefix: '/settings' });
};

export const settingsPlugin = fp(settingsPluginImpl, {
  name: 'settings-desk',
  dependencies: ['prisma', 'config'],
});
