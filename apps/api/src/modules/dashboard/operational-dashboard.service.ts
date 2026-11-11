import type { BedStatus, Prisma, PrismaClient } from '@nestora/database';
import type { RoleCode } from '../../middleware/authorize.js';

const TERMINAL_COMPLAINT_STATUSES = ['RESOLVED', 'CLOSED', 'REJECTED'] as const;
const PENDING_LEAVE_STATUSES = ['SUBMITTED', 'PENDING', 'PENDING_APPROVAL'] as const;
const ADMISSION_FULLY_APPROVED = 'FULLY_APPROVED';

type OperationalRole = Extract<RoleCode, 'HOSTEL_WARDEN' | 'HOSTEL_STAFF'>;

export type OperationalDashboardOverview = {
  generatedAt: string;
  role: OperationalRole;
  scope: {
    hostelNames: string[];
    unassigned: boolean;
  };
  occupancy: {
    percent: number | null;
    occupiedBeds: number;
    availableBeds: number;
    totalOperationalBeds: number;
  };
  residents: { activeAllocations: number };
  attendanceToday: {
    percent: number | null;
    present: number;
    absent: number;
    onLeave: number;
  };
  operations: {
    openComplaints: number;
    pendingLeave: number;
    myAssignedTickets: number;
    dutiesToday: number;
  };
  approvals: {
    pendingAdmissions: number;
    leaveRequests: number;
    complaints: number;
    totalPending: number;
  };
};

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function attendanceRatePercent(present: number, absent: number, onLeave: number): number | null {
  const total = present + absent + onLeave;
  if (total === 0) return null;
  return Math.round((present / total) * 1000) / 10;
}

function occupancyFromBedRows(rows: { status: BedStatus; count: number }[]): OperationalDashboardOverview['occupancy'] {
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
    availableBeds: available,
    totalOperationalBeds: totalOperational,
  };
}

function bedHostelWhere(hostelIds: string[]): Prisma.BedWhereInput {
  if (hostelIds.length === 0) {
    return { id: { equals: '00000000-0000-0000-0000-000000000000' } };
  }
  return {
    room: {
      floor: {
        block: {
          building: {
            hostelId: hostelIds.length === 1 ? hostelIds[0] : { in: hostelIds },
          },
        },
      },
    },
  };
}

export async function resolveHostelScope(
  prisma: PrismaClient,
  userId: string,
  role: OperationalRole,
): Promise<{ hostelIds: string[]; hostelNames: string[] }> {
  const assignmentRows = await prisma.hostelAssignment.findMany({
    where: { userId },
    select: { hostel: { select: { id: true, name: true } } },
  });

  const idSet = new Set<string>();
  const nameSet = new Set<string>();

  for (const row of assignmentRows) {
    idSet.add(row.hostel.id);
    nameSet.add(row.hostel.name);
  }

  if (role === 'HOSTEL_WARDEN') {
    const wardenHostels = await prisma.hostel.findMany({
      where: { wardenInCharge: userId, isActive: true },
      select: { id: true, name: true },
    });
    for (const hostel of wardenHostels) {
      idSet.add(hostel.id);
      nameSet.add(hostel.name);
    }
  }

  return {
    hostelIds: [...idSet],
    hostelNames: [...nameSet].sort((a, b) => a.localeCompare(b)),
  };
}

export async function getOperationalDashboardOverview(
  prisma: PrismaClient,
  userId: string,
  role: OperationalRole,
): Promise<OperationalDashboardOverview> {
  const { hostelIds, hostelNames } = await resolveHostelScope(prisma, userId, role);
  const unassigned = hostelIds.length === 0;
  const today = startOfUtcDay(new Date());
  const hostelWhere = hostelIds.length === 1 ? hostelIds[0] : { in: hostelIds };

  if (unassigned) {
    return {
      generatedAt: new Date().toISOString(),
      role,
      scope: { hostelNames: [], unassigned: true },
      occupancy: {
        percent: null,
        occupiedBeds: 0,
        availableBeds: 0,
        totalOperationalBeds: 0,
      },
      residents: { activeAllocations: 0 },
      attendanceToday: { percent: null, present: 0, absent: 0, onLeave: 0 },
      operations: {
        openComplaints: 0,
        pendingLeave: 0,
        myAssignedTickets: 0,
        dutiesToday: 0,
      },
      approvals: {
        pendingAdmissions: 0,
        leaveRequests: 0,
        complaints: 0,
        totalPending: 0,
      },
    };
  }

  const [
    bedGroups,
    activeAllocations,
    attendanceGroups,
    openComplaints,
    pendingLeave,
    pendingAdmissions,
    myAssignedTickets,
    dutiesToday,
  ] = await Promise.all([
    prisma.bed.groupBy({
      by: ['status'],
      where: bedHostelWhere(hostelIds),
      _count: { _all: true },
    }),
    prisma.allocationRecord.count({
      where: {
        status: 'ACTIVE',
        bed: bedHostelWhere(hostelIds),
      },
    }),
    prisma.attendanceRecord.groupBy({
      by: ['status'],
      where: { hostelId: hostelWhere, attendanceDate: today },
      _count: { _all: true },
    }),
    prisma.complaintTicket.count({
      where: {
        hostelId: hostelWhere,
        status: { notIn: [...TERMINAL_COMPLAINT_STATUSES] },
      },
    }),
    prisma.leaveApplication.count({
      where: {
        hostelId: hostelWhere,
        status: { in: [...PENDING_LEAVE_STATUSES] },
      },
    }),
    prisma.admissionApplication.count({
      where: {
        hostelId: hostelWhere,
        status: ADMISSION_FULLY_APPROVED,
        student: {
          allocationRecords: { none: { status: 'ACTIVE' } },
        },
      },
    }),
    prisma.ticketAssignment.count({
      where: {
        staffId: userId,
        isActive: true,
        ticket: { status: { notIn: [...TERMINAL_COMPLAINT_STATUSES] } },
      },
    }),
    prisma.dutyAssignment.count({
      where: { staffId: userId, dutyDate: today },
    }),
  ]);

  const bedRows = bedGroups.map((g) => ({ status: g.status, count: g._count._all }));
  const attendanceMap = new Map(attendanceGroups.map((row) => [row.status, row._count._all]));
  const present = attendanceMap.get('PRESENT') ?? 0;
  const absent = attendanceMap.get('ABSENT') ?? 0;
  const onLeave = attendanceMap.get('ON_LEAVE') ?? 0;

  const approvals = {
    pendingAdmissions,
    leaveRequests: pendingLeave,
    complaints: openComplaints,
    totalPending: pendingAdmissions + pendingLeave + openComplaints,
  };

  return {
    generatedAt: new Date().toISOString(),
    role,
    scope: { hostelNames, unassigned: false },
    occupancy: occupancyFromBedRows(bedRows),
    residents: { activeAllocations },
    attendanceToday: {
      percent: attendanceRatePercent(present, absent, onLeave),
      present,
      absent,
      onLeave,
    },
    operations: {
      openComplaints,
      pendingLeave,
      myAssignedTickets,
      dutiesToday,
    },
    approvals,
  };
}
