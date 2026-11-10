export type BedStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export type BedType =
  | 'Single Bed'
  | 'Bunk Bed — Upper'
  | 'Bunk Bed — Lower'
  | 'Other';

export type BedStudentAssignment = {
  name: string;
  studentId: string;
};

export type BedReservation = {
  reference: string;
  reviewDate: string;
  note?: string;
};

export type BedStatusChange = {
  id: string;
  date: string;
  from: BedStatus | '—';
  to: BedStatus;
  actor: string;
  note?: string;
};

export type BedMaintenanceEntry = {
  id: string;
  date: string;
  title: string;
  status: 'Open' | 'Resolved';
  notes?: string;
};

export type BedRecord = {
  id: string;
  bedId: string;
  hostel: string;
  block: string;
  floor: string;
  roomNumber: string;
  roomId: string;
  bedNumber: string;
  bedLabel: string;
  bedType: BedType;
  status: BedStatus;
  student: BedStudentAssignment | null;
  allocationDate: string | null;
  expectedCheckout: string | null;
  reservation: BedReservation | null;
  roomUnderMaintenance: boolean;
  maintenanceHistory: BedMaintenanceEntry[];
  statusHistory: BedStatusChange[];
  description?: string;
};

export const BED_INVENTORY_STATS = {
  totalBeds: 540,
  occupied: 412,
  available: 98,
  reserved: 20,
  maintenance: 10,
} as const;

export const HOSTEL_BED_AVAILABILITY = [
  { hostel: 'Boys Hostel A', available: 42, total: 220 },
  { hostel: 'Girls Hostel B', available: 38, total: 210 },
  { hostel: 'Graduate Wing C', available: 18, total: 110 },
] as const;

export const BED_HOSTEL_FILTER_OPTIONS = [
  'All Hostels',
  'Boys Hostel A',
  'Girls Hostel B',
  'Graduate Wing C',
] as const;

