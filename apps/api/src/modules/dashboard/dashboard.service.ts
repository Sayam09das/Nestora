import type { BedStatus, PrismaClient } from '@nestora/database';

const STAFF_AND_WARDEN_ROLES = [
  'HOSTEL_WARDEN',
  'HOSTEL_STAFF',
  'SECURITY_GUARD',
] as const;

const TERMINAL_COMPLAINT_STATUSES = ['RESOLVED', 'CLOSED', 'REJECTED'] as const;

const PENDING_LEAVE_STATUSES = ['SUBMITTED', 'PENDING', 'PENDING_APPROVAL'] as const;

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function attendanceRatePercent(present: number, absent: number, onLeave: number): number | null {
  const total = present + absent + onLeave;
  if (total === 0) {
    return null;
  }
  return Math.round((present / total) * 1000) / 10;
}

function averageComplaintResponseHours(
  tickets: { createdAt: Date; updatedAt: Date }[],
): number | null {
  if (tickets.length === 0) {
    return null;
  }
  const totalHours = tickets.reduce((sum, t) => {
    const ms = t.updatedAt.getTime() - t.createdAt.getTime();
    return sum + ms / (1000 * 60 * 60);
  }, 0);
  return Math.round((totalHours / tickets.length) * 10) / 10;
}

function formatAuditActivity(actionName: string, entityType: string): { title: string; detail: string } {
  const infraMatch = actionName.match(/^(HOSTEL|ROOM|BED|BUILDING|BLOCK|FLOOR|UNIVERSITY)_(CREATED|UPDATED|DELETED)$/);
  if (infraMatch) {
    const entity = infraMatch[1];
    const verb = infraMatch[2];
    if (entity && verb) {
      const verbLabel = verb === 'CREATED' ? 'created' : verb === 'UPDATED' ? 'updated' : 'removed';
      const entityLabel = `${entity.charAt(0)}${entity.slice(1).toLowerCase()}`;
      return {
        title: `${entityLabel} ${verbLabel}`,
        detail: `Infrastructure · ${entityType}`,
      };
    }
  }
  switch (actionName) {
    case 'USER_PROVISIONED':
      return { title: 'New user provisioned', detail: 'User account created' };
    case 'ACCOUNT_ACTIVATED':
      return { title: 'Account activated', detail: 'Student or staff onboarding' };
    case 'LOGIN_SUCCESS':
      return { title: 'Sign-in recorded', detail: 'Authentication' };
    default:
      return {
        title: actionName.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
        detail: entityType,
      };
  }
}

function monthOverMonthPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? null : 100;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

type BedCountRow = { status: BedStatus; count: number };

function occupancyPercent(rows: BedCountRow[]): AdminDashboardOverview['occupancy'] {
  const map = new Map(rows.map((r) => [r.status, r.count]));
  const occupied = map.get('OCCUPIED') ?? 0;
  const available = map.get('AVAILABLE') ?? 0;
  const reserved = map.get('RESERVED') ?? 0;
  const totalOperational = occupied + available + reserved;
  const percent =
    totalOperational > 0 ? Math.round((occupied / totalOperational) * 1000) / 10 : null;
  return {
    percent,
    occupiedBeds: occupied,
    totalOperationalBeds: totalOperational,
    availableBeds: available,
  };
}

export type AdminDashboardOverview = {
  generatedAt: string;
  occupancy: {
    percent: number | null;
    occupiedBeds: number;
    totalOperationalBeds: number;
    availableBeds: number;
  };
  pendingActivations: number;
  students: {
    active: number;
    createdThisMonth: number;
    createdPreviousMonth: number;
    monthOverMonthPercent: number | null;
  };
  staff: { active: number };
  infrastructure: {
    hostels: number;
    rooms: number;
    beds: number;
  };
  attendanceToday: {
    percent: number | null;
    present: number;
    absent: number;
    onLeave: number;
  };
  announcements: {
    liveCount: number;
    recent: Array<{ id: string; title: string; postedAt: string }>;
  };
  operations: {
    openComplaints: number;
    pendingLeave: number;
    avgResponseHours: number | null;
  };
  approvals: {
    studentRegistrations: number;
    leaveRequests: number;
    complaints: number;
    totalPending: number;
  };
  fees: {
    available: false;
    collectedInr: null;
    expectedInr: null;
    pendingInr: null;
    collectionRatePercent: null;
    monthlyTrend: Array<{ month: string; feesInr: number }>;
  };
  recentActivities: Array<{
    id: string;
    title: string;
    detail: string;
    occurredAt: string;
    entityType: string;
    actionName: string;
  }>;
};

