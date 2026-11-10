import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestError, InternalError, NotFoundError } from '../../common/errors/index.js';
import type { Env } from '../../config/index.js';
import { buildObjectKey, isSafeObjectKey } from './object-key.js';
import type { PutObjectInput, StorageBucket, StoredObjectMeta } from './storage.types.js';

function bucketName(env: Env, bucket: StorageBucket): string {
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

let client: S3Client | undefined;

function s3Client(env: Env): S3Client {
  if (!client) {
    if (!env.S3_REGION || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
      throw new InternalError('Object storage is not configured (Neon: run neon env pull).');
    }
    client = new S3Client({
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
      ...(env.AWS_ENDPOINT_URL_S3
        ? { endpoint: env.AWS_ENDPOINT_URL_S3, forcePathStyle: true }
        : {}),
    });
  }
  return client;
}

export async function putS3Object(env: Env, input: PutObjectInput): Promise<StoredObjectMeta> {
  const objectKey = buildObjectKey(input.fileName);
  const Bucket = bucketName(env, input.bucket);
  const command = new PutObjectCommand({
    Bucket,
    Key: objectKey,
    Body: input.body,
    ContentType: input.mimeType,
    ...((input.bucket === 'public' || input.bucket === 'staffPublic') && !env.AWS_ENDPOINT_URL_S3
      ? { ACL: 'public-read' as const }
      : {}),
  });
  await s3Client(env).send(command);
  return {
    objectKey,
    bucket: input.bucket,
    fileName: input.fileName,
    mimeType: input.mimeType,
    sizeBytes: input.body.length,
  };
}

export async function assertS3ObjectExists(
  env: Env,
  bucket: StorageBucket,
  objectKey: string,
): Promise<void> {
  if (!isSafeObjectKey(objectKey)) {
    throw new BadRequestError('Invalid object key.');
  }
  const command = new HeadObjectCommand({
    Bucket: bucketName(env, bucket),
    Key: objectKey,
  });
  try {
    await s3Client(env).send(command);
  } catch {
    throw new BadRequestError('Uploaded file was not found. Upload again before submitting.');
  }
}

export function publicObjectUrl(env: Env, objectKey: string, bucketNameOverride?: string): string {
  const bucket = bucketNameOverride ?? env.S3_BUCKET_PUBLIC;
  const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');
  if (env.AWS_ENDPOINT_URL_S3) {
    const base = env.AWS_ENDPOINT_URL_S3.replace(/\/$/, '');
    return `${base}/${bucket}/${encodedKey}`;
  }
  const region = env.S3_REGION || 'us-east-1';
  if (region === 'us-east-1') {
    return `https://${bucket}.s3.amazonaws.com/${encodedKey}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

export async function getS3ObjectBuffer(
  env: Env,
  bucket: StorageBucket,
  objectKey: string,
): Promise<{ buffer: Buffer; mimeType: string }> {
  if (!isSafeObjectKey(objectKey)) {
    throw new NotFoundError('File not found.');
  }
  const response = await s3Client(env).send(
    new GetObjectCommand({
      Bucket: bucketName(env, bucket),
      Key: objectKey,
    }),
  );
  if (!response.Body) {
    throw new NotFoundError('File not found.');
  }
  const bytes = await response.Body.transformToByteArray();
  return {
    buffer: Buffer.from(bytes),
    mimeType: response.ContentType ?? 'application/octet-stream',
  };
}