export const BED_BLOCK_FILTER_OPTIONS = ['All Blocks', 'Block A', 'Block B', 'Block C'] as const;
export const BED_FLOOR_FILTER_OPTIONS = ['All Floors', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'] as const;
export const BED_STATUS_FILTER_OPTIONS = ['All Status', 'Available', 'Occupied', 'Reserved', 'Maintenance'] as const;
export const BED_TYPE_OPTIONS: BedType[] = [
  'Single Bed',
  'Bunk Bed — Upper',
  'Bunk Bed — Lower',
  'Other',
];
export const BED_STATUS_OPTIONS: BedStatus[] = ['Available', 'Occupied', 'Reserved', 'Maintenance'];

export const ROOM_PICKER_OPTIONS = [
  { roomNumber: 'A-101', hostel: 'Boys Hostel A', block: 'Block A', floor: '1st Floor', roomId: 'r1' },
  { roomNumber: 'A-102', hostel: 'Boys Hostel A', block: 'Block A', floor: '1st Floor', roomId: 'r2' },
  { roomNumber: 'A-103', hostel: 'Boys Hostel A', block: 'Block A', floor: '1st Floor', roomId: 'r3' },
  { roomNumber: 'B-201', hostel: 'Girls Hostel B', block: 'Block B', floor: '2nd Floor', roomId: 'r4' },
  { roomNumber: 'B-202', hostel: 'Girls Hostel B', block: 'Block B', floor: '2nd Floor', roomId: 'r5' },
] as const;

export function bedInventoryOccupancyPercent(): number {
  return Math.round((BED_INVENTORY_STATS.occupied / BED_INVENTORY_STATS.totalBeds) * 1000) / 10;
}

export function isBedAllocatable(bed: BedRecord): boolean {
  if (bed.roomUnderMaintenance) {
    return false;
  }
  if (bed.status === 'Maintenance' || bed.status === 'Occupied') {
    return false;
  }
  return bed.status === 'Available' || bed.status === 'Reserved';
}

export function generateBedId(roomNumber: string, bedNumber: string): string {
  const num = bedNumber.replace(/\D/g, '').padStart(2, '0') || '01';
  return `BED-${roomNumber}-${num}`;
}

export const SAMPLE_BEDS: BedRecord[] = [
  {
    id: 'b1',
    bedId: 'BED-A101-01',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    floor: '1st Floor',
    roomNumber: 'A-101',
    roomId: 'r1',
    bedNumber: '01',
    bedLabel: 'Bed 01',
    bedType: 'Single Bed',
    status: 'Occupied',
    student: { name: 'Aarav Sharma', studentId: 'STU-001' },
    allocationDate: '2025-08-01',
    expectedCheckout: '2026-06-30',
    reservation: null,
    roomUnderMaintenance: false,
    maintenanceHistory: [],
    statusHistory: [
      { id: 'sh1', date: '2025-08-01', from: 'Available', to: 'Occupied', actor: 'Admin · Priya N.', note: 'Allocation STU-001' },
    ],
  },
  {
    id: 'b2',
    bedId: 'BED-A101-02',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    floor: '1st Floor',
    roomNumber: 'A-101',
    roomId: 'r1',
    bedNumber: '02',
    bedLabel: 'Bed 02',
    bedType: 'Single Bed',
    status: 'Occupied',
    student: { name: 'Rohan Das', studentId: 'STU-008' },
    allocationDate: '2025-08-15',
    expectedCheckout: '2026-06-30',
    reservation: null,
    roomUnderMaintenance: false,
    maintenanceHistory: [],
    statusHistory: [
      { id: 'sh2', date: '2025-08-15', from: 'Available', to: 'Occupied', actor: 'Warden · Rajesh K.' },
    ],
  },
  {
    id: 'b3',
    bedId: 'BED-A102-01',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    floor: '1st Floor',
    roomNumber: 'A-102',
    roomId: 'r2',
    bedNumber: '01',
    bedLabel: 'Bed 01',
    bedType: 'Single Bed',
    status: 'Available',
    student: null,
    allocationDate: null,
    expectedCheckout: null,
    reservation: null,
    roomUnderMaintenance: false,
    maintenanceHistory: [],
    statusHistory: [],
  },
  {
    id: 'b4',
    bedId: 'BED-A102-02',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    floor: '1st Floor',
    roomNumber: 'A-102',
    roomId: 'r2',
    bedNumber: '02',
    bedLabel: 'Bed 02',
    bedType: 'Single Bed',
    status: 'Reserved',
    student: null,
    allocationDate: null,
    expectedCheckout: null,
    reservation: {
      reference: 'RES-2026-0412',
      reviewDate: '2026-03-18',
      note: 'Approved transfer from A-210',
    },
    roomUnderMaintenance: false,
    maintenanceHistory: [],
    statusHistory: [
      { id: 'sh4', date: '2026-03-10', from: 'Available', to: 'Reserved', actor: 'Admin · Priya N.' },
    ],
  },
  {
    id: 'b5',
    bedId: 'BED-B201-01',
    hostel: 'Girls Hostel B',
    block: 'Block B',
    floor: '2nd Floor',
    roomNumber: 'B-201',
    roomId: 'r4',
    bedNumber: '01',
    bedLabel: 'Bed 01',
    bedType: 'Single Bed',
    status: 'Maintenance',
    student: null,
    allocationDate: null,
    expectedCheckout: null,
    reservation: null,
    roomUnderMaintenance: false,
    maintenanceHistory: [
      { id: 'mh1', date: '2026-03-05', title: 'Mattress replacement', status: 'Open' },
    ],
    statusHistory: [
      { id: 'sh5', date: '2026-03-05', from: 'Available', to: 'Maintenance', actor: 'Maintenance · Arjun M.' },
    ],
  },
  {
    id: 'b6',
    bedId: 'BED-B201-02',
    hostel: 'Girls Hostel B',
    block: 'Block B',
    floor: '2nd Floor',
    roomNumber: 'B-201',
    roomId: 'r4',
    bedNumber: '02',
    bedLabel: 'Bed 02',
    bedType: 'Single Bed',
    status: 'Available',
    student: null,
    allocationDate: null,
    expectedCheckout: null,
    reservation: null,
    roomUnderMaintenance: false,
    maintenanceHistory: [],
    statusHistory: [],
  },
  {
    id: 'b7',
    bedId: 'BED-B202-01',
    hostel: 'Girls Hostel B',
    block: 'Block B',
    floor: '2nd Floor',
    roomNumber: 'B-202',
    roomId: 'r5',
    bedNumber: '01',
    bedLabel: 'Bed 01',
    bedType: 'Single Bed',
    status: 'Maintenance',
    student: null,
    allocationDate: null,
    expectedCheckout: null,
    reservation: null,
    roomUnderMaintenance: true,
    maintenanceHistory: [],
    statusHistory: [
      {
        id: 'sh7',
        date: '2026-03-01',
        from: 'Available',
        to: 'Maintenance',
        actor: 'System',
        note: 'Room B-202 under maintenance — beds blocked',
      },
    ],
  },
  {
    id: 'b8',
    bedId: 'BED-A103-01',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    floor: '1st Floor',
    roomNumber: 'A-103',
    roomId: 'r3',
    bedNumber: '01',
    bedLabel: 'Bed 01',
    bedType: 'Single Bed',
    status: 'Available',
    student: null,
    allocationDate: null,
    expectedCheckout: null,
    reservation: null,
    roomUnderMaintenance: false,
    maintenanceHistory: [],
    statusHistory: [],
  },
];

export const BED_ROOM_FILTER_OPTIONS = ['All Rooms', ...Array.from(new Set(SAMPLE_BEDS.map((b) => b.roomNumber)))];

export function getBedById(id: string): BedRecord | undefined {
  return SAMPLE_BEDS.find((b) => b.id === id || b.bedId === id);
}

export function formatBedDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export const BED_STATUS_HINTS: Record<BedStatus, string> = {
  Available: 'Ready for allocation',
  Occupied: 'Student assigned',
  Reserved: 'Temporarily held',
  Maintenance: 'Unavailable until repair',
};
