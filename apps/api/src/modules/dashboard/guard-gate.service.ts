import type { PrismaClient } from '@nestora/database';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors/index.js';
import { hostelNameInScope } from '../../common/helpers/warden-hostel-scope.js';
import { resolveHostelScope } from './operational-dashboard.service.js';

export type GuardGateMovementRow = {
  id: string;
  passToken: string;
  studentName: string;
  registrationNumber: string;
  hostelName: string;
  roomBed: string;
  actualDeparture: string | null;
  actualReturn: string | null;
  isLateReturn: boolean;
  status: 'out' | 'returned';
};

export type GuardGateConsoleDesk = {
  generatedAt: string;
  hostelNames: string[];
  unassigned: boolean;
  summary: {
    currentlyOut: number;
    exitsToday: number;
    returnsToday: number;
  };
  recentMovements: GuardGateMovementRow[];
};

export type GuardGateLookupResult = {
  passId: string;
  passToken: string;
  studentName: string;
  registrationNumber: string;
  hostelName: string;
  roomBed: string;
  leaveType: string;
  destination: string;
  validFrom: string;
  validUntil: string;
  passValidity: 'valid' | 'not_yet' | 'expired';
  movementPhase: 'ready_exit' | 'out' | 'returned' | 'closed';
  openMovementId: string | null;
  canRecordExit: boolean;
  canRecordReturn: boolean;
  isLateReturnRisk: boolean;
};

function studentDisplayName(student: {
  user: { firstName: string | null; lastName: string | null };
  registrationNumber: string;
}): string {
  const name = `${student.user.firstName ?? ''} ${student.user.lastName ?? ''}`.trim();
  return name || student.registrationNumber;
}

function formatRoomBed(allocation: {
  bed: { bedNumber: string; room: { roomNumber: string; floor: { block: { name: string } } } };
} | null): string {
  if (!allocation) return '—';
  const { bed } = allocation;
  return `${bed.room.floor.block.name} · ${bed.room.roomNumber} · Bed ${bed.bedNumber}`;
}

async function guardHostelIds(prisma: PrismaClient, guardUserId: string): Promise<{
  hostelIds: string[];
  hostelNames: string[];
  unassigned: boolean;
}> {
  const scope = await resolveHostelScope(prisma, guardUserId, 'HOSTEL_STAFF');
  return {
    hostelIds: scope.hostelIds,
    hostelNames: scope.hostelNames,
    unassigned: scope.hostelIds.length === 0,
  };
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function passValidityWindow(validFrom: Date, validUntil: Date, now: Date): GuardGateLookupResult['passValidity'] {
  if (now.getTime() < validFrom.getTime()) return 'not_yet';
  if (now.getTime() > validUntil.getTime()) return 'expired';
  return 'valid';
}

type PassRow = NonNullable<Awaited<ReturnType<typeof loadPassByToken>>>;

async function loadPassByToken(prisma: PrismaClient, token: string) {
  return prisma.gatePass.findFirst({
    where: { passToken: { equals: token.trim(), mode: 'insensitive' } },
    include: {
      leave: { include: { hostel: { select: { id: true, name: true } } } },
      student: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          allocationRecords: {
            where: { status: 'ACTIVE' },
            orderBy: { allocatedAt: 'desc' },
            take: 1,
            include: {
              bed: {
                include: {
                  room: {
                    include: { floor: { include: { block: { select: { name: true } } } } },
                  },
                },
              },
            },
          },
        },
      },
      movementLogs: { orderBy: { actualDeparture: 'desc' }, take: 1 },
    },
  });
}

async function loadPassById(prisma: PrismaClient, passId: string) {
  return prisma.gatePass.findUnique({
    where: { id: passId },
    include: {
      leave: { include: { hostel: { select: { id: true, name: true } } } },
      student: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          allocationRecords: {
            where: { status: 'ACTIVE' },
            orderBy: { allocatedAt: 'desc' },
            take: 1,
            include: {
              bed: {
                include: {
                  room: {
                    include: { floor: { include: { block: { select: { name: true } } } } },
                  },
                },
              },
            },
          },
        },
      },
      movementLogs: { orderBy: { actualDeparture: 'desc' }, take: 1 },
    },
  });
}

