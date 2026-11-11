import type { BedStatus, Prisma, PrismaClient } from '@nestora/database';
import type { BedDirectoryListQuery } from '@nestora/validators';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';
import { prismaHostelNamesOnBed } from '../../common/helpers/warden-hostel-scope.js';
import { formatFloorLabel } from '../rooms/rooms.service.js';

export type BedUiStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export type BedDirectorySummary = {
  generatedAt: string;
  totalBeds: number;
  occupied: number;
  available: number;
  reserved: number;
  maintenance: number;
  occupiedRatePercent: number | null;
  byHostel: Array<{
    hostel: string;
    total: number;
    available: number;
    occupied: number;
  }>;
  facets: {
    hostels: string[];
    blocks: string[];
    floors: string[];
    rooms: string[];
  };
};

export type BedDirectoryRow = {
  id: string;
  bedId: string;
  hostel: string;
  block: string;
  floor: string;
  roomNumber: string;
  roomId: string;
  bedNumber: string;
  bedLabel: string;
  bedType: 'Single Bed' | 'Bunk Bed — Upper' | 'Bunk Bed — Lower' | 'Other';
  status: BedUiStatus;
  student: { name: string; studentId: string } | null;
  allocationDate: string | null;
  expectedCheckout: string | null;
  reservation: null;
  roomUnderMaintenance: boolean;
  maintenanceHistory: [];
  statusHistory: [];
};

