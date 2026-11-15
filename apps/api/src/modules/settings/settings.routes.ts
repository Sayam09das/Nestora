import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getSettingsDeskSummaryHandler,
  getSettingsPanelDetailHandler,
  listSettingsDeskPanelsHandler,
  patchSettingsPanelHandler,
  patchWardenSettingsPanelHandler,
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

const settingsReader = {
  preHandler: [
    async (request: FastifyRequest) => {
      requireAuth(request);
    },
    requireRoles('UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN'),
  ],
};

const wardenOnly = {
  preHandler: [
    async (request: FastifyRequest) => {
      requireAuth(request);
    },
    requireRoles('HOSTEL_WARDEN'),
  ],
};

export const settingsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/desk/summary', settingsReader, getSettingsDeskSummaryHandler);
  app.get('/desk/panels', settingsReader, listSettingsDeskPanelsHandler);
  app.get('/desk/panels/:panelId', settingsReader, getSettingsPanelDetailHandler);
  app.patch('/desk/panels/:panelId', universityAdmin, patchSettingsPanelHandler);
  app.patch('/warden/desk/panels/:panelId', wardenOnly, patchWardenSettingsPanelHandler);
};
