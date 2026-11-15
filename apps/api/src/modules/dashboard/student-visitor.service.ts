import { createHash } from 'node:crypto';
import type { PrismaClient } from '@nestora/database';
import type { CreateStudentVisitorBody } from '@nestora/validators';
import { BadRequestError } from '../../common/errors/index.js';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';

const PENDING = 'PENDING_APPROVAL';
const APPROVED = 'APPROVED';
const REJECTED = 'REJECTED';

export const STUDENT_VISITOR_ID_PROOF_TYPES = [
  'Aadhaar',
  'Driving License',
  'Voter ID',
  'Passport',
  'Other',
] as const;

export type StudentVisitorStatus = 'pending' | 'approved' | 'inside' | 'checked_out' | 'rejected';

export type StudentVisitorRequest = {
  id: string;
  visitorRef: string;
  visitorName: string;
  visitorPhone: string;
  idProofType: string;
  idProofMasked: string;
  purpose: string;
  status: StudentVisitorStatus;
  statusLabel: string;
  statusNote: string;
  submittedAt: string;
  checkInTime: string | null;
  checkOutTime: string | null;
};

export type StudentVisitorDesk = {
  generatedAt: string;
  profileLinked: boolean;
  canSubmit: boolean;
  hostelName: string | null;
  idProofTypes: readonly string[];
  summary: {
    total: number;
    pending: number;
    approved: number;
    inside: number;
    checkedOut: number;
    rejected: number;
  };
  requests: StudentVisitorRequest[];
};

function visitorRef(id: string, createdAt: Date): string {
  const short = createHash('sha256').update(id).digest('hex').slice(0, 4).toUpperCase();
  return `VR-${createdAt.getUTCFullYear()}-${short}`;
}

function maskIdProof(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 4) return '••••';
  return `•••• ${trimmed.slice(-4)}`;
}

function mapStudentVisitorStatus(row: {
  status: string;
  checkInTime: Date | null;
  checkOutTime: Date | null;
}): { status: StudentVisitorStatus; statusLabel: string; statusNote: string } {
  const db = row.status.toUpperCase();
  if (db === REJECTED) {
    return {
      status: 'rejected',
      statusLabel: 'Rejected',
      statusNote: 'Request declined by warden or security.',
    };
  }
  if (row.checkOutTime) {
    return {
      status: 'checked_out',
      statusLabel: 'Checked out',
      statusNote: 'Visit completed. Thank you for following gate timings.',
    };
  }
  if (row.checkInTime && !row.checkOutTime) {
    return {
      status: 'inside',
      statusLabel: 'Inside hostel',
      statusNote: 'Visitor is on campus. Ensure they check out at the gate.',
    };
  }
  if (db === PENDING || db === 'SUBMITTED' || db === 'PENDING') {
    return {
      status: 'pending',
      statusLabel: 'Pending approval',
      statusNote: 'Awaiting warden or security approval before gate entry.',
    };
  }
  if (db === APPROVED || db === 'CHECKED_IN') {
    return {
      status: 'approved',
      statusLabel: 'Approved',
      statusNote: 'Approved — visitor may check in at the gate during visiting hours.',
    };
  }
  return {
    status: 'pending',
    statusLabel: 'Submitted',
    statusNote: 'Request is being processed.',
  };
}

function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

const emptyDesk = (now: Date): StudentVisitorDesk => ({
  generatedAt: now.toISOString(),
  profileLinked: false,
  canSubmit: false,
  hostelName: null,
  idProofTypes: STUDENT_VISITOR_ID_PROOF_TYPES,
  summary: { total: 0, pending: 0, approved: 0, inside: 0, checkedOut: 0, rejected: 0 },
  requests: [],
});

export async function getStudentVisitorDesk(
  prisma: PrismaClient,
  userId: string,
): Promise<StudentVisitorDesk> {
  const now = new Date();
  await ensureStudentProfileForUser(prisma, userId);

  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    return emptyDesk(now);
  }

  const allocation = await prisma.allocationRecord.findFirst({
    where: { studentId: student.id, status: 'ACTIVE' },
    orderBy: { allocatedAt: 'desc' },
    include: {
      bed: {
        include: {
          room: {
            include: {
              floor: {
                include: {
                  block: { include: { building: { include: { hostel: true } } } },
                },
              },
            },
          },
        },
      },
    },
  });

  const hostel = allocation?.bed.room.floor.block.building.hostel;
  const hostelId = hostel?.id ?? null;
  const hostelName = hostel?.name ?? null;

  const rows = await prisma.visitorRecord.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      visitorName: true,
      visitorPhone: true,
      idProofType: true,
      idProofNumber: true,
      purpose: true,
      status: true,
      createdAt: true,
      checkInTime: true,
      checkOutTime: true,
    },
  });

  const requests: StudentVisitorRequest[] = rows.map((row) => {
    const mapped = mapStudentVisitorStatus(row);
    return {
      id: row.id,
      visitorRef: visitorRef(row.id, row.createdAt),
      visitorName: row.visitorName,
      visitorPhone: row.visitorPhone,
      idProofType: row.idProofType,
      idProofMasked: maskIdProof(row.idProofNumber),
      purpose: row.purpose,
      status: mapped.status,
      statusLabel: mapped.statusLabel,
      statusNote: mapped.statusNote,
      submittedAt: formatDisplayDate(row.createdAt),
      checkInTime: row.checkInTime ? formatDisplayDate(row.checkInTime) : null,
      checkOutTime: row.checkOutTime ? formatDisplayDate(row.checkOutTime) : null,
    };
  });

  return {
    generatedAt: now.toISOString(),
    profileLinked: true,
    canSubmit: Boolean(hostelId),
    hostelName,
    idProofTypes: STUDENT_VISITOR_ID_PROOF_TYPES,
    summary: {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      inside: requests.filter((r) => r.status === 'inside').length,
      checkedOut: requests.filter((r) => r.status === 'checked_out').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    },
    requests,
  };
}

export async function createStudentVisitorRequest(
  prisma: PrismaClient,
  userId: string,
  body: CreateStudentVisitorBody,
): Promise<StudentVisitorDesk> {
  await ensureStudentProfileForUser(prisma, userId);

  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!student) {
    throw new BadRequestError('Student profile is not linked to this account.');
  }

  const allocation = await prisma.allocationRecord.findFirst({
    where: { studentId: student.id, status: 'ACTIVE' },
    orderBy: { allocatedAt: 'desc' },
    include: {
      bed: {
        include: {
          room: {
            include: {
              floor: {
                include: {
                  block: { include: { building: { include: { hostel: true } } } },
                },
              },
            },
          },
        },
      },
    },
  });

  const hostelId = allocation?.bed.room.floor.block.building.hostel.id;
  if (!hostelId) {
    throw new BadRequestError('You need an active hostel allocation before requesting a visitor pass.');
  }

  await prisma.visitorRecord.create({
    data: {
      hostelId,
      studentId: student.id,
      visitorName: body.visitorName,
      visitorPhone: body.visitorPhone,
      idProofType: body.idProofType,
      idProofNumber: body.idProofNumber,
      purpose: body.purpose,
      status: PENDING,
      guardId: userId,
      isException: false,
    },
  });

  return getStudentVisitorDesk(prisma, userId);
}