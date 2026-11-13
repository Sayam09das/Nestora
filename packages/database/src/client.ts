import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

function isTransientConnectError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const code = 'code' in error ? String((error as { code?: string }).code) : '';
  if (code === 'P1001' || code === 'P1002' || code === 'P1017') return true;
  const message = 'message' in error ? String((error as { message?: string }).message) : '';
  return message.includes("Can't reach database server");
}

export async function connectDatabase(): Promise<void> {
  const maxAttempts = process.env.NODE_ENV === 'production' ? 1 : 5;
  const delayMs = 2_000;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await prisma.$connect();
      return;
    } catch (error) {
      const retry = attempt < maxAttempts && isTransientConnectError(error);
      if (!retry) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export async function databaseHealthCheck(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
