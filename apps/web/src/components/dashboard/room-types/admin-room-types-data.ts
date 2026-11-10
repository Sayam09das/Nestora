export type RoomTypeStatus = 'Active' | 'Inactive';
export type RoomCategory = 'General' | 'Standard' | 'Premium' | 'Deluxe' | 'Special';
export type BedConfiguration = 'Single Bed' | 'Bunk Bed' | 'Mixed Bed Configuration';

export type HostelTypeUsage = {
  hostel: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
};

export type RoomTypeHistoryEntry = {
  id: string;
  date: string;
  actor: string;
  change: string;
};

export type RoomTypeRecord = {
  id: string;
  typeCode: string;
  name: string;
  category: RoomCategory;
  description: string;
  maxCapacity: number;
  bedCount: number;
  bedConfiguration: BedConfiguration;
  facilities: string[];
  bathroomType: 'Attached' | 'Shared';
  hasAC: boolean;
  totalRooms: number;
  monthlyPriceInr: number;
  securityDepositInr: number | null;
  additionalChargesNote?: string;
  status: RoomTypeStatus;
  imageUrl?: string;
  hostelUsage: HostelTypeUsage[];
  createdBy: string;
  createdDate: string;
  lastUpdated: string;
  history: RoomTypeHistoryEntry[];
};

export const ROOM_TYPE_STATS = {
  totalTypes: 12,
  activeTypes: 10,
  inactiveTypes: 2,
  totalRoomCapacity: 680,
  averageRoomCapacity: 3,
} as const;

export const CATEGORY_OVERVIEW = [
  { category: 'General' as RoomCategory, count: 5 },
  { category: 'Standard' as RoomCategory, count: 2 },
  { category: 'Premium' as RoomCategory, count: 3 },
  { category: 'Deluxe' as RoomCategory, count: 1 },
  { category: 'Special' as RoomCategory, count: 1 },
] as const;

export const ROOM_TYPE_HOSTEL_FILTERS = ['All Hostels', 'Boys Hostel A', 'Girls Hostel B', 'Graduate Wing C'] as const;
export const ROOM_TYPE_CATEGORY_FILTERS = [
  'All Categories',
  'General',
  'Standard',
  'Premium',
  'Deluxe',
  'Special',
] as const;
export const ROOM_TYPE_CAPACITY_FILTERS = ['All Capacity', '1 Student', '2 Students', '3 Students', '4+ Students'] as const;
export const ROOM_TYPE_PRICE_FILTERS = ['All Pricing', 'Under ₹4,000', '₹4,000 – ₹6,000', 'Above ₹6,000'] as const;
export const ROOM_TYPE_STATUS_FILTERS = ['All Status', 'Active', 'Inactive'] as const;

export const ROOM_CATEGORY_OPTIONS: RoomCategory[] = ['General', 'Standard', 'Premium', 'Deluxe', 'Special'];
export const BED_CONFIGURATION_OPTIONS: BedConfiguration[] = [
  'Single Bed',
  'Bunk Bed',
  'Mixed Bed Configuration',
];
export const FACILITY_OPTIONS = [
  'Attached Bathroom',
  'Shared Bathroom',
  'Air Conditioning',
  'Study Table',
  'Wardrobe',
  'Wi-Fi',
  'Balcony',
  'Fan',
  'Hot Water',
  'Laundry Access',
] as const;

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateTypeCode(seq: number): string {
  return `RT-${String(seq).padStart(3, '0')}`;
}

function baseUsage(hostel: string, rooms: number, occRate: number): HostelTypeUsage {
  const totalBeds = rooms * 3; // illustrative avg
  const occupiedBeds = Math.round(totalBeds * occRate);
  return {
    hostel,
    totalRooms: rooms,
    totalBeds,
    occupiedBeds,
    availableBeds: totalBeds - occupiedBeds,
  };
}