const bedListInclude = {
  room: {
    include: {
      config: { select: { capacity: true } },
      floor: {
        include: {
          block: {
            include: {
              building: {
                include: { hostel: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  },
  allocationRecords: {
    where: { status: 'ACTIVE' as const },
    take: 1,
    orderBy: { allocatedAt: 'desc' as const },
    include: {
      student: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  },
} satisfies Prisma.BedInclude;

type BedWithContext = Prisma.BedGetPayload<{ include: typeof bedListInclude }>;

function mapBedStatus(status: BedStatus): BedUiStatus {
  switch (status) {
    case 'AVAILABLE':
      return 'Available';
    case 'OCCUPIED':
      return 'Occupied';
    case 'RESERVED':
      return 'Reserved';
    case 'MAINTENANCE':
      return 'Maintenance';
    default:
      return 'Available';
  }
}

function mapUiStatusToDb(status: BedUiStatus): BedStatus {
  switch (status) {
    case 'Available':
      return 'AVAILABLE';
    case 'Occupied':
      return 'OCCUPIED';
    case 'Reserved':
      return 'RESERVED';
    case 'Maintenance':
      return 'MAINTENANCE';
    default:
      return 'AVAILABLE';
  }
}

function inferBedType(capacity: number, bedNumber: string): BedDirectoryRow['bedType'] {
  if (capacity <= 1) {
    return 'Single Bed';
  }
  if (capacity === 2) {
    return bedNumber === '1' ? 'Bunk Bed — Lower' : 'Bunk Bed — Upper';
  }
  return 'Single Bed';
}

function rowFromBed(bed: BedWithContext): BedDirectoryRow {
  const room = bed.room;
  const allocation = bed.allocationRecords[0];
  const studentUser = allocation?.student.user;
  const studentName = studentUser
    ? `${studentUser.firstName} ${studentUser.lastName}`.trim()
    : null;

  return {
    id: bed.id,
    bedId: `BD-${room.roomNumber}-${bed.bedNumber}`,
    hostel: room.floor.block.building.hostel.name,
    block: room.floor.block.name,
    floor: formatFloorLabel(room.floor),
    roomNumber: room.roomNumber,
    roomId: room.id,
    bedNumber: bed.bedNumber,
    bedLabel: `Bed ${bed.bedNumber}`,
    bedType: inferBedType(room.config.capacity, bed.bedNumber),
    status: mapBedStatus(bed.status),
    student:
      studentName && allocation
        ? {
            name: studentName,
            studentId: allocation.student.registrationNumber,
          }
        : null,
    allocationDate: allocation ? allocation.startDate.toISOString().slice(0, 10) : null,
    expectedCheckout: allocation?.endDate ? allocation.endDate.toISOString().slice(0, 10) : null,
    reservation: null,
    roomUnderMaintenance: room.status === 'UNDER_MAINTENANCE',
    maintenanceHistory: [],
    statusHistory: [],
  };
}

async function floorIdsForLabel(prisma: PrismaClient, label: string): Promise<string[]> {
  const floors = await prisma.floor.findMany({
    select: { id: true, floorNumber: true, name: true },
  });
  return floors.filter((f) => formatFloorLabel(f) === label).map((f) => f.id);
}

export async function getBedDirectorySummaryForHostels(
  prisma: PrismaClient,
  scopeHostelNames: string[],
): Promise<BedDirectorySummary> {
  if (scopeHostelNames.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      totalBeds: 0,
      occupied: 0,
      available: 0,
      reserved: 0,
      maintenance: 0,
      occupiedRatePercent: null,
      byHostel: [],
      facets: { hostels: [], blocks: [], floors: [], rooms: [] },
    };
  }

  const bedScope = prismaHostelNamesOnBed(scopeHostelNames);

  const [grouped, hostels, facetRows] = await Promise.all([
    prisma.bed.groupBy({
      by: ['status'],
      where: bedScope,
      _count: { _all: true },
    }),
    prisma.hostel.findMany({
      where: { isActive: true, name: { in: scopeHostelNames, mode: 'insensitive' } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.bed.findMany({
      where: bedScope,
      select: {
        status: true,
        room: {
          select: {
            roomNumber: true,
            floor: {
              select: {
                floorNumber: true,
                name: true,
                block: {
                  select: {
                    name: true,
                    building: { select: { hostel: { select: { name: true } } } },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const counts = {
    totalBeds: 0,
    occupied: 0,
    available: 0,
    reserved: 0,
    maintenance: 0,
  };

  for (const row of grouped) {
    const n = row._count._all;
    counts.totalBeds += n;
    switch (row.status) {
      case 'OCCUPIED':
        counts.occupied += n;
        break;
      case 'AVAILABLE':
        counts.available += n;
        break;
      case 'RESERVED':
        counts.reserved += n;
        break;
      case 'MAINTENANCE':
        counts.maintenance += n;
        break;
      default:
        break;
    }
  }

  const byHostel = await Promise.all(
    hostels.map(async (hostel) => {
      const base: Prisma.BedWhereInput = {
        room: { floor: { block: { building: { hostelId: hostel.id } } } },
      };
      const [total, available, occupied] = await Promise.all([
        prisma.bed.count({ where: base }),
        prisma.bed.count({ where: { ...base, status: 'AVAILABLE' } }),
        prisma.bed.count({ where: { ...base, status: 'OCCUPIED' } }),
      ]);
      return { hostel: hostel.name, total, available, occupied };
    }),
  );

  const hostelNames = new Set<string>();
  const blocks = new Set<string>();
  const floors = new Set<string>();
  const rooms = new Set<string>();

  for (const row of facetRows) {
    hostelNames.add(row.room.floor.block.building.hostel.name);
    blocks.add(row.room.floor.block.name);
    floors.add(formatFloorLabel(row.room.floor));
    rooms.add(row.room.roomNumber);
  }

  const occupiedRatePercent =
    counts.totalBeds > 0 ? Math.round((counts.occupied / counts.totalBeds) * 1000) / 10 : null;

  return {
    generatedAt: new Date().toISOString(),
    ...counts,
    occupiedRatePercent,
    byHostel: byHostel.filter((h) => h.total > 0),
    facets: {
      hostels: [...scopeHostelNames].sort(),
      blocks: [...blocks].sort(),
      floors: [...floors].sort((a, b) => a.localeCompare(b, 'en', { numeric: true })),
      rooms: [...rooms].sort((a, b) => a.localeCompare(b, 'en', { numeric: true })),
    },
  };
}

export async function getBedDirectorySummary(prisma: PrismaClient): Promise<BedDirectorySummary> {
  const [grouped, hostels, facetRows] = await Promise.all([
    prisma.bed.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.hostel.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.bed.findMany({
      select: {
        status: true,
        room: {
          select: {
            roomNumber: true,
            floor: {
              select: {
                floorNumber: true,
                name: true,
                block: {
                  select: {
                    name: true,
                    building: { select: { hostel: { select: { name: true } } } },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const counts = {
    totalBeds: 0,
    occupied: 0,
    available: 0,
    reserved: 0,
    maintenance: 0,
  };

  for (const row of grouped) {
    const n = row._count._all;
    counts.totalBeds += n;
    switch (row.status) {
      case 'OCCUPIED':
        counts.occupied += n;
        break;
      case 'AVAILABLE':
        counts.available += n;
        break;
      case 'RESERVED':
        counts.reserved += n;
        break;
      case 'MAINTENANCE':
        counts.maintenance += n;
        break;
      default:
        break;
    }
  }

  const byHostel = await Promise.all(
    hostels.map(async (hostel) => {
      const base: Prisma.BedWhereInput = {
        room: { floor: { block: { building: { hostelId: hostel.id } } } },
      };
      const [total, available, occupied] = await Promise.all([
        prisma.bed.count({ where: base }),
        prisma.bed.count({ where: { ...base, status: 'AVAILABLE' } }),
        prisma.bed.count({ where: { ...base, status: 'OCCUPIED' } }),
      ]);
      return { hostel: hostel.name, total, available, occupied };
    }),
  );

  const hostelNames = new Set<string>();
  const blocks = new Set<string>();
  const floors = new Set<string>();
  const rooms = new Set<string>();

  for (const row of facetRows) {
    hostelNames.add(row.room.floor.block.building.hostel.name);
    blocks.add(row.room.floor.block.name);
    floors.add(formatFloorLabel(row.room.floor));
    rooms.add(row.room.roomNumber);
  }

  const occupiedRatePercent =
    counts.totalBeds > 0 ? Math.round((counts.occupied / counts.totalBeds) * 1000) / 10 : null;

  return {
    generatedAt: new Date().toISOString(),
    ...counts,
    occupiedRatePercent,
    byHostel: byHostel.filter((h) => h.total > 0),
    facets: {
      hostels: [...hostelNames].sort(),
      blocks: [...blocks].sort(),
      floors: [...floors].sort((a, b) => a.localeCompare(b, 'en', { numeric: true })),
      rooms: [...rooms].sort((a, b) => a.localeCompare(b, 'en', { numeric: true })),
    },
  };
}

export type BedDirectoryListOptions = BedDirectoryListQuery & {
  scopeHostelNames?: string[];
};

export async function listBedDirectory(
  prisma: PrismaClient,
  query: BedDirectoryListOptions,
): Promise<{
  beds: BedDirectoryRow[];
  pagination: ReturnType<typeof buildPaginationMeta>;
}> {
  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
  const { limit: safeLimit, skip } = normalizePagination(page, limit);

  const and: Prisma.BedWhereInput[] = [];

  if (query.q?.trim()) {
    const term = query.q.trim();
    and.push({
      OR: [
        { bedNumber: { contains: term, mode: 'insensitive' } },
        {
          room: {
            OR: [
              { roomNumber: { contains: term, mode: 'insensitive' } },
              {
                floor: {
                  block: {
                    OR: [
                      { name: { contains: term, mode: 'insensitive' } },
                      {
                        building: {
                          hostel: { name: { contains: term, mode: 'insensitive' } },
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
        {
          allocationRecords: {
            some: {
              status: 'ACTIVE',
              student: {
                OR: [
                  { registrationNumber: { contains: term, mode: 'insensitive' } },
                  {
                    user: {
                      OR: [
                        { firstName: { contains: term, mode: 'insensitive' } },
                        { lastName: { contains: term, mode: 'insensitive' } },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      ],
    });
  }

  if (query.hostel?.trim() && query.hostel !== 'All Hostels') {
    and.push({
      room: {
        floor: {
          block: {
            building: { hostel: { name: { equals: query.hostel.trim(), mode: 'insensitive' } } },
          },
        },
      },
    });
  }

  if (query.block?.trim() && query.block !== 'All Blocks') {
    and.push({
      room: { floor: { block: { name: { equals: query.block.trim(), mode: 'insensitive' } } } },
    });
  }

  if (query.floor?.trim() && query.floor !== 'All Floors') {
    const ids = await floorIdsForLabel(prisma, query.floor.trim());
    if (ids.length === 0) {
      return { beds: [], pagination: buildPaginationMeta(page, safeLimit, 0) };
    }
    and.push({ room: { floorId: { in: ids } } });
  }

  if (query.room?.trim() && query.room !== 'All Rooms') {
    and.push({
      room: { roomNumber: { equals: query.room.trim(), mode: 'insensitive' } },
    });
  }

  if (query.status) {
    and.push({ status: mapUiStatusToDb(query.status) });
  }

  if (query.scopeHostelNames && query.scopeHostelNames.length > 0) {
    and.push(prismaHostelNamesOnBed(query.scopeHostelNames));
  }

  const where: Prisma.BedWhereInput = and.length ? { AND: and } : {};

  const [total, rows] = await Promise.all([
    prisma.bed.count({ where }),
    prisma.bed.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: [
        { room: { floor: { block: { building: { hostel: { name: 'asc' } } } } } },
        { room: { roomNumber: 'asc' } },
        { bedNumber: 'asc' },
      ],
      include: bedListInclude,
    }),
  ]);

  return {
    beds: rows.map(rowFromBed),
    pagination: buildPaginationMeta(page, safeLimit, total),
  };
}
