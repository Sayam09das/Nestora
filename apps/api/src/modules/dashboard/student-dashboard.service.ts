import type { PrismaClient } from '@nestora/database';

const PENDING_LEAVE_STATUSES = ['SUBMITTED', 'PENDING', 'PENDING_APPROVAL'] as const;
const APPROVED_LEAVE_STATUSES = ['APPROVED'] as const;
const TERMINAL_COMPLAINT_STATUSES = ['RESOLVED', 'CLOSED', 'REJECTED'] as const;
const IN_PROGRESS_COMPLAINT_STATUSES = ['IN_PROGRESS', 'ASSIGNED', 'WORKING', 'IN_REVIEW'] as const;

export type StudentDashboardOverview = {
  generatedAt: string;
  profile: {
    linked: boolean;
    studentId: string | null;
    registrationNumber: string | null;
    department: string | null;
    course: string | null;
    academicYear: string | null;
    currentSemester: string | null;
    admissionYear: string | null;
  };
  residence: {
    hasActiveAllocation: boolean;
    hostelName: string | null;
    roomNumber: string | null;
    bedNumber: string | null;
    blockName: string | null;
    floorLabel: string | null;
    capacity: number | null;
    roomStatus: 'occupied' | 'vacant';
    allocationRecordId: string | null;
    allocationRef: string | null;
    allocationStartDate: string | null;
    academicYear: string | null;
    roomTypeLabel: string | null;
    occupiedBeds: number | null;
    availableBeds: number | null;
    facilitiesSummary: string | null;
    hasAc: boolean | null;
  };
  roomRequests: Array<{
    id: string;
    type: 'room_change' | 'bed_change' | 'maintenance' | 'roommate_issue';
    typeLabel: string;
    submittedAt: string;
    description: string;
    status: 'pending' | 'approved' | 'rejected' | 'in_progress';
    statusLabel: string;
  }>;
  allocationHistory: Array<{
    id: string;
    academicYear: string;
    hostel: string;
    room: string;
    bed: string;
    status: 'Current' | 'Previous';
  }>;
  attendanceMonth: {
    label: string;
    percent: number | null;
    present: number;
    absent: number;
    onLeave: number;
    standing: string;
  };
  leave: {
    total: number;
    pending: number;
    approved: number;
    recent: Array<{
      id: string;
      title: string;
      status: 'pending' | 'approved' | 'rejected';
      dateRange: string;
      statusNote: string;
    }>;
  };
  fees: {
    available: boolean;
    outstanding: number;
    totalAssessed: number;
    totalPaid: number;
    dueDate: string | null;
  };
  complaints: Array<{
    id: string;
    title: string;
    location: string;
    status: 'in_progress' | 'resolved' | 'open';
    statusLabel: string;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    relativeTime: string;
    body: string;
    author: string;
  }>;
  events: Array<{
    id: string;
    day: string;
    month: string;
    title: string;
    schedule: string;
  }>;
  roommates: Array<{
    id: string;
    name: string;
    program: string;
    initials: string;
    bedNumber: string | null;
    registrationNumber: string;
    department: string;
    course: string;
    academicYear: string;
    admissionYear: string;
    hostelName: string | null;
    roomNumber: string | null;
    blockName: string | null;
    floorLabel: string | null;
  }>;
  navBadges: {
    leave: number;
    complaints: number;
    maintenance: number;
    fees: number;
    announcements: number;
    visitors: number;
  };
  gateMovement: {
    overdueOutCount: number;
    alert: string | null;
  };
};

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function endOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function formatLeaveRange(start: Date, end: Date): string {
  const a = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(start);
  const b = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(end);
  return `${a} – ${b}`;
}

function relativeTimeLabel(publishedAt: Date, now: Date): string {
  const diffDays = Math.floor((now.getTime() - publishedAt.getTime()) / 86_400_000);
  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'ST';
}

