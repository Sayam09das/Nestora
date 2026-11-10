import type { PrismaClient } from '@nestora/database';
import { describe, expect, it } from 'vitest';
import { getStudentDirectorySummary } from './students.service.js';

function mockPrisma(): PrismaClient {
  return {
    user: {
      count: async (args?: { where?: { status?: string; isVerified?: boolean } }) => {
        if (args?.where?.status === 'ACTIVE') {
          return 2;
        }
        if (args?.where?.status === 'INACTIVE' && args.where.isVerified === false) {
          return 1;
        }
        if (args?.where && 'OR' in args.where) {
          return 1;
        }
        if (args?.where && 'createdAt' in args.where) {
          return 1;
        }
        return 4;
      },
    },
    student: {
      findMany: async () => [{ course: 'B.Tech CSE' }, { academicYear: '2024' }],
    },
    hostel: {
      findMany: async () => [{ name: 'Boys Hostel A' }],
    },
  } as unknown as PrismaClient;
}

describe('getStudentDirectorySummary', () => {
  it('aggregates student role counts', async () => {
    const summary = await getStudentDirectorySummary(mockPrisma());
    expect(summary.total).toBe(4);
    expect(summary.active).toBe(2);
    expect(summary.activeRatePercent).toBe(50);
    expect(summary.facets.hostels).toContain('Boys Hostel A');
  });
});
