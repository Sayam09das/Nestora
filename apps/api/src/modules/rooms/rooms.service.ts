import type { BedStatus, Prisma, PrismaClient, RoomStatus } from '@nestora/database';
import type { RoomDirectoryListQuery } from '@nestora/validators';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';

export type RoomOperationalStatus = 'Available' | 'Full' | 'Maintenance' | 'Inactive';

export type RoomDirectorySummary = {
  generatedAt: string;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  facets: {
    hostels: string[];
    blocks: string[];
    floors: string[];
    roomTypes: string[];
  };
};

export type RoomDirectoryRow = {
  id: string;
  roomId: string;
  roomNumber: string;
  hostel: string;
  block: string;
  floor: string;
  roomType: string;
  capacity: number;
  occupiedBeds: number;
  operationalStatus: RoomOperationalStatus;
  facilities: string[];
  wardenName: string;
  students: [];
  maintenanceHistory: [];
};

const OCCUPIED_BED_STATUSES: BedStatus[] = ['OCCUPIED', 'RESERVED'];

const SHARING_CAPACITY: Record<string, number> = {
  'Single Sharing': 1,
  'Double Sharing': 2,
  'Triple Sharing': 3,
  'Quad Sharing': 4,
};

const locationInclude = {
  floor: {
    include: {
      block: {
        include: {
          building: {
            include: {
              hostel: {
                include: {
                  warden: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
        },
      },
    },
  },
  config: true,
  beds: { select: { status: true } },
} satisfies Prisma.RoomInclude;

type RoomWithLocation = Prisma.RoomGetPayload<{ include: typeof locationInclude }>;

function ordinalSuffix(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) {
    return 'th';
  }
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export function formatFloorLabel(floor: { floorNumber: number; name: string | null }): string {
  if (floor.name?.trim()) {
    return floor.name.trim();
  }
  if (floor.floorNumber === 0) {
    return 'Ground Floor';
  }
  return `${floor.floorNumber}${ordinalSuffix(floor.floorNumber)} Floor`;
}

export function sharingTypeLabel(capacity: number): string {
  switch (capacity) {
    case 1:
      return 'Single Sharing';
    case 2:
      return 'Double Sharing';
    case 3:
      return 'Triple Sharing';
    case 4:
      return 'Quad Sharing';
    default:
      return `${capacity}-Sharing`;
  }
}

function countOccupiedBeds(beds: { status: BedStatus }[]): number {
  return beds.filter((b) => OCCUPIED_BED_STATUSES.includes(b.status)).length;
}

export function deriveOperationalStatus(
  roomStatus: RoomStatus,
  capacity: number,
  occupiedBeds: number,
): RoomOperationalStatus {
  if (roomStatus === 'DECOMMISSIONED') {
    return 'Inactive';
  }
  if (roomStatus === 'UNDER_MAINTENANCE') {
    return 'Maintenance';
  }
  if (capacity > 0 && occupiedBeds >= capacity) {
    return 'Full';
  }
  return 'Available';
}

function rowFromRoom(room: RoomWithLocation): RoomDirectoryRow {
  const hostel = room.floor.block.building.hostel;
  const capacity = room.config.capacity;
  const occupiedBeds = countOccupiedBeds(room.beds);
  const warden = hostel.warden;
  const wardenName = warden ? `${warden.firstName} ${warden.lastName}`.trim() : '—';

  const facilities = [
    room.config.hasAc ? 'Air conditioning' : 'Ceiling fan',
    room.config.description,
    `${capacity}-bed capacity`,
  ];

  return {
    id: room.id,
    roomId: `RM-${room.roomNumber}`,
    roomNumber: room.roomNumber,
    hostel: hostel.name,
    block: room.floor.block.name,
    floor: formatFloorLabel(room.floor),
    roomType: sharingTypeLabel(capacity),
    capacity,
    occupiedBeds,
    operationalStatus: deriveOperationalStatus(room.status, capacity, occupiedBeds),
    facilities,
    wardenName,
    students: [],
    maintenanceHistory: [],
  };
}

function activeFullyOccupiedWhere(): Prisma.RoomWhereInput {
  return {
    status: 'ACTIVE',
    NOT: { beds: { some: { status: 'AVAILABLE' } } },
    beds: { some: { status: { in: OCCUPIED_BED_STATUSES } } },
  };
}

function activeHasOpenBedsWhere(): Prisma.RoomWhereInput {
  return {
    status: 'ACTIVE',
    beds: { some: { status: 'AVAILABLE' } },
  };
}

function activeVacantWhere(): Prisma.RoomWhereInput {
  return {
    status: 'ACTIVE',
    NOT: { beds: { some: { status: { in: OCCUPIED_BED_STATUSES } } } },
  };
}

function applyUiStatusFilter(status: RoomOperationalStatus): Prisma.RoomWhereInput {
  switch (status) {
    case 'Maintenance':
      return { status: 'UNDER_MAINTENANCE' };
    case 'Inactive':
      return { status: 'DECOMMISSIONED' };
    case 'Full':
      return activeFullyOccupiedWhere();
    case 'Available':
      return {
        status: 'ACTIVE',
        NOT: activeFullyOccupiedWhere(),
      };
    default:
      return {};
  }
}

function applyOccupancyFilter(occupancy: string): Prisma.RoomWhereInput {
  switch (occupancy) {
    case 'Has open beds':
      return activeHasOpenBedsWhere();
    case 'Fully occupied':
      return activeFullyOccupiedWhere();
    case 'Vacant':
      return activeVacantWhere();
    default:
      return {};
  }
}

async function floorIdsForLabel(prisma: PrismaClient, label: string): Promise<string[]> {
  const floors = await prisma.floor.findMany({
    select: { id: true, floorNumber: true, name: true },
  });
  return floors.filter((f) => formatFloorLabel(f) === label).map((f) => f.id);
}

export async function getRoomDirectorySummary(prisma: PrismaClient): Promise<RoomDirectorySummary> {
  const [totalRooms, maintenanceRooms, totalBeds, occupiedBeds, availableBeds, activeRooms, facetRows] =
    await Promise.all([
      prisma.room.count(),
      prisma.room.count({ where: { status: 'UNDER_MAINTENANCE' } }),
      prisma.bed.count(),
      prisma.bed.count({ where: { status: { in: OCCUPIED_BED_STATUSES } } }),
      prisma.bed.count({ where: { status: 'AVAILABLE' } }),
      prisma.room.findMany({
        where: { status: 'ACTIVE' },
        select: {
          config: { select: { capacity: true } },
          beds: { select: { status: true } },
        },
      }),
      prisma.room.findMany({
        select: {
          config: { select: { capacity: true } },
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
      }),
    ]);

  let occupiedRooms = 0;
  let availableRooms = 0;
  for (const room of activeRooms) {
    const occupied = countOccupiedBeds(room.beds);
    const cap = room.config.capacity;
    if (cap > 0 && occupied >= cap) {
      occupiedRooms += 1;
    } else {
      availableRooms += 1;
    }
  }

  const hostels = new Set<string>();
  const blocks = new Set<string>();
  const floors = new Set<string>();
  const roomTypes = new Set<string>();

  for (const row of facetRows) {
    hostels.add(row.floor.block.building.hostel.name);
    blocks.add(row.floor.block.name);
    floors.add(formatFloorLabel(row.floor));
    roomTypes.add(sharingTypeLabel(row.config.capacity));
  }

  return {
    generatedAt: new Date().toISOString(),
    totalRooms,
    occupiedRooms,
    availableRooms,
    maintenanceRooms,
    totalBeds,
    occupiedBeds,
    availableBeds,
    facets: {
      hostels: [...hostels].sort(),
      blocks: [...blocks].sort(),
      floors: [...floors].sort((a, b) => a.localeCompare(b, 'en', { numeric: true })),
      roomTypes: [...roomTypes].sort((a, b) => {
        const ca = SHARING_CAPACITY[a] ?? 99;
        const cb = SHARING_CAPACITY[b] ?? 99;
        return ca - cb;
      }),
    },
  };
}

export async function listRoomDirectory(
  prisma: PrismaClient,
  query: RoomDirectoryListQuery,
): Promise<{
  rooms: RoomDirectoryRow[];
  pagination: ReturnType<typeof buildPaginationMeta>;
}> {
  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
  const { limit: safeLimit, skip } = normalizePagination(page, limit);

  const and: Prisma.RoomWhereInput[] = [];

  if (query.q?.trim()) {
    const term = query.q.trim();
    and.push({
      OR: [
        { roomNumber: { contains: term, mode: 'insensitive' } },
        {
          floor: {
            block: {
              OR: [
                { name: { contains: term, mode: 'insensitive' } },
                {
                  building: {
                    OR: [
                      { name: { contains: term, mode: 'insensitive' } },
                      { hostel: { name: { contains: term, mode: 'insensitive' } } },
                    ],
                  },
                },
              ],
            },
          },
        },
      ],
    });
  }

  if (query.hostel?.trim() && query.hostel !== 'All Hostels') {
    and.push({
      floor: { block: { building: { hostel: { name: { equals: query.hostel.trim(), mode: 'insensitive' } } } } },
    });
  }

  if (query.block?.trim() && query.block !== 'All Blocks') {
    and.push({
      floor: { block: { name: { equals: query.block.trim(), mode: 'insensitive' } } },
    });
  }

  if (query.floor?.trim() && query.floor !== 'All Floors') {
    const ids = await floorIdsForLabel(prisma, query.floor.trim());
    if (ids.length === 0) {
      return {
        rooms: [],
        pagination: buildPaginationMeta(page, safeLimit, 0),
      };
    }
    and.push({ floorId: { in: ids } });
  }

  if (query.roomType?.trim() && query.roomType !== 'All Types') {
    const cap = SHARING_CAPACITY[query.roomType.trim()];
    if (cap) {
      and.push({ config: { capacity: cap } });
    } else {
      and.push({
        config: { description: { equals: query.roomType.trim(), mode: 'insensitive' } },
      });
    }
  }

  if (query.status) {
    and.push(applyUiStatusFilter(query.status));
  }

  if (query.occupancy) {
    and.push(applyOccupancyFilter(query.occupancy));
  }

  const where: Prisma.RoomWhereInput = and.length ? { AND: and } : {};

  const [total, rows] = await Promise.all([
    prisma.room.count({ where }),
    prisma.room.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: [{ floor: { block: { building: { hostel: { name: 'asc' } } } } }, { roomNumber: 'asc' }],
      include: locationInclude,
    }),
  ]);

  return {
    rooms: rows.map(rowFromRoom),
    pagination: buildPaginationMeta(page, safeLimit, total),
  };
}
