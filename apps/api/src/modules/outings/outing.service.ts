import type { Prisma, PrismaClient } from '@nestora/database';
import type { OutingDeskListQuery } from '@nestora/validators';
import { createHash, randomBytes } from 'node:crypto';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors/index.js';
import { hostelNameInScope } from '../../common/helpers/warden-hostel-scope.js';
import { notifyOutingDecision } from '../notifications/notification-events.service.js';

const PENDING_DB = ['SUBMITTED', 'PENDING', 'PENDING_APPROVAL'] as const;
const APPROVED_DB = 'APPROVED';
const REJECTED_DB = 'REJECTED';

export type OutingDeskRow = {
  id: string;
  outingRef: string;
  studentId: string;
  studentName: string;
  hostel: string;
  roomBed: string;
  outingDate: string;
  departureTime: string;
  expectedReturnTime: string;
  destination: string;
  isExceptional: boolean;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  submittedAt: string;
  gatePassToken: string | null;
};

export type OutingDeskSummary = {
  generatedAt: string;
  pendingReview: number;
  approvedToday: number;
  exceptionalPending: number;
  facets: { hostels: string[] };
};

const outingInclude = {
  hostel: { select: { name: true } },
  student: {
    include: {
      user: { select: { firstName: true, lastName: true } },
      allocationRecords: {
        where: { status: 'ACTIVE' },
        take: 1,
        include: {
          bed: {
            include: {
              room: { include: { floor: { include: { block: { select: { name: true } } } } } },
            },
          },
        },
      },
    },
  },
  gatePasses: { orderBy: { validFrom: 'desc' as const }, take: 1 },
} satisfies Prisma.OutingRequestInclude;

type OutingRow = Prisma.OutingRequestGetPayload<{ include: typeof outingInclude }>;

function formatHm(d: Date): string {
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

function outingRefFromId(id: string, createdAt: Date): string {
  const year = createdAt.getUTCFullYear();
  const short = createHash('sha256').update(id).digest('hex').slice(0, 4).toUpperCase();
  return `OUT-${year}-${short}`;
}

function roomBed(alloc: OutingRow['student']['allocationRecords'][0] | undefined): string {
  if (!alloc?.bed) return 'Unallocated';
  const room = alloc.bed.room;
  return `${room.floor.block.name} · ${room.roomNumber} · Bed ${alloc.bed.bedNumber}`;
}

function mapUiStatus(db: string): OutingDeskRow['status'] {
  const u = db.toUpperCase();
  if (PENDING_DB.some((s) => s === u)) return 'Pending Review';
  if (u === APPROVED_DB) return 'Approved';
  if (u === REJECTED_DB) return 'Rejected';
  return 'Pending Review';
}

function mapRow(row: OutingRow): OutingDeskRow {
  const studentName =
    `${row.student.user.firstName ?? ''} ${row.student.user.lastName ?? ''}`.trim() || row.student.id;
  return {
    id: row.id,
    outingRef: outingRefFromId(row.id, row.createdAt),
    studentId: row.studentId,
    studentName,
    hostel: row.hostel.name,
    roomBed: roomBed(row.student.allocationRecords[0]),
    outingDate: row.outingDate.toISOString().slice(0, 10),
    departureTime: formatHm(row.departureTime),
    expectedReturnTime: formatHm(row.expectedReturnTime),
    destination: row.destination,
    isExceptional: row.isExceptional,
    status: mapUiStatus(row.status),
    submittedAt: row.createdAt.toISOString(),
    gatePassToken: row.gatePasses[0]?.passToken ?? null,
  };
}

function matchesQuery(row: OutingDeskRow, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    row.studentName.toLowerCase().includes(needle) ||
    row.destination.toLowerCase().includes(needle) ||
    row.outingRef.toLowerCase().includes(needle)
  );
}

function matchesHostel(row: OutingDeskRow, hostel?: string): boolean {
  if (!hostel || hostel === 'All Hostels') return true;
  return row.hostel.toLowerCase() === hostel.trim().toLowerCase();
}

function matchesStatus(row: OutingDeskRow, status?: string): boolean {
  if (!status || status === 'All Status') return true;
  return row.status === status;
}

