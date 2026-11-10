import type { GenderCategory, Prisma, PrismaClient } from '@nestora/database';
import type { AllocationDirectoryListQuery } from '@nestora/validators';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';

const ADMISSION_FULLY_APPROVED = 'FULLY_APPROVED';
const CHANGE_PENDING = 'PENDING';
const CHANGE_REJECTED = 'REJECTED';
const ADMISSION_REJECTED = 'REJECTED';

export type AllocationUiStatus = 'Pending' | 'Allocated' | 'Change Requested' | 'Rejected';
export type AllocationUiType = 'New Allocation' | 'Room Change';

export type AllocationDirectorySummary = {
  generatedAt: string;
  pendingQueue: number;
  allocatedToday: number;
  roomChangePending: number;
  eligibleUnallocated: number;
  bedsAvailable: number;
  totalBedCapacity: number;
  bedsAvailableSharePct: number | null;
  queueByHostel: Array<{ hostel: string; pending: number; availableBeds: number }>;
  facets: {
    hostels: string[];
  };
};

export type AllocationDirectoryRow = {
  id: string;
  allocationRef: string;
  type: AllocationUiType;
  status: AllocationUiStatus;
  admissionStatus: 'Fully Approved' | 'Pending Verification';
  studentId: string;
  studentName: string;
  course: string;
  genderHostelCategory: "Boys' Hostel" | "Girls' Hostel";
  preferenceHostel: string;
  preferenceRoomType: string;
  acPreference: 'AC' | 'Non-AC';
  reason?: string;
  hostel: string | null;
  block: string | null;
  roomNumber: string | null;
  bedId: string | null;
  bedLabel: string | null;
  submittedAt: string;
  allocatedAt: string | null;
  allocatedBy: string | null;
  expectedCheckout: string | null;
  history: [];
};

function mapGenderCategory(category: GenderCategory): "Boys' Hostel" | "Girls' Hostel" {
  return category === 'GIRLS_HOSTEL' ? "Girls' Hostel" : "Boys' Hostel";
}

function roomTypeLabel(config: { capacity: number; description: string }): string {
  const cap = config.capacity;
  if (cap === 1) return 'Single Occupancy';
  if (cap === 2) return 'Double Sharing';
  if (cap === 3) return 'Triple Sharing';
  if (cap === 4) return 'Four Sharing';
  return config.description || `${cap}-bed room`;
}

