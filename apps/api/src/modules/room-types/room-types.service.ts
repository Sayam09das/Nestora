import type { PrismaClient } from '@nestora/database';
import type { RoomTypeDirectoryListQuery } from '@nestora/validators';
import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from '../../common/constants/limits.js';
import { buildPaginationMeta, normalizePagination } from '../../common/helpers/index.js';

export type RoomCategory = 'General' | 'Standard' | 'Premium' | 'Deluxe' | 'Special';

export type RoomTypeDirectorySummary = {
  generatedAt: string;
  totalTypes: number;
  activeTypes: number;
  inactiveTypes: number;
  totalRoomCapacity: number;
  averageRoomCapacity: number;
  byCategory: Array<{ category: RoomCategory; count: number }>;
  facets: {
    hostels: string[];
    categories: RoomCategory[];
  };
};

export type RoomTypeDirectoryRow = {
  id: string;
  typeCode: string;
  name: string;
  category: RoomCategory;
  description: string;
  maxCapacity: number;
  bedCount: number;
  bedConfiguration: 'Single Bed' | 'Bunk Bed' | 'Mixed Bed Configuration';
  facilities: string[];
  bathroomType: 'Attached' | 'Shared';
  hasAC: boolean;
  totalRooms: number;
  monthlyPriceInr: number;
  securityDepositInr: number | null;
  status: 'Active' | 'Inactive';
  hostelUsage: Array<{
    hostel: string;
    totalRooms: number;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
  }>;
  createdBy: string;
  createdDate: string;
  lastUpdated: string;
  history: [];
};

function mapCategory(capacity: number, hasAc: boolean): RoomCategory {
  if (hasAc && capacity === 1) {
    return 'Deluxe';
  }
  if (hasAc) {
    return 'Premium';
  }
  if (capacity === 1) {
    return 'Special';
  }
  if (capacity === 2) {
    return 'Standard';
  }
  return 'General';
}

function displayName(description: string, capacity: number, hasAc: boolean): string {
  const sharing = capacity === 1 ? 'Single' : capacity === 2 ? 'Double' : capacity === 3 ? 'Triple' : `${capacity}-Bed`;
  return hasAc ? `${sharing} Sharing (AC)` : `${sharing} Sharing`;
}

function defaultMonthlyPrice(capacity: number, hasAc: boolean): number {
  let base = capacity === 1 ? 8000 : capacity === 2 ? 5500 : 4000;
  if (hasAc) {
    base += 2000;
  }
  return base;
}

function parseCapacityFilter(filter: string): number | null {
  if (filter === '1 Student') return 1;
  if (filter === '2 Students') return 2;
  if (filter === '3 Students') return 3;
  if (filter === '4+ Students') return 4;
  return null;
}

function matchesPriceFilter(price: number, filter: string): boolean {
  if (filter === 'All Pricing' || !filter) return true;
  if (filter === 'Under ₹4,000') return price < 4000;
  if (filter === '₹4,000 – ₹6,000') return price >= 4000 && price <= 6000;
  if (filter === 'Above ₹6,000') return price > 6000;
  return true;
}

type ConfigAgg = {
  configId: string;
  roomCount: number;
  beds: { status: string }[];
  hostels: Map<string, { rooms: number; beds: { status: string }[] }>;
};

async function loadConfigAggregates(prisma: PrismaClient): Promise<Map<string, ConfigAgg>> {
  const rooms = await prisma.room.findMany({
    select: {
      configId: true,
      floor: {
        select: {
          block: {
            select: {
              building: { select: { hostel: { select: { name: true } } } },
            },
          },
        },
      },
      beds: { select: { status: true } },
    },
  });

  const map = new Map<string, ConfigAgg>();
  for (const room of rooms) {
    let agg = map.get(room.configId);
    if (!agg) {
      agg = { configId: room.configId, roomCount: 0, beds: [], hostels: new Map() };
      map.set(room.configId, agg);
    }
    agg.roomCount += 1;
    agg.beds.push(...room.beds);
    const hostelName = room.floor.block.building.hostel.name;
    let hostelAgg = agg.hostels.get(hostelName);
    if (!hostelAgg) {
      hostelAgg = { rooms: 0, beds: [] };
      agg.hostels.set(hostelName, hostelAgg);
    }
    hostelAgg.rooms += 1;
    hostelAgg.beds.push(...room.beds);
  }
  return map;
}

