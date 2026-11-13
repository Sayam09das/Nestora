import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { getAccountDeskHandler, patchAccountDeskProfileHandler } from './account.controller.js';

const authOnly = {
  preHandler: async (request: FastifyRequest) => {
    requireAuth(request);
  },
};

export const accountRoutes: FastifyPluginAsync = async (app) => {
  app.get('/desk', authOnly, getAccountDeskHandler);
  app.patch('/desk/profile', authOnly, patchAccountDeskProfileHandler);
};
