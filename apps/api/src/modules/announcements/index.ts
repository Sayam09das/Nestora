import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { announcementsRoutes } from './announcements.routes.js';

const announcementsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(announcementsRoutes, { prefix: '/announcements' });
};

export const announcementsPlugin = fp(announcementsPluginImpl, {
  name: 'announcements-desk',
  dependencies: ['prisma'],
});
