import type { FastifyPluginAsync } from 'fastify';
import { requireRoles } from '../../middleware/authorize.js';
import {
  getAccountantCheckOutRequestsHandler,
  getStudentCheckOutDeskHandler,
  getWardenCheckOutRequestsHandler,
  postAccountantCheckOutClearanceHandler,
  postStudentCancelCheckOutHandler,
  postStudentCheckOutRequestHandler,
  postWardenCheckInHandler,
  postWardenFinalizeCheckOutHandler,
  postWardenRejectCheckOutHandler,
} from './checkin-out.controller.js';

export const checkinOutRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/student/desk',
    { preHandler: [requireRoles('STUDENT')] },
    getStudentCheckOutDeskHandler,
  );
  app.post(
    '/student/requests',
    { preHandler: [requireRoles('STUDENT')] },
    postStudentCheckOutRequestHandler,
  );
  app.get(
    '/warden/requests',
    { preHandler: [requireRoles('HOSTEL_WARDEN')] },
    getWardenCheckOutRequestsHandler,
  );
  app.post(
    '/warden/requests/:requestId/finalize',
    { preHandler: [requireRoles('HOSTEL_WARDEN')] },
    postWardenFinalizeCheckOutHandler,
  );
  app.post(
    '/warden/check-in',
    { preHandler: [requireRoles('HOSTEL_WARDEN')] },
    postWardenCheckInHandler,
  );
  app.post(
    '/warden/requests/:requestId/reject',
    { preHandler: [requireRoles('HOSTEL_WARDEN')] },
    postWardenRejectCheckOutHandler,
  );
  app.post(
    '/student/requests/:requestId/cancel',
    { preHandler: [requireRoles('STUDENT')] },
    postStudentCancelCheckOutHandler,
  );
  app.get(
    '/accountant/requests',
    { preHandler: [requireRoles('ACCOUNTANT', 'UNIVERSITY_ADMINISTRATOR')] },
    getAccountantCheckOutRequestsHandler,
  );
  app.post(
    '/accountant/requests/:requestId/clearance',
    { preHandler: [requireRoles('ACCOUNTANT', 'UNIVERSITY_ADMINISTRATOR')] },
    postAccountantCheckOutClearanceHandler,
  );
};