const bedPathInclude = {
  room: {
    include: {
      config: { select: { capacity: true, description: true, hasAc: true } },
      floor: {
        include: {
          block: {
            include: {
              building: {
                include: { hostel: { select: { name: true, genderCategory: true } } },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.BedInclude;

type BedPath = Prisma.BedGetPayload<{ include: typeof bedPathInclude }>;

function bedPlacement(bed: BedPath | null | undefined): {
  hostel: string | null;
  block: string | null;
  roomNumber: string | null;
  bedLabel: string | null;
} {
  if (!bed) {
    return { hostel: null, block: null, roomNumber: null, bedLabel: null };
  }
  const hostel = bed.room.floor.block.building.hostel.name;
  const block = bed.room.floor.block.name;
  return {
    hostel,
    block,
    roomNumber: bed.room.roomNumber,
    bedLabel: `Bed ${bed.bedNumber}`,
  };
}

function hasActiveAllocation(
  records: Array<{ status: string }>,
): boolean {
  return records.some((r) => r.status === 'ACTIVE');
}

async function loadAllRows(prisma: PrismaClient): Promise<AllocationDirectoryRow[]> {
  const [applications, changeRequests, allocations] = await Promise.all([
    prisma.admissionApplication.findMany({
      include: {
        hostel: { select: { name: true, genderCategory: true } },
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            bedPreferences: {
              take: 1,
              orderBy: { submittedAt: 'desc' },
              include: {
                hostel: { select: { name: true, genderCategory: true } },
                config: { select: { capacity: true, description: true, hasAc: true } },
              },
            },
            allocationRecords: { select: { status: true } },
          },
        },
      },
    }),
    prisma.roomChangeRequest.findMany({
      include: {
        preferredConfig: { select: { capacity: true, description: true, hasAc: true } },
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            allocationRecords: { select: { status: true } },
          },
        },
        currentBed: { include: bedPathInclude },
      },
    }),
    prisma.allocationRecord.findMany({
      orderBy: { allocatedAt: 'desc' },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            bedPreferences: {
              take: 1,
              orderBy: { submittedAt: 'desc' },
              include: {
                hostel: { select: { name: true, genderCategory: true } },
                config: { select: { capacity: true, description: true, hasAc: true } },
              },
            },
            admissionApplications: {
              take: 1,
              orderBy: { submittedAt: 'desc' },
              include: { hostel: { select: { name: true, genderCategory: true } } },
            },
          },
        },
        bed: { include: bedPathInclude },
      },
    }),
  ]);

  const allocatorIds = [...new Set(allocations.map((a) => a.allocatedBy))];
  const allocatorUsers =
    allocatorIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: allocatorIds } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [];
  const allocatorName = new Map(
    allocatorUsers.map((u) => [u.id, `${u.firstName} ${u.lastName}`.trim()]),
  );
  const rows: AllocationDirectoryRow[] = [];

  for (const app of applications) {
    const student = app.student;
    if (!student) continue;
    const fullyApproved = app.status === ADMISSION_FULLY_APPROVED;
    const rejected = app.status === ADMISSION_REJECTED;

    if (fullyApproved && !hasActiveAllocation(student.allocationRecords)) {
      const pref = student.bedPreferences[0];
      const hostelName = pref?.hostel.name ?? app.hostel.name;
      const gender = pref?.hostel.genderCategory ?? app.hostel.genderCategory;
      rows.push({
        id: `queue:admission:${app.id}`,
        allocationRef: `QUEUE-${student.registrationNumber}`,
        type: 'New Allocation',
        status: 'Pending',
        admissionStatus: 'Fully Approved',
        studentId: student.registrationNumber,
        studentName: `${student.user.firstName} ${student.user.lastName}`.trim(),
        course: student.course,
        genderHostelCategory: mapGenderCategory(gender),
        preferenceHostel: hostelName,
        preferenceRoomType: pref ? roomTypeLabel(pref.config) : '—',
        acPreference: pref?.config.hasAc ? 'AC' : 'Non-AC',
        hostel: null,
        block: null,
        roomNumber: null,
        bedId: null,
        bedLabel: null,
        submittedAt: app.submittedAt.toISOString(),
        allocatedAt: null,
        allocatedBy: null,
        expectedCheckout: null,
        history: [],
      });
    } else if (rejected) {
      const gender = app.hostel.genderCategory;
      rows.push({
        id: `rejected:admission:${app.id}`,
        allocationRef: `REJ-${student.registrationNumber}`,
        type: 'New Allocation',
        status: 'Rejected',
        admissionStatus: 'Pending Verification',
        studentId: student.registrationNumber,
        studentName: `${student.user.firstName} ${student.user.lastName}`.trim(),
        course: student.course,
        genderHostelCategory: mapGenderCategory(gender),
        preferenceHostel: app.hostel.name,
        preferenceRoomType: '—',
        acPreference: 'Non-AC',
        hostel: null,
        block: null,
        roomNumber: null,
        bedId: null,
        bedLabel: null,
        submittedAt: app.submittedAt.toISOString(),
        allocatedAt: null,
        allocatedBy: null,
        expectedCheckout: null,
        history: [],
      });
    }
  }

  for (const req of changeRequests) {
    const student = req.student;
    const placement = bedPlacement(req.currentBed);
    const hostelGender =
      req.currentBed.room.floor.block.building.hostel.genderCategory;
    const isPending = req.status.toUpperCase() === CHANGE_PENDING;
    const isRejected = req.status.toUpperCase() === CHANGE_REJECTED;

    if (!isPending && !isRejected) continue;

    rows.push({
      id: `change:${req.id}`,
      allocationRef: `CHG-${student.registrationNumber}`,
      type: 'Room Change',
      status: isPending ? 'Change Requested' : 'Rejected',
      admissionStatus: 'Fully Approved',
      studentId: student.registrationNumber,
      studentName: `${student.user.firstName} ${student.user.lastName}`.trim(),
      course: student.course,
      genderHostelCategory: mapGenderCategory(hostelGender),
      preferenceHostel: placement.hostel ?? '—',
      preferenceRoomType: roomTypeLabel(req.preferredConfig),
      acPreference: req.preferredConfig.hasAc ? 'AC' : 'Non-AC',
      reason: req.reason,
      hostel: placement.hostel,
      block: placement.block,
      roomNumber: placement.roomNumber,
      bedId: req.currentBedId,
      bedLabel: placement.bedLabel,
      submittedAt: req.createdAt.toISOString(),
      allocatedAt: null,
      allocatedBy: null,
      expectedCheckout: null,
      history: [],
    });
  }

  for (const record of allocations) {
    if (record.status !== 'ACTIVE') continue;
    const student = record.student;
    const placement = bedPlacement(record.bed);
    const pref = student.bedPreferences[0];
    const admission = student.admissionApplications[0];
    const gender =
      record.bed.room.floor.block.building.hostel.genderCategory ??
      admission?.hostel.genderCategory ??
      'BOYS_HOSTEL';
    const refSuffix = record.id.replace(/-/g, '').slice(0, 8).toUpperCase();

    rows.push({
      id: record.id,
      allocationRef: `ALLOC-${refSuffix}`,
      type: 'New Allocation',
      status: 'Allocated',
      admissionStatus:
        admission?.status === ADMISSION_FULLY_APPROVED ? 'Fully Approved' : 'Pending Verification',
      studentId: student.registrationNumber,
      studentName: `${student.user.firstName} ${student.user.lastName}`.trim(),
      course: student.course,
      genderHostelCategory: mapGenderCategory(gender),
      preferenceHostel: pref?.hostel.name ?? placement.hostel ?? '—',
      preferenceRoomType: pref
        ? roomTypeLabel(pref.config)
        : roomTypeLabel(record.bed.room.config),
      acPreference: (pref?.config.hasAc ?? record.bed.room.config.hasAc) ? 'AC' : 'Non-AC',
      hostel: placement.hostel,
      block: placement.block,
      roomNumber: placement.roomNumber,
      bedId: record.bedId,
      bedLabel: placement.bedLabel,
      submittedAt: record.allocatedAt.toISOString(),
      allocatedAt: record.allocatedAt.toISOString(),
      allocatedBy: allocatorName.get(record.allocatedBy) ?? null,
      expectedCheckout: record.endDate ? record.endDate.toISOString().slice(0, 10) : null,
      history: [],
    });
  }

  rows.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  return rows;
}