export const SAMPLE_ROOM_TYPES: RoomTypeRecord[] = [
  {
    id: 'rt1',
    typeCode: 'RT-001',
    name: 'Single Occupancy',
    category: 'General',
    description: 'Private room with single bed for one student.',
    maxCapacity: 1,
    bedCount: 1,
    bedConfiguration: 'Single Bed',
    facilities: ['Attached Bathroom', 'Study Table', 'Wardrobe', 'Wi-Fi', 'Fan'],
    bathroomType: 'Attached',
    hasAC: false,
    totalRooms: 48,
    monthlyPriceInr: 8000,
    securityDepositInr: 5000,
    status: 'Active',
    hostelUsage: [
      baseUsage('Boys Hostel A', 28, 0.92),
      baseUsage('Girls Hostel B', 20, 0.88),
    ],
    createdBy: 'Admin · Priya N.',
    createdDate: '2024-06-01',
    lastUpdated: '2026-01-12',
    history: [{ id: 'h1', date: '2026-01-12', actor: 'Admin', change: 'Monthly price updated to ₹8,000 (effective new allocations)' }],
  },
  {
    id: 'rt2',
    typeCode: 'RT-002',
    name: 'Double Sharing',
    category: 'General',
    description: 'Two single beds for double sharing.',
    maxCapacity: 2,
    bedCount: 2,
    bedConfiguration: 'Single Bed',
    facilities: ['Shared Bathroom', 'Study Table', 'Wardrobe', 'Wi-Fi', 'Fan'],
    bathroomType: 'Shared',
    hasAC: false,
    totalRooms: 120,
    monthlyPriceInr: 5500,
    securityDepositInr: 4000,
    status: 'Active',
    hostelUsage: [
      baseUsage('Boys Hostel A', 70, 0.95),
      baseUsage('Girls Hostel B', 50, 0.9),
    ],
    createdBy: 'Admin · Priya N.',
    createdDate: '2024-06-01',
    lastUpdated: '2025-11-20',
    history: [],
  },
  {
    id: 'rt3',
    typeCode: 'RT-003',
    name: 'Triple Sharing',
    category: 'General',
    description: 'Three-bed configuration for economical accommodation.',
    maxCapacity: 3,
    bedCount: 3,
    bedConfiguration: 'Single Bed',
    facilities: ['Shared Bathroom', 'Study Table', 'Wardrobe', 'Wi-Fi', 'Laundry Access'],
    bathroomType: 'Shared',
    hasAC: false,
    totalRooms: 95,
    monthlyPriceInr: 4000,
    securityDepositInr: 3000,
    status: 'Active',
    hostelUsage: [baseUsage('Boys Hostel A', 55, 0.88), baseUsage('Graduate Wing C', 40, 0.82)],
    createdBy: 'Warden · Rajesh K.',
    createdDate: '2024-07-15',
    lastUpdated: '2026-02-01',
    history: [],
  },
  {
    id: 'rt4',
    typeCode: 'RT-004',
    name: 'Four Sharing',
    category: 'Premium',
    description: 'Four-bed room with upgraded common amenities.',
    maxCapacity: 4,
    bedCount: 4,
    bedConfiguration: 'Mixed Bed Configuration',
    facilities: ['Shared Bathroom', 'Study Table', 'Wardrobe', 'Wi-Fi', 'Hot Water'],
    bathroomType: 'Shared',
    hasAC: false,
    totalRooms: 42,
    monthlyPriceInr: 3000,
    securityDepositInr: 2500,
    status: 'Active',
    hostelUsage: [baseUsage('Boys Hostel A', 42, 0.86)],
    createdBy: 'Admin · Priya N.',
    createdDate: '2024-08-01',
    lastUpdated: '2025-12-10',
    history: [],
  },
  {
    id: 'rt5',
    typeCode: 'RT-005',
    name: 'AC Single Deluxe',
    category: 'Deluxe',
    description: 'Single occupancy with air conditioning and attached bath.',
    maxCapacity: 1,
    bedCount: 1,
    bedConfiguration: 'Single Bed',
    facilities: ['Attached Bathroom', 'Air Conditioning', 'Study Table', 'Wardrobe', 'Wi-Fi', 'Balcony'],
    bathroomType: 'Attached',
    hasAC: true,
    totalRooms: 18,
    monthlyPriceInr: 12000,
    securityDepositInr: 8000,
    additionalChargesNote: 'AC metered above 8 hrs/day',
    status: 'Active',
    hostelUsage: [baseUsage('Girls Hostel B', 18, 0.94)],
    createdBy: 'Admin · Priya N.',
    createdDate: '2025-01-10',
    lastUpdated: '2026-03-01',
    history: [],
  },
  {
    id: 'rt6',
    typeCode: 'RT-006',
    name: 'Bunk Standard',
    category: 'Standard',
    description: 'Bunk bed layout for two students.',
    maxCapacity: 2,
    bedCount: 2,
    bedConfiguration: 'Bunk Bed',
    facilities: ['Shared Bathroom', 'Study Table', 'Wardrobe', 'Fan'],
    bathroomType: 'Shared',
    hasAC: false,
    totalRooms: 36,
    monthlyPriceInr: 4800,
    securityDepositInr: 3500,
    status: 'Active',
    hostelUsage: [baseUsage('Boys Hostel A', 36, 0.91)],
    createdBy: 'Facilities · Arjun M.',
    createdDate: '2025-03-22',
    lastUpdated: '2025-10-05',
    history: [],
  },
  {
    id: 'rt7',
    typeCode: 'RT-007',
    name: 'Premium Twin',
    category: 'Premium',
    description: 'Twin single beds, premium wing.',
    maxCapacity: 2,
    bedCount: 2,
    bedConfiguration: 'Single Bed',
    facilities: ['Attached Bathroom', 'Air Conditioning', 'Study Table', 'Wardrobe', 'Wi-Fi'],
    bathroomType: 'Attached',
    hasAC: true,
    totalRooms: 24,
    monthlyPriceInr: 7200,
    securityDepositInr: 5000,
    status: 'Active',
    hostelUsage: [baseUsage('Graduate Wing C', 24, 0.89)],
    createdBy: 'Admin · Priya N.',
    createdDate: '2025-04-01',
    lastUpdated: '2026-01-18',
    history: [],
  },
  {
    id: 'rt8',
    typeCode: 'RT-008',
    name: 'Scholarship Block',
    category: 'Special',
    description: 'Subsidised configuration for scholarship holders.',
    maxCapacity: 3,
    bedCount: 3,
    bedConfiguration: 'Single Bed',
    facilities: ['Shared Bathroom', 'Study Table', 'Wardrobe', 'Wi-Fi', 'Laundry Access'],
    bathroomType: 'Shared',
    hasAC: false,
    totalRooms: 30,
    monthlyPriceInr: 2500,
    securityDepositInr: 1500,
    status: 'Active',
    hostelUsage: [baseUsage('Boys Hostel A', 30, 0.97)],
    createdBy: 'Finance · Kavita N.',
    createdDate: '2025-05-12',
    lastUpdated: '2025-11-01',
    history: [],
  },
  {
    id: 'rt9',
    typeCode: 'RT-009',
    name: 'Standard Triple',
    category: 'Standard',
    description: 'Standard triple-sharing across blocks.',
    maxCapacity: 3,
    bedCount: 3,
    bedConfiguration: 'Single Bed',
    facilities: ['Shared Bathroom', 'Study Table', 'Wardrobe', 'Fan', 'Hot Water'],
    bathroomType: 'Shared',
    hasAC: false,
    totalRooms: 52,
    monthlyPriceInr: 3800,
    securityDepositInr: 2800,
    status: 'Active',
    hostelUsage: [baseUsage('Girls Hostel B', 52, 0.85)],
    createdBy: 'Warden · Meena I.',
    createdDate: '2025-06-01',
    lastUpdated: '2025-12-20',
    history: [],
  },
  {
    id: 'rt10',
    typeCode: 'RT-010',
    name: 'Premium Quad',
    category: 'Premium',
    description: 'Four sharing with study cluster layout.',
    maxCapacity: 4,
    bedCount: 4,
    bedConfiguration: 'Mixed Bed Configuration',
    facilities: ['Shared Bathroom', 'Study Table', 'Wardrobe', 'Wi-Fi'],
    bathroomType: 'Shared',
    hasAC: false,
    totalRooms: 20,
    monthlyPriceInr: 3200,
    securityDepositInr: 2200,
    status: 'Active',
    hostelUsage: [baseUsage('Graduate Wing C', 20, 0.8)],
    createdBy: 'Admin · Priya N.',
    createdDate: '2025-07-08',
    lastUpdated: '2026-02-14',
    history: [],
  },
  {
    id: 'rt11',
    typeCode: 'RT-011',
    name: 'Legacy Twin (2019)',
    category: 'General',
    description: 'Retired layout — kept for historical rooms only.',
    maxCapacity: 2,
    bedCount: 2,
    bedConfiguration: 'Single Bed',
    facilities: ['Shared Bathroom', 'Fan'],
    bathroomType: 'Shared',
    hasAC: false,
    totalRooms: 8,
    monthlyPriceInr: 4500,
    securityDepositInr: null,
    status: 'Inactive',
    hostelUsage: [baseUsage('Boys Hostel A', 8, 0.5)],
    createdBy: 'System migration',
    createdDate: '2019-04-01',
    lastUpdated: '2025-08-01',
    history: [{ id: 'h11', date: '2025-08-01', actor: 'Admin', change: 'Deactivated — no new room assignments' }],
  },
  {
    id: 'rt12',
    typeCode: 'RT-012',
    name: 'Pilot AC Quad',
    category: 'Premium',
    description: 'Pilot programme ended; existing rooms retain config.',
    maxCapacity: 4,
    bedCount: 4,
    bedConfiguration: 'Bunk Bed',
    facilities: ['Attached Bathroom', 'Air Conditioning', 'Wi-Fi'],
    bathroomType: 'Attached',
    hasAC: true,
    totalRooms: 4,
    monthlyPriceInr: 6500,
    securityDepositInr: 4000,
    status: 'Inactive',
    hostelUsage: [baseUsage('Girls Hostel B', 4, 0.75)],
    createdBy: 'Admin · Priya N.',
    createdDate: '2023-11-01',
    lastUpdated: '2025-06-15',
    history: [{ id: 'h12', date: '2025-06-15', actor: 'Admin', change: 'Marked inactive after pilot review' }],
  },
];

