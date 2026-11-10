export type HostelGenderCategory = "Boys' Hostel" | "Girls' Hostel";
export type HostelStatus = 'Active' | 'Under Setup' | 'Inactive';

export type HostelBuildingSummary = {
  name: string;
  blocks: number;
  floors: number;
  rooms: number;
};

export type HostelRecord = {
  id: string;
  hostelCode: string;
  name: string;
  genderCategory: HostelGenderCategory;
  campusZone: string;
  address: string;
  status: HostelStatus;
  description: string;
  imageUrl?: string;
  wardenName: string;
  wardenEmail: string;
  contactPhone: string;
  yearEstablished: number;
  facilities: string[];
  buildings: HostelBuildingSummary[];
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
  modificationHistory: { date: string; user: string; note: string }[];
};

export const HOSTEL_STATS = {
  totalHostels: 5,
  activeHostels: 3,
  underSetup: 1,
  inactiveHostels: 1,
  totalBedCapacity: 540,
  averageOccupancyPct: 76.3,
} as const;

export const GENDER_OVERVIEW = [
  { label: "Boys' Hostel", count: 2, beds: 280 },
  { label: "Girls' Hostel", count: 3, beds: 260 },
] as const;

export const HOSTEL_STATUS_FILTERS = ['All Status', 'Active', 'Under Setup', 'Inactive'] as const;
export const HOSTEL_GENDER_FILTERS = ['All Categories', "Boys' Hostel", "Girls' Hostel"] as const;
export const HOSTEL_CAMPUS_FILTERS = [
  'All Campus Zones',
  'North Campus',
  'South Campus',
  'East Annex',
] as const;
export const HOSTEL_OCCUPANCY_FILTERS = [
  'All Occupancy',
  'Above 85%',
  '65% – 85%',
  'Below 65%',
] as const;

export const HOSTEL_FACILITY_OPTIONS = [
  '24×7 Security',
  'CCTV Surveillance',
  'Dining Hall',
  'Laundry',
  'Medical Room',
  'Study Hall',
  'Visitor Lounge',
  'Wi-Fi Campus',
  'Gym Access',
  'Parking Zone',
] as const;

export const WARDEN_ASSIGN_OPTIONS = [
  'Unassigned',
  'Dr. Meera Nair',
  'Mr. Rajesh Kumar',
  'Mrs. Anita Sharma',
  'Mr. Vikram Patel',
] as const;

export function generateHostelCode(nextIndex: number): string {
  return `HST-${String(nextIndex).padStart(3, '0')}`;
}

export function hostelOccupancyPct(record: HostelRecord): number {
  if (record.totalBeds === 0) return 0;
  return Math.round((record.occupiedBeds / record.totalBeds) * 1000) / 10;
}

export function formatHostelDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function matchesOccupancyFilter(record: HostelRecord, filter: string): boolean {
  const pct = hostelOccupancyPct(record);
  if (filter === 'All Occupancy') return true;
  if (filter === 'Above 85%') return pct > 85;
  if (filter === '65% – 85%') return pct >= 65 && pct <= 85;
  if (filter === 'Below 65%') return pct < 65;
  return true;
}

