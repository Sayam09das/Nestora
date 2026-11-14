import type { Prisma, PrismaClient } from '@nestora/database';
import type { RegisterVisitorBody, VisitorDeskListQuery } from '@nestora/validators';
import { createHash } from 'node:crypto';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors/index.js';
import { hostelNameInScope } from '../../common/helpers/warden-hostel-scope.js';

const PENDING = 'PENDING_APPROVAL';
const APPROVED = 'APPROVED';
const REJECTED = 'REJECTED';
const CHECKED_IN = 'CHECKED_IN';
const CHECKED_OUT = 'CHECKED_OUT';

export type VisitorUiStatus = 'Pending Approval' | 'Approved' | 'Inside' | 'Checked Out' | 'Rejected';

export type VisitorDeskRecord = {
  id: string;
  visitorRef: string;
  visitorName: string;
  visitorPhone: string;
  idProofType: string;
  idProofNumber: string;
  purpose: string;
  hostel: string;
  studentId: string;
  studentName: string;
  roomBed: string;
  status: VisitorUiStatus;
  submittedAt: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  approvedBy: string | null;
  isException: boolean;
};

export type VisitorDeskSummary = {
  generatedAt: string;
  totalToday: number;
  pendingApproval: number;
  insideNow: number;
  checkedOutToday: number;
  facets: { hostels: string[] };
};

