import type { FastifyPluginAsync } from 'fastify';
import { requireRoles } from '../../middleware/authorize.js';
import { getUniversities, postUniversity } from './infrastructure.controller.js';

export const infrastructureRoutes: FastifyPluginAsync = async (app) => {
  const guard = requireRoles('UNIVERSITY_ADMINISTRATOR');
  app.get('/universities', { preHandler: guard }, getUniversities);
  app.post('/universities', { preHandler: guard }, postUniversity);
};
