import type { PrismaClient } from '@nestora/database';
import type { Env } from '../../config/index.js';
import { BadRequestError, NotFoundError } from '../../common/errors/index.js';
import { isSafeObjectKey } from '../storage/object-key.js';
import {
  buildPublicProfilePhotoUrl,
  buildPublicStaffPhotoUrl,
  putObject,
  readBucketObject,
  readPrivateObject,
} from '../storage/storage.service.js';
import type { StorageBucket, StoredObjectMeta } from '../storage/storage.types.js';
import { assertAllowedDocument, assertAllowedPhoto } from './uploads.mime.js';

const PHOTO_MAX_BYTES = 2 * 1024 * 1024;

function bucketLabel(env: Env, bucket: StorageBucket): string {
  switch (bucket) {
    case 'public':
      return env.S3_BUCKET_PUBLIC;
    case 'private':
      return env.S3_BUCKET_PRIVATE;
    case 'staffPublic':
      return env.S3_BUCKET_STAFF_PUBLIC;
    case 'staffPrivate':
      return env.S3_BUCKET_STAFF_PRIVATE;
    default:
      return env.S3_BUCKET_PRIVATE;
  }
}

export type UploadPayload = {
  objectKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  bucket: string;
  publicUrl?: string;
};

function toUploadPayload(env: Env, meta: StoredObjectMeta, publicUrl?: string): UploadPayload {
  return {
    objectKey: meta.objectKey,
    fileName: meta.fileName,
    mimeType: meta.mimeType,
    sizeBytes: meta.sizeBytes,
    bucket: bucketLabel(env, meta.bucket),
    ...(publicUrl ? { publicUrl } : {}),
  };
}

export async function uploadStudentProfilePhoto(
  env: Env,
  buffer: Buffer,
  fileName: string,
  declaredMime: string,
): Promise<UploadPayload> {
  if (buffer.length > PHOTO_MAX_BYTES) {
    throw new BadRequestError('Profile photo must be 2 MB or smaller.');
  }
  const mimeType = assertAllowedPhoto(buffer, declaredMime);
  const meta = await putObject(env, { bucket: 'public', body: buffer, fileName, mimeType });
  const publicUrl = buildPublicProfilePhotoUrl(env, meta.objectKey);
  return toUploadPayload(env, meta, publicUrl);
}

export async function uploadStudentDocument(
  env: Env,
  buffer: Buffer,
  fileName: string,
  declaredMime: string,
): Promise<UploadPayload> {
  if (buffer.length > env.MAX_UPLOAD_SIZE_BYTES) {
    throw new BadRequestError('Document exceeds the maximum allowed size.');
  }
  const mimeType = assertAllowedDocument(buffer, declaredMime);
  const meta = await putObject(env, { bucket: 'private', body: buffer, fileName, mimeType });
  return toUploadPayload(env, meta);
}

export async function uploadStaffProfilePhoto(
  env: Env,
  buffer: Buffer,
  fileName: string,
  declaredMime: string,
): Promise<UploadPayload> {
  if (buffer.length > PHOTO_MAX_BYTES) {
    throw new BadRequestError('Profile photo must be 2 MB or smaller.');
  }
  const mimeType = assertAllowedPhoto(buffer, declaredMime);
  const meta = await putObject(env, { bucket: 'staffPublic', body: buffer, fileName, mimeType });
  const publicUrl = buildPublicStaffPhotoUrl(env, meta.objectKey);
  return toUploadPayload(env, meta, publicUrl);
}

export async function uploadStaffDocument(
  env: Env,
  buffer: Buffer,
  fileName: string,
  declaredMime: string,
): Promise<UploadPayload> {
  if (buffer.length > env.MAX_UPLOAD_SIZE_BYTES) {
    throw new BadRequestError('Document exceeds the maximum allowed size.');
  }
  const mimeType = assertAllowedDocument(buffer, declaredMime);
  const meta = await putObject(env, { bucket: 'staffPrivate', body: buffer, fileName, mimeType });
  return toUploadPayload(env, meta);
}

export function parseObjectKeyFromUrl(urlPath: string, segment: string): string {
  const marker = `/${segment}/`;
  const idx = urlPath.indexOf(marker);
  if (idx === -1) {
    throw new BadRequestError('Invalid object key.');
  }
  const encodedTail = urlPath.slice(idx + marker.length);
  const key = decodeURIComponent(encodedTail);
  if (!isSafeObjectKey(key)) {
    throw new BadRequestError('Invalid object key.');
  }
  return key;
}

export async function readStudentPublicObject(env: Env, objectKey: string) {
  if (!isSafeObjectKey(objectKey)) {
    throw new BadRequestError('Invalid object key.');
  }
  return readBucketObject(env, 'public', objectKey);
}

export async function readStaffPublicObject(env: Env, objectKey: string) {
  if (!isSafeObjectKey(objectKey)) {
    throw new BadRequestError('Invalid object key.');
  }
  return readBucketObject(env, 'staffPublic', objectKey);
}

export async function readStaffDocumentForAdmin(
  prisma: PrismaClient,
  env: Env,
  objectKey: string,
): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
  if (!isSafeObjectKey(objectKey)) {
    throw new BadRequestError('Invalid object key.');
  }
  const row = await prisma.staffDocument.findUnique({
    where: { objectKey },
    select: { fileName: true },
  });
  if (!row) {
    throw new NotFoundError('Document not found.');
  }
  const { buffer, mimeType } = await readPrivateObject(env, objectKey, 'staffPrivate');
  return { buffer, mimeType, fileName: row.fileName };
}