export async function getAdminDashboardOverview(
  prisma: PrismaClient,
): Promise<AdminDashboardOverview> {
  const now = new Date();
  const monthStart = startOfUtcMonth(now);
  const previousMonthStart = startOfUtcMonth(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)),
  );
  const today = startOfUtcDay(now);
  const responseWindowStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    bedGroups,
    hostels,
    rooms,
    beds,
    pendingActivations,
    activeStudents,
    activeStaff,
    studentsCreatedThisMonth,
    studentsCreatedPreviousMonth,
    attendanceGroups,
    openComplaints,
    pendingLeave,
    recentResolvedComplaints,
    auditRows,
  ] = await Promise.all([
    prisma.bed.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.hostel.count({ where: { isActive: true } }),
    prisma.room.count({ where: { status: 'ACTIVE' } }),
    prisma.bed.count(),
    prisma.user.count({
      where: {
        status: 'INACTIVE',
        isVerified: false,
      },
    }),
    prisma.user.count({
      where: { role: 'STUDENT', status: 'ACTIVE' },
    }),
    prisma.user.count({
      where: {
        role: { in: [...STAFF_AND_WARDEN_ROLES] },
        status: 'ACTIVE',
      },
    }),
    prisma.user.count({
      where: {
        role: 'STUDENT',
        createdAt: { gte: monthStart },
      },
    }),
    prisma.user.count({
      where: {
        role: 'STUDENT',
        createdAt: { gte: previousMonthStart, lt: monthStart },
      },
    }),
    prisma.attendanceRecord.groupBy({
      by: ['status'],
      where: { attendanceDate: today },
      _count: { _all: true },
    }),
    prisma.complaintTicket.count({
      where: { status: { notIn: [...TERMINAL_COMPLAINT_STATUSES] } },
    }),
    prisma.leaveApplication.count({
      where: { status: { in: [...PENDING_LEAVE_STATUSES] } },
    }),
    prisma.complaintTicket.findMany({
      where: {
        status: { in: ['RESOLVED', 'CLOSED'] },
        updatedAt: { gte: responseWindowStart },
      },
      select: { createdAt: true, updatedAt: true },
      take: 200,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 8,
      select: {
        id: true,
        actionName: true,
        entityType: true,
        timestamp: true,
      },
    }),
  ]);

  const bedRows: BedCountRow[] = bedGroups.map((g) => ({
    status: g.status,
    count: g._count._all,
  }));

  const attendanceMap = new Map(
    attendanceGroups.map((row) => [row.status, row._count._all]),
  );
  const present = attendanceMap.get('PRESENT') ?? 0;
  const absent = attendanceMap.get('ABSENT') ?? 0;
  const onLeave = attendanceMap.get('ON_LEAVE') ?? 0;

  const approvals = {
    studentRegistrations: pendingActivations,
    leaveRequests: pendingLeave,
    complaints: openComplaints,
    totalPending: pendingActivations + pendingLeave + openComplaints,
  };

  const recentActivities = auditRows.map((row) => {
    const copy = formatAuditActivity(row.actionName, row.entityType);
    return {
      id: row.id,
      title: copy.title,
      detail: copy.detail,
      occurredAt: row.timestamp.toISOString(),
      entityType: row.entityType,
      actionName: row.actionName,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    occupancy: occupancyPercent(bedRows),
    pendingActivations,
    students: {
      active: activeStudents,
      createdThisMonth: studentsCreatedThisMonth,
      createdPreviousMonth: studentsCreatedPreviousMonth,
      monthOverMonthPercent: monthOverMonthPercent(
        studentsCreatedThisMonth,
        studentsCreatedPreviousMonth,
      ),
    },
    staff: { active: activeStaff },
    infrastructure: { hostels, rooms, beds },
    attendanceToday: {
      percent: attendanceRatePercent(present, absent, onLeave),
      present,
      absent,
      onLeave,
    },
    announcements: {
      liveCount: 0,
      recent: [],
    },
    operations: {
      openComplaints,
      pendingLeave,
      avgResponseHours: averageComplaintResponseHours(recentResolvedComplaints),
    },
    approvals,
    fees: {
      available: false,
      collectedInr: null,
      expectedInr: null,
      pendingInr: null,
      collectionRatePercent: null,
      monthlyTrend: [],
    },
    recentActivities,
  };
}
