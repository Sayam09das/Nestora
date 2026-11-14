import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { databaseHealthCheck } from '@nestora/database';
import type { FastifyError, FastifyServerOptions } from 'fastify';
import Fastify, { type FastifyInstance } from 'fastify';
import { errorResponse, successResponse } from './common/api-response.js';
import { ERROR_CODES } from './common/constants/index.js';
import { isAppError } from './common/errors/index.js';
import type { Env } from './config/env.js';
import { refreshSessionCookieIfPresent } from './modules/auth/session-cookie.js';
import { authenticate } from './middleware/authenticate.js';
import { enforcePasswordChangeGate } from './middleware/password-change-gate.js';
import { auditPlugin } from './modules/audit/index.js';
import { authPlugin } from './modules/auth/index.js';
import { dashboardPlugin } from './modules/dashboard/index.js';
import { staffPlugin } from './modules/staff/index.js';
import { studentsPlugin } from './modules/students/index.js';
import { roomsPlugin } from './modules/rooms/index.js';
import { bedsPlugin } from './modules/beds/index.js';
import { roomTypesPlugin } from './modules/room-types/index.js';
import { hostelsPlugin } from './modules/hostels/index.js';
import { allocationsPlugin } from './modules/allocations/index.js';
import { announcementsPlugin } from './modules/announcements/index.js';
import { complaintsPlugin } from './modules/complaints/index.js';
import { visitorsPlugin } from './modules/visitors/index.js';
import { incidentsPlugin } from './modules/incidents/index.js';
import { accountPlugin } from './modules/account/index.js';
import { uploadsPlugin } from './modules/uploads/index.js';
import { infrastructurePlugin } from './modules/infrastructure/index.js';
import { configPluginWrapped } from './plugins/config.js';
import { cookiePluginWrapped } from './plugins/cookie.js';
import { corsPluginWrapped } from './plugins/cors.js';
import { csrfPluginWrapped } from './plugins/csrf.js';
import { helmetPlugin } from './plugins/helmet.js';
import { prismaPlugin } from './plugins/prisma.js';
import { rateLimitPluginWrapped } from './plugins/rate-limit.js';
import { sessionPluginWrapped } from './plugins/session.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readPackageVersion(): string {
  try {
    const raw = readFileSync(join(__dirname, '../package.json'), 'utf-8');
    const pkg = JSON.parse(raw) as { version?: string };
    return typeof pkg.version === 'string' ? pkg.version : '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function buildLoggerConfig(env: Env): boolean | FastifyServerOptions['logger'] {
  if (env.NODE_ENV === 'production') {
    return {
      level: 'info',
    };
  }
  return {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  };
}

function isFastifyError(error: unknown): error is FastifyError {
  return typeof error === 'object' && error !== null && 'statusCode' in error;
}

function resolveErrorPayload(
  env: Env,
  error: unknown,
): { statusCode: number; code: string; message: string; details?: Record<string, unknown> } {
  const isProduction = env.NODE_ENV === 'production';

  if (isAppError(error)) {
    const message =
      error.statusCode >= 500 && isProduction ? 'An unexpected error occurred.' : error.message;
    return {
      statusCode: error.statusCode,
      code: error.code,
      message,
      details: error.details,
    };
  }

  const err = isFastifyError(error) ? error : undefined;
  const statusCode = err?.statusCode ?? 500;

  let code = 'REQUEST_ERROR';
  if (err?.code === 'FST_ERR_VALIDATION') {
    code = ERROR_CODES.VALIDATION_ERROR;
  } else if (statusCode === 429) {
    code = ERROR_CODES.RATE_LIMIT_EXCEEDED;
  } else if (statusCode >= 500) {
    code = ERROR_CODES.INTERNAL_ERROR;
  }

  const rawMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
  const message = statusCode >= 500 && isProduction ? 'An unexpected error occurred.' : rawMessage;

  return { statusCode, code, message };
}

