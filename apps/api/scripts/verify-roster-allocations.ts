import { prisma } from '@nestora/database';

const stats = await prisma.student.groupBy({
  by: ['id'],
  where: { registrationNumber: { startsWith: 'STU-2026-' } },
  _count: true,
});

const allocated = await prisma.student.count({
  where: {
    registrationNumber: { startsWith: 'STU-2026-' },
    allocationRecords: { some: { status: 'ACTIVE' } },
  },
});

const rahul = await prisma.student.findUnique({
  where: { registrationNumber: 'STU-2026-001' },
  include: {
    allocationRecords: {
      where: { status: 'ACTIVE' },
      take: 1,
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
    },
  },
});

const alloc = rahul?.allocationRecords[0];
let roommateName = '—';
if (alloc) {
  const peer = await prisma.allocationRecord.findFirst({
    where: {
      status: 'ACTIVE',
      bed: { roomId: alloc.bed.roomId },
      studentId: { not: rahul!.id },
    },
    include: { student: { include: { user: true } } },
  });
  if (peer) {
    roommateName = `${peer.student.user.firstName} ${peer.student.user.lastName}`;
  }
}

console.log({ rosterStudents: stats.length, allocated });
console.log({
  rahul: {
    hostel: alloc?.bed.room.floor.block.building.hostel.name,
    room: alloc?.bed.room.roomNumber,
    bed: alloc?.bed.bedNumber,
    roommate: roommateName,
  },
});

await prisma.$disconnect();
