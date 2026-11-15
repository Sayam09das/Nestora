import type { BedStatus, Prisma, PrismaClient } from '@nestora/database';
import type { RoleCode } from '../../middleware/authorize.js';

const TERMINAL_COMPLAINT_STATUSES = ['RESOLVED', 'CLOSED', 'REJECTED'] as const;
const WARDEN_COMPLAINT_QUEUE_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'REOPENED'] as const;
const MAINTENANCE_PIPELINE_STATUSES = ['ASSIGNED', 'IN_PROGRESS'] as const;
const PENDING_LEAVE_STATUSES = ['SUBMITTED', 'PENDING', 'PENDING_APPROVAL'] as const;
const PENDING_OUTING_STATUSES = ['SUBMITTED', 'PENDING', 'PENDING_APPROVAL'] as const;
const ADMISSION_FULLY_APPROVED = 'FULLY_APPROVED';
const PANEL_LIST_LIMIT = 8;
const OPEN_INCIDENT_STATUSES = ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS'] as const;

type OperationalRole = Extract<RoleCode, 'HOSTEL_WARDEN' | 'HOSTEL_STAFF'>;

export type OperationalDashboardHostel = { id: string; name: string };

export type OperationalDashboardAdmissionRow = {
  id: string;
  name: string;
  registrationNo: string;
  course: string;
  submittedAt: string;
};

export type OperationalDashboardIssueRow = {
  id: string;
  issue: string;
  room: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Assigned' | 'In progress';
};

export type OperationalDashboardVisitorRow = {
  id: string;
  name: string;
  visiting: string;
  room: string;
  time: string;
};

export type OperationalDashboardIncidentRow = {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium';
  status: 'Open' | 'Acknowledged' | 'In progress';
  reportedAt: string;
};