function mapLeaveUiStatus(status: string): 'pending' | 'approved' | 'rejected' {
  const upper = status.toUpperCase();
  if (APPROVED_LEAVE_STATUSES.includes(upper as (typeof APPROVED_LEAVE_STATUSES)[number])) {
    return 'approved';
  }
  if (['REJECTED', 'DENIED', 'CANCELLED'].includes(upper)) {
    return 'rejected';
  }
  return 'pending';
}

function leaveStatusNote(status: string): string {
  const ui = mapLeaveUiStatus(status);
  if (ui === 'approved') return 'Approved by Warden';
  if (ui === 'rejected') return 'Request declined';
  return 'Awaiting Warden approval';
}

function mapComplaintUi(status: string): {
  status: 'in_progress' | 'resolved' | 'open';
  statusLabel: string;
} {
  const upper = status.toUpperCase();
  if (TERMINAL_COMPLAINT_STATUSES.includes(upper as (typeof TERMINAL_COMPLAINT_STATUSES)[number])) {
    return { status: 'resolved', statusLabel: 'Resolved' };
  }
  if (IN_PROGRESS_COMPLAINT_STATUSES.includes(upper as (typeof IN_PROGRESS_COMPLAINT_STATUSES)[number])) {
    return { status: 'in_progress', statusLabel: 'In Progress' };
  }
  return { status: 'open', statusLabel: 'Open' };
}

function floorLabel(floorNumber: number, name: string | null): string {
  if (name?.trim()) return name.trim();
  const ordinals = ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth'];
  if (floorNumber >= 0 && floorNumber < ordinals.length) {
    return `${ordinals[floorNumber]} Floor`;
  }
  return `Floor ${floorNumber}`;
}

function formatUiDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function roomFacilitiesSummary(hasAc: boolean): string {
  const base = ['Wi-Fi', 'Study Table', 'Wardrobe', 'Bed and Mattress'];
  if (hasAc) base.push('Air Conditioning');
  else base.push('Ceiling Fan');
  return base.join(', ');
}

function mapRoomChangeUiStatus(status: string): {
  status: 'pending' | 'approved' | 'rejected' | 'in_progress';
  statusLabel: string;
} {
  const upper = status.toUpperCase();
  if (upper === 'APPROVED') return { status: 'approved', statusLabel: 'Approved' };
  if (upper === 'REJECTED' || upper === 'DENIED') {
    return { status: 'rejected', statusLabel: 'Rejected' };
  }
  if (upper === 'PENDING' || upper === 'SUBMITTED' || upper === 'PENDING_APPROVAL') {
    return { status: 'pending', statusLabel: 'Pending' };
  }
  return { status: 'in_progress', statusLabel: 'In Progress' };
}

function academicYearFromDate(date: Date): string {
  const year = date.getUTCFullYear();
  return `${year}–${String(year + 1).slice(-2)}`;
}

function attendanceStanding(percent: number | null): string {
  if (percent == null) return 'No records yet';
  if (percent >= 90) return 'Good standing';
  if (percent >= 75) return 'Needs attention';
  return 'Below threshold';
}

const emptyOverview = (now: Date): StudentDashboardOverview => ({
  generatedAt: now.toISOString(),
  profile: {
    linked: false,
    studentId: null,
    registrationNumber: null,
    department: null,
    course: null,
    academicYear: null,
    currentSemester: null,
    admissionYear: null,
  },
  residence: {
    hasActiveAllocation: false,
    hostelName: null,
    roomNumber: null,
    bedNumber: null,
    blockName: null,
    floorLabel: null,
    capacity: null,
    roomStatus: 'vacant',
    allocationRecordId: null,
    allocationRef: null,
    allocationStartDate: null,
    academicYear: null,
    roomTypeLabel: null,
    occupiedBeds: null,
    availableBeds: null,
    facilitiesSummary: null,
    hasAc: null,
  },
  roomRequests: [],
  allocationHistory: [],
  attendanceMonth: {
    label: new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(now),
    percent: null,
    present: 0,
    absent: 0,
    onLeave: 0,
    standing: 'No records yet',
  },
  leave: { total: 0, pending: 0, approved: 0, recent: [] },
  fees: { available: true, outstanding: 0, totalAssessed: 0, totalPaid: 0, dueDate: null },
  complaints: [],
  announcements: [],
  events: [],
  roommates: [],
  navBadges: { leave: 0, complaints: 0, maintenance: 0, fees: 0, announcements: 0, visitors: 0 },
  gateMovement: { overdueOutCount: 0, alert: null },
});

