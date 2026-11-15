import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { requireAuth } from '../../middleware/authenticate.js';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getFinanceDeskSummaryHandler,
  getFinanceLedgerDetailHandler,
  listFinanceDeskLedgersHandler,
  postDecideFeeAdjustmentHandler,
  postProposeFeeWaiverHandler,
  postAssessLedgerFromScheduleHandler,
  postQueuePaymentReminderHandler,
  postRecordOfflinePaymentHandler,
} from './finance.controller.js';

function withAdminOrWardenAuth() {
  return {
    preHandler: [
      async (request: FastifyRequest) => {
        requireAuth(request);
      },
      requireRoles('UNIVERSITY_ADMINISTRATOR', 'HOSTEL_WARDEN', 'HOSTEL_STAFF', 'ACCOUNTANT'),
    ],
  };
}

const adminOrWarden = withAdminOrWardenAuth();

export const financeRoutes: FastifyPluginAsync = async (app) => {
  app.get('/desk/summary', adminOrWarden, getFinanceDeskSummaryHandler);
  app.get('/desk/ledgers', adminOrWarden, listFinanceDeskLedgersHandler);
  app.get('/desk/ledgers/:ledgerId', adminOrWarden, getFinanceLedgerDetailHandler);
  app.post('/desk/payments', withAccountantAdminAuth(), postRecordOfflinePaymentHandler);
  app.post('/desk/waivers', adminOrWarden, postProposeFeeWaiverHandler);
  app.post('/desk/adjustments/:adjustmentId/decide', withAdminOnlyAuth(), postDecideFeeAdjustmentHandler);
  app.post('/desk/ledgers/:ledgerId/assess', withAccountantAdminAuth(), postAssessLedgerFromScheduleHandler);
  app.post('/desk/ledgers/:ledgerId/reminder', adminOrWarden, postQueuePaymentReminderHandler);
};

function withAccountantAdminAuth() {
  return {
    preHandler: [
      async (request: FastifyRequest) => {
        requireAuth(request);
      },
      requireRoles('UNIVERSITY_ADMINISTRATOR', 'ACCOUNTANT'),
    ],
  };
}

function withAdminOnlyAuth() {
  return {
    preHandler: [
      async (request: FastifyRequest) => {
        requireAuth(request);
      },
      requireRoles('UNIVERSITY_ADMINISTRATOR'),
    ],
  };
}
