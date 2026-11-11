import type { Env } from '../../config/index.js';

/** Remote object storage (Neon Object Storage or generic S3). */
export function usesObjectStorage(env: Env): boolean {
  return env.STORAGE_DRIVER === 'neon' || env.STORAGE_DRIVER === 's3';
}

/** Files live in Neon branch buckets (S3-compatible API, not Amazon AWS). */
export function usesNeonObjectStorage(env: Env): boolean {
  return env.STORAGE_DRIVER === 'neon' || Boolean(env.AWS_ENDPOINT_URL_S3);
}