export async function getStudentDashboardOverview(
  prisma: PrismaClient,
  userId: string,
): Promise<StudentDashboardOverview> {
  const now = new Date();
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      registrationNumber: true,
      course: true,
      department: true,
      academicYear: true,
      currentSemester: true,
      createdAt: true,
    },
  });

  if (!student) {
    return emptyOverview(now);
  }

  const monthStart = startOfUtcMonth(now);
  const monthEnd = endOfUtcMonth(now);
  const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(now);

  const [allocation, attendanceRows, leaveRows, complaintRows, ledger, visitorPending, roomChangeRows, allocationHistoryRows] =
    await Promise.all([
      prisma.allocationRecord.findFirst({
        where: { studentId: student.id, status: 'ACTIVE' },
        orderBy: { allocatedAt: 'desc' },
        include: {
          bed: {
            include: {
              room: {
                include: {
                  config: true,
                  floor: { include: { block: { include: { building: { include: { hostel: true } } } } } },
                },
              },
            },
          },
        },
      }),
      prisma.attendanceRecord.findMany({
        where: {
          studentId: student.id,
          attendanceDate: { gte: monthStart, lte: monthEnd },
        },
        select: { status: true },
      }),
      prisma.leaveApplication.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          leaveType: true,
          departureDate: true,
          expectedReturnDate: true,
          status: true,
        },
      }),
      prisma.complaintTicket.findMany({
        where: { studentId: student.id },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          location: true,
          status: true,
          category: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.studentLedger.findUnique({
        where: { studentId: student.id },
        select: { totalAssessed: true, totalPaid: true, currentBalance: true },
      }),
      prisma.visitorRecord.count({
        where: { studentId: student.id, status: { in: ['PENDING_APPROVAL', 'SUBMITTED', 'PENDING'] } },
      }),
      prisma.roomChangeRequest.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, reason: true, status: true, createdAt: true },
      }),
      prisma.allocationRecord.findMany({
        where: { studentId: student.id },
        orderBy: { startDate: 'desc' },
        take: 8,
        include: {
          bed: {
            include: {
              room: {
                include: {
                  floor: {
                    include: {
                      block: { include: { building: { include: { hostel: true } } } },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

  let hostelId: string | null = null;
  let roomId: string | null = null;
  let residence = emptyOverview(now).residence;

  let occupiedBedsInRoom: number | null = null;
  if (allocation?.bed.room) {
    const { room, bedNumber } = allocation.bed;
    const hostel = room.floor.block.building.hostel;
    hostelId = hostel.id;
    roomId = room.id;
    occupiedBedsInRoom = await prisma.allocationRecord.count({
      where: { status: 'ACTIVE', bed: { roomId } },
    });
    const capacity = room.config.capacity;
    residence = {
      hasActiveAllocation: true,
      hostelName: hostel.name,
      roomNumber: room.roomNumber,
      bedNumber: bedNumber.padStart(2, '0'),
      blockName: room.floor.block.name,
      floorLabel: floorLabel(room.floor.floorNumber, room.floor.name),
      capacity,
      roomStatus: 'occupied',
      allocationRecordId: allocation.id,
      allocationRef: `ALLOC-${student.registrationNumber}`,
      allocationStartDate: allocation.startDate.toISOString().slice(0, 10),
      academicYear: student.academicYear,
      roomTypeLabel: room.config.description || `${capacity}-sharing`,
      occupiedBeds: occupiedBedsInRoom,
      availableBeds: Math.max(0, capacity - occupiedBedsInRoom),
      facilitiesSummary: roomFacilitiesSummary(room.config.hasAc),
      hasAc: room.config.hasAc,
    };
  }

  let roommates: StudentDashboardOverview['roommates'] = [];
  if (roomId) {
    const peers = await prisma.allocationRecord.findMany({
      where: {
        status: 'ACTIVE',
        studentId: { not: student.id },
        bed: { roomId },
      },
      take: 6,
      include: {
        bed: { select: { bedNumber: true } },
        student: {
          select: {
            id: true,
            registrationNumber: true,
            course: true,
            department: true,
            academicYear: true,
            currentSemester: true,
            createdAt: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
    const sharedHostel = residence.hostelName;
    const sharedRoom = residence.roomNumber;
    const sharedBlock = residence.blockName;
    const sharedFloor = residence.floorLabel;
    roommates = peers.map((row) => {
      const name =
        `${row.student.user.firstName} ${row.student.user.lastName}`.trim() || 'Resident';
      const { student: peer } = row;
      return {
        id: row.studentId,
        name,
        program: `${peer.course} · ${peer.currentSemester}`,
        initials: initialsFromName(name),
        bedNumber: row.bed.bedNumber.padStart(2, '0'),
        registrationNumber: peer.registrationNumber,
        department: peer.department,
        course: peer.course,
        academicYear: peer.academicYear,
        admissionYear: String(peer.createdAt.getUTCFullYear()),
        hostelName: sharedHostel,
        roomNumber: sharedRoom,
        blockName: sharedBlock,
        floorLabel: sharedFloor,
      };
    });
  }

  const roomRequests: StudentDashboardOverview['roomRequests'] = [
    ...roomChangeRows.map((row) => {
      const mapped = mapRoomChangeUiStatus(row.status);
      return {
        id: row.id,
        type: 'room_change' as const,
        typeLabel: 'Room Change',
        submittedAt: formatUiDate(row.createdAt),
        description: row.reason,
        status: mapped.status,
        statusLabel: mapped.statusLabel,
      };
    }),
    ...complaintRows
      .filter((row) => row.category?.toLowerCase().includes('maintenance'))
      .map((row) => {
        const mapped = mapComplaintUi(row.status);
        const uiStatus =
          mapped.status === 'resolved'
            ? ({ status: 'approved' as const, statusLabel: 'Resolved' })
            : mapped.status === 'in_progress'
              ? ({ status: 'in_progress' as const, statusLabel: mapped.statusLabel })
              : ({ status: 'pending' as const, statusLabel: mapped.statusLabel });
        return {
          id: row.id,
          type: 'maintenance' as const,
          typeLabel: 'Maintenance',
          submittedAt: formatUiDate(row.updatedAt ?? row.createdAt ?? now),
          description: row.title,
          ...uiStatus,
        };
      }),
  ].slice(0, 12);

  const allocationHistory: StudentDashboardOverview['allocationHistory'] = allocationHistoryRows.map(
    (row, index) => {
      const hostel = row.bed.room.floor.block.building.hostel.name;
      return {
        id: row.id,
        academicYear: academicYearFromDate(row.startDate),
        hostel,
        room: row.bed.room.roomNumber,
        bed: row.bed.bedNumber,
        status: row.status === 'ACTIVE' ? 'Current' : 'Previous',
      };
    },
  );

  const noticeWhere = {
    OR: hostelId ? [{ hostelId: null }, { hostelId }] : [{ hostelId: null }],
    AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
  };

  const noticesScoped = await prisma.notice.findMany({
    where: noticeWhere,
    orderBy: { publishedAt: 'desc' },
    take: 5,
    select: { id: true, title: true, description: true, publishedAt: true, category: true },
  });

  const present = attendanceRows.filter((r) => r.status === 'PRESENT').length;
  const absent = attendanceRows.filter((r) => r.status === 'ABSENT').length;
  const onLeave = attendanceRows.filter((r) => r.status === 'ON_LEAVE').length;
  const attendanceTotal = attendanceRows.length;
  const attendancePercent =
    attendanceTotal > 0 ? Math.round((present / attendanceTotal) * 1000) / 10 : null;

  const leavePending = await prisma.leaveApplication.count({
    where: { studentId: student.id, status: { in: [...PENDING_LEAVE_STATUSES] } },
  });
  const leaveApproved = await prisma.leaveApplication.count({
    where: { studentId: student.id, status: { in: [...APPROVED_LEAVE_STATUSES] } },
  });
  const leaveTotal = await prisma.leaveApplication.count({ where: { studentId: student.id } });

  const openComplaints = await prisma.complaintTicket.count({
    where: { studentId: student.id, status: { notIn: [...TERMINAL_COMPLAINT_STATUSES] } },
  });
  const maintenanceOpen = await prisma.complaintTicket.count({
    where: {
      studentId: student.id,
      status: { notIn: [...TERMINAL_COMPLAINT_STATUSES] },
      category: { contains: 'maintenance', mode: 'insensitive' },
    },
  });

  const outstanding = ledger ? Number(ledger.currentBalance) : 0;
  const totalAssessed = ledger ? Number(ledger.totalAssessed) : 0;
  const totalPaid = ledger ? Number(ledger.totalPaid) : 0;

  const unackedNotices = await prisma.notice.count({
    where: {
      ...noticeWhere,
      requiresAcknowledgement: true,
      acknowledgements: { none: { studentId: student.id } },
    },
  });

  const overdueOutCount = await prisma.gateMovementLog.count({
    where: {
      studentId: student.id,
      actualDeparture: { not: null },
      actualReturn: null,
      OR: [{ isLateReturn: true }, { pass: { validUntil: { lt: now } } }],
    },
  });

  return {
    generatedAt: now.toISOString(),
    profile: {
      linked: true,
      studentId: student.id,
      registrationNumber: student.registrationNumber,
      department: student.department,
      course: student.course,
      academicYear: student.academicYear,
      currentSemester: student.currentSemester,
      admissionYear: String(student.createdAt.getUTCFullYear()),
    },
    residence,
    roomRequests,
    allocationHistory,
    attendanceMonth: {
      label: monthLabel,
      percent: attendancePercent,
      present,
      absent,
      onLeave,
      standing: attendanceStanding(attendancePercent),
    },
    leave: {
      total: leaveTotal,
      pending: leavePending,
      approved: leaveApproved,
      recent: leaveRows.map((row) => ({
        id: row.id,
        title: row.leaveType,
        status: mapLeaveUiStatus(row.status),
        dateRange: formatLeaveRange(row.departureDate, row.expectedReturnDate),
        statusNote: leaveStatusNote(row.status),
      })),
    },
    fees: {
      available: true,
      outstanding,
      totalAssessed,
      totalPaid,
      dueDate: null,
    },
    complaints: complaintRows.map((row) => {
      const mapped = mapComplaintUi(row.status);
      return {
        id: row.id,
        title: row.title,
        location: row.location,
        status: mapped.status,
        statusLabel: mapped.statusLabel,
      };
    }),
    announcements: noticesScoped.map((n) => ({
      id: n.id,
      title: n.title,
      relativeTime: relativeTimeLabel(n.publishedAt, now),
      body: n.description.length > 160 ? `${n.description.slice(0, 157)}…` : n.description,
      author: n.category ? `Posted · ${n.category}` : 'Posted by Administration',
    })),
    events: [],
    roommates,
    navBadges: {
      leave: leavePending,
      complaints: openComplaints,
      maintenance: maintenanceOpen,
      fees: outstanding > 0 ? 1 : 0,
      announcements: unackedNotices,
      visitors: visitorPending,
    },
    gateMovement: {
      overdueOutCount,
      alert:
        overdueOutCount > 0
          ? 'You are marked out past your gate pass window — return to the hostel immediately.'
          : null,
    },
  };
}