function assertPassInGuardScope(
  pass: PassRow,
  hostelIds: string[],
  hostelNames: string[],
): { hostelId: string; hostelName: string } {
  const hostelId = pass.leave?.hostelId;
  const hostelName = pass.leave?.hostel.name;
  if (!hostelId || !hostelName) {
    throw new BadRequestError('This pass is not linked to a hostel leave record.');
  }
  if (hostelIds.length > 0 && !hostelIds.includes(hostelId)) {
    if (!hostelNameInScope(hostelName, hostelNames)) {
      throw new ForbiddenError('This pass belongs to a hostel outside your gate assignment.');
    }
  }
  return { hostelId, hostelName };
}

function mapLookup(pass: PassRow, now: Date): GuardGateLookupResult {
  const movement = pass.movementLogs[0];
  const validity = passValidityWindow(pass.validFrom, pass.validUntil, now);
  const hostelName = pass.leave?.hostel.name ?? 'Hostel';
  const allocation = pass.student.allocationRecords[0] ?? null;

  let movementPhase: GuardGateLookupResult['movementPhase'] = 'ready_exit';
  if (pass.isUsed || movement?.actualReturn) {
    movementPhase = 'returned';
  } else if (movement?.actualDeparture && !movement.actualReturn) {
    movementPhase = 'out';
  } else if (validity === 'expired' && !movement?.actualDeparture) {
    movementPhase = 'closed';
  }

  const canRecordExit =
    validity !== 'expired' &&
    movementPhase === 'ready_exit' &&
    !pass.isUsed;
  const canRecordReturn = movementPhase === 'out' && Boolean(movement?.id);

  const expectedReturn = pass.leave?.expectedReturnDate;
  const isLateReturnRisk =
    Boolean(expectedReturn) &&
    startOfUtcDay(now).getTime() > startOfUtcDay(expectedReturn!).getTime();

  return {
    passId: pass.id,
    passToken: pass.passToken,
    studentName: studentDisplayName(pass.student),
    registrationNumber: pass.student.registrationNumber,
    hostelName,
    roomBed: formatRoomBed(allocation),
    leaveType: pass.leave?.leaveType ?? 'Leave',
    destination: pass.leave?.destination ?? '—',
    validFrom: pass.validFrom.toISOString(),
    validUntil: pass.validUntil.toISOString(),
    passValidity: validity,
    movementPhase,
    openMovementId: movement?.actualReturn ? null : movement?.id ?? null,
    canRecordExit,
    canRecordReturn,
    isLateReturnRisk,
  };
}

function mapMovementRow(
  log: {
    id: string;
    actualDeparture: Date | null;
    actualReturn: Date | null;
    isLateReturn: boolean;
    pass: { passToken: string };
    student: {
      registrationNumber: string;
      user: { firstName: string | null; lastName: string | null };
      allocationRecords: Array<{
        bed: { bedNumber: string; room: { roomNumber: string; floor: { block: { name: string } } } };
      }>;
    };
    hostel: { name: string };
  },
): GuardGateMovementRow {
  const alloc = log.student.allocationRecords[0];
  return {
    id: log.id,
    passToken: log.pass.passToken,
    studentName: studentDisplayName(log.student),
    registrationNumber: log.student.registrationNumber,
    hostelName: log.hostel.name,
    roomBed: formatRoomBed(alloc ? { bed: alloc.bed } : null),
    actualDeparture: log.actualDeparture?.toISOString() ?? null,
    actualReturn: log.actualReturn?.toISOString() ?? null,
    isLateReturn: log.isLateReturn,
    status: log.actualReturn ? 'returned' : 'out',
  };
}

