import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { incidentRoutes } from './incidents.routes.js';

const incidentsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(incidentRoutes, { prefix: '/incidents' });
};

export const incidentsPlugin = fp(incidentsPluginImpl, {
  name: 'incidents',
  dependencies: ['prisma'],
});
