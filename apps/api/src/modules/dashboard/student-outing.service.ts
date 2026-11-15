import type { PrismaClient } from '@nestora/database';
import type { CreateStudentOutingBody } from '@nestora/validators';
import { BadRequestError } from '../../common/errors/index.js';
import { notifyOutingApplicationSubmitted } from '../notifications/notification-events.service.js';
import { ensureStudentProfileForUser } from '../students/student-profile-ensure.service.js';

const PENDING = ['SUBMITTED', 'PENDING', 'PENDING_APPROVAL'] as const;
const APPROVED = ['APPROVED'] as const;
const REJECTED = ['REJECTED', 'DENIED', 'CANCELLED'] as const;

export type StudentOutingRequest = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  statusLabel: string;
  statusNote: string;
  outingDate: string;
  departureTime: string;
  expectedReturnTime: string;
  destination: string;
  isExceptional: boolean;
  submittedAt: string;
  reviewedAt: string | null;
};

export type StudentOutingDesk = {
  generatedAt: string;
  profileLinked: boolean;
  canApply: boolean;
  hostelName: string | null;
  summary: { total: number; pending: number; approved: number; rejected: number };
  requests: StudentOutingRequest[];
};

function mapUiStatus(status: string): StudentOutingRequest['status'] {
  const u = status.toUpperCase();
  if (APPROVED.includes(u as (typeof APPROVED)[number])) return 'approved';
  if (REJECTED.includes(u as (typeof REJECTED)[number])) return 'rejected';
  return 'pending';
}

function statusLabel(status: string): string {
  const ui = mapUiStatus(status);
  if (ui === 'approved') return 'Approved';
  if (ui === 'rejected') return 'Rejected';
  return 'Pending review';
}

function statusNote(status: string): string {
  const ui = mapUiStatus(status);
  if (ui === 'approved') return 'Outing approved — use your gate pass within the time window.';
  if (ui === 'rejected') return 'Request declined. Contact your warden for details.';
  return 'Awaiting warden approval.';
}

function formatHm(d: Date): string {
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

function parseOutingDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function parseTimeHm(hm: string): Date {
  const [h, m] = hm.split(':').map(Number);
  return new Date(Date.UTC(1970, 0, 1, h, m, 0));
}

async function resolveStudentHostelId(prisma: PrismaClient, studentId: string): Promise<string | null> {
  const allocation = await prisma.allocationRecord.findFirst({
    where: { studentId, status: 'ACTIVE' },
    orderBy: { allocatedAt: 'desc' },
    include: {
      bed: { include: { room: { include: { floor: { include: { block: { include: { building: { include: { hostel: true } } } } } } } } } },
    },
  });
  return allocation?.bed.room.floor.block.building.hostel.id ?? null;
}

const emptyDesk = (now: Date): StudentOutingDesk => ({
  generatedAt: now.toISOString(),
  profileLinked: false,
  canApply: false,
  hostelName: null,
  summary: { total: 0, pending: 0, approved: 0, rejected: 0 },
  requests: [],
});

export async function getStudentOutingDesk(prisma: PrismaClient, userId: string): Promise<StudentOutingDesk> {
  const now = new Date();
  await ensureStudentProfileForUser(prisma, userId);
  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) return emptyDesk(now);

  const hostelId = await resolveStudentHostelId(prisma, student.id);
  const hostel = hostelId
    ? await prisma.hostel.findUnique({ where: { id: hostelId }, select: { name: true } })
    : null;

  const rows = await prisma.outingRequest.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
    take: 40,
  });

  const pending = rows.filter((r) => PENDING.includes(r.status.toUpperCase() as (typeof PENDING)[number])).length;
  const approved = rows.filter((r) => APPROVED.includes(r.status.toUpperCase() as (typeof APPROVED)[number])).length;
  const rejected = rows.filter((r) => REJECTED.includes(r.status.toUpperCase() as (typeof REJECTED)[number])).length;

  return {
    generatedAt: now.toISOString(),
    profileLinked: true,
    canApply: Boolean(hostelId),
    hostelName: hostel?.name ?? null,
    summary: { total: rows.length, pending, approved, rejected },
    requests: rows.map((row) => ({
      id: row.id,
      status: mapUiStatus(row.status),
      statusLabel: statusLabel(row.status),
      statusNote: statusNote(row.status),
      outingDate: row.outingDate.toISOString().slice(0, 10),
      departureTime: formatHm(row.departureTime),
      expectedReturnTime: formatHm(row.expectedReturnTime),
      destination: row.destination,
      isExceptional: row.isExceptional,
      submittedAt: row.createdAt.toISOString(),
      reviewedAt: row.reviewedBy ? row.createdAt.toISOString() : null,
    })),
  };
}

export async function createStudentOutingRequest(
  prisma: PrismaClient,
  userId: string,
  body: CreateStudentOutingBody,
): Promise<StudentOutingDesk> {
  await ensureStudentProfileForUser(prisma, userId);
  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) throw new BadRequestError('Student profile is not linked to this account.');

  const hostelId = await resolveStudentHostelId(prisma, student.id);
  if (!hostelId) throw new BadRequestError('You need an active hostel allocation before applying for an outing.');

  const outingDate = parseOutingDate(body.outingDate);
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (outingDate.getTime() < todayUtc.getTime()) {
    throw new BadRequestError('Outing date cannot be in the past.');
  }

  const overlapping = await prisma.outingRequest.count({
    where: {
      studentId: student.id,
      outingDate,
      status: { in: [...PENDING, ...APPROVED] },
    },
  });
  if (overlapping > 0) {
    throw new BadRequestError('You already have an active outing request for this date.');
  }

  const created = await prisma.outingRequest.create({
    data: {
      studentId: student.id,
      hostelId,
      outingDate,
      departureTime: parseTimeHm(body.departureTime),
      expectedReturnTime: parseTimeHm(body.expectedReturnTime),
      destination: body.destination,
      isExceptional: body.isExceptional ?? false,
      status: 'SUBMITTED',
    },
    select: { id: true },
  });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } });
  const studentName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'A resident';
  await notifyOutingApplicationSubmitted(prisma, {
    outingId: created.id,
    hostelId,
    studentName,
    destination: body.destination,
  });

  return getStudentOutingDesk(prisma, userId);
}