export type OperationalDashboardOverview = {
  generatedAt: string;
  role: OperationalRole;
  hostels: OperationalDashboardHostel[];
  focusHostelId: string | null;
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
    pendingOutings: number;
    complaints: number;
    maintenancePipeline: number;
    totalPending: number;
  };
  panels: {
    admissionsQueue: OperationalDashboardAdmissionRow[];
    openIssues: OperationalDashboardIssueRow[];
    visitorsToday: {
      total: number;
      checkedOut: number;
      inside: number;
      recent: OperationalDashboardVisitorRow[];
    };
    activeIncidents: {
      count: number;
      items: OperationalDashboardIncidentRow[];
    };
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

function mapComplaintPriority(value: string): OperationalDashboardIssueRow['priority'] {
  const normalized = value.toUpperCase();
  if (normalized === 'HIGH' || normalized === 'URGENT' || normalized === 'CRITICAL') return 'High';
  if (normalized === 'LOW') return 'Low';
  return 'Medium';
}

function mapComplaintStatus(value: string): OperationalDashboardIssueRow['status'] {
  const normalized = value.toUpperCase();
  if (normalized === 'ASSIGNED') return 'Assigned';
  if (normalized === 'IN_PROGRESS' || normalized === 'IN PROGRESS') return 'In progress';
  return 'Open';
}

function mapIncidentSeverity(value: string): OperationalDashboardIncidentRow['severity'] {
  const normalized = value.toUpperCase();
  if (normalized === 'CRITICAL') return 'Critical';
  if (normalized === 'HIGH') return 'High';
  return 'Medium';
}

function mapIncidentStatus(value: string): OperationalDashboardIncidentRow['status'] {
  const normalized = value.toUpperCase();
  if (normalized === 'ACKNOWLEDGED') return 'Acknowledged';
  if (normalized === 'IN_PROGRESS') return 'In progress';
  return 'Open';
}

function formatVisitorTime(value: Date): string {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(value);
}

function emptyPanels(): OperationalDashboardOverview['panels'] {
  return {
    admissionsQueue: [],
    openIssues: [],
    visitorsToday: { total: 0, checkedOut: 0, inside: 0, recent: [] },
    activeIncidents: { count: 0, items: [] },
  };
}

export async function resolveHostelScope(
  prisma: PrismaClient,
  userId: string,
  role: OperationalRole,
): Promise<{ hostelIds: string[]; hostelNames: string[]; hostels: OperationalDashboardHostel[] }> {
  const assignmentRows = await prisma.hostelAssignment.findMany({
    where: { userId },
    select: { hostel: { select: { id: true, name: true } } },
  });

  const idSet = new Set<string>();
  const hostelMeta = new Map<string, string>();

  for (const row of assignmentRows) {
    idSet.add(row.hostel.id);
    hostelMeta.set(row.hostel.id, row.hostel.name);
  }

  if (role === 'HOSTEL_WARDEN') {
    const wardenHostels = await prisma.hostel.findMany({
      where: { wardenInCharge: userId, isActive: true },
      select: { id: true, name: true },
    });
    for (const hostel of wardenHostels) {
      idSet.add(hostel.id);
      hostelMeta.set(hostel.id, hostel.name);
    }
  }

  const sortedHostels: OperationalDashboardHostel[] = [...idSet]
    .map((id) => ({ id, name: hostelMeta.get(id) ?? 'Hostel' }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    hostelIds: sortedHostels.map((h) => h.id),
    hostelNames: sortedHostels.map((h) => h.name),
    hostels: sortedHostels,
  };
}

function resolveMetricHostelIds(allHostelIds: string[], filterHostelId?: string): string[] {
  if (filterHostelId && allHostelIds.includes(filterHostelId)) {
    return [filterHostelId];
  }
  return allHostelIds;
}

export async function getOperationalDashboardOverview(
  prisma: PrismaClient,
  userId: string,
  role: OperationalRole,
  filterHostelId?: string,
): Promise<OperationalDashboardOverview> {
  const scope = await resolveHostelScope(prisma, userId, role);
  const { hostels } = scope;
  const metricHostelIds = resolveMetricHostelIds(scope.hostelIds, filterHostelId);
  const focusHostelId = metricHostelIds.length === 1 ? metricHostelIds[0]! : null;
  const scopedNames =
    focusHostelId !== null
      ? [hostels.find((h) => h.id === focusHostelId)?.name].filter((n): n is string => Boolean(n))
      : scope.hostelNames;

  const unassigned = scope.hostelIds.length === 0;
  const today = startOfUtcDay(new Date());
  const todayEnd = new Date(today);
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);
  const hostelWhere = metricHostelIds.length === 1 ? metricHostelIds[0] : { in: metricHostelIds };

  if (unassigned) {
    return {
      generatedAt: new Date().toISOString(),
      role,
      hostels: [],
      focusHostelId: null,
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
        pendingOutings: 0,
        complaints: 0,
        maintenancePipeline: 0,
        totalPending: 0,
      },
      panels: emptyPanels(),
    };
  }

  const loadWardenPanels = role === 'HOSTEL_WARDEN';

  const [
    bedGroups,
    activeAllocations,
    attendanceGroups,
    openComplaints,
    complaintsAwaitingReview,
    maintenancePipeline,
    pendingLeave,
    pendingOutings,
    pendingAdmissions,
    myAssignedTickets,
    dutiesToday,
    admissionRows,
    complaintRows,
    visitorTotal,
    visitorCheckedOut,
    visitorInside,
    recentVisitors,
    openIncidentCount,
    incidentRows,
  ] = await Promise.all([
    prisma.bed.groupBy({
      by: ['status'],
      where: bedHostelWhere(metricHostelIds),
      _count: { _all: true },
    }),
    prisma.allocationRecord.count({
      where: {
        status: 'ACTIVE',
        bed: bedHostelWhere(metricHostelIds),
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
    loadWardenPanels
      ? prisma.complaintTicket.count({
          where: {
            hostelId: hostelWhere,
            status: { in: [...WARDEN_COMPLAINT_QUEUE_STATUSES] },
          },
        })
      : Promise.resolve(0),
    loadWardenPanels
      ? prisma.complaintTicket.count({
          where: {
            hostelId: hostelWhere,
            status: { in: [...MAINTENANCE_PIPELINE_STATUSES] },
          },
        })
      : Promise.resolve(0),
    prisma.leaveApplication.count({
      where: {
        hostelId: hostelWhere,
        status: { in: [...PENDING_LEAVE_STATUSES] },
      },
    }),
    prisma.outingRequest.count({
      where: {
        hostelId: hostelWhere,
        status: { in: [...PENDING_OUTING_STATUSES] },
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
    loadWardenPanels
      ? prisma.admissionApplication.findMany({
          where: {
            hostelId: hostelWhere,
            status: ADMISSION_FULLY_APPROVED,
            student: { allocationRecords: { none: { status: 'ACTIVE' } } },
          },
          orderBy: { submittedAt: 'desc' },
          take: PANEL_LIST_LIMIT,
          select: {
            id: true,
            submittedAt: true,
            student: {
              select: {
                registrationNumber: true,
                course: true,
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        })
      : Promise.resolve([]),
    loadWardenPanels
      ? prisma.complaintTicket.findMany({
          where: {
            hostelId: hostelWhere,
            status: { notIn: [...TERMINAL_COMPLAINT_STATUSES] },
          },
          orderBy: { createdAt: 'desc' },
          take: PANEL_LIST_LIMIT,
          select: {
            id: true,
            title: true,
            location: true,
            suggestedPriority: true,
            finalPriority: true,
            status: true,
          },
        })
      : Promise.resolve([]),
    loadWardenPanels
      ? prisma.visitorRecord.count({
          where: {
            hostelId: hostelWhere,
            createdAt: { gte: today, lt: todayEnd },
          },
        })
      : Promise.resolve(0),
    loadWardenPanels
      ? prisma.visitorRecord.count({
          where: {
            hostelId: hostelWhere,
            checkOutTime: { gte: today, lt: todayEnd },
          },
        })
      : Promise.resolve(0),
    loadWardenPanels
      ? prisma.visitorRecord.count({
          where: {
            hostelId: hostelWhere,
            checkInTime: { not: null },
            checkOutTime: null,
          },
        })
      : Promise.resolve(0),
    loadWardenPanels
      ? prisma.visitorRecord.findMany({
          where: {
            hostelId: hostelWhere,
            createdAt: { gte: today, lt: todayEnd },
          },
          orderBy: [{ checkInTime: 'desc' }, { createdAt: 'desc' }],
          take: PANEL_LIST_LIMIT,
          select: {
            id: true,
            visitorName: true,
            purpose: true,
            checkInTime: true,
            createdAt: true,
            student: {
              select: {
                user: { select: { firstName: true, lastName: true } },
                allocationRecords: {
                  where: { status: 'ACTIVE' },
                  take: 1,
                  select: {
                    bed: {
                      select: {
                        bedNumber: true,
                        room: { select: { roomNumber: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        })
      : Promise.resolve([]),
    loadWardenPanels
      ? prisma.emergencyIncident.count({
          where: {
            hostelId: hostelWhere,
            status: { in: [...OPEN_INCIDENT_STATUSES] },
          },
        })
      : Promise.resolve(0),
    loadWardenPanels
      ? prisma.emergencyIncident.findMany({
          where: {
            hostelId: hostelWhere,
            status: { in: [...OPEN_INCIDENT_STATUSES] },
          },
          orderBy: { createdAt: 'desc' },
          take: PANEL_LIST_LIMIT,
          select: {
            id: true,
            title: true,
            initialSeverity: true,
            officialSeverity: true,
            status: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const bedRows = bedGroups.map((g) => ({ status: g.status, count: g._count._all }));
  const attendanceMap = new Map(attendanceGroups.map((row) => [row.status, row._count._all]));
  const present = attendanceMap.get('PRESENT') ?? 0;
  const absent = attendanceMap.get('ABSENT') ?? 0;
  const onLeave = attendanceMap.get('ON_LEAVE') ?? 0;

  const approvals = {
    pendingAdmissions,
    leaveRequests: pendingLeave,
    pendingOutings,
    complaints: loadWardenPanels ? complaintsAwaitingReview : openComplaints,
    maintenancePipeline: loadWardenPanels ? maintenancePipeline : 0,
    totalPending: loadWardenPanels
      ? pendingAdmissions + pendingLeave + pendingOutings + complaintsAwaitingReview + maintenancePipeline
      : pendingAdmissions + pendingLeave + pendingOutings + openComplaints,
  };

  const admissionsQueue: OperationalDashboardAdmissionRow[] = admissionRows.map((row) => {
    const first = row.student.user.firstName?.trim() ?? '';
    const last = row.student.user.lastName?.trim() ?? '';
    const name = `${first} ${last}`.trim() || row.student.registrationNumber;
    return {
      id: row.id,
      name,
      registrationNo: row.student.registrationNumber,
      course: row.student.course,
      submittedAt: row.submittedAt.toISOString(),
    };
  });

  const openIssues: OperationalDashboardIssueRow[] = complaintRows.map((row) => ({
    id: row.id,
    issue: row.title,
    room: row.location,
    priority: mapComplaintPriority(row.finalPriority ?? row.suggestedPriority),
    status: mapComplaintStatus(row.status),
  }));

  const activeIncidentItems: OperationalDashboardIncidentRow[] = incidentRows.map((row) => ({
    id: row.id,
    title: row.title,
    severity: mapIncidentSeverity(row.officialSeverity ?? row.initialSeverity),
    status: mapIncidentStatus(row.status),
    reportedAt: formatVisitorTime(row.createdAt),
  }));

  const recent: OperationalDashboardVisitorRow[] = recentVisitors.map((row) => {
    const studentName = `${row.student.user.firstName ?? ''} ${row.student.user.lastName ?? ''}`.trim();
    const allocation = row.student.allocationRecords[0];
    const roomLabel = allocation
      ? `${allocation.bed.room.roomNumber}-${allocation.bed.bedNumber}`
      : '—';
    const stamp = row.checkInTime ?? row.createdAt;
    return {
      id: row.id,
      name: row.visitorName,
      visiting: studentName || 'Student',
      room: roomLabel,
      time: formatVisitorTime(stamp),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    role,
    hostels,
    focusHostelId,
    scope: { hostelNames: scopedNames, unassigned: false },
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
    panels: loadWardenPanels
      ? {
          admissionsQueue,
          openIssues,
          visitorsToday: {
            total: visitorTotal,
            checkedOut: visitorCheckedOut,
            inside: visitorInside,
            recent,
          },
          activeIncidents: {
            count: openIncidentCount,
            items: activeIncidentItems,
          },
        }
      : emptyPanels(),
  };
}
