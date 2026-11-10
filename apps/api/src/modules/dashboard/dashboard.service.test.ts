import type { PrismaClient } from '@nestora/database';
import { describe, expect, it } from 'vitest';
import { getAdminDashboardOverview } from './dashboard.service.js';

function mockPrisma(): PrismaClient {
  return {
    bed: {
      groupBy: async () => [
        { status: 'OCCUPIED', _count: { _all: 8 } },
        { status: 'AVAILABLE', _count: { _all: 2 } },
      ],
      count: async () => 10,
    },
    hostel: { count: async () => 2 },
    room: { count: async () => 5 },
    user: {
      count: async (args?: { where?: { role?: string } }) => {
        if (args?.where?.role === 'STUDENT' && args.where && 'status' in args.where) {
          return 3;
        }
        if (args?.where?.role === 'STUDENT') {
          return 2;
        }
        return 4;
      },
    },
    attendanceRecord: {
      groupBy: async () => [
        { status: 'PRESENT', _count: { _all: 9 } },
        { status: 'ABSENT', _count: { _all: 1 } },
      ],
    },
    complaintTicket: {
      count: async () => 2,
      findMany: async () => [
        {
          createdAt: new Date('2026-11-01T10:00:00.000Z'),
          updatedAt: new Date('2026-11-01T14:00:00.000Z'),
        },
      ],
    },
    leaveApplication: { count: async () => 1 },
    auditLog: {
      findMany: async () => [
        {
          id: 'a1',
          actionName: 'USER_PROVISIONED',
          entityType: 'User',
          timestamp: new Date('2026-11-10T08:00:00.000Z'),
        },
      ],
    },
  } as unknown as PrismaClient;
}

describe('getAdminDashboardOverview', () => {
  it('computes occupancy from bed status counts', async () => {
    const overview = await getAdminDashboardOverview(mockPrisma());
    expect(overview.occupancy.percent).toBe(80);
    expect(overview.occupancy.totalOperationalBeds).toBe(10);
    expect(overview.students.active).toBe(3);
    expect(overview.infrastructure.hostels).toBe(2);
    expect(overview.attendanceToday.percent).toBe(90);
    expect(overview.approvals.totalPending).toBe(7);
    expect(overview.recentActivities).toHaveLength(1);
  });
});