async function monthlyPriceForConfig(prisma: PrismaClient, configId: string, fallback: number): Promise<number> {
  const schedule = await prisma.feeSchedule.findFirst({
    where: { configId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!schedule?.items.length) {
    return fallback;
  }
  const total = schedule.items.reduce((sum, item) => sum + Number(item.amount), 0);
  return total > 0 ? Math.round(total) : fallback;
}

function rowFromConfig(
  config: {
    id: string;
    code: string;
    capacity: number;
    hasAc: boolean;
    description: string;
  },
  agg: ConfigAgg | undefined,
  monthlyPriceInr: number,
): RoomTypeDirectoryRow {
  const totalRooms = agg?.roomCount ?? 0;
  const status = totalRooms > 0 ? 'Active' : 'Inactive';
  const category = mapCategory(config.capacity, config.hasAc);

  const hostelUsage: RoomTypeDirectoryRow['hostelUsage'] = [];
  if (agg) {
    for (const [hostel, h] of agg.hostels) {
      const occupiedBeds = h.beds.filter((b) => b.status === 'OCCUPIED' || b.status === 'RESERVED').length;
      const availableBeds = h.beds.filter((b) => b.status === 'AVAILABLE').length;
      hostelUsage.push({
        hostel,
        totalRooms: h.rooms,
        totalBeds: h.beds.length,
        occupiedBeds,
        availableBeds,
      });
    }
  }

  const facilities = [
    config.hasAc ? 'Air conditioning' : 'Ceiling fan',
    config.capacity === 1 ? 'Attached Bathroom' : 'Shared Bathroom',
    'Study Table',
    'Wardrobe',
    'Wi-Fi',
  ];

  return {
    id: config.id,
    typeCode: config.code,
    name: displayName(config.description, config.capacity, config.hasAc),
    category,
    description: config.description,
    maxCapacity: config.capacity,
    bedCount: config.capacity,
    bedConfiguration: config.capacity <= 1 ? 'Single Bed' : 'Mixed Bed Configuration',
    facilities,
    bathroomType: config.capacity === 1 ? 'Attached' : 'Shared',
    hasAC: config.hasAc,
    totalRooms,
    monthlyPriceInr,
    securityDepositInr: Math.round(monthlyPriceInr * 0.75),
    status,
    hostelUsage: hostelUsage.sort((a, b) => a.hostel.localeCompare(b.hostel)),
    createdBy: 'Nestora catalog',
    createdDate: '2024-06-01',
    lastUpdated: new Date().toISOString().slice(0, 10),
    history: [],
  };
}

export async function getRoomTypeDirectorySummary(prisma: PrismaClient): Promise<RoomTypeDirectorySummary> {
  const [configs, aggregates, hostels] = await Promise.all([
    prisma.roomConfiguration.findMany({ orderBy: { code: 'asc' } }),
    loadConfigAggregates(prisma),
    prisma.hostel.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: 'asc' } }),
  ]);

  let activeTypes = 0;
  let inactiveTypes = 0;
  let totalRoomCapacity = 0;
  let totalRooms = 0;
  const categoryCounts = new Map<RoomCategory, number>();

  for (const config of configs) {
    const agg = aggregates.get(config.id);
    const rooms = agg?.roomCount ?? 0;
    if (rooms > 0) {
      activeTypes += 1;
    } else {
      inactiveTypes += 1;
    }
    totalRooms += rooms;
    totalRoomCapacity += rooms * config.capacity;

    const cat = mapCategory(config.capacity, config.hasAc);
    categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
  }

  const averageRoomCapacity =
    totalRooms > 0 ? Math.round((totalRoomCapacity / totalRooms) * 10) / 10 : 0;

  const byCategory: RoomCategory[] = ['General', 'Standard', 'Premium', 'Deluxe', 'Special'];
  return {
    generatedAt: new Date().toISOString(),
    totalTypes: configs.length,
    activeTypes,
    inactiveTypes,
    totalRoomCapacity,
    averageRoomCapacity,
    byCategory: byCategory
      .map((category) => ({ category, count: categoryCounts.get(category) ?? 0 }))
      .filter((row) => row.count > 0),
    facets: {
      hostels: hostels.map((h) => h.name),
      categories: byCategory.filter((c) => (categoryCounts.get(c) ?? 0) > 0),
    },
  };
}

export async function listRoomTypeDirectory(
  prisma: PrismaClient,
  query: RoomTypeDirectoryListQuery,
): Promise<{
  roomTypes: RoomTypeDirectoryRow[];
  pagination: ReturnType<typeof buildPaginationMeta>;
}> {
  const configs = await prisma.roomConfiguration.findMany({ orderBy: { code: 'asc' } });
  const aggregates = await loadConfigAggregates(prisma);

  const rows: RoomTypeDirectoryRow[] = [];
  for (const config of configs) {
    const fallback = defaultMonthlyPrice(config.capacity, config.hasAc);
    const monthlyPriceInr = await monthlyPriceForConfig(prisma, config.id, fallback);
    rows.push(rowFromConfig(config, aggregates.get(config.id), monthlyPriceInr));
  }

  let filtered = rows;

  if (query.q?.trim()) {
    const term = query.q.trim().toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.typeCode.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term),
    );
  }

  if (query.hostel?.trim() && query.hostel !== 'All Hostels') {
    const hostel = query.hostel.trim();
    filtered = filtered.filter((r) => r.hostelUsage.some((u) => u.hostel === hostel));
  }

  if (query.category?.trim() && query.category !== 'All Categories') {
    filtered = filtered.filter((r) => r.category === query.category);
  }

  const cap = query.capacity?.trim();
  if (cap && cap !== 'All Capacity') {
    const wanted = parseCapacityFilter(cap);
    if (wanted === 4) {
      filtered = filtered.filter((r) => r.maxCapacity >= 4);
    } else if (wanted) {
      filtered = filtered.filter((r) => r.maxCapacity === wanted);
    }
  }

  if (query.price?.trim() && query.price !== 'All Pricing') {
    filtered = filtered.filter((r) => matchesPriceFilter(r.monthlyPriceInr, query.price!.trim()));
  }

  if (query.status) {
    filtered = filtered.filter((r) => r.status === query.status);
  }

  const page = query.page ?? DEFAULT_PAGE;
  const limit = query.limit ?? DEFAULT_PAGE_LIMIT;
  const { limit: safeLimit, skip } = normalizePagination(page, limit);
  const total = filtered.length;
  const pageRows = filtered.slice(skip, skip + safeLimit);

  return {
    roomTypes: pageRows,
    pagination: buildPaginationMeta(page, safeLimit, total),
  };
}
