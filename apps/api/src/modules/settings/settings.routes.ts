import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getSettingsDeskSummaryHandler,
  getSettingsPanelDetailHandler,
  listSettingsDeskPanelsHandler,
} from './settings.controller.js';

function withUniversityAdminAuth() {
  return {
    preHandler: [
      async (request: FastifyRequest) => {
        requireAuth(request);
      },
      requireRoles('UNIVERSITY_ADMINISTRATOR'),
    ],
  };
}

const universityAdmin = withUniversityAdminAuth();

export const settingsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/desk/summary', universityAdmin, getSettingsDeskSummaryHandler);
  app.get('/desk/panels', universityAdmin, listSettingsDeskPanelsHandler);
  app.get('/desk/panels/:panelId', universityAdmin, getSettingsPanelDetailHandler);
};
