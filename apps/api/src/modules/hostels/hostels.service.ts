import type { GenderCategory, PrismaClient } from '@nestora/database';
import type { HostelDirectoryListQuery } from '@nestora/validators';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';

export type HostelUiStatus = 'Active' | 'Under Setup' | 'Inactive';
export type HostelGenderUi = "Boys' Hostel" | "Girls' Hostel";

export type HostelDirectorySummary = {
  generatedAt: string;
  totalHostels: number;
  activeHostels: number;
  underSetup: number;
  inactiveHostels: number;
  totalBedCapacity: number;
  averageOccupancyPct: number | null;
  boysBedsSharePct: number | null;
  girlsBedsSharePct: number | null;
  byGender: Array<{ label: HostelGenderUi; count: number; beds: number }>;
  facets: {
    campuses: string[];
    genders: HostelGenderUi[];
  };
};

export type HostelDirectoryRow = {
  id: string;
  hostelCode: string;
  name: string;
  genderCategory: HostelGenderUi;
  campusZone: string;
  address: string;
  status: HostelUiStatus;
  description: string;
  wardenName: string;
  wardenEmail: string;
  contactPhone: string;
  yearEstablished: number;
  facilities: string[];
  buildings: Array<{ name: string; blocks: number; floors: number; rooms: number }>;
  totalBuildings: number;
  totalBlocks: number;
  totalFloors: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  modificationHistory: [];
};

const hostelTreeInclude = {
  university: { select: { name: true, address: true } },
  warden: { select: { firstName: true, lastName: true, email: true, phoneNumber: true } },
  buildings: {
    include: {
      blocks: {
        include: {
          floors: {
            include: {
              rooms: {
                include: { beds: { select: { status: true } } },
              },
            },
          },
        },
      },
    },
  },
} as const;

type HostelTree = Awaited<ReturnType<typeof loadHostelTree>>[number];

async function loadHostelTree(prisma: PrismaClient) {
  return prisma.hostel.findMany({
    orderBy: { name: 'asc' },
    include: hostelTreeInclude,
  });
}

function mapGender(category: GenderCategory): HostelGenderUi {
  return category === 'GIRLS_HOSTEL' ? "Girls' Hostel" : "Boys' Hostel";
}

function deriveStatus(isActive: boolean, totalBeds: number): HostelUiStatus {
  if (!isActive) {
    return 'Inactive';
  }
  if (totalBeds === 0) {
    return 'Under Setup';
  }
  return 'Active';
}

function aggregateHostel(hostel: HostelTree): HostelDirectoryRow {
  let totalBlocks = 0;
  let totalFloors = 0;
  let totalRooms = 0;
  let totalBeds = 0;
  let occupiedBeds = 0;
  let availableBeds = 0;

  const buildings: HostelDirectoryRow['buildings'] = [];

  for (const building of hostel.buildings) {
    let bBlocks = building.blocks.length;
    let bFloors = 0;
    let bRooms = 0;
    for (const block of building.blocks) {
      totalBlocks += 1;
      bFloors += block.floors.length;
      for (const floor of block.floors) {
        totalFloors += 1;
        bRooms += floor.rooms.length;
        totalRooms += floor.rooms.length;
        for (const room of floor.rooms) {
          totalBeds += room.beds.length;
          for (const bed of room.beds) {
            if (bed.status === 'OCCUPIED' || bed.status === 'RESERVED') {
              occupiedBeds += 1;
            }
            if (bed.status === 'AVAILABLE') {
              availableBeds += 1;
            }
          }
        }
      }
    }
    buildings.push({
      name: building.name,
      blocks: bBlocks,
      floors: bFloors,
      rooms: bRooms,
    });
  }

  const warden = hostel.warden;
  const wardenName = warden ? `${warden.firstName} ${warden.lastName}`.trim() : 'Unassigned';

  return {
    id: hostel.id,
    hostelCode: hostel.code,
    name: hostel.name,
    genderCategory: mapGender(hostel.genderCategory),
    campusZone: hostel.university.name,
    address: hostel.university.address?.trim() || '—',
    status: deriveStatus(hostel.isActive, totalBeds),
    description: `${hostel.name} — ${mapGender(hostel.genderCategory)} facility.`,
    wardenName,
    wardenEmail: warden?.email ?? '—',
    contactPhone: warden?.phoneNumber?.trim() || '—',
    yearEstablished: hostel.createdAt.getUTCFullYear(),
    facilities: ['24×7 Security', 'Wi-Fi Campus', 'Dining Hall', 'Laundry'],
    buildings,
    totalBuildings: hostel.buildings.length,
    totalBlocks,
    totalFloors,
    totalRooms,
    totalBeds,
    occupiedBeds,
    availableBeds,
    createdBy: 'Nestora admin',
    createdAt: hostel.createdAt.toISOString().slice(0, 10),
    updatedAt: hostel.createdAt.toISOString().slice(0, 10),
    modificationHistory: [],
  };
}

