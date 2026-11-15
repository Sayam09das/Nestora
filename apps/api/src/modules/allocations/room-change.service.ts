import type { PrismaClient } from '@nestora/database';
import type { ApproveRoomChangeBody, CreateRoomChangeBody } from '@nestora/validators';
import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors/index.js';
import { hostelNameInScope } from '../../common/helpers/warden-hostel-scope.js';

const PENDING = 'PENDING';

export type RoomChangeRequestRow = {
  id: string;
  status: string;
  reason: string;
  createdAt: string;
  studentName: string;
  regNo: string;
  currentHostel: string;
  currentRoom: string;
  currentBed: string;
  preferredConfigLabel: string;
  preferredConfigId: string;
  studentUserId: string;
};

export type RoomConfigOption = {
  id: string;
  code: string;
  label: string;
  capacity: number;
  hasAc: boolean;
};

export async function listStudentRoomConfigurationOptions(
  prisma: PrismaClient,
  userId: string,
): Promise<{ options: RoomConfigOption[] }> {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!student) {
    throw new BadRequestError('Student profile is not linked.');
  }

  const allocation = await prisma.allocationRecord.findFirst({
    where: { studentId: student.id, status: 'ACTIVE' },
    select: {
      bed: {
        select: {
          room: {
            select: {
              floor: {
                select: {
                  block: { select: { building: { select: { hostelId: true } } } },
                },
              },
            },
          },
        },
      },
    },
  });
  const hostelId = allocation?.bed.room.floor.block.building.hostelId;

  const configs = await prisma.roomConfiguration.findMany({
    where: hostelId
      ? {
          rooms: {
            some: {
              floor: { block: { building: { hostelId } } },
            },
          },
        }
      : undefined,
    orderBy: { code: 'asc' },
    select: { id: true, code: true, description: true, capacity: true, hasAc: true },
  });

  return {
    options: configs.map((c) => ({
      id: c.id,
      code: c.code,
      label: `${c.code.replace(/_/g, ' ')} · ${c.description}`,
      capacity: c.capacity,
      hasAc: c.hasAc,
    })),
  };
}

export async function createStudentRoomChangeRequest(
  prisma: PrismaClient,
  userId: string,
  body: CreateRoomChangeBody,
): Promise<{ id: string }> {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!student) {
    throw new BadRequestError('Student profile is not linked.');
  }

  const allocation = await prisma.allocationRecord.findFirst({
    where: { studentId: student.id, status: 'ACTIVE' },
    include: { bed: true },
  });
  if (!allocation) {
    throw new BadRequestError('Active bed allocation required before requesting a room change.');
  }

  const pending = await prisma.roomChangeRequest.findFirst({
    where: { studentId: student.id, status: PENDING },
    select: { id: true },
  });
  if (pending) {
    throw new ConflictError('A room change request is already pending.');
  }

  const config = await prisma.roomConfiguration.findUnique({
    where: { id: body.preferredConfigId },
    select: { id: true },
  });
  if (!config) {
    throw new NotFoundError('Preferred room configuration not found.');
  }

  const created = await prisma.roomChangeRequest.create({
    data: {
      studentId: student.id,
      currentBedId: allocation.bedId,
      preferredConfigId: body.preferredConfigId,
      reason: body.reason,
      status: PENDING,
    },
    select: { id: true },
  });

  return { id: created.id };
}

