import { Prisma } from '@nestora/database';
import { ConflictError, NotFoundError } from '../../common/errors/index.js';

export function auditJsonState(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function rethrowPrismaMutation(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new ConflictError('A record with the same unique identifier already exists.');
    }
    if (error.code === 'P2003') {
      throw new ConflictError(
        'This record cannot be removed while dependent infrastructure exists.',
      );
    }
    if (error.code === 'P2025') {
      throw new NotFoundError('Record not found.');
    }
  }
  throw error;
}

export function defaultBedNumbers(capacity: number): string[] {
  return Array.from({ length: capacity }, (_, i) => String(i + 1));
}