async function loadOutings(prisma: PrismaClient, scopeHostelNames?: string[]): Promise<OutingRow[]> {
  const where: Prisma.OutingRequestWhereInput = {};
  if (scopeHostelNames?.length) {
    where.hostel = { name: { in: scopeHostelNames } };
  }
  return prisma.outingRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: outingInclude,
  });
}

function combineDateTimeUtc(date: Date, time: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      time.getUTCHours(),
      time.getUTCMinutes(),
      0,
    ),
  );
}

function gatePassToken(): string {
  return `GP-${randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function getOutingDeskSummary(
  prisma: PrismaClient,
  scopeHostelNames?: string[],
): Promise<OutingDeskSummary> {
  const rows = await loadOutings(prisma, scopeHostelNames);
  const mapped = rows.map(mapRow);
  const today = new Date().toISOString().slice(0, 10);
  const hostels = new Set(mapped.map((r) => r.hostel));
  return {
    generatedAt: new Date().toISOString(),
    pendingReview: mapped.filter((r) => r.status === 'Pending Review').length,
    approvedToday: mapped.filter((r) => r.status === 'Approved' && r.outingDate === today).length,
    exceptionalPending: mapped.filter((r) => r.status === 'Pending Review' && r.isExceptional).length,
    facets: { hostels: [...hostels].sort() },
  };
}

export async function listOutingDeskApplications(
  prisma: PrismaClient,
  query: OutingDeskListQuery,
  scopeHostelNames?: string[],
): Promise<OutingDeskRow[]> {
  const rows = await loadOutings(prisma, scopeHostelNames).then((list) => list.map(mapRow));
  return rows.filter(
    (row) =>
      matchesQuery(row, query.q ?? '') &&
      matchesHostel(row, query.hostel) &&
      matchesStatus(row, query.status),
  );
}

export async function decideOutingApplication(
  prisma: PrismaClient,
  params: {
    outingId: string;
    decision: 'Approved' | 'Rejected';
    feedback?: string;
    reviewerId: string;
    scopeHostelNames?: string[];
  },
): Promise<OutingDeskRow> {
  const row = await prisma.outingRequest.findUnique({
    where: { id: params.outingId },
    include: { hostel: { select: { name: true } } },
  });
  if (!row) throw new NotFoundError('Outing request not found.');
  if (params.scopeHostelNames?.length && !hostelNameInScope(row.hostel.name, params.scopeHostelNames)) {
    throw new ForbiddenError('Outing request is outside your hostel scope.');
  }

  const db = row.status.toUpperCase();
  if (!PENDING_DB.some((s) => s === db)) {
    throw new BadRequestError('Only pending outing requests can be reviewed.');
  }
  if (params.decision === 'Rejected' && !params.feedback?.trim()) {
    throw new BadRequestError('Rejection requires warden feedback.');
  }

  const newStatus = params.decision === 'Approved' ? APPROVED_DB : REJECTED_DB;
  await prisma.outingRequest.update({
    where: { id: params.outingId },
    data: { status: newStatus, reviewedBy: params.reviewerId },
  });

  let issuedPassToken: string | null = null;
  if (params.decision === 'Approved') {
    const validFrom = combineDateTimeUtc(row.outingDate, row.departureTime);
    const validUntil = combineDateTimeUtc(row.outingDate, row.expectedReturnTime);
    issuedPassToken = gatePassToken();
    await prisma.gatePass.create({
      data: {
        passToken: issuedPassToken,
        studentId: row.studentId,
        outingId: row.id,
        validFrom,
        validUntil,
      },
    });
  }

  await notifyOutingDecision(prisma, {
    studentId: row.studentId,
    decision: params.decision,
    outingId: row.id,
    hostelName: row.hostel.name,
    passToken: issuedPassToken,
  });

  void params.feedback;

  const refreshed = await prisma.outingRequest.findUnique({
    where: { id: params.outingId },
    include: outingInclude,
  });
  if (!refreshed) throw new NotFoundError('Outing request not found.');
  return mapRow(refreshed);
}