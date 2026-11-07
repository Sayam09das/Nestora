import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { authRoutes } from './auth.routes.js';
import * as authService from './auth.service.js';

const authPluginImpl: FastifyPluginAsync = async (app) => {
  app.addHook('onReady', async () => {
    await authService.ensureBootstrapAdmin(app.prisma, app.config);
  });
  await app.register(authRoutes, { prefix: '/auth' });
};

export const authPlugin = fp(authPluginImpl, {
  name: 'auth',
  dependencies: ['prisma', 'config'],
});
