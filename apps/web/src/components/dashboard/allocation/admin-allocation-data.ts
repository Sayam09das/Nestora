export type AllocationStatus = 'Pending' | 'Allocated' | 'Change Requested' | 'Rejected';
export type AllocationType = 'New Allocation' | 'Room Change';
export type AdmissionGate = 'Fully Approved' | 'Pending Verification';

export type AllocationHistoryEntry = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  note?: string;
};

export type AllocationRecord = {
  id: string;
  allocationRef: string;
  type: AllocationType;
  status: AllocationStatus;
  admissionStatus: AdmissionGate;
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
  history: AllocationHistoryEntry[];
};

export const ALLOCATION_STATS = {
  pendingQueue: 18,
  allocatedToday: 6,
  roomChangePending: 4,
  eligibleUnallocated: 24,
  bedsAvailable: 98,
} as const;

export const HOSTEL_QUEUE_SUMMARY = [
  { hostel: 'Boys Hostel A', pending: 9, availableBeds: 42 },
  { hostel: 'Girls Hostel B', pending: 6, availableBeds: 38 },
  { hostel: 'Graduate Wing C', pending: 3, availableBeds: 18 },
] as const;

export const ALLOCATION_STATUS_FILTERS = ['All Status', 'Pending', 'Allocated', 'Change Requested', 'Rejected'] as const;
export const ALLOCATION_TYPE_FILTERS = ['All Types', 'New Allocation', 'Room Change'] as const;
export const ALLOCATION_HOSTEL_FILTERS = [
  'All Hostels',
  'Boys Hostel A',
  'Girls Hostel B',
  'Graduate Wing C',
] as const;

export const ELIGIBLE_STUDENT_OPTIONS = [
  { studentId: 'STU-003', name: 'Rahul Verma', admissionStatus: 'Fully Approved' as const },
  { studentId: 'STU-018', name: 'Kavya Iyer', admissionStatus: 'Fully Approved' as const },
  { studentId: 'STU-021', name: 'Dev Malhotra', admissionStatus: 'Fully Approved' as const },
] as const;

export const AVAILABLE_BED_OPTIONS = [
  { bedId: 'BED-A102-02', label: 'A-102 · Bed 02', hostel: 'Boys Hostel A', room: 'A-102' },
  { bedId: 'BED-A103-01', label: 'A-103 · Bed 01', hostel: 'Boys Hostel A', room: 'A-103' },
  { bedId: 'BED-B201-01', label: 'B-201 · Bed 01', hostel: 'Girls Hostel B', room: 'B-201' },
  { bedId: 'BED-B202-02', label: 'B-202 · Bed 02', hostel: 'Girls Hostel B', room: 'B-202' },
] as const;

export function generateAllocationRef(next: number): string {
  return `ALLOC-${String(next).padStart(3, '0')}`;
}

export function formatAllocationDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatAllocationDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function canAllocate(record: AllocationRecord): boolean {
  return record.admissionStatus === 'Fully Approved' && (record.status === 'Pending' || record.status === 'Change Requested');
}