export const SAMPLE_HOSTELS: HostelRecord[] = [
  {
    id: 'hst1',
    hostelCode: 'HST-001',
    name: 'Boys Hostel A',
    genderCategory: "Boys' Hostel",
    campusZone: 'North Campus',
    address: 'Block A, North Campus Road, Sector 12',
    status: 'Active',
    description:
      'Primary undergraduate boys residence with dining annex and sports courtyard. Gender classification is enforced for all child buildings.',
    wardenName: 'Mr. Rajesh Kumar',
    wardenEmail: 'rajesh.kumar@nestora.edu',
    contactPhone: '+91 98765 43210',
    yearEstablished: 1998,
    facilities: ['24×7 Security', 'CCTV Surveillance', 'Dining Hall', 'Study Hall', 'Wi-Fi Campus'],
    buildings: [
      { name: 'Building Alpha', blocks: 2, floors: 4, rooms: 62 },
      { name: 'Building Beta', blocks: 1, floors: 3, rooms: 28 },
    ],
    totalBuildings: 2,
    totalBlocks: 3,
    totalFloors: 7,
    totalRooms: 90,
    totalBeds: 220,
    occupiedBeds: 178,
    availableBeds: 42,
    createdBy: 'Admin — Priya Menon',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2025-10-28T14:22:00Z',
    modificationHistory: [
      { date: '2025-10-28', user: 'Priya Menon', note: 'Updated warden assignment' },
      { date: '2025-06-01', user: 'System', note: 'Synced bed counts from room inventory' },
    ],
  },
  {
    id: 'hst2',
    hostelCode: 'HST-002',
    name: 'Girls Hostel B',
    genderCategory: "Girls' Hostel",
    campusZone: 'South Campus',
    address: 'Lotus Wing, South Campus Avenue',
    status: 'Active',
    description:
      'Flagship girls residence with attached medical room and visitor lounge. Blocks inherit girls hostel classification.',
    wardenName: 'Dr. Meera Nair',
    wardenEmail: 'meera.nair@nestora.edu',
    contactPhone: '+91 98765 43211',
    yearEstablished: 2001,
    facilities: ['24×7 Security', 'Medical Room', 'Visitor Lounge', 'Laundry', 'Wi-Fi Campus'],
    buildings: [{ name: 'Lotus Block', blocks: 2, floors: 5, rooms: 84 }],
    totalBuildings: 1,
    totalBlocks: 2,
    totalFloors: 5,
    totalRooms: 84,
    totalBeds: 210,
    occupiedBeds: 168,
    availableBeds: 42,
    createdBy: 'Admin — Priya Menon',
    createdAt: '2024-01-12T10:05:00Z',
    updatedAt: '2025-11-02T09:15:00Z',
    modificationHistory: [
      { date: '2025-11-02', user: 'Dr. Meera Nair', note: 'Added visitor lounge facility tag' },
    ],
  },
  {
    id: 'hst3',
    hostelCode: 'HST-003',
    name: 'Graduate Wing C',
    genderCategory: "Boys' Hostel",
    campusZone: 'East Annex',
    address: 'Graduate Housing, East Annex Lane 4',
    status: 'Active',
    description:
      'Postgraduate and research scholars wing with quiet hours policy and dedicated study hall.',
    wardenName: 'Mr. Vikram Patel',
    wardenEmail: 'vikram.patel@nestora.edu',
    contactPhone: '+91 98765 43212',
    yearEstablished: 2015,
    facilities: ['Study Hall', 'Wi-Fi Campus', 'Laundry', 'Gym Access'],
    buildings: [{ name: 'Grad Tower', blocks: 1, floors: 4, rooms: 44 }],
    totalBuildings: 1,
    totalBlocks: 1,
    totalFloors: 4,
    totalRooms: 44,
    totalBeds: 110,
    occupiedBeds: 64,
    availableBeds: 46,
    createdBy: 'Admin — Arjun Das',
    createdAt: '2024-03-18T11:00:00Z',
    updatedAt: '2025-09-20T16:40:00Z',
    modificationHistory: [
      { date: '2025-09-20', user: 'Arjun Das', note: 'Expanded study hall hours in policy note' },
    ],
  },
  {
    id: 'hst4',
    hostelCode: 'HST-004',
    name: 'International Wing D',
    genderCategory: "Girls' Hostel",
    campusZone: 'North Campus',
    address: 'International House, North Campus Gate 3',
    status: 'Under Setup',
    description:
      'New exchange-student facility under fit-out. Rooms cannot be allocated until status is Active.',
    wardenName: 'Unassigned',
    wardenEmail: '—',
    contactPhone: '—',
    yearEstablished: 2025,
    facilities: ['CCTV Surveillance', 'Visitor Lounge'],
    buildings: [{ name: 'International Block', blocks: 1, floors: 3, rooms: 0 }],
    totalBuildings: 1,
    totalBlocks: 1,
    totalFloors: 3,
    totalRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    createdBy: 'Admin — Priya Menon',
    createdAt: '2025-08-01T08:00:00Z',
    updatedAt: '2025-10-15T12:00:00Z',
    modificationHistory: [
      { date: '2025-10-15', user: 'Priya Menon', note: 'Marked under setup pending fire safety clearance' },
    ],
  },
  {
    id: 'hst5',
    hostelCode: 'HST-005',
    name: 'Heritage Annex',
    genderCategory: "Girls' Hostel",
    campusZone: 'South Campus',
    address: 'Heritage Block, South Campus Rear',
    status: 'Inactive',
    description:
      'Decommissioned for new construction. Existing room records retain historical configuration; no new allocations.',
    wardenName: 'Mrs. Anita Sharma',
    wardenEmail: 'anita.sharma@nestora.edu',
    contactPhone: '+91 98765 43219',
    yearEstablished: 1975,
    facilities: ['24×7 Security'],
    buildings: [{ name: 'Heritage Block', blocks: 1, floors: 2, rooms: 12 }],
    totalBuildings: 1,
    totalBlocks: 1,
    totalFloors: 2,
    totalRooms: 12,
    totalBeds: 36,
    occupiedBeds: 0,
    availableBeds: 0,
    createdBy: 'Legacy import',
    createdAt: '2020-05-01T00:00:00Z',
    updatedAt: '2025-04-10T10:00:00Z',
    modificationHistory: [
      { date: '2025-04-10', user: 'Priya Menon', note: 'Deactivated — retain historical beds' },
    ],
  },
];

export function getHostelById(id: string): HostelRecord | undefined {
  return SAMPLE_HOSTELS.find((h) => h.id === id);
}

export function canDeleteHostel(record: HostelRecord): boolean {
  return record.totalRooms === 0 && record.occupiedBeds === 0;
}
