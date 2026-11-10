import { type Env, envSchema } from './schema.js';

export type { Env };

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const hasNeonS3 =
    Boolean(source.AWS_ENDPOINT_URL_S3) &&
    Boolean(source.AWS_ACCESS_KEY_ID || source.S3_ACCESS_KEY_ID) &&
    Boolean(source.AWS_SECRET_ACCESS_KEY || source.S3_SECRET_ACCESS_KEY);

  const normalized: NodeJS.ProcessEnv = {
    ...source,
    S3_ACCESS_KEY_ID: source.S3_ACCESS_KEY_ID || source.AWS_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: source.S3_SECRET_ACCESS_KEY || source.AWS_SECRET_ACCESS_KEY,
    S3_REGION: source.S3_REGION || source.AWS_REGION,
    AWS_ENDPOINT_URL_S3: source.AWS_ENDPOINT_URL_S3,
    STORAGE_DRIVER:
      hasNeonS3 && (source.STORAGE_DRIVER ?? 'local') === 'local'
        ? 'neon'
        : (source.STORAGE_DRIVER ?? 'local'),
  };
  const parsed = envSchema.safeParse(normalized);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${message}`);
  }
  let data = parsed.data;
  if (data.NODE_ENV === 'development' && source.SESSION_IDLE_TIMEOUT_MINUTES === undefined) {
    data = { ...data, SESSION_IDLE_TIMEOUT_MINUTES: 480 };
  }
  return data;
}
