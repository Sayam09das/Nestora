import type { PrismaClient } from '@nestora/database';
import type {
  AccountantClearanceBody,
  CreateCheckOutRequestBody,
  FinalizeCheckOutBody,
  WardenCheckInBody,
} from '@nestora/validators';
import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors/index.js';
import { hostelNameInScope } from '../../common/helpers/warden-hostel-scope.js';
import { notifyCheckOutRequestSubmitted } from '../notifications/notification-events.service.js';

const PENDING_CHECKOUT = 'PENDING';

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function moneyBalance(ledger: { currentBalance: { toString(): string } } | null | undefined): number {
  if (!ledger) return 0;
  return Math.max(0, Math.round(Number(ledger.currentBalance)));
}

async function loadScopedActiveAllocation(
  prisma: PrismaClient,
  studentId: string,
) {
  return prisma.allocationRecord.findFirst({
    where: { studentId, status: 'ACTIVE' },
    orderBy: { allocatedAt: 'desc' },
    include: {
      bed: {
        include: {
          room: {
            include: {
              floor: {
                include: {
                  block: {
                    include: {
                      building: { include: { hostel: { select: { id: true, name: true } } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      checkIn: true,
      checkOut: true,
    },
  });
}

export type CheckOutRequestRow = {
  id: string;
  status: string;
  plannedDate: string;
  reason: string | null;
  createdAt: string;
  studentName: string;
  regNo: string;
  hostel: string;
  room: string;
  bed: string;
  allocationId: string;
  outstandingDues: number;
  accountantCleared: boolean;
  keysReturned?: boolean;
};

export type StudentCheckOutDesk = {
  generatedAt: string;
  canRequest: boolean;
  hostelName: string | null;
  roomLabel: string | null;
  checkedIn: boolean;
  outstandingDues: number;
  requests: CheckOutRequestRow[];
};

export async function getStudentCheckOutDesk(
  prisma: PrismaClient,
  userId: string,
): Promise<StudentCheckOutDesk> {
  const now = new Date();
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      registrationNumber: true,
      user: { select: { firstName: true, lastName: true } },
      studentLedger: { select: { currentBalance: true } },
    },
  });
  if (!student) {
    return {
      generatedAt: now.toISOString(),
      canRequest: false,
      hostelName: null,
      roomLabel: null,
      checkedIn: false,
      outstandingDues: 0,
      requests: [],
    };
  }

  const allocation = await loadScopedActiveAllocation(prisma, student.id);
  const outstanding = moneyBalance(student.studentLedger);
  const pending = await prisma.checkOutRequest.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: {
      allocation: {
        include: {
          bed: {
            include: {
              room: {
                include: {
                  floor: {
                    include: {
                      block: {
                        include: {
                          building: { include: { hostel: { select: { name: true } } } },
                        },
                      },
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

  const hostelName = allocation?.bed.room.floor.block.building.hostel.name ?? null;
  const roomLabel = allocation
    ? `${allocation.bed.room.roomNumber} · Bed ${allocation.bed.bedNumber}`
    : null;

  const hasPending = pending.some((r) => r.status === PENDING_CHECKOUT);

  return {
    generatedAt: now.toISOString(),
    canRequest: Boolean(allocation) && !hasPending,
    hostelName,
    roomLabel,
    checkedIn: Boolean(allocation?.checkIn),
    outstandingDues: outstanding,
    requests: pending.map((row) => mapRequestRow(row, student)),
  };
}

function mapRequestRow(
  row: {
    id: string;
    status: string;
    plannedDate: Date;
    reason: string | null;
    createdAt: Date;
    allocationId: string;
    accountantCleared: boolean;
    allocation: {
      bed: {
        bedNumber: string;
        room: {
          roomNumber: string;
          floor: { block: { building: { hostel: { name: string } } } };
        };
      };
    };
  },
  student: {
    registrationNumber: string;
    user: { firstName: string | null; lastName: string | null };
    studentLedger?: { currentBalance: { toString(): string } } | null;
  },
): CheckOutRequestRow {
  const bed = row.allocation.bed;
  const hostel = bed.room.floor.block.building.hostel.name;
  const name = `${student.user.firstName ?? ''} ${student.user.lastName ?? ''}`.trim();
  return {
    id: row.id,
    status: row.status,
    plannedDate: row.plannedDate.toISOString().slice(0, 10),
    reason: row.reason,
    createdAt: row.createdAt.toISOString(),
    studentName: name || 'Student',
    regNo: student.registrationNumber,
    hostel,
    room: bed.room.roomNumber,
    bed: bed.bedNumber,
    allocationId: row.allocationId,
    outstandingDues: moneyBalance(student.studentLedger ?? null),
    accountantCleared: row.accountantCleared,
  };
}

export async function createStudentCheckOutRequest(
  prisma: PrismaClient,
  userId: string,
  body: CreateCheckOutRequestBody,
): Promise<StudentCheckOutDesk> {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      registrationNumber: true,
      user: { select: { firstName: true, lastName: true } },
      studentLedger: { select: { currentBalance: true } },
    },
  });
  if (!student) {
    throw new BadRequestError('Student profile is not linked to this account.');
  }

  const allocation = await loadScopedActiveAllocation(prisma, student.id);
  if (!allocation) {
    throw new BadRequestError('You need an active bed allocation before requesting checkout.');
  }

  const existingPending = await prisma.checkOutRequest.findFirst({
    where: { studentId: student.id, status: PENDING_CHECKOUT },
    select: { id: true },
  });
  if (existingPending) {
    throw new ConflictError('You already have a pending checkout request.');
  }

  const planned = parseDateOnly(body.plannedDate);
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (planned.getTime() < todayUtc.getTime()) {
    throw new BadRequestError('Planned checkout date cannot be in the past.');
  }

  await prisma.checkOutRequest.create({
    data: {
      studentId: student.id,
      allocationId: allocation.id,
      plannedDate: planned,
      reason: body.reason?.trim() || null,
      status: PENDING_CHECKOUT,
    },
  });

  const hostelId = allocation.bed.room.floor.block.building.hostel.id;
  const studentName =
    `${student.user.firstName ?? ''} ${student.user.lastName ?? ''}`.trim() || 'Resident';
  await notifyCheckOutRequestSubmitted(prisma, {
    hostelId,
    studentName,
    plannedDate: body.plannedDate,
  });

  return getStudentCheckOutDesk(prisma, userId);
}

export async function listWardenCheckOutRequests(
  prisma: PrismaClient,
  hostelNames: string[] | null,
  status?: string,
): Promise<{ generatedAt: string; requests: CheckOutRequestRow[] }> {
  const now = new Date();
  const rows = await prisma.checkOutRequest.findMany({
    where: {
      status: status ?? PENDING_CHECKOUT,
    },
    orderBy: { plannedDate: 'asc' },
    take: 100,
    include: {
      student: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          studentLedger: { select: { currentBalance: true } },
        },
      },
      allocation: {
        include: {
          bed: {
            include: {
              room: {
                include: {
                  floor: {
                    include: {
                      block: {
                        include: {
                          building: { include: { hostel: { select: { name: true } } } },
                        },
                      },
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

  const filtered = rows.filter((row) => {
    if (!hostelNames?.length) return true;
    return hostelNameInScope(row.allocation.bed.room.floor.block.building.hostel.name, hostelNames);
  });

  return {
    generatedAt: now.toISOString(),
    requests: filtered.map((row) =>
      mapRequestRow(row, {
        registrationNumber: row.student.registrationNumber,
        user: row.student.user,
        studentLedger: row.student.studentLedger,
      }),
    ),
  };
}

export async function finalizeWardenCheckOut(
  prisma: PrismaClient,
  actorUserId: string,
  requestId: string,
  body: FinalizeCheckOutBody,
  hostelNames: string[] | null,
): Promise<CheckOutRequestRow> {
  const request = await prisma.checkOutRequest.findUnique({
    where: { id: requestId },
    include: {
      student: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          studentLedger: { select: { currentBalance: true } },
        },
      },
      allocation: {
        include: {
          bed: true,
          checkOut: true,
          checkIn: true,
        },
      },
    },
  });
  if (!request || request.status !== PENDING_CHECKOUT) {
    throw new NotFoundError('Pending checkout request not found.');
  }

  const hostelRow = await prisma.allocationRecord.findUnique({
    where: { id: request.allocationId },
    select: {
      bed: {
        select: {
          room: {
            select: {
              floor: {
                select: {
                  block: {
                    select: {
                      building: { select: { hostel: { select: { name: true } } } },
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
  const hostelName = hostelRow?.bed.room.floor.block.building.hostel.name ?? '';
  if (hostelNames?.length && !hostelNameInScope(hostelName, hostelNames)) {
    throw new NotFoundError('Checkout request not found.');
  }

  if (request.allocation.status !== 'ACTIVE') {
    throw new BadRequestError('Allocation is no longer active.');
  }
  if (request.allocation.checkOut) {
    throw new ConflictError('Checkout already finalized for this allocation.');
  }

  const outstanding = moneyBalance(request.student.studentLedger);
  if (outstanding > 0 && !request.accountantCleared) {
    throw new BadRequestError(
      `Cannot finalize checkout while finance dues remain (₹${outstanding.toLocaleString('en-IN')}). Accountant clearance required (FR-033).`,
    );
  }

  const now = new Date();
  const financeCleared = outstanding <= 0 || request.accountantCleared;

  await prisma.$transaction(async (tx) => {
    const checkOut = await tx.checkOutRecord.create({
      data: {
        allocationId: request.allocationId,
        checkOutTime: now,
        keysReturned: body.keysReturned,
        duesCleared: financeCleared,
        clearedBy: request.accountantClearedBy ?? actorUserId,
        remarks: body.remarks?.trim() || null,
      },
    });
    for (const item of body.inspections) {
      await tx.inventoryInspection.create({
        data: {
          checkOutId: checkOut.id,
          itemName: item.itemName,
          condition: item.condition,
          damageFee: item.damageFee ?? null,
          inspectedBy: actorUserId,
        },
      });
    }
    await tx.allocationRecord.update({
      where: { id: request.allocationId },
      data: {
        status: 'TERMINATED',
        endDate: now,
      },
    });
    await tx.bed.update({
      where: { id: request.allocation.bedId },
      data: { status: 'AVAILABLE' },
    });
    await tx.checkOutRequest.update({
      where: { id: requestId },
      data: {
        status: 'COMPLETED',
        reviewedBy: actorUserId,
        reviewedAt: now,
        reviewRemarks: body.remarks?.trim() || null,
      },
    });
  });

  const refreshed = await prisma.checkOutRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: {
      student: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          studentLedger: { select: { currentBalance: true } },
        },
      },
      allocation: {
        include: {
          bed: {
            include: {
              room: {
                include: {
                  floor: {
                    include: {
                      block: {
                        include: {
                          building: { include: { hostel: { select: { name: true } } } },
                        },
                      },
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

  return {
    ...mapRequestRow(refreshed, {
      registrationNumber: refreshed.student.registrationNumber,
      user: refreshed.student.user,
      studentLedger: refreshed.student.studentLedger,
    }),
    keysReturned: body.keysReturned,
  };
}

export async function recordWardenCheckIn(
  prisma: PrismaClient,
  actorUserId: string,
  body: WardenCheckInBody,
  hostelNames: string[] | null,
): Promise<{ checkInId: string; checkInTime: string }> {
  const allocation = await prisma.allocationRecord.findUnique({
    where: { id: body.allocationId },
    include: {
      checkIn: true,
      bed: {
        include: {
          room: {
            include: {
              floor: {
                include: {
                  block: {
                    include: {
                      building: { include: { hostel: { select: { name: true } } } },
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
  if (!allocation || allocation.status !== 'ACTIVE') {
    throw new NotFoundError('Active allocation not found.');
  }
  const hostelName = allocation.bed.room.floor.block.building.hostel.name;
  if (hostelNames?.length && !hostelNameInScope(hostelName, hostelNames)) {
    throw new NotFoundError('Allocation not found.');
  }
  if (allocation.checkIn) {
    throw new ConflictError('Check-in already recorded for this allocation.');
  }

  const now = new Date();
  const created = await prisma.checkInRecord.create({
    data: {
      allocationId: allocation.id,
      checkInTime: now,
      keysIssued: body.keysIssued,
      verifiedBy: actorUserId,
      remarks: body.remarks?.trim() || null,
    },
    select: { id: true, checkInTime: true },
  });

  return { checkInId: created.id, checkInTime: created.checkInTime.toISOString() };
}

export async function rejectWardenCheckOut(
  prisma: PrismaClient,
  actorUserId: string,
  requestId: string,
  remarks: string,
  hostelNames: string[] | null,
): Promise<void> {
  const request = await prisma.checkOutRequest.findUnique({
    where: { id: requestId },
    include: {
      allocation: {
        include: {
          bed: {
            include: {
              room: {
                include: {
                  floor: {
                    include: {
                      block: {
                        include: {
                          building: { include: { hostel: { select: { name: true } } } },
                        },
                      },
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
  if (!request || request.status !== PENDING_CHECKOUT) {
    throw new NotFoundError('Pending checkout request not found.');
  }
  const hostelName = request.allocation.bed.room.floor.block.building.hostel.name;
  if (hostelNames?.length && !hostelNameInScope(hostelName, hostelNames)) {
    throw new NotFoundError('Checkout request not found.');
  }
  await prisma.checkOutRequest.update({
    where: { id: requestId },
    data: {
      status: 'REJECTED',
      reviewedBy: actorUserId,
      reviewedAt: new Date(),
      reviewRemarks: remarks,
    },
  });
}

export async function cancelStudentCheckOutRequest(
  prisma: PrismaClient,
  userId: string,
  requestId: string,
): Promise<StudentCheckOutDesk> {
  const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (!student) throw new BadRequestError('Student profile not found.');

  const request = await prisma.checkOutRequest.findFirst({
    where: { id: requestId, studentId: student.id, status: PENDING_CHECKOUT },
  });
  if (!request) throw new NotFoundError('Pending checkout request not found.');

  await prisma.checkOutRequest.update({
    where: { id: requestId },
    data: { status: 'CANCELLED' },
  });

  return getStudentCheckOutDesk(prisma, userId);
}

export async function markAccountantCheckOutClearance(
  prisma: PrismaClient,
  actorUserId: string,
  requestId: string,
  body: AccountantClearanceBody,
): Promise<CheckOutRequestRow> {
  const request = await prisma.checkOutRequest.findUnique({
    where: { id: requestId },
    include: {
      student: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          studentLedger: { select: { currentBalance: true } },
        },
      },
      allocation: {
        include: {
          bed: {
            include: {
              room: {
                include: {
                  floor: {
                    include: {
                      block: {
                        include: {
                          building: { include: { hostel: { select: { name: true } } } },
                        },
                      },
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
  if (!request || request.status !== PENDING_CHECKOUT) {
    throw new NotFoundError('Pending checkout request not found.');
  }

  const outstanding = moneyBalance(request.student.studentLedger);
  if (outstanding > 0 && !body.affirmDuesCleared) {
    throw new BadRequestError('Outstanding dues remain. Record payment or affirm clearance with acknowledge flag.');
  }

  const now = new Date();
  await prisma.checkOutRequest.update({
    where: { id: requestId },
    data: {
      accountantCleared: true,
      accountantClearedAt: now,
      accountantClearedBy: actorUserId,
      reviewRemarks: body.remarks?.trim() || request.reviewRemarks,
    },
  });

  const refreshed = await prisma.checkOutRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: {
      student: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          studentLedger: { select: { currentBalance: true } },
        },
      },
      allocation: {
        include: {
          bed: {
            include: {
              room: {
                include: {
                  floor: {
                    include: {
                      block: {
                        include: {
                          building: { include: { hostel: { select: { name: true } } } },
                        },
                      },
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

  return mapRequestRow(refreshed, {
    registrationNumber: refreshed.student.registrationNumber,
    user: refreshed.student.user,
    studentLedger: refreshed.student.studentLedger,
  });
}