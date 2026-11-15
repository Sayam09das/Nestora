import { PrismaClient } from '@prisma/client';

import { isTransientDbError, runWithDbRetry } from './db-retry.js';

/** Neon pooler + cold starts: ensure Prisma-friendly query params before Client reads env. */
function augmentDatabaseUrl(url: string): string {
  if (!url.includes('neon.tech')) return url;
  let out = url;
  if (url.includes('-pooler') && !url.includes('pgbouncer=')) {
    out += `${out.includes('?') ? '&' : '?'}pgbouncer=true`;
  }
  if (!out.includes('connect_timeout=')) {
    out += `${out.includes('?') ? '&' : '?'}connect_timeout=30`;
  }
  if (!out.includes('pool_timeout=')) {
    out += `${out.includes('?') ? '&' : '?'}pool_timeout=30`;
  }
  return out;
}

if (process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = augmentDatabaseUrl(process.env.DATABASE_URL.trim());
}

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createPrismaClient> };

function createPrismaClient() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  return base.$extends({
    name: 'nestora-db-retry',
    query: {
      $allOperations({ args, query }) {
        return runWithDbRetry(() => query(args), () => base.$connect());
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  await runWithDbRetry(() => prisma.$connect());
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export async function databaseHealthCheck(): Promise<boolean> {
  try {
    await runWithDbRetry(() => prisma.$queryRaw`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}
