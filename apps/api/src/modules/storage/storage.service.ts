import type { Env } from '../../config/index.js';
import {
  assertLocalObjectExists,
  openLocalObjectReadStream,
  putLocalObject,
  readLocalObject,
} from './local.storage.js';
import {
  assertS3ObjectExists,
  getS3ObjectBuffer,
  publicObjectUrl,
  putS3Object,
} from './s3.storage.js';
import { usesObjectStorage } from './storage-driver.js';
import type { PutObjectInput, StorageBucket, StoredObjectMeta } from './storage.types.js';

export async function putObject(env: Env, input: PutObjectInput): Promise<StoredObjectMeta> {
  if (usesObjectStorage(env)) {
    return putS3Object(env, input);
  }
  return putLocalObject(env, input);
}

export async function assertObjectExists(
  env: Env,
  bucket: StorageBucket,
  objectKey: string,
): Promise<void> {
  if (usesObjectStorage(env)) {
    await assertS3ObjectExists(env, bucket, objectKey);
    return;
  }
  await assertLocalObjectExists(env, bucket, objectKey);
}

export function buildPublicProfilePhotoUrl(env: Env, objectKey: string): string {
  if (usesObjectStorage(env)) {
    return publicObjectUrl(env, objectKey);
  }
  const base = (env.API_URL ?? `http://localhost:${env.PORT}`).replace(/\/$/, '');
  const encoded = objectKey.split('/').map(encodeURIComponent).join('/');
  return `${base}/api/v1/uploads/public/${encoded}`;
}

export function buildPublicStaffPhotoUrl(env: Env, objectKey: string): string {
  const base = (env.API_URL ?? `http://localhost:${env.PORT}`).replace(/\/$/, '');
  const encoded = objectKey.split('/').map(encodeURIComponent).join('/');
  return `${base}/api/v1/uploads/staff-public/${encoded}`;
}

export async function readBucketObject(
  env: Env,
  bucket: StorageBucket,
  objectKey: string,
): Promise<{ buffer: Buffer; mimeType: string }> {
  if (usesObjectStorage(env)) {
    return getS3ObjectBuffer(env, bucket, objectKey);
  }
  const buffer = await readLocalObject(env, bucket, objectKey);
  const ext = objectKey.split('.').pop()?.toLowerCase();
  const mimeType =
    ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/octet-stream';
  return { buffer, mimeType };
}

export function getPublicObjectReadStream(env: Env, objectKey: string) {
  return openLocalObjectReadStream(env, 'public', objectKey);
}

export async function readPrivateObject(
  env: Env,
  objectKey: string,
  bucket: StorageBucket = 'private',
): Promise<{ buffer: Buffer; mimeType: string }> {
  if (usesObjectStorage(env)) {
    return getS3ObjectBuffer(env, bucket, objectKey);
  }
  const buffer = await readLocalObject(env, bucket, objectKey);
  return { buffer, mimeType: 'application/octet-stream' };
}
