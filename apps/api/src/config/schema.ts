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

    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    UPLOAD_LOCAL_PATH: z.string().min(1).default('./uploads'),
    S3_BUCKET_NAME: z.string().default(''),
    S3_REGION: z.string().default(''),
    S3_ACCESS_KEY_ID: z.string().default(''),
    S3_SECRET_ACCESS_KEY: z.string().default(''),
    MAX_UPLOAD_SIZE_BYTES: z.coerce.number().int().positive().default(5_242_880),
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

      if (data.STORAGE_DRIVER === 's3') {
        if (!data.S3_BUCKET_NAME) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['S3_BUCKET_NAME'],
            message: 'S3_BUCKET_NAME is required when STORAGE_DRIVER is s3.',
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
            message: 'S3_ACCESS_KEY_ID is required when STORAGE_DRIVER is s3.',
          });
        }
        if (!data.S3_SECRET_ACCESS_KEY) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['S3_SECRET_ACCESS_KEY'],
            message: 'S3_SECRET_ACCESS_KEY is required when STORAGE_DRIVER is s3.',
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
