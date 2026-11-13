export type RoomOperationalStatus = 'Available' | 'Full' | 'Maintenance' | 'Inactive';

export type RoomStudentAllocation = {
  id: string;
  name: string;
  bedLabel: string;
  studentId: string;
};

export type MaintenanceLogEntry = {
  id: string;
  date: string;
  title: string;
  status: 'Open' | 'Resolved';
  notes?: string;
};

export type RoomRecord = {
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
  students: RoomStudentAllocation[];
  maintenanceHistory: MaintenanceLogEntry[];
};

export const ROOM_DIRECTORY_STATS = {
  totalRooms: 240,
  occupiedRooms: 0,
  availableRooms: 240,
  maintenanceRooms: 0,
  totalBeds: 540,
  occupiedBeds: 0,
  availableBeds: 540,
} as const;

export const HOSTEL_FILTER_OPTIONS = ['All Hostels', 'Boys Hostel A', 'Girls Hostel B', 'Graduate Wing C'] as const;
export const BLOCK_FILTER_OPTIONS = ['All Blocks', 'Block A', 'Block B', 'Block C'] as const;
export const FLOOR_FILTER_OPTIONS = ['All Floors', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'] as const;
export const ROOM_TYPE_FILTER_OPTIONS = [
  'All Types',
  'Single Sharing',
  'Double Sharing',
  'Triple Sharing',
  'Quad Sharing',
] as const;
export const ROOM_STATUS_FILTER_OPTIONS = [
  'All Status',
  'Available',
  'Full',
  'Maintenance',
  'Inactive',
] as const;
export const OCCUPANCY_FILTER_OPTIONS = [
  'All Occupancy',
  'Has open beds',
  'Fully occupied',
  'Vacant',
] as const;

export function roomAvailableBeds(room: RoomRecord): number {
  return Math.max(0, room.capacity - room.occupiedBeds);
}

export function roomOccupancyPercent(room: RoomRecord): number {
  if (room.capacity <= 0) {
    return 0;
  }
  return Math.round((room.occupiedBeds / room.capacity) * 1000) / 10;
}

export function isRoomAssignable(room: RoomRecord): boolean {
  return room.operationalStatus === 'Available' && roomAvailableBeds(room) > 0;
}

export const SAMPLE_ROOMS: RoomRecord[] = [
  {
    id: 'r1',
    roomId: 'RM-A-101',
    roomNumber: 'A-101',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    floor: '1st Floor',
    roomType: 'Double Sharing',
    capacity: 2,
    occupiedBeds: 2,
    operationalStatus: 'Full',
    facilities: ['Attached washroom', 'Study desk', 'Wardrobe', 'Ceiling fan'],
    wardenName: 'Rajesh Khanna',
    students: [
      { id: 's1', name: 'Arjun Patel', bedLabel: 'Bed A', studentId: 'STU-2041' },
      { id: 's2', name: 'Vikram Singh', bedLabel: 'Bed B', studentId: 'STU-2088' },
    ],
    maintenanceHistory: [],
  },
  {
    id: 'r2',
    roomId: 'RM-A-102',
    roomNumber: 'A-102',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    floor: '1st Floor',
    roomType: 'Triple Sharing',
    capacity: 3,
    occupiedBeds: 2,
    operationalStatus: 'Available',
    facilities: ['Shared washroom', 'Study desk', 'Wardrobe'],
    wardenName: 'Rajesh Khanna',
    students: [
      { id: 's3', name: 'Rohan Mehta', bedLabel: 'Bed A', studentId: 'STU-3012' },
      { id: 's4', name: 'Kabir Desai', bedLabel: 'Bed C', studentId: 'STU-3020' },
    ],
    maintenanceHistory: [],
  },
  {
    id: 'r3',
    roomId: 'RM-A-103',
    roomNumber: 'A-103',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    floor: '1st Floor',
    roomType: 'Single Sharing',
    capacity: 1,
    occupiedBeds: 0,
    operationalStatus: 'Available',
    facilities: ['Attached washroom', 'AC', 'Study desk', 'Balcony'],
    wardenName: 'Rajesh Khanna',
    students: [],
    maintenanceHistory: [],
  },
  {
    id: 'r4',
    roomId: 'RM-B-201',
    roomNumber: 'B-201',
    hostel: 'Girls Hostel B',
    block: 'Block B',
    floor: '2nd Floor',
    roomType: 'Double Sharing',
    capacity: 2,
    occupiedBeds: 1,
    operationalStatus: 'Available',
    facilities: ['Attached washroom', 'Study desk', 'Wardrobe'],
    wardenName: 'Dr. Meena Iyer',
    students: [{ id: 's5', name: 'Ananya Sen', bedLabel: 'Bed A', studentId: 'STU-1104' }],
    maintenanceHistory: [],
  },
  {
    id: 'r5',
    roomId: 'RM-B-202',
    roomNumber: 'B-202',
    hostel: 'Girls Hostel B',
    block: 'Block B',
    floor: '2nd Floor',
    roomType: 'Double Sharing',
    capacity: 2,
    occupiedBeds: 0,
    operationalStatus: 'Maintenance',
    facilities: ['Attached washroom', 'Study desk'],
    wardenName: 'Dr. Meena Iyer',
    students: [],
    maintenanceHistory: [
      {
        id: 'm1',
        date: '2026-03-01',
        title: 'Plumbing leak — washroom',
        status: 'Open',
        notes: 'Beds cleared; reassignment paused until 12 Mar.',
      },
    ],
  },
  {
    id: 'r6',
    roomId: 'RM-A-210',
    roomNumber: 'A-210',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    floor: '2nd Floor',
    roomType: 'Double Sharing',
    capacity: 2,
    occupiedBeds: 2,
    operationalStatus: 'Full',
    facilities: ['Shared washroom', 'Study desk'],
    wardenName: 'Rajesh Khanna',
    students: [
      { id: 's6', name: 'Aman Roy', bedLabel: 'Bed A', studentId: 'STU-2201' },
      { id: 's7', name: 'Ishaan Das', bedLabel: 'Bed B', studentId: 'STU-2210' },
    ],
    maintenanceHistory: [
      {
        id: 'm2',
        date: '2025-11-14',
        title: 'Electrical inspection',
        status: 'Resolved',
      },
    ],
  },
  {
    id: 'r7',
    roomId: 'RM-B-115',
    roomNumber: 'B-115',
    hostel: 'Girls Hostel B',
    block: 'Block B',
    floor: '1st Floor',
    roomType: 'Triple Sharing',
    capacity: 3,
    occupiedBeds: 3,
    operationalStatus: 'Full',
    facilities: ['Shared washroom', 'Wardrobe'],
    wardenName: 'Dr. Meena Iyer',
    students: [
      { id: 's8', name: 'Priya Nair', bedLabel: 'Bed A', studentId: 'STU-1402' },
      { id: 's9', name: 'Sara Verma', bedLabel: 'Bed B', studentId: 'STU-1410' },
      { id: 's10', name: 'Neha Gupta', bedLabel: 'Bed C', studentId: 'STU-1418' },
    ],
    maintenanceHistory: [],
  },
  {
    id: 'r8',
    roomId: 'RM-C-302',
    roomNumber: 'C-302',
    hostel: 'Graduate Wing C',
    block: 'Block C',
    floor: '3rd Floor',
    roomType: 'Single Sharing',
    capacity: 1,
    occupiedBeds: 0,
    operationalStatus: 'Inactive',
    facilities: ['Attached washroom', 'AC'],
    wardenName: 'Sunita Rao',
    students: [],
    maintenanceHistory: [
      {
        id: 'm3',
        date: '2026-01-08',
        title: 'Reserved for fellowship block',
        status: 'Open',
      },
    ],
  },
];

export function getRoomById(id: string): RoomRecord | undefined {
  return SAMPLE_ROOMS.find((r) => r.id === id || r.roomId === id || r.roomNumber === id);
}

export function formatMaintenanceDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}