function applyFilters(
  rows: AllocationDirectoryRow[],
  query: AllocationDirectoryListQuery,
): AllocationDirectoryRow[] {
  let filtered = rows;

  if (query.q?.trim()) {
    const term = query.q.trim().toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.studentName.toLowerCase().includes(term) ||
        r.studentId.toLowerCase().includes(term) ||
        r.allocationRef.toLowerCase().includes(term) ||
        (r.bedId?.toLowerCase().includes(term) ?? false),
    );
  }

  if (query.status) {
    filtered = filtered.filter((r) => r.status === query.status);
  }

  if (query.type) {
    filtered = filtered.filter((r) => r.type === query.type);
  }

  if (query.hostel?.trim() && query.hostel !== 'All Hostels') {
    filtered = filtered.filter((r) => {
      const hostel = r.hostel ?? r.preferenceHostel;
      return hostel === query.hostel;
    });
  }

  return filtered;
}

export async function getAllocationDirectorySummary(
  prisma: PrismaClient,
): Promise<AllocationDirectorySummary> {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    bedsAvailable,
    totalBedCapacity,
    allocatedToday,
    roomChangePending,
    approvedUnallocated,
    hostels,
    rows,
  ] = await Promise.all([
    prisma.bed.count({ where: { status: 'AVAILABLE' } }),
    prisma.bed.count(),
    prisma.allocationRecord.count({ where: { allocatedAt: { gte: dayAgo } } }),
    prisma.roomChangeRequest.count({ where: { status: { equals: CHANGE_PENDING, mode: 'insensitive' } } }),
    prisma.admissionApplication.count({
      where: {
        status: ADMISSION_FULLY_APPROVED,
        student: {
          allocationRecords: { none: { status: 'ACTIVE' } },
        },
      },
    }),
    prisma.hostel.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    loadAllRows(prisma),
  ]);

  const pendingQueue =
    rows.filter((r) => r.status === 'Pending' || r.status === 'Change Requested').length;

  const pendingByHostel = new Map<string, number>();
  for (const row of rows) {
    if (row.status !== 'Pending' && row.status !== 'Change Requested') continue;
    const hostel = row.preferenceHostel;
    pendingByHostel.set(hostel, (pendingByHostel.get(hostel) ?? 0) + 1);
  }

  const availableByHostel = await Promise.all(
    hostels.map(async (h) => {
      const availableBeds = await prisma.bed.count({
        where: {
          status: 'AVAILABLE',
          room: {
            floor: {
              block: {
                building: { hostelId: h.id },
              },
            },
          },
        },
      });
      return { hostel: h.name, availableBeds };
    }),
  );

  const queueByHostel = hostels.map((h) => ({
    hostel: h.name,
    pending: pendingByHostel.get(h.name) ?? 0,
    availableBeds: availableByHostel.find((b) => b.hostel === h.name)?.availableBeds ?? 0,
  }));

  return {
    generatedAt: new Date().toISOString(),
    pendingQueue,
    allocatedToday,
    roomChangePending,
    eligibleUnallocated: approvedUnallocated,
    bedsAvailable,
    totalBedCapacity,
    bedsAvailableSharePct:
      totalBedCapacity > 0 ? Math.round((bedsAvailable / totalBedCapacity) * 1000) / 10 : null,
    queueByHostel: queueByHostel.filter((r) => r.pending > 0 || r.availableBeds > 0),
    facets: {
      hostels: hostels.map((h) => h.name),
    },
  };
}

export async function listAllocationQueue(prisma: PrismaClient): Promise<AllocationDirectoryRow[]> {
  const rows = await loadAllRows(prisma);
  return rows.filter((r) => r.status === 'Pending' || r.status === 'Change Requested');
}

export async function listAllocationDirectory(
  prisma: PrismaClient,
  query: AllocationDirectoryListQuery,
): Promise<{
  allocations: AllocationDirectoryRow[];
  pagination: ReturnType<typeof buildPaginationMeta>;
}> {
  const allRows = await loadAllRows(prisma);
  const filtered = applyFilters(allRows, query);

  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
  const { limit: safeLimit, skip } = normalizePagination(page, limit);
  const total = filtered.length;
  const pageRows = filtered.slice(skip, skip + safeLimit);

  return {
    allocations: pageRows,
    pagination: buildPaginationMeta(page, safeLimit, total),
  };
}