export function getRoomTypeById(id: string): RoomTypeRecord | undefined {
  return SAMPLE_ROOM_TYPES.find((r) => r.id === id || r.typeCode === id);
}

export function formatRoomTypeDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function aggregateUsage(record: RoomTypeRecord) {
  return record.hostelUsage.reduce(
    (acc, row) => ({
      totalRooms: acc.totalRooms + row.totalRooms,
      totalBeds: acc.totalBeds + row.totalBeds,
      occupiedBeds: acc.occupiedBeds + row.occupiedBeds,
      availableBeds: acc.availableBeds + row.availableBeds,
    }),
    { totalRooms: 0, totalBeds: 0, occupiedBeds: 0, availableBeds: 0 },
  );
}

export function matchesPriceFilter(price: number, filter: string): boolean {
  if (filter === 'All Pricing') return true;
  if (filter === 'Under ₹4,000') return price < 4000;
  if (filter === '₹4,000 – ₹6,000') return price >= 4000 && price <= 6000;
  if (filter === 'Above ₹6,000') return price > 6000;
  return true;
}

export function matchesCapacityFilter(capacity: number, filter: string): boolean {
  if (filter === 'All Capacity') return true;
  if (filter === '1 Student') return capacity === 1;
  if (filter === '2 Students') return capacity === 2;
  if (filter === '3 Students') return capacity === 3;
  if (filter === '4+ Students') return capacity >= 4;
  return true;
}

export function matchesHostelFilter(record: RoomTypeRecord, filter: string): boolean {
  if (filter === 'All Hostels') return true;
  return record.hostelUsage.some((u) => u.hostel === filter);
}