const visitorInclude = {
  hostel: { select: { name: true } },
  student: {
    include: {
      user: { select: { firstName: true, lastName: true } },
      allocationRecords: {
        where: { status: 'ACTIVE' },
        take: 1,
        include: {
          bed: {
            select: {
              bedNumber: true,
              room: { select: { roomNumber: true } },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.VisitorRecordInclude;

type VisitorRow = Prisma.VisitorRecordGetPayload<{ include: typeof visitorInclude }>;

function todayRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function visitorRef(id: string, createdAt: Date): string {
  const short = createHash('sha256').update(id).digest('hex').slice(0, 4).toUpperCase();
  return `VR-${createdAt.getUTCFullYear()}-${short}`;
}

function deriveUiStatus(row: VisitorRow): VisitorUiStatus {
  const db = row.status.toUpperCase();
  if (db === REJECTED) return 'Rejected';
  if (row.checkOutTime) return 'Checked Out';
  if (row.checkInTime && !row.checkOutTime) return 'Inside';
  if (db === PENDING) return 'Pending Approval';
  return 'Approved';
}

function mapRow(row: VisitorRow, approverNames?: Map<string, string>): VisitorDeskRecord {
  const student = row.student;
  const alloc = student.allocationRecords[0];
  const roomBed = alloc
    ? `${alloc.bed.room.roomNumber} · Bed ${alloc.bed.bedNumber}`
    : 'Unallocated';
  return {
    id: row.id,
    visitorRef: visitorRef(row.id, row.createdAt),
    visitorName: row.visitorName,
    visitorPhone: row.visitorPhone,
    idProofType: row.idProofType,
    idProofNumber: row.idProofNumber,
    purpose: row.purpose,
    hostel: row.hostel.name,
    studentId: student.registrationNumber,
    studentName: `${student.user.firstName} ${student.user.lastName}`.trim(),
    roomBed,
    status: deriveUiStatus(row),
    submittedAt: row.createdAt.toISOString(),
    checkInTime: row.checkInTime?.toISOString() ?? null,
    checkOutTime: row.checkOutTime?.toISOString() ?? null,
    approvedBy:
      row.approvedBy && approverNames?.get(row.approvedBy)
        ? approverNames.get(row.approvedBy)!
        : row.approvedBy
          ? 'Warden'
          : null,
    isException: row.isException,
  };
}

function hostelWhere(scopeHostelNames?: string[]): Prisma.VisitorRecordWhereInput {
  if (!scopeHostelNames?.length) return {};
  if (scopeHostelNames.length === 1) {
    return { hostel: { name: { equals: scopeHostelNames[0], mode: 'insensitive' } } };
  }
  return { hostel: { name: { in: scopeHostelNames, mode: 'insensitive' } } };
}

async function loadApproverNames(prisma: PrismaClient, rows: VisitorRow[]): Promise<Map<string, string>> {
  const ids = [...new Set(rows.map((r) => r.approvedBy).filter((id): id is string => Boolean(id)))];
  if (ids.length === 0) return new Map();
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, firstName: true, lastName: true },
  });
  return new Map(users.map((u) => [u.id, `${u.firstName} ${u.lastName}`.trim() || 'Warden']));
}

async function loadDeskRows(prisma: PrismaClient, scopeHostelNames?: string[]): Promise<VisitorDeskRecord[]> {
  const { start, end } = todayRange();
  const scope = hostelWhere(scopeHostelNames);
  const rows = await prisma.visitorRecord.findMany({
    where: {
      ...scope,
      OR: [
        { createdAt: { gte: start, lt: end } },
        { checkInTime: { not: null }, checkOutTime: null },
      ],
    },
    include: visitorInclude,
    orderBy: [{ checkInTime: 'desc' }, { createdAt: 'desc' }],
    take: 200,
  });
  const approvers = await loadApproverNames(prisma, rows);
  return rows.map((r) => mapRow(r, approvers));
}

function matchesFilters(row: VisitorDeskRecord, query: VisitorDeskListQuery): boolean {
  const q = query.q?.trim().toLowerCase();
  if (q) {
    const hit =
      row.visitorName.toLowerCase().includes(q) ||
      row.studentName.toLowerCase().includes(q) ||
      row.studentId.toLowerCase().includes(q) ||
      row.visitorRef.toLowerCase().includes(q) ||
      row.purpose.toLowerCase().includes(q);
    if (!hit) return false;
  }
  if (query.hostel?.trim() && query.hostel !== 'All Hostels') {
    if (row.hostel.toLowerCase() !== query.hostel.trim().toLowerCase()) return false;
  }
  if (query.status?.trim() && query.status !== 'All Status') {
    if (row.status !== query.status) return false;
  }
  return true;
}

export async function getVisitorDeskSummary(
  prisma: PrismaClient,
  scopeHostelNames?: string[],
  hostelFilter?: string,
): Promise<VisitorDeskSummary> {
  const rows = await loadDeskRows(prisma, scopeHostelNames);
  const scoped =
    hostelFilter && hostelFilter !== 'All Hostels'
      ? rows.filter((r) => hostelNameInScope(r.hostel, [hostelFilter]))
      : rows;

  let pendingApproval = 0;
  let insideNow = 0;
  let checkedOutToday = 0;
  const { start, end } = todayRange();

  for (const row of scoped) {
    if (row.status === 'Pending Approval') pendingApproval += 1;
    if (row.status === 'Inside') insideNow += 1;
    if (row.checkOutTime) {
      const out = new Date(row.checkOutTime);
      if (out >= start && out < end) checkedOutToday += 1;
    }
  }

  const totalToday = scoped.filter((r) => {
    const created = new Date(r.submittedAt);
    return created >= start && created < end;
  }).length;

  const hostels = new Set(rows.map((r) => r.hostel));

  return {
    generatedAt: new Date().toISOString(),
    totalToday,
    pendingApproval,
    insideNow,
    checkedOutToday,
    facets: { hostels: [...hostels].sort() },
  };
}

export async function listVisitorDeskRecords(
  prisma: PrismaClient,
  query: VisitorDeskListQuery,
  scopeHostelNames?: string[],
): Promise<VisitorDeskRecord[]> {
  const rows = await loadDeskRows(prisma, scopeHostelNames);
  return rows.filter((r) => matchesFilters(r, query));
}

async function assertVisitorInScope(
  prisma: PrismaClient,
  visitorId: string,
  scopeHostelNames?: string[],
): Promise<VisitorRow> {
  const row = await prisma.visitorRecord.findUnique({
    where: { id: visitorId },
    include: visitorInclude,
  });
  if (!row) throw new NotFoundError('Visitor record not found.');
  if (scopeHostelNames?.length && !hostelNameInScope(row.hostel.name, scopeHostelNames)) {
    throw new ForbiddenError('Visitor record is outside your hostel scope.');
  }
  return row as VisitorRow;
}

async function studentHostelId(
  prisma: PrismaClient,
  studentId: string,
): Promise<{ hostelId: string; hostelName: string }> {
  const alloc = await prisma.allocationRecord.findFirst({
    where: { studentId, status: 'ACTIVE' },
    select: {
      bed: {
        select: {
          room: {
            select: {
              floor: {
                select: {
                  block: {
                    select: {
                      building: { select: { hostel: { select: { id: true, name: true } } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  const hostel = alloc?.bed.room.floor.block.building.hostel;
  if (!hostel) {
    throw new BadRequestError('Student has no active hostel allocation.');
  }
  return { hostelId: hostel.id, hostelName: hostel.name };
}

export async function registerVisitor(
  prisma: PrismaClient,
  body: RegisterVisitorBody,
  guardUserId: string,
  scopeHostelNames?: string[],
): Promise<VisitorDeskRecord> {
  const { hostelId, hostelName } = await studentHostelId(prisma, body.studentId);
  if (scopeHostelNames?.length && !hostelNameInScope(hostelName, scopeHostelNames)) {
    throw new ForbiddenError('Student is outside your hostel scope.');
  }

  const created = await prisma.visitorRecord.create({
    data: {
      hostelId,
      studentId: body.studentId,
      visitorName: body.visitorName.trim(),
      visitorPhone: body.visitorPhone.trim(),
      idProofType: body.idProofType.trim(),
      idProofNumber: body.idProofNumber.trim(),
      purpose: body.purpose.trim(),
      isException: body.isException ?? false,
      guardId: guardUserId,
      status: PENDING,
    },
    include: visitorInclude,
  });
  return mapRow(created);
}

export async function approveVisitor(
  prisma: PrismaClient,
  visitorId: string,
  approverId: string,
  scopeHostelNames?: string[],
): Promise<VisitorDeskRecord> {
  const row = await assertVisitorInScope(prisma, visitorId, scopeHostelNames);
  if (row.status.toUpperCase() !== PENDING) {
    throw new BadRequestError('Only pending visitors can be approved.');
  }
  const updated = await prisma.visitorRecord.update({
    where: { id: visitorId },
    data: { status: APPROVED, approvedBy: approverId },
    include: visitorInclude,
  });
  const approvers = await loadApproverNames(prisma, [updated]);
  return mapRow(updated, approvers);
}

export async function rejectVisitor(
  prisma: PrismaClient,
  visitorId: string,
  approverId: string,
  scopeHostelNames?: string[],
): Promise<VisitorDeskRecord> {
  const row = await assertVisitorInScope(prisma, visitorId, scopeHostelNames);
  if (row.status.toUpperCase() !== PENDING) {
    throw new BadRequestError('Only pending visitors can be rejected.');
  }
  const updated = await prisma.visitorRecord.update({
    where: { id: visitorId },
    data: { status: REJECTED, approvedBy: approverId },
    include: visitorInclude,
  });
  const approvers = await loadApproverNames(prisma, [updated]);
  return mapRow(updated, approvers);
}

export async function checkInVisitor(
  prisma: PrismaClient,
  visitorId: string,
  scopeHostelNames?: string[],
): Promise<VisitorDeskRecord> {
  const row = await assertVisitorInScope(prisma, visitorId, scopeHostelNames);
  const db = row.status.toUpperCase();
  if (db === REJECTED || db === PENDING) {
    throw new BadRequestError('Approve the visitor before check-in.');
  }
  if (row.checkInTime && !row.checkOutTime) {
    throw new BadRequestError('Visitor is already checked in.');
  }
  const updated = await prisma.visitorRecord.update({
    where: { id: visitorId },
    data: { checkInTime: new Date(), status: CHECKED_IN, checkOutTime: null },
    include: visitorInclude,
  });
  return mapRow(updated);
}

export async function checkOutVisitor(
  prisma: PrismaClient,
  visitorId: string,
  scopeHostelNames?: string[],
): Promise<VisitorDeskRecord> {
  const row = await assertVisitorInScope(prisma, visitorId, scopeHostelNames);
  if (!row.checkInTime || row.checkOutTime) {
    throw new BadRequestError('Visitor must be checked in before check-out.');
  }
  const updated = await prisma.visitorRecord.update({
    where: { id: visitorId },
    data: { checkOutTime: new Date(), status: CHECKED_OUT },
    include: visitorInclude,
  });
  return mapRow(updated);
}
