import cors from '@fastify/cors';
import { databaseHealthCheck } from '@nestora/database';
import type { ApiSuccessResponse } from '@nestora/types';
import Fastify, { type FastifyInstance } from 'fastify';
import type { Env } from './config/env.js';

export async function buildApp(env: Env): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  app.get('/api/v1/health', async () => {
    const database =
      process.env.DATABASE_URL !== undefined
        ? { connected: await databaseHealthCheck() }
        : undefined;

    const body: ApiSuccessResponse<{
      status: 'ok';
      service: 'api';
      database?: { connected: boolean };
    }> = {
      success: true,
      data: { status: 'ok', service: 'api', ...(database ? { database } : {}) },
      timestamp: new Date().toISOString(),
    };
    return body;
  });

  return app;
}