export async function getGuardGateConsoleDesk(
  prisma: PrismaClient,
  guardUserId: string,
): Promise<GuardGateConsoleDesk> {
  const now = new Date();
  const { hostelIds, hostelNames, unassigned } = await guardHostelIds(prisma, guardUserId);
  const today = startOfUtcDay(now);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  if (unassigned) {
    return {
      generatedAt: now.toISOString(),
      hostelNames: [],
      unassigned: true,
      summary: { currentlyOut: 0, exitsToday: 0, returnsToday: 0 },
      recentMovements: [],
    };
  }

  const hostelWhere = hostelIds.length === 1 ? hostelIds[0]! : { in: hostelIds };

  const movementLogs = await prisma.gateMovementLog.findMany({
    where: { hostelId: hostelWhere },
    orderBy: { actualDeparture: 'desc' },
    take: 25,
    include: {
      pass: { select: { passToken: true } },
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
                  room: {
                    include: { floor: { include: { block: { select: { name: true } } } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const todayLogs = movementLogs.filter(
    (m) => m.actualDeparture && m.actualDeparture >= today && m.actualDeparture < tomorrow,
  );
  const returnsToday = todayLogs.filter((m) => m.actualReturn).length;
  const exitsToday = todayLogs.length;
  const currentlyOut = movementLogs.filter((m) => m.actualDeparture && !m.actualReturn).length;

  return {
    generatedAt: now.toISOString(),
    hostelNames,
    unassigned: false,
    summary: { currentlyOut, exitsToday, returnsToday },
    recentMovements: movementLogs.map(mapMovementRow),
  };
}

export async function lookupGuardGatePass(
  prisma: PrismaClient,
  guardUserId: string,
  token: string,
): Promise<GuardGateLookupResult> {
  const { hostelIds, hostelNames, unassigned } = await guardHostelIds(prisma, guardUserId);
  if (unassigned) {
    throw new ForbiddenError('No hostel gate assignment on your account. Contact the warden.');
  }

  const pass = await loadPassByToken(prisma, token);
  if (!pass) {
    throw new NotFoundError('No gate pass found for that token.');
  }

  assertPassInGuardScope(pass, hostelIds, hostelNames);
  return mapLookup(pass, new Date());
}

export async function recordGuardGateExit(
  prisma: PrismaClient,
  guardUserId: string,
  passId: string,
  remarks?: string,
): Promise<GuardGateLookupResult> {
  const { hostelIds, hostelNames, unassigned } = await guardHostelIds(prisma, guardUserId);
  if (unassigned) {
    throw new ForbiddenError('No hostel gate assignment on your account.');
  }

  const pass = await loadPassById(prisma, passId);
  if (!pass) {
    throw new NotFoundError('Gate pass not found.');
  }

  const { hostelId } = assertPassInGuardScope(pass, hostelIds, hostelNames);
  const now = new Date();
  const lookup = mapLookup(pass, now);

  if (!lookup.canRecordExit) {
    throw new BadRequestError('Exit cannot be recorded for this pass in its current state.');
  }

  const open = pass.movementLogs[0];
  if (open?.actualDeparture && !open.actualReturn) {
    throw new BadRequestError('Student is already marked out on this pass.');
  }

  await prisma.gateMovementLog.create({
    data: {
      passId: pass.id,
      studentId: pass.studentId,
      hostelId,
      securityGuardId: guardUserId,
      actualDeparture: now,
      remarks: remarks?.trim() || null,
    },
  });

  const refreshed = await loadPassById(prisma, passId);
  if (!refreshed) {
    throw new NotFoundError('Gate pass not found.');
  }
  return mapLookup(refreshed, now);
}

export async function recordGuardGateReturn(
  prisma: PrismaClient,
  guardUserId: string,
  passId: string,
  remarks?: string,
): Promise<GuardGateLookupResult> {
  const { hostelIds, hostelNames, unassigned } = await guardHostelIds(prisma, guardUserId);
  if (unassigned) {
    throw new ForbiddenError('No hostel gate assignment on your account.');
  }

  const pass = await loadPassById(prisma, passId);
  if (!pass) {
    throw new NotFoundError('Gate pass not found.');
  }

  assertPassInGuardScope(pass, hostelIds, hostelNames);
  const now = new Date();
  const lookup = mapLookup(pass, now);

  if (!lookup.canRecordReturn || !lookup.openMovementId) {
    throw new BadRequestError('Return cannot be recorded — student is not marked out on this pass.');
  }

  const expectedReturn = pass.leave?.expectedReturnDate;
  const isLate =
    Boolean(expectedReturn) &&
    startOfUtcDay(now).getTime() > startOfUtcDay(expectedReturn!).getTime();

  await prisma.$transaction([
    prisma.gateMovementLog.update({
      where: { id: lookup.openMovementId },
      data: {
        actualReturn: now,
        isLateReturn: isLate,
        remarks: remarks?.trim() || undefined,
        securityGuardId: guardUserId,
      },
    }),
    prisma.gatePass.update({
      where: { id: pass.id },
      data: { isUsed: true },
    }),
  ]);

  const refreshed = await loadPassById(prisma, passId);
  if (!refreshed) {
    throw new NotFoundError('Gate pass not found.');
  }
  return mapLookup(refreshed, now);
}