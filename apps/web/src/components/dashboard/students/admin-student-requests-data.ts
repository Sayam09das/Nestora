export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export type RequestType =
  | 'Hostel Admission'
  | 'Room Change'
  | 'Leave Request'
  | 'Fee Extension'
  | 'Roommate Change'
  | 'Other Requests';

export type RequestHistoryEntry = {
  id: string;
  action: string;
  actor: string;
  remarks?: string;
  at: string;
};

export type StudentRequestRecord = {
  id: string;
  requestId: string;
  studentId: string;
  studentName: string;
  type: RequestType;
  status: RequestStatus;
  submittedAt: string;
  description: string;
  reason: string;
  documents: { name: string; kind: string }[];
  history: RequestHistoryEntry[];
};

export const REQUEST_DIRECTORY_STATS = {
  total: 48,
  pending: 12,
  approved: 30,
  rejected: 6,
} as const;

export const REQUEST_TYPE_OPTIONS = [
  'All Types',
  'Hostel Admission',
  'Room Change',
  'Leave Request',
  'Fee Extension',
  'Roommate Change',
  'Other Requests',
] as const;

export const REQUEST_STATUS_TABS = ['All', 'Pending', 'Approved', 'Rejected'] as const;

export const SAMPLE_STUDENT_REQUESTS: StudentRequestRecord[] = [
  {
    id: 'r1',
    requestId: 'SR-2026-001',
    studentId: 'STU-001',
    studentName: 'Aarav Sharma',
    type: 'Hostel Admission',
    status: 'Pending',
    submittedAt: '2026-11-10',
    description: 'Request for admission to Boys Hostel A for the current academic session.',
    reason: 'Recently admitted to the college and requires hostel accommodation.',
    documents: [
      { name: 'admission-letter.pdf', kind: 'Admission proof' },
      { name: 'id-card.jpg', kind: 'Photo ID' },
    ],
    history: [
      {
        id: 'h1',
        action: 'Submitted',
        actor: 'Aarav Sharma',
        at: '2026-11-10T09:15:00',
      },
    ],
  },
  {
    id: 'r2',
    requestId: 'SR-2026-002',
    studentId: 'STU-002',
    studentName: 'Priya Das',
    type: 'Room Change',
    status: 'Pending',
    submittedAt: '2026-11-09',
    description: 'Request to move from B-108 to a quieter floor in Girls Hostel B.',
    reason: 'Current room is adjacent to common area; affecting study hours.',
    documents: [{ name: 'room-allocation.pdf', kind: 'Current allocation' }],
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Priya Das', at: '2026-11-09T14:22:00' },
    ],
  },
  {
    id: 'r3',
    requestId: 'SR-2026-003',
    studentId: 'STU-003',
    studentName: 'Rahul Verma',
    type: 'Leave Request',
    status: 'Approved',
    submittedAt: '2026-11-09',
    description: 'Permission for 5-day leave to attend a family function out of state.',
    reason: 'Sister’s wedding; travel requires early departure on 14 Nov.',
    documents: [{ name: 'travel-itinerary.pdf', kind: 'Supporting' }],
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Rahul Verma', at: '2026-11-09T08:00:00' },
      {
        id: 'h2',
        action: 'Approved',
        actor: 'Admin — Nestora',
        remarks: 'Leave recorded; room keys to be deposited at reception.',
        at: '2026-11-09T16:45:00',
      },
    ],
  },
  {
    id: 'r4',
    requestId: 'SR-2026-004',
    studentId: 'STU-004',
    studentName: 'Ananya Roy',
    type: 'Fee Extension',
    status: 'Rejected',
    submittedAt: '2026-11-08',
    description: 'Request for a 15-day extension on semester hostel fee payment.',
    reason: 'Delay in education loan disbursement from bank.',
    documents: [{ name: 'bank-letter.pdf', kind: 'Fee proof' }],
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Ananya Roy', at: '2026-11-08T11:30:00' },
      {
        id: 'h2',
        action: 'Rejected',
        actor: 'Admin — Finance',
        remarks: 'Extension exceeds policy limit; partial payment required first.',
        at: '2026-11-08T17:10:00',
      },
    ],
  },
  {
    id: 'r5',
    requestId: 'SR-2026-005',
    studentId: 'STU-005',
    studentName: 'Rohan Gupta',
    type: 'Roommate Change',
    status: 'Pending',
    submittedAt: '2026-11-07',
    description: 'Request to change roommate assignment in A-210.',
    reason: 'Schedule mismatch; seeking roommate with similar study routine.',
    documents: [],
    history: [{ id: 'h1', action: 'Submitted', actor: 'Rohan Gupta', at: '2026-11-07T10:05:00' }],
  },
  {
    id: 'r6',
    requestId: 'SR-2026-006',
    studentId: 'STU-006',
    studentName: 'Isha Patel',
    type: 'Other Requests',
    status: 'Approved',
    submittedAt: '2026-11-06',
    description: 'Request for extended library access card linked to hostel ID.',
    reason: 'Research project requires late-night library access.',
    documents: [{ name: 'supervisor-note.pdf', kind: 'Supporting' }],
    history: [
      { id: 'h1', action: 'Submitted', actor: 'Isha Patel', at: '2026-11-06T09:00:00' },
      {
        id: 'h2',
        action: 'Approved',
        actor: 'Admin — Nestora',
        remarks: 'Library notified; valid through end of semester.',
        at: '2026-11-06T15:20:00',
      },
    ],
  },
  {
    id: 'r7',
    requestId: 'SR-2026-007',
    studentId: 'STU-007',
    studentName: 'Vikram Singh',
    type: 'Hostel Admission',
    status: 'Pending',
    submittedAt: '2026-11-05',
    description: 'Late admission request for Boys Hostel A after seat reopening.',
    reason: 'Transferred from affiliated college mid-year.',
    documents: [
      { name: 'transfer-certificate.pdf', kind: 'Admission proof' },
      { name: 'medical-fitness.pdf', kind: 'Supporting' },
    ],
    history: [{ id: 'h1', action: 'Submitted', actor: 'Vikram Singh', at: '2026-11-05T13:40:00' }],
  },
  {
    id: 'r8',
    requestId: 'SR-2026-008',
    studentId: 'STU-008',
    studentName: 'Meera Nair',
    type: 'Leave Request',
    status: 'Pending',
    submittedAt: '2026-11-04',
    description: 'Weekend leave for inter-college sports tournament.',
    reason: 'Representing university team; return by Sunday 9 PM.',
    documents: [{ name: 'team-invite.pdf', kind: 'Supporting' }],
    history: [{ id: 'h1', action: 'Submitted', actor: 'Meera Nair', at: '2026-11-04T08:55:00' }],
  },
];

export function formatRequestDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatHistoryTimestamp(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}
