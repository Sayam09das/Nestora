import { createReadStream } from 'node:fs';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import type { Readable } from 'node:stream';
import { BadRequestError, NotFoundError } from '../../common/errors/index.js';
import type { Env } from '../../config/index.js';
import { buildObjectKey, isSafeObjectKey } from './object-key.js';
import type { PutObjectInput, StorageBucket, StoredObjectMeta } from './storage.types.js';

function bucketDirName(env: Env, bucket: StorageBucket): string {
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

function resolveObjectPath(env: Env, bucket: StorageBucket, objectKey: string): string {
  if (!isSafeObjectKey(objectKey)) {
    throw new BadRequestError('Invalid object key.');
  }
  const root = resolve(env.UPLOAD_LOCAL_PATH);
  const full = resolve(join(root, bucketDirName(env, bucket), objectKey));
  if (!full.startsWith(resolve(root, bucketDirName(env, bucket)))) {
    throw new BadRequestError('Invalid object key.');
  }
  return full;
}

export async function putLocalObject(
  env: Env,
  input: PutObjectInput,
): Promise<StoredObjectMeta> {
  const objectKey = buildObjectKey(input.fileName);
  const absolute = resolveObjectPath(env, input.bucket, objectKey);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, input.body);
  return {
    objectKey,
    bucket: input.bucket,
    fileName: input.fileName,
    mimeType: input.mimeType,
    sizeBytes: input.body.length,
  };
}

export async function assertLocalObjectExists(
  env: Env,
  bucket: StorageBucket,
  objectKey: string,
): Promise<void> {
  const absolute = resolveObjectPath(env, bucket, objectKey);
  try {
    await stat(absolute);
  } catch {
    throw new BadRequestError('Uploaded file was not found. Upload again before submitting.');
  }
}

export function openLocalObjectReadStream(
  env: Env,
  bucket: StorageBucket,
  objectKey: string,
): Readable {
  const absolute = resolveObjectPath(env, bucket, objectKey);
  try {
    return createReadStream(absolute);
  } catch {
    throw new NotFoundError('File not found.');
  }
}

export async function readLocalObject(
  env: Env,
  bucket: StorageBucket,
  objectKey: string,
): Promise<Buffer> {
  const stream = openLocalObjectReadStream(env, bucket, objectKey);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
