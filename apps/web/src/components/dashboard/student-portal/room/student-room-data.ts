export type RoomRequestStatus = 'pending' | 'approved' | 'rejected' | 'in_progress';

export type RoomRequestType =
  | 'room_change'
  | 'bed_change'
  | 'maintenance'
  | 'roommate_issue';

export type StudentRoomRequest = {
  id: string;
  type: RoomRequestType;
  typeLabel: string;
  submittedAt: string;
  description: string;
  status: RoomRequestStatus;
  statusLabel: string;
};

export type StudentRoommate = {
  id: string;
  name: string;
  bedLabel: string;
  program: string;
  isYou: boolean;
  initials: string;
};

export type StudentAllocationHistoryRow = {
  id: string;
  academicYear: string;
  hostel: string;
  room: string;
  bed: string;
  status: 'Current' | 'Previous';
};

export type StudentRoomFacility = {
  id: string;
  label: string;
  available: boolean;
};

export type StudentRoomSnapshot = {
  allocationId: string;
  status: 'Active' | 'Inactive';
  roomNumber: string;
  hostelName: string;
  block: string;
  floor: string;
  roomType: string;
  bedAssigned: string;
  allocationDate: string;
  academicYear: string;
  details: {
    hostel: string;
    block: string;
    floor: string;
    roomNumber: string;
    roomType: string;
    totalCapacity: number;
    occupiedBeds: number;
    availableBeds: number;
    facilitiesSummary: string;
  };
  bed: {
    label: string;
    status: 'Occupied' | 'Vacant';
    allocationDate: string;
  };
  roommates: StudentRoommate[];
  facilities: StudentRoomFacility[];
  requests: StudentRoomRequest[];
  allocationHistory: StudentAllocationHistoryRow[];
  illustrativeOnly: boolean;
};

const REQUEST_TYPE_LABELS: Record<RoomRequestType, string> = {
  room_change: 'Room Change',
  bed_change: 'Bed Change',
  maintenance: 'Maintenance',
  roommate_issue: 'Roommate Issue',
};

const STATUS_LABELS: Record<RoomRequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  in_progress: 'In Progress',
};

export const ROOM_REQUEST_OPTIONS: { type: RoomRequestType; label: string; description: string; href?: string }[] = [
  {
    type: 'room_change',
    label: 'Room Change',
    description: 'Request a different room — reviewed by warden',
  },
  {
    type: 'bed_change',
    label: 'Bed Change',
    description: 'Request a different bed in your room or block',
  },
  {
    type: 'maintenance',
    label: 'Maintenance',
    description: 'Report room or bed damage',
    href: '/student/maintenance',
  },
  {
    type: 'roommate_issue',
    label: 'Roommate Issue',
    description: 'Report roommate-related concerns',
    href: '/student/complaints',
  },
];

export { REQUEST_TYPE_LABELS, STATUS_LABELS };
