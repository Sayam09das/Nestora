import { z } from 'zod';

const PLACEHOLDER_COOKIE_SECRET = 'change_me_to_a_32_byte_secure_random_string';

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    HOST: z.string().min(1).default('0.0.0.0'),
    API_URL: z.string().url().optional(),
    WEB_URL: z.string().url().default('http://localhost:3000'),
    /** Primary frontend origin (also used when CORS_ORIGINS is unset). */
    CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
    /** Comma-separated list of allowed browser origins for credentialed CORS. */
    CORS_ORIGINS: z.string().optional(),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    /** Stricter cap for login, reset, and activation endpoints (per IP, per minute). */
    RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().default(15),
    /** When true, Fastify trusts X-Forwarded-For for request.ip (set behind a reverse proxy). */
    TRUST_PROXY: z.coerce.boolean().default(false),
    /** Override auto SameSite (`lax` same host, `none` when WEB_URL ≠ API_URL). Required for Vercel + Render. */
    COOKIE_SAME_SITE: z.enum(['lax', 'none', 'strict']).optional(),

    DATABASE_URL: z.string().url(),

    COOKIE_SECRET: z.string().min(1).default(PLACEHOLDER_COOKIE_SECRET),
    SESSION_TTL_HOURS: z.coerce.number().int().positive().default(24),
    SESSION_IDLE_TIMEOUT_MINUTES: z.coerce.number().int().positive().default(30),

    /** Argon2id tuning (memory in KiB). Override per deployment hardware. */
    ARGON2_MEMORY_COST: z.coerce.number().int().positive().default(65_536),
    ARGON2_TIME_COST: z.coerce.number().int().positive().max(10).default(3),
    ARGON2_PARALLELISM: z.coerce.number().int().positive().max(16).default(4),

    /** Optional; defaults to COOKIE_SECRET when unset (derive a dedicated secret in production). */
    MFA_ENCRYPTION_SECRET: z.string().min(32).optional(),

    /**
     * When true, UNIVERSITY_ADMINISTRATOR and ACCOUNTANT must complete MFA before protected APIs.
     * MFA enrollment endpoints remain available to bootstrap privileged users.
     */
    PRIVILEGED_MFA_ENFORCED: z.coerce.boolean().default(false),

    SMTP_HOST: z.string().min(1).default('localhost'),
    SMTP_PORT: z.coerce.number().int().positive().max(65_535).default(1025),
    SMTP_USER: z.string().default(''),
    SMTP_PASS: z.string().default(''),
    SMTP_FROM: z
      .string()
      .min(1)
      .default('Nestora University System <no-reply@nestora.university.edu>'),

    /** `local` = disk; `neon` = Neon Object Storage (from `neon deploy`); `s3` = other S3-compatible host. */
    STORAGE_DRIVER: z.enum(['local', 'neon', 's3']).default('local'),
    UPLOAD_LOCAL_PATH: z.string().min(1).default('./uploads'),
    /** Legacy / general attachments (complaints, notices). */
    S3_BUCKET_NAME: z.string().default(''),
    /** Public bucket — student profile photos (world-readable). */
    S3_BUCKET_PUBLIC: z.string().default('nestora-student-profiles'),
    /** Private bucket — student registration / KYC documents. */
    S3_BUCKET_PRIVATE: z.string().default('nestora-student-documents'),
    /** Public bucket — staff / warden profile photos. */
    S3_BUCKET_STAFF_PUBLIC: z.string().default('nestora-staff-profiles'),
    /** Private bucket — staff / warden HR documents. */
    S3_BUCKET_STAFF_PRIVATE: z.string().default('nestora-staff-documents'),
    S3_REGION: z.string().default(''),
    S3_ACCESS_KEY_ID: z.string().default(''),
    S3_SECRET_ACCESS_KEY: z.string().default(''),
    /**
     * Injected by Neon CLI (`neon deploy` / `neon env pull`). Standard S3 API names — not an Amazon AWS account.
     */
    AWS_ENDPOINT_URL_S3: z.string().url().optional(),
    MAX_UPLOAD_SIZE_BYTES: z.coerce.number().int().positive().default(5_242_880),
    STUDENT_PHOTO_MAX_BYTES: z.coerce.number().int().positive().default(2_097_152),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      if (data.COOKIE_SECRET === PLACEHOLDER_COOKIE_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['COOKIE_SECRET'],
          message:
            'Set COOKIE_SECRET to a strong secret in production (not the example placeholder).',
        });
      } else if (data.COOKIE_SECRET.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['COOKIE_SECRET'],
          message: 'COOKIE_SECRET must be at least 32 characters in production.',
        });
      }

      if (!data.MFA_ENCRYPTION_SECRET || data.MFA_ENCRYPTION_SECRET.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['MFA_ENCRYPTION_SECRET'],
          message:
            'Set MFA_ENCRYPTION_SECRET to a dedicated 32+ character secret in production (do not reuse COOKIE_SECRET).',
        });
      }

      if (data.STORAGE_DRIVER === 'neon' || data.STORAGE_DRIVER === 's3') {
        if (!data.S3_BUCKET_PUBLIC) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['S3_BUCKET_PUBLIC'],
            message: 'S3_BUCKET_PUBLIC is required when STORAGE_DRIVER is s3.',
          });
        }
        if (!data.S3_BUCKET_PRIVATE) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['S3_BUCKET_PRIVATE'],
            message: 'S3_BUCKET_PRIVATE is required when STORAGE_DRIVER is s3.',
          });
        }
        if (!data.S3_REGION) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['S3_REGION'],
            message: 'S3_REGION is required when STORAGE_DRIVER is s3.',
          });
        }
        if (!data.S3_ACCESS_KEY_ID) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['S3_ACCESS_KEY_ID'],
            message: 'Storage credentials are required (Neon: AWS_ACCESS_KEY_ID from neon env pull).',
          });
        }
        if (!data.S3_SECRET_ACCESS_KEY) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['S3_SECRET_ACCESS_KEY'],
            message: 'Storage credentials are required (Neon: AWS_SECRET_ACCESS_KEY from neon env pull).',
          });
        }
        if (data.STORAGE_DRIVER === 'neon' && !data.AWS_ENDPOINT_URL_S3) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['AWS_ENDPOINT_URL_S3'],
            message: 'AWS_ENDPOINT_URL_S3 is required for Neon Object Storage (from neon env pull).',
          });
        }
      }

      if (data.ARGON2_MEMORY_COST < 19_456) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ARGON2_MEMORY_COST'],
          message: 'ARGON2_MEMORY_COST should be at least 19456 KiB (per OWASP) in production.',
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;
