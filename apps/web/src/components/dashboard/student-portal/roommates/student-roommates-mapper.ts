import {
  facilitiesForRoom,
  formatBedLabel,
} from '@/components/dashboard/student-portal/room/student-room-mapper';
import type {
  StudentRoommateCard,
  StudentRoommateDetail,
  StudentRoommatesSnapshot,
} from '@/components/dashboard/student-portal/roommates/student-roommates-data';
import type { StudentDashboardOverview } from '@/lib/api/dashboard';

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'ST';
}

function buildDetail(
  base: Omit<StudentRoommateDetail, 'isYou'>,
  isYou: boolean,
): StudentRoommateDetail {
  return { ...base, isYou };
}

export function emptyStudentRoommatesSnapshot(): StudentRoommatesSnapshot {
  return {
    hasAllocation: false,
    roomStatus: 'Unassigned',
    roomNumber: '—',
    hostelName: 'No hostel assigned',
    block: '—',
    floor: '—',
    capacity: 0,
    occupants: 0,
    availableBeds: 0,
    roommates: [],
    facilities: facilitiesForRoom(null),
  };
}

export function mapOverviewToRoommatesSnapshot(
  overview: StudentDashboardOverview,
  displayName: string,
): StudentRoommatesSnapshot {
  const { residence, profile } = overview;

  if (!residence.hasActiveAllocation) {
    return emptyStudentRoommatesSnapshot();
  }

  const capacity = residence.capacity ?? 0;
  const occupants = residence.occupiedBeds ?? 0;
  const available = residence.availableBeds ?? Math.max(0, capacity - occupants);
  const hostel = residence.hostelName ?? '—';
  const block = residence.blockName ?? '—';
  const floor = residence.floorLabel ?? '—';
  const roomNumber = residence.roomNumber ?? '—';
  const bedLabel = formatBedLabel(residence.bedNumber);

  const sharedDetail = {
    hostelName: hostel,
    blockName: block,
    floorLabel: floor,
    roomNumber,
  };

  const selfCard: StudentRoommateCard = {
    id: profile.studentId ?? 'self',
    isYou: true,
    name: displayName,
    registrationNumber: profile.registrationNumber ?? '—',
    bedLabel,
    courseLine: profile.course && profile.currentSemester
      ? `${profile.course} · ${profile.currentSemester}`
      : profile.course ?? '—',
    initials: initialsFromName(displayName),
    detail: buildDetail(
      {
        id: profile.studentId ?? 'self',
        name: displayName,
        initials: initialsFromName(displayName),
        registrationNumber: profile.registrationNumber ?? '—',
        department: profile.department ?? '—',
        course: profile.course ?? '—',
        academicYear: profile.academicYear ?? '—',
        admissionYear: profile.admissionYear ?? '—',
        bedLabel,
        ...sharedDetail,
      },
      true,
    ),
  };

  const peerCards: StudentRoommateCard[] = overview.roommates.map((peer) => {
    const peerBed = formatBedLabel(peer.bedNumber);
    return {
      id: peer.id,
      isYou: false,
      name: peer.name,
      registrationNumber: peer.registrationNumber,
      bedLabel: peerBed,
      courseLine: peer.program,
      initials: peer.initials,
      detail: buildDetail(
        {
          id: peer.id,
          name: peer.name,
          initials: peer.initials,
          registrationNumber: peer.registrationNumber,
          department: peer.department,
          course: peer.course,
          academicYear: peer.academicYear,
          admissionYear: peer.admissionYear,
          bedLabel: peerBed,
          hostelName: peer.hostelName ?? hostel,
          blockName: peer.blockName ?? block,
          floorLabel: peer.floorLabel ?? floor,
          roomNumber: peer.roomNumber ?? roomNumber,
        },
        false,
      ),
    };
  });

  return {
    hasAllocation: true,
    roomStatus: 'Active',
    roomNumber,
    hostelName: hostel,
    block,
    floor,
    capacity,
    occupants,
    availableBeds: available,
    roommates: [selfCard, ...peerCards],
    facilities: facilitiesForRoom(residence.hasAc).filter((f) => f.available),
  };
}