export async function buildApp(env: Env): Promise<FastifyInstance> {
  const app = Fastify({
    logger: buildLoggerConfig(env),
    requestIdHeader: 'x-request-id',
    trustProxy: env.TRUST_PROXY,
  });

  await app.register(configPluginWrapped, { env });
  await app.register(helmetPlugin);
  await app.register(corsPluginWrapped, { env });
  await app.register(rateLimitPluginWrapped, { env });
  await app.register(cookiePluginWrapped, { env });
  await app.register(prismaPlugin);
  await app.register(sessionPluginWrapped);
  await app.register(csrfPluginWrapped, { env });

  app.addHook('onRequest', async (request, reply) => {
    await authenticate(request, reply);
    enforcePasswordChangeGate(request);
  });

  app.addHook('onSend', async (request, reply) => {
    refreshSessionCookieIfPresent(
      request.server.config,
      request.cookies,
      Boolean(request.sessionContext),
      (name, value, options) => {
        reply.setCookie(name, value, options);
      },
    );
  });

  const apiVersion = readPackageVersion();

  app.setErrorHandler((error, request, reply) => {
    const log = request.log ?? app.log;
    log.error({ err: error }, 'request failed');

    const { statusCode, code, message, details } = resolveErrorPayload(env, error);
    const correlationId = typeof request.id === 'string' ? request.id : undefined;
    const safeDetails = env.NODE_ENV === 'production' && statusCode >= 500 ? undefined : details;
    void reply
      .status(statusCode)
      .send(errorResponse(code, message, { details: safeDetails, correlationId }));
  });

  app.setNotFoundHandler((request, reply) => {
    const correlationId = typeof request.id === 'string' ? request.id : undefined;
    void reply.status(404).send(
      errorResponse(ERROR_CODES.NOT_FOUND, 'The requested resource was not found.', {
        correlationId,
      }),
    );
  });

  app.get('/', async () => {
    return successResponse(
      {
        name: 'Nestora API',
        version: apiVersion,
        environment: env.NODE_ENV,
        baseUrl: env.API_URL ?? null,
      },
      'API information retrieved successfully.',
    );
  });

  app.get('/health', async () => {
    return successResponse(
      {
        status: 'healthy',
        service: 'nestora-api',
      },
      'General health check passed.',
    );
  });

  app.get('/health/live', async () => {
    return successResponse({ status: 'alive' }, 'Liveness probe succeeded.');
  });

  app.get('/health/ready', async (_request, reply) => {
    const dbConnected = await databaseHealthCheck();
    if (!dbConnected) {
      return reply
        .status(503)
        .send(
          errorResponse(
            'SERVICE_UNAVAILABLE',
            'PostgreSQL is not reachable; the API is not ready to serve traffic.',
            {},
          ),
        );
    }
    return successResponse(
      {
        status: 'ready',
        application: { status: 'ready' },
        database: { status: 'connected', connected: true },
      },
      'Readiness probe passed.',
    );
  });

  await app.register(
    async (v1) => {
      v1.get('/', async () => successResponse({ apiVersion: 1 }, 'Nestora API v1 root.'));

      await v1.register(authPlugin);
      await v1.register(infrastructurePlugin);
      await v1.register(auditPlugin);
      await v1.register(dashboardPlugin);
      await v1.register(uploadsPlugin);
      await v1.register(staffPlugin);
      await v1.register(studentsPlugin);
      await v1.register(roomsPlugin);
      await v1.register(bedsPlugin);
      await v1.register(roomTypesPlugin);
      await v1.register(hostelsPlugin);
      await v1.register(allocationsPlugin);
      await v1.register(complaintsPlugin);
      await v1.register(visitorsPlugin);
      await v1.register(announcementsPlugin);
      await v1.register(incidentsPlugin);
      await v1.register(accountPlugin);
    },
    { prefix: '/api/v1' },
  );

  return app;
}