function occupancyPct(row: HostelDirectoryRow): number {
  if (row.totalBeds <= 0) return 0;
  return Math.round((row.occupiedBeds / row.totalBeds) * 1000) / 10;
}

function matchesOccupancyFilter(pct: number, filter: string): boolean {
  if (filter === 'All Occupancy' || !filter) return true;
  if (filter === 'Above 85%') return pct > 85;
  if (filter === '65% – 85%') return pct >= 65 && pct <= 85;
  if (filter === 'Below 65%') return pct < 65;
  return true;
}

export async function getHostelDirectorySummary(prisma: PrismaClient): Promise<HostelDirectorySummary> {
  const tree = await loadHostelTree(prisma);
  const rows = tree.map(aggregateHostel);

  let activeHostels = 0;
  let underSetup = 0;
  let inactiveHostels = 0;
  let totalBedCapacity = 0;
  let totalOccupied = 0;

  const genderMap = new Map<HostelGenderUi, { count: number; beds: number }>();
  const campuses = new Set<string>();

  for (const row of rows) {
    campuses.add(row.campusZone);
    if (row.status === 'Active') activeHostels += 1;
    else if (row.status === 'Under Setup') underSetup += 1;
    else inactiveHostels += 1;

    totalBedCapacity += row.totalBeds;
    totalOccupied += row.occupiedBeds;

    const g = genderMap.get(row.genderCategory) ?? { count: 0, beds: 0 };
    g.count += 1;
    g.beds += row.totalBeds;
    genderMap.set(row.genderCategory, g);
  }

  const boysBeds = genderMap.get("Boys' Hostel")?.beds ?? 0;
  const girlsBeds = genderMap.get("Girls' Hostel")?.beds ?? 0;
  const genderBedTotal = boysBeds + girlsBeds;

  const averageOccupancyPct =
    totalBedCapacity > 0 ? Math.round((totalOccupied / totalBedCapacity) * 1000) / 10 : null;

  return {
    generatedAt: new Date().toISOString(),
    totalHostels: rows.length,
    activeHostels,
    underSetup,
    inactiveHostels,
    totalBedCapacity,
    averageOccupancyPct,
    boysBedsSharePct: genderBedTotal > 0 ? Math.round((boysBeds / genderBedTotal) * 1000) / 10 : null,
    girlsBedsSharePct: genderBedTotal > 0 ? Math.round((girlsBeds / genderBedTotal) * 1000) / 10 : null,
    byGender: (["Boys' Hostel", "Girls' Hostel"] as const)
      .map((label) => ({
        label,
        count: genderMap.get(label)?.count ?? 0,
        beds: genderMap.get(label)?.beds ?? 0,
      }))
      .filter((row) => row.count > 0),
    facets: {
      campuses: [...campuses].sort(),
      genders: ["Boys' Hostel", "Girls' Hostel"],
    },
  };
}

export async function getHostelDirectoryById(
  prisma: PrismaClient,
  hostelId: string,
): Promise<HostelDirectoryRow | null> {
  const hostel = await prisma.hostel.findUnique({
    where: { id: hostelId },
    include: hostelTreeInclude,
  });
  if (!hostel) {
    return null;
  }
  return aggregateHostel(hostel);
}

export async function listHostelDirectory(
  prisma: PrismaClient,
  query: HostelDirectoryListQuery,
): Promise<{
  hostels: HostelDirectoryRow[];
  pagination: ReturnType<typeof buildPaginationMeta>;
}> {
  const tree = await loadHostelTree(prisma);
  let rows = tree.map(aggregateHostel);

  if (query.q?.trim()) {
    const term = query.q.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.hostelCode.toLowerCase().includes(term) ||
        r.address.toLowerCase().includes(term) ||
        r.wardenName.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term),
    );
  }

  if (query.gender?.trim() && query.gender !== 'All Categories') {
    rows = rows.filter((r) => r.genderCategory === query.gender);
  }

  if (query.campus?.trim() && query.campus !== 'All Campus Zones') {
    rows = rows.filter((r) => r.campusZone === query.campus);
  }

  if (query.status) {
    rows = rows.filter((r) => r.status === query.status);
  }

  if (query.occupancy?.trim() && query.occupancy !== 'All Occupancy') {
    rows = rows.filter((r) => matchesOccupancyFilter(occupancyPct(r), query.occupancy!.trim()));
  }

  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
  const { limit: safeLimit, skip } = normalizePagination(page, limit);
  const total = rows.length;
  const pageRows = rows.slice(skip, skip + safeLimit);

  return {
    hostels: pageRows,
    pagination: buildPaginationMeta(page, safeLimit, total),
  };
}
