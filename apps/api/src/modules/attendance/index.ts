import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { attendanceRoutes } from './attendance.routes.js';

const attendancePluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(attendanceRoutes, { prefix: '/attendance' });
};

export const attendancePlugin = fp(attendancePluginImpl, {
  name: 'attendance',
  dependencies: ['prisma'],
});
