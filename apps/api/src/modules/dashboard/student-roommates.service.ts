import type { PrismaClient } from '@nestora/database';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';
import type { StudentDashboardOverview } from './student-dashboard.service.js';

export type StudentRoommatesDesk = {
  generatedAt: string;
  profileLinked: boolean;
  profile: StudentDashboardOverview['profile'];
  residence: StudentDashboardOverview['residence'];
  roommates: StudentDashboardOverview['roommates'];
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'ST';
}

function floorLabel(floorNumber: number, name: string | null): string {
  if (name?.trim()) return name.trim();
  const ordinals = ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth'];
  if (floorNumber >= 0 && floorNumber < ordinals.length) {
    return `${ordinals[floorNumber]} Floor`;
  }
  return `Floor ${floorNumber}`;
}

function roomFacilitiesSummary(hasAc: boolean): string {
  const base = ['Wi-Fi', 'Study Table', 'Wardrobe', 'Bed and Mattress'];
  if (hasAc) base.push('Air Conditioning');
  else base.push('Ceiling Fan');
  return base.join(', ');
}

const emptyResidence = (): StudentDashboardOverview['residence'] => ({
  hasActiveAllocation: false,
  hostelName: null,
  roomNumber: null,
  bedNumber: null,
  blockName: null,
  floorLabel: null,
  capacity: null,
  roomStatus: 'vacant',
  allocationRecordId: null,
  allocationRef: null,
  allocationStartDate: null,
  academicYear: null,
  roomTypeLabel: null,
  occupiedBeds: null,
  availableBeds: null,
  facilitiesSummary: null,
  hasAc: null,
});

export async function getStudentRoommatesDesk(
  prisma: PrismaClient,
  userId: string,
): Promise<StudentRoommatesDesk> {
  const now = new Date();
  await ensureStudentProfileForUser(prisma, userId);

  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      registrationNumber: true,
      course: true,
      department: true,
      academicYear: true,
      currentSemester: true,
      createdAt: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });

  if (!student) {
    return {
      generatedAt: now.toISOString(),
      profileLinked: false,
      profile: {
        linked: false,
        studentId: null,
        registrationNumber: null,
        department: null,
        course: null,
        academicYear: null,
        currentSemester: null,
        admissionYear: null,
      },
      residence: emptyResidence(),
      roommates: [],
    };
  }

  const profile: StudentDashboardOverview['profile'] = {
    linked: true,
    studentId: student.id,
    registrationNumber: student.registrationNumber,
    department: student.department,
    course: student.course,
    academicYear: student.academicYear,
    currentSemester: student.currentSemester,
    admissionYear: String(student.createdAt.getUTCFullYear()),
  };

  const allocation = await prisma.allocationRecord.findFirst({
    where: { studentId: student.id, status: 'ACTIVE' },
    orderBy: { allocatedAt: 'desc' },
    include: {
      bed: {
        include: {
          room: {
            include: {
              config: true,
              floor: { include: { block: { include: { building: { include: { hostel: true } } } } } },
            },
          },
        },
      },
    },
  });

  if (!allocation?.bed.room) {
    return {
      generatedAt: now.toISOString(),
      profileLinked: true,
      profile,
      residence: emptyResidence(),
      roommates: [],
    };
  }

  const { room, bedNumber } = allocation.bed;
  const hostel = room.floor.block.building.hostel;
  const roomId = room.id;

  const occupiedBedsInRoom = await prisma.allocationRecord.count({
    where: { status: 'ACTIVE', bed: { roomId } },
  });
  const capacity = room.config.capacity;
  const residence: StudentDashboardOverview['residence'] = {
    hasActiveAllocation: true,
    hostelName: hostel.name,
    roomNumber: room.roomNumber,
    bedNumber: bedNumber.padStart(2, '0'),
    blockName: room.floor.block.name,
    floorLabel: floorLabel(room.floor.floorNumber, room.floor.name),
    capacity,
    roomStatus: 'occupied',
    allocationRecordId: allocation.id,
    allocationRef: `ALLOC-${student.registrationNumber}`,
    allocationStartDate: allocation.startDate.toISOString().slice(0, 10),
    academicYear: student.academicYear,
    roomTypeLabel: room.config.description || `${capacity}-sharing`,
    occupiedBeds: occupiedBedsInRoom,
    availableBeds: Math.max(0, capacity - occupiedBedsInRoom),
    facilitiesSummary: roomFacilitiesSummary(room.config.hasAc),
    hasAc: room.config.hasAc,
  };

  const peers = await prisma.allocationRecord.findMany({
    where: {
      status: 'ACTIVE',
      studentId: { not: student.id },
      bed: { roomId },
    },
    take: 12,
    include: {
      bed: { select: { bedNumber: true } },
      student: {
        select: {
          id: true,
          registrationNumber: true,
          course: true,
          department: true,
          academicYear: true,
          currentSemester: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  const roommates: StudentDashboardOverview['roommates'] = peers.map((row) => {
    const name = `${row.student.user.firstName} ${row.student.user.lastName}`.trim() || 'Resident';
    const { student: peer } = row;
    return {
      id: row.studentId,
      name,
      program: `${peer.course} · ${peer.currentSemester}`,
      initials: initialsFromName(name),
      bedNumber: row.bed.bedNumber.padStart(2, '0'),
      registrationNumber: peer.registrationNumber,
      department: peer.department,
      course: peer.course,
      academicYear: peer.academicYear,
      admissionYear: String(peer.createdAt.getUTCFullYear()),
      hostelName: residence.hostelName,
      roomNumber: residence.roomNumber,
      blockName: residence.blockName,
      floorLabel: residence.floorLabel,
    };
  });

  return {
    generatedAt: now.toISOString(),
    profileLinked: true,
    profile,
    residence,
    roommates,
  };
}