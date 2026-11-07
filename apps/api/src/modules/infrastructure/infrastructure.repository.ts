import type { Prisma, PrismaClient } from '@nestora/database';

type Db = PrismaClient | Prisma.TransactionClient;

export function listUniversities(prisma: Db) {
  return prisma.university.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
      contactEmail: true,
      createdAt: true,
    },
  });
}

export function createUniversity(
  prisma: Db,
  data: { name: string; code: string; address?: string; contactEmail?: string },
) {
  return prisma.university.create({
    data: {
      name: data.name,
      code: data.code,
      address: data.address,
      contactEmail: data.contactEmail,
    },
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
      contactEmail: true,
      createdAt: true,
    },
  });
}