export async function listWardenRoomChangeRequests(
  prisma: PrismaClient,
  hostelNames: string[] | null,
): Promise<{ generatedAt: string; requests: RoomChangeRequestRow[] }> {
  const rows = await prisma.roomChangeRequest.findMany({
    where: { status: PENDING },
    orderBy: { createdAt: 'asc' },
    take: 100,
    include: {
      preferredConfig: { select: { capacity: true, description: true, hasAc: true } },
      student: {
        select: {
          registrationNumber: true,
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      currentBed: {
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

  const filtered = rows.filter((row) => {
    const hostel = row.currentBed.room.floor.block.building.hostel.name;
    if (!hostelNames?.length) return true;
    return hostelNameInScope(hostel, hostelNames);
  });

  return {
    generatedAt: new Date().toISOString(),
    requests: filtered.map((row) => ({
      id: row.id,
      status: row.status,
      reason: row.reason,
      createdAt: row.createdAt.toISOString(),
      studentName:
        `${row.student.user.firstName ?? ''} ${row.student.user.lastName ?? ''}`.trim() || 'Student',
      regNo: row.student.registrationNumber,
      currentHostel: row.currentBed.room.floor.block.building.hostel.name,
      currentRoom: row.currentBed.room.roomNumber,
      currentBed: row.currentBed.bedNumber,
      preferredConfigLabel: `${row.preferredConfig.description} (${row.preferredConfig.capacity}-bed${row.preferredConfig.hasAc ? ', AC' : ''})`,
      preferredConfigId: row.preferredConfigId,
      studentUserId: row.student.user.id,
    })),
  };
}

export async function approveRoomChangeRequest(
  prisma: PrismaClient,
  actorUserId: string,
  requestId: string,
  body: ApproveRoomChangeBody,
  hostelNames: string[] | null,
): Promise<void> {
  const request = await prisma.roomChangeRequest.findUnique({
    where: { id: requestId },
    include: {
      student: true,
      currentBed: {
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
              config: true,
            },
          },
        },
      },
      preferredConfig: true,
    },
  });
  if (!request || request.status !== PENDING) {
    throw new NotFoundError('Pending room change request not found.');
  }

  const hostelName = request.currentBed.room.floor.block.building.hostel.name;
  if (hostelNames?.length && !hostelNameInScope(hostelName, hostelNames)) {
    throw new NotFoundError('Request not found.');
  }

  const allocation = await prisma.allocationRecord.findFirst({
    where: { studentId: request.studentId, status: 'ACTIVE', bedId: request.currentBedId },
    select: { id: true, startDate: true },
  });
  if (!allocation) {
    throw new BadRequestError('Student no longer occupies the requested current bed.');
  }

  const newBed = await prisma.bed.findUnique({
    where: { id: body.bedId },
    include: {
      room: {
        include: {
          config: true,
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
  });
  if (!newBed) {
    throw new NotFoundError('Target bed not found.');
  }
  if (newBed.status !== 'AVAILABLE') {
    throw new BadRequestError('Target bed is not available.');
  }
  if (newBed.room.configId !== request.preferredConfigId) {
    throw new BadRequestError('Bed does not match the student’s preferred room configuration.');
  }
  if (!hostelNameInScope(newBed.room.floor.block.building.hostel.name, hostelNames ?? [hostelName])) {
    throw new BadRequestError('Target bed is outside operational scope.');
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.allocationRecord.update({
      where: { id: allocation.id },
      data: { status: 'TRANSFERRED', endDate: now },
    });
    await tx.bed.update({
      where: { id: request.currentBedId },
      data: { status: 'AVAILABLE' },
    });
    await tx.allocationRecord.create({
      data: {
        studentId: request.studentId,
        bedId: newBed.id,
        allocatedBy: actorUserId,
        status: 'ACTIVE',
        startDate: allocation.startDate,
      },
    });
    await tx.bed.update({
      where: { id: newBed.id },
      data: { status: 'OCCUPIED' },
    });
    await tx.roomChangeRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        reviewedBy: actorUserId,
        reviewedAt: now,
      },
    });
  });
}

export async function rejectRoomChangeRequest(
  prisma: PrismaClient,
  actorUserId: string,
  requestId: string,
  remarks: string,
  hostelNames: string[] | null,
): Promise<void> {
  const request = await prisma.roomChangeRequest.findUnique({
    where: { id: requestId },
    include: {
      currentBed: {
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
  if (!request || request.status !== PENDING) {
    throw new NotFoundError('Pending room change request not found.');
  }
  const hostelName = request.currentBed.room.floor.block.building.hostel.name;
  if (hostelNames?.length && !hostelNameInScope(hostelName, hostelNames)) {
    throw new NotFoundError('Request not found.');
  }

  await prisma.$transaction([
    prisma.roomChangeRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        reviewedBy: actorUserId,
        reviewedAt: new Date(),
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId,
        actorRole: 'HOSTEL_WARDEN',
        actionName: 'ROOM_CHANGE_REJECTED',
        entityType: 'ROOM_CHANGE_REQUEST',
        entityId: requestId,
        newState: { remarks, studentReason: request.reason },
      },
    }),
  ]);
}