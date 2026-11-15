import type { PrismaClient } from '@nestora/database';
import type { CreateStudentLeaveBody } from '@nestora/validators';
import { BadRequestError } from '../../common/errors/index.js';
import { notifyLeaveApplicationSubmitted } from '../notifications/notification-events.service.js';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';

const PENDING_LEAVE_STATUSES = ['SUBMITTED', 'PENDING', 'PENDING_APPROVAL'] as const;
const APPROVED_LEAVE_STATUSES = ['APPROVED'] as const;
const REJECTED_LEAVE_STATUSES = ['REJECTED', 'DENIED', 'CANCELLED'] as const;

export const STUDENT_LEAVE_TYPES = ['Medical', 'Family', 'Academic', 'Emergency', 'Personal'] as const;

export type StudentLeaveRequest = {
  id: string;
  leaveType: string;
  status: 'pending' | 'approved' | 'rejected';
  statusLabel: string;
  statusNote: string;
  dateRange: string;
  destination: string;
  reason: string;
  emergencyContact: string;
  submittedAt: string;
  departureDate: string;
  expectedReturnDate: string;
  reviewedAt: string | null;
};

export type StudentLeaveDesk = {
  generatedAt: string;
  profileLinked: boolean;
  canApply: boolean;
  hostelName: string | null;
  leaveTypes: readonly string[];
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  requests: StudentLeaveRequest[];
};

function formatLeaveRange(start: Date, end: Date): string {
  const a = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(start);
  const b = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(end);
  return `${a} – ${b}`;
}

function mapLeaveUiStatus(status: string): 'pending' | 'approved' | 'rejected' {
  const upper = status.toUpperCase();
  if (APPROVED_LEAVE_STATUSES.includes(upper as (typeof APPROVED_LEAVE_STATUSES)[number])) {
    return 'approved';
  }
  if (REJECTED_LEAVE_STATUSES.includes(upper as (typeof REJECTED_LEAVE_STATUSES)[number])) {
    return 'rejected';
  }
  return 'pending';
}

function leaveStatusLabel(status: string): string {
  const ui = mapLeaveUiStatus(status);
  if (ui === 'approved') return 'Approved';
  if (ui === 'rejected') return 'Rejected';
  return 'Pending review';
}

function leaveStatusNote(status: string): string {
  const ui = mapLeaveUiStatus(status);
  if (ui === 'approved') return 'Approved by warden — follow gate pass rules at exit.';
  if (ui === 'rejected') return 'Request declined. Contact your warden for details.';
  return 'Awaiting warden approval.';
}

function parseIsoDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

const emptyDesk = (now: Date): StudentLeaveDesk => ({
  generatedAt: now.toISOString(),
  profileLinked: false,
  canApply: false,
  hostelName: null,
  leaveTypes: STUDENT_LEAVE_TYPES,
  summary: { total: 0, pending: 0, approved: 0, rejected: 0 },
  requests: [],
});

export async function getStudentLeaveDesk(
  prisma: PrismaClient,
  userId: string,
): Promise<StudentLeaveDesk> {
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

  const rows = await prisma.leaveApplication.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      leaveType: true,
      departureDate: true,
      expectedReturnDate: true,
      destination: true,
      reason: true,
      emergencyContact: true,
      status: true,
      createdAt: true,
      reviewedAt: true,
    },
  });

  const pending = rows.filter((r) =>
    PENDING_LEAVE_STATUSES.includes(r.status.toUpperCase() as (typeof PENDING_LEAVE_STATUSES)[number]),
  ).length;
  const approved = rows.filter((r) =>
    APPROVED_LEAVE_STATUSES.includes(r.status.toUpperCase() as (typeof APPROVED_LEAVE_STATUSES)[number]),
  ).length;
  const rejected = rows.filter((r) =>
    REJECTED_LEAVE_STATUSES.includes(r.status.toUpperCase() as (typeof REJECTED_LEAVE_STATUSES)[number]),
  ).length;

  return {
    generatedAt: now.toISOString(),
    profileLinked: true,
    canApply: Boolean(hostelId),
    hostelName,
    leaveTypes: STUDENT_LEAVE_TYPES,
    summary: {
      total: rows.length,
      pending,
      approved,
      rejected,
    },
    requests: rows.map((row) => ({
      id: row.id,
      leaveType: row.leaveType,
      status: mapLeaveUiStatus(row.status),
      statusLabel: leaveStatusLabel(row.status),
      statusNote: leaveStatusNote(row.status),
      dateRange: formatLeaveRange(row.departureDate, row.expectedReturnDate),
      destination: row.destination,
      reason: row.reason,
      emergencyContact: row.emergencyContact,
      submittedAt: row.createdAt.toISOString(),
      departureDate: row.departureDate.toISOString().slice(0, 10),
      expectedReturnDate: row.expectedReturnDate.toISOString().slice(0, 10),
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
    })),
  };
}

export async function createStudentLeaveApplication(
  prisma: PrismaClient,
  userId: string,
  body: CreateStudentLeaveBody,
): Promise<StudentLeaveDesk> {
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
    throw new BadRequestError('You need an active hostel allocation before applying for leave.');
  }

  const departure = parseIsoDate(body.departureDate);
  const expectedReturn = parseIsoDate(body.expectedReturnDate);
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (departure.getTime() < todayUtc.getTime()) {
    throw new BadRequestError('Departure date cannot be in the past.');
  }

  const overlappingPending = await prisma.leaveApplication.count({
    where: {
      studentId: student.id,
      status: { in: [...PENDING_LEAVE_STATUSES, ...APPROVED_LEAVE_STATUSES] },
      departureDate: { lte: expectedReturn },
      expectedReturnDate: { gte: departure },
    },
  });
  if (overlappingPending > 0) {
    throw new BadRequestError('You already have a pending or approved leave overlapping these dates.');
  }

  const created = await prisma.leaveApplication.create({
    data: {
      studentId: student.id,
      hostelId,
      leaveType: body.leaveType,
      departureDate: departure,
      expectedReturnDate: expectedReturn,
      destination: body.destination,
      reason: body.reason,
      emergencyContact: body.emergencyContact,
      status: 'SUBMITTED',
    },
    select: { id: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });
  const studentName =
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'A resident';
  await notifyLeaveApplicationSubmitted(prisma, {
    leaveId: created.id,
    hostelId,
    studentName,
    leaveType: body.leaveType,
  });

  return getStudentLeaveDesk(prisma, userId);
}