export const SAMPLE_ALLOCATIONS: AllocationRecord[] = [
  {
    id: 'a1',
    allocationRef: 'ALLOC-001',
    type: 'New Allocation',
    status: 'Pending',
    admissionStatus: 'Fully Approved',
    studentId: 'STU-003',
    studentName: 'Rahul Verma',
    course: 'B.Tech ECE',
    genderHostelCategory: "Boys' Hostel",
    preferenceHostel: 'Boys Hostel A',
    preferenceRoomType: 'Double Sharing',
    acPreference: 'Non-AC',
    hostel: null,
    block: null,
    roomNumber: null,
    bedId: null,
    bedLabel: null,
    submittedAt: '2026-03-08T09:12:00Z',
    allocatedAt: null,
    allocatedBy: null,
    expectedCheckout: null,
    history: [{ id: 'h1', timestamp: '2026-03-08T09:12:00Z', actor: 'System', action: 'Queued after full admission approval' }],
  },
  {
    id: 'a2',
    allocationRef: 'ALLOC-002',
    type: 'New Allocation',
    status: 'Pending',
    admissionStatus: 'Fully Approved',
    studentId: 'STU-018',
    studentName: 'Kavya Iyer',
    course: 'B.Sc Chemistry',
    genderHostelCategory: "Girls' Hostel",
    preferenceHostel: 'Girls Hostel B',
    preferenceRoomType: 'Triple Sharing',
    acPreference: 'AC',
    hostel: null,
    block: null,
    roomNumber: null,
    bedId: null,
    bedLabel: null,
    submittedAt: '2026-03-09T11:05:00Z',
    allocatedAt: null,
    allocatedBy: null,
    expectedCheckout: null,
    history: [{ id: 'h1', timestamp: '2026-03-09T11:05:00Z', actor: 'Student', action: 'Submitted accommodation preference' }],
  },
  {
    id: 'a3',
    allocationRef: 'ALLOC-003',
    type: 'Room Change',
    status: 'Change Requested',
    admissionStatus: 'Fully Approved',
    studentId: 'STU-001',
    studentName: 'Aarav Sharma',
    course: 'B.Tech CSE',
    genderHostelCategory: "Boys' Hostel",
    preferenceHostel: 'Boys Hostel A',
    preferenceRoomType: 'Single Occupancy',
    acPreference: 'AC',
    reason: 'Medical — quiet room requested',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    roomNumber: 'A-204',
    bedId: 'BED-A204-01',
    bedLabel: 'Bed 01',
    submittedAt: '2026-03-07T14:20:00Z',
    allocatedAt: '2025-08-01T10:00:00Z',
    allocatedBy: 'Mr. Rajesh Kumar',
    expectedCheckout: null,
    history: [
      { id: 'h1', timestamp: '2026-03-07T14:20:00Z', actor: 'Aarav Sharma', action: 'Room change requested' },
      { id: 'h2', timestamp: '2025-08-01T10:00:00Z', actor: 'Mr. Rajesh Kumar', action: 'Initial bed allocated' },
    ],
  },
  {
    id: 'a4',
    allocationRef: 'ALLOC-004',
    type: 'New Allocation',
    status: 'Allocated',
    admissionStatus: 'Fully Approved',
    studentId: 'STU-001',
    studentName: 'Aarav Sharma',
    course: 'B.Tech CSE',
    genderHostelCategory: "Boys' Hostel",
    preferenceHostel: 'Boys Hostel A',
    preferenceRoomType: 'Double Sharing',
    acPreference: 'Non-AC',
    hostel: 'Boys Hostel A',
    block: 'Block A',
    roomNumber: 'A-204',
    bedId: 'BED-A204-01',
    bedLabel: 'Bed 01',
    submittedAt: '2025-07-20T08:00:00Z',
    allocatedAt: '2025-08-01T10:00:00Z',
    allocatedBy: 'Mr. Rajesh Kumar',
    expectedCheckout: '2026-06-30',
    history: [{ id: 'h1', timestamp: '2025-08-01T10:00:00Z', actor: 'Mr. Rajesh Kumar', action: 'Bed BED-A204-01 marked Occupied' }],
  },
  {
    id: 'a5',
    allocationRef: 'ALLOC-005',
    type: 'New Allocation',
    status: 'Allocated',
    admissionStatus: 'Fully Approved',
    studentId: 'STU-002',
    studentName: 'Priya Das',
    course: 'B.Sc Physics',
    genderHostelCategory: "Girls' Hostel",
    preferenceHostel: 'Girls Hostel B',
    preferenceRoomType: 'Double Sharing',
    acPreference: 'AC',
    hostel: 'Girls Hostel B',
    block: 'Block B',
    roomNumber: 'B-108',
    bedId: 'BED-B108-01',
    bedLabel: 'Bed 01',
    submittedAt: '2025-07-18T12:00:00Z',
    allocatedAt: '2025-07-22T15:30:00Z',
    allocatedBy: 'Dr. Meera Nair',
    expectedCheckout: '2026-05-15',
    history: [{ id: 'h1', timestamp: '2025-07-22T15:30:00Z', actor: 'Dr. Meera Nair', action: 'Allocated to B-108 Bed 01' }],
  },
  {
    id: 'a6',
    allocationRef: 'ALLOC-006',
    type: 'New Allocation',
    status: 'Pending',
    admissionStatus: 'Pending Verification',
    studentId: 'STU-025',
    studentName: 'Neha Singh',
    course: 'MBA',
    genderHostelCategory: "Girls' Hostel",
    preferenceHostel: 'Girls Hostel B',
    preferenceRoomType: 'Single Occupancy',
    acPreference: 'AC',
    hostel: null,
    block: null,
    roomNumber: null,
    bedId: null,
    bedLabel: null,
    submittedAt: '2026-03-10T06:40:00Z',
    allocatedAt: null,
    allocatedBy: null,
    expectedCheckout: null,
    history: [{ id: 'h1', timestamp: '2026-03-10T06:40:00Z', actor: 'System', action: 'Blocked — awaiting warden verification' }],
  },
  {
    id: 'a7',
    allocationRef: 'ALLOC-007',
    type: 'Room Change',
    status: 'Change Requested',
    admissionStatus: 'Fully Approved',
    studentId: 'STU-004',
    studentName: 'Ananya Roy',
    course: 'BBA',
    genderHostelCategory: "Girls' Hostel",
    preferenceHostel: 'Girls Hostel B',
    preferenceRoomType: 'Double Sharing',
    acPreference: 'Non-AC',
    reason: 'Maintenance noise in current block',
    hostel: 'Girls Hostel B',
    block: 'Block B',
    roomNumber: 'B-212',
    bedId: 'BED-B212-02',
    bedLabel: 'Bed 02',
    submittedAt: '2026-03-06T16:00:00Z',
    allocatedAt: '2024-08-05T09:00:00Z',
    allocatedBy: 'Dr. Meera Nair',
    expectedCheckout: null,
    history: [{ id: 'h1', timestamp: '2026-03-06T16:00:00Z', actor: 'Ananya Roy', action: 'Change request submitted' }],
  },
  {
    id: 'a8',
    allocationRef: 'ALLOC-008',
    type: 'New Allocation',
    status: 'Rejected',
    admissionStatus: 'Fully Approved',
    studentId: 'STU-030',
    studentName: 'Imran Khan',
    course: 'B.Tech ME',
    genderHostelCategory: "Boys' Hostel",
    preferenceHostel: 'Boys Hostel A',
    preferenceRoomType: 'Single Occupancy',
    acPreference: 'AC',
    hostel: null,
    block: null,
    roomNumber: null,
    bedId: null,
    bedLabel: null,
    submittedAt: '2026-02-28T10:00:00Z',
    allocatedAt: null,
    allocatedBy: null,
    expectedCheckout: null,
    history: [{ id: 'h1', timestamp: '2026-03-01T11:00:00Z', actor: 'Admin', action: 'Rejected — no single AC capacity', note: 'Offered double sharing' }],
  },
  {
    id: 'a9',
    allocationRef: 'ALLOC-009',
    type: 'New Allocation',
    status: 'Allocated',
    admissionStatus: 'Fully Approved',
    studentId: 'STU-012',
    studentName: 'Arjun Nambiar',
    course: 'M.Tech AI',
    genderHostelCategory: "Boys' Hostel",
    preferenceHostel: 'Graduate Wing C',
    preferenceRoomType: 'Single Occupancy',
    acPreference: 'AC',
    hostel: 'Graduate Wing C',
    block: 'Block C',
    roomNumber: 'C-301',
    bedId: 'BED-C301-01',
    bedLabel: 'Bed 01',
    submittedAt: '2026-01-10T08:00:00Z',
    allocatedAt: '2026-01-12T14:00:00Z',
    allocatedBy: 'Mr. Vikram Patel',
    expectedCheckout: '2027-06-30',
    history: [{ id: 'h1', timestamp: '2026-01-12T14:00:00Z', actor: 'Mr. Vikram Patel', action: 'Graduate wing allocation' }],
  },
  {
    id: 'a10',
    allocationRef: 'ALLOC-010',
    type: 'New Allocation',
    status: 'Pending',
    admissionStatus: 'Fully Approved',
    studentId: 'STU-021',
    studentName: 'Dev Malhotra',
    course: 'B.Tech CSE',
    genderHostelCategory: "Boys' Hostel",
    preferenceHostel: 'Boys Hostel A',
    preferenceRoomType: 'Four Sharing',
    acPreference: 'Non-AC',
    hostel: null,
    block: null,
    roomNumber: null,
    bedId: null,
    bedLabel: null,
    submittedAt: '2026-03-10T08:22:00Z',
    allocatedAt: null,
    allocatedBy: null,
    expectedCheckout: null,
    history: [{ id: 'h1', timestamp: '2026-03-10T08:22:00Z', actor: 'Student', action: 'Preference submitted' }],
  },
];

export function getAllocationById(id: string): AllocationRecord | undefined {
  return SAMPLE_ALLOCATIONS.find((a) => a.id === id);
}

export function queueAllocations(records: AllocationRecord[]): AllocationRecord[] {
  return records.filter((r) => r.status === 'Pending' || r.status === 'Change Requested');
}
