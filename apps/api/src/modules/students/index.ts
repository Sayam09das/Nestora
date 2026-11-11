import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { studentsRoutes } from './students.routes.js';

const studentsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(studentsRoutes, { prefix: '/students' });
};

export const studentsPlugin = fp(studentsPluginImpl, {
  name: 'students',
  dependencies: ['prisma'],
});
