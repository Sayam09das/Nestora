import multipart from '@fastify/multipart';
import type { FastifyPluginAsync } from 'fastify';
import { requireRoles } from '../../middleware/authorize.js';
import { uploadsController } from './uploads.controller.js';

const adminOnly = requireRoles('UNIVERSITY_ADMINISTRATOR');
const studentProfileUpload = requireRoles('UNIVERSITY_ADMINISTRATOR', 'STUDENT');
const staffProfileUpload = requireRoles(
  'UNIVERSITY_ADMINISTRATOR',
  'HOSTEL_WARDEN',
  'HOSTEL_STAFF',
  'SECURITY_GUARD',
  'ACCOUNTANT',
);

export const uploadsRoutes: FastifyPluginAsync = async (app) => {
  await app.register(multipart, {
    limits: {
      fileSize: app.config.MAX_UPLOAD_SIZE_BYTES,
      files: 1,
    },
  });

  app.post('/student-profile', { preHandler: [studentProfileUpload] }, uploadsController.handleStudentProfile);
  app.post('/student-document', { preHandler: [adminOnly] }, uploadsController.handleStudentDocument);
  app.post('/staff-profile', { preHandler: [staffProfileUpload] }, uploadsController.handleStaffProfile);
  app.post('/staff-document', { preHandler: [adminOnly] }, uploadsController.handleStaffDocumentUpload);
  app.get('/staff-document/*', { preHandler: [adminOnly] }, uploadsController.handleStaffDocumentDownload);
  app.get('/public/*', uploadsController.handlePublicStudentAsset);
  app.get('/staff-public/*', uploadsController.handlePublicStaffAsset);
};