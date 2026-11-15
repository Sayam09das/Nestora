import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { dailyRegisterRoutes } from './daily-register.routes.js';

const dailyRegisterPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(dailyRegisterRoutes, { prefix: '/daily-register' });
};

export const dailyRegisterPlugin = fp(dailyRegisterPluginImpl, {
  name: 'daily-register-desk',
  dependencies: ['prisma'],
});
