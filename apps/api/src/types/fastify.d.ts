import type { PrismaClient } from '@nestora/database';
import type { SessionUser } from '@nestora/types';
import type { Env } from '../config/env.js';
import type { SessionContext } from '../modules/auth/auth.types.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: SessionUser;
    sessionContext?: SessionContext;
  }

  interface FastifyInstance {
    config: Env;
    prisma: PrismaClient;
  }
}
