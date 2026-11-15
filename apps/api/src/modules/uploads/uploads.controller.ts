import type { FastifyReply, FastifyRequest } from 'fastify';
import { successResponse } from '../../common/api-response.js';
import { requireAuth } from '../../middleware/authenticate.js';
import { readSingleUpload } from './uploads.multipart.js';
import * as service from './uploads.service.js';

const PHOTO_MAX_BYTES = 2 * 1024 * 1024;

async function handleStudentProfile(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  requireAuth(request);
  const part = await request.file();
  const file = await readSingleUpload(part, PHOTO_MAX_BYTES);
  const env = request.server.config;
  const upload = await service.uploadStudentProfilePhoto(env, file.buffer, file.fileName, file.mimeType);
  reply.send(successResponse({ upload }, 'Profile photo uploaded.'));
}

async function handleStudentDocument(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  requireAuth(request);
  const part = await request.file();
  const env = request.server.config;
  const file = await readSingleUpload(part, env.MAX_UPLOAD_SIZE_BYTES);
  const upload = await service.uploadStudentDocument(env, file.buffer, file.fileName, file.mimeType);
  reply.send(successResponse({ upload }, 'Document uploaded.'));
}

async function handleStaffProfile(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  requireAuth(request);
  const part = await request.file();
  const file = await readSingleUpload(part, PHOTO_MAX_BYTES);
  const env = request.server.config;
  const upload = await service.uploadStaffProfilePhoto(env, file.buffer, file.fileName, file.mimeType);
  reply.send(successResponse({ upload }, 'Profile photo uploaded.'));
}

async function handleStaffDocumentUpload(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  requireAuth(request);
  const part = await request.file();
  const env = request.server.config;
  const file = await readSingleUpload(part, env.MAX_UPLOAD_SIZE_BYTES);
  const upload = await service.uploadStaffDocument(env, file.buffer, file.fileName, file.mimeType);
  reply.send(successResponse({ upload }, 'Document uploaded.'));
}

async function handleStaffDocumentDownload(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  requireAuth(request);
  const path = request.url.split('?')[0] ?? '';
  const objectKey = service.parseObjectKeyFromUrl(path, 'staff-document');
  const env = request.server.config;
  const { buffer, mimeType, fileName } = await service.readStaffDocumentForAdmin(
    request.server.prisma,
    env,
    objectKey,
  );
  reply
    .header('Content-Type', mimeType)
    .header('Content-Disposition', `attachment; filename="${fileName.replace(/"/g, '')}"`)
    .send(buffer);
}

async function handlePublicStudentAsset(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const path = request.url.split('?')[0] ?? '';
  const objectKey = service.parseObjectKeyFromUrl(path, 'public');
  const env = request.server.config;
  const { buffer, mimeType } = await service.readStudentPublicObject(env, objectKey);
  reply.header('Content-Type', mimeType).header('Cache-Control', 'public, max-age=3600');
  reply.send(buffer);
}

async function handlePublicStaffAsset(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const path = request.url.split('?')[0] ?? '';
  const objectKey = service.parseObjectKeyFromUrl(path, 'staff-public');
  const env = request.server.config;
  const { buffer, mimeType } = await service.readStaffPublicObject(env, objectKey);
  reply.header('Content-Type', mimeType).header('Cache-Control', 'public, max-age=3600');
  reply.send(buffer);
}

export const uploadsController = {
  handleStudentProfile,
  handleStudentDocument,
  handleStaffProfile,
  handleStaffDocumentUpload,
  handleStaffDocumentDownload,
  handlePublicStudentAsset,
  handlePublicStaffAsset,
};