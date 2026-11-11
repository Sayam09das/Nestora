import type { StudentRoomSnapshot, StudentRoomFacility } from '@/components/dashboard/student-portal/room/student-room-data';
import type { StudentDashboardOverview } from '@/lib/api/dashboard';

function formatAllocationDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'ST';
}

export function formatBedLabel(bedNumber: string | null | undefined): string {
  if (!bedNumber) return '—';
  const trimmed = bedNumber.trim();
  const asIndex = Number.parseInt(trimmed, 10);
  if (!Number.isNaN(asIndex) && asIndex >= 1 && asIndex <= 26) {
    return `Bed ${String.fromCharCode(64 + asIndex)}`;
  }
  if (/^[A-Za-z]$/.test(trimmed)) {
    return `Bed ${trimmed.toUpperCase()}`;
  }
  return `Bed ${trimmed}`;
}

export function facilitiesForRoom(hasAc: boolean | null): StudentRoomFacility[] {
  return [
    { id: 'wifi', label: 'Wi-Fi', available: true },
    { id: 'fan', label: hasAc ? 'Air Conditioning' : 'Ceiling Fan', available: true },
    { id: 'bed', label: 'Bed and Mattress', available: true },
    { id: 'desk', label: 'Study Table', available: true },
    { id: 'wardrobe', label: 'Wardrobe', available: true },
    { id: 'bath', label: 'Attached Bathroom', available: false },
  ];
}

export function emptyStudentRoomSnapshot(): StudentRoomSnapshot {
  return {
    allocationId: '—',
    status: 'Inactive',
    roomNumber: '—',
    hostelName: 'No hostel assigned',
    block: '—',
    floor: '—',
    roomType: '—',
    bedAssigned: '—',
    allocationDate: '—',
    academicYear: '—',
    details: {
      hostel: 'No hostel assigned',
      block: '—',
      floor: '—',
      roomNumber: '—',
      roomType: '—',
      totalCapacity: 0,
      occupiedBeds: 0,
      availableBeds: 0,
      facilitiesSummary: '—',
    },
    bed: {
      label: '—',
      status: 'Vacant',
      allocationDate: '—',
    },
    roommates: [],
    facilities: facilitiesForRoom(null),
    requests: [],
    allocationHistory: [],
    illustrativeOnly: false,
  };
}

export function mapOverviewToStudentRoomSnapshot(
  overview: StudentDashboardOverview,
  displayName: string,
): StudentRoomSnapshot {
  const { residence } = overview;

  if (!residence.hasActiveAllocation) {
    return emptyStudentRoomSnapshot();
  }

  const bedLabel = formatBedLabel(residence.bedNumber);
  const allocationDate = residence.allocationStartDate
    ? formatAllocationDate(residence.allocationStartDate)
    : '—';
  const hostel = residence.hostelName ?? '—';
  const block = residence.blockName ?? '—';
  const floor = residence.floorLabel ?? '—';
  const roomNumber = residence.roomNumber ?? '—';
  const roomType = residence.roomTypeLabel ?? '—';
  const capacity = residence.capacity ?? 0;
  const occupied = residence.occupiedBeds ?? 0;
  const available = residence.availableBeds ?? Math.max(0, capacity - occupied);
  const facilitiesSummary = residence.facilitiesSummary ?? '—';

  const selfRoommate = {
    id: overview.profile.studentId ?? 'self',
    name: displayName,
    bedLabel,
    program: 'You',
    isYou: true,
    initials: initialsFromName(displayName),
  };

  const peerRoommates = overview.roommates.map((row) => ({
    id: row.id,
    name: row.name,
    bedLabel: formatBedLabel(row.bedNumber),
    program: row.program,
    isYou: false,
    initials: row.initials,
  }));

  return {
    allocationId: residence.allocationRef ?? residence.allocationRecordId ?? '—',
    status: 'Active',
    roomNumber,
    hostelName: hostel,
    block,
    floor,
    roomType,
    bedAssigned: bedLabel,
    allocationDate,
    academicYear: residence.academicYear ?? '—',
    details: {
      hostel,
      block,
      floor,
      roomNumber,
      roomType,
      totalCapacity: capacity,
      occupiedBeds: occupied,
      availableBeds: available,
      facilitiesSummary,
    },
    bed: {
      label: bedLabel,
      status: 'Occupied',
      allocationDate,
    },
    roommates: [selfRoommate, ...peerRoommates],
    facilities: facilitiesForRoom(residence.hasAc),
    requests: overview.roomRequests ?? [],
    allocationHistory: overview.allocationHistory ?? [],
    illustrativeOnly: false,
  };
}
