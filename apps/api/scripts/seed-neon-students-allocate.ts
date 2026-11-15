/**
 * Assigns all STU-2026-* roster students to beds:
 * - Pairs (roommates) in double rooms
 * - Triples in triple-capacity rooms (sample)
 * - Single occupancy in double rooms (one student, one bed free)
 *
 *   pnpm --filter @nestora/api seed:neon-students-allocate
 */
import { prisma } from '@nestora/database';

type BedRow = {
  bedId: string;
  bedNumber: string;
  roomId: string;
  roomNumber: string;
  capacity: number;
  hostelName: string;
};

async function loadAvailableBedRooms(): Promise<Map<string, BedRow[]>> {
  const beds = await prisma.bed.findMany({
    where: {
      status: 'AVAILABLE',
      room: { status: 'ACTIVE' },
    },
    select: {
      id: true,
      bedNumber: true,
      roomId: true,
      room: {
        select: {
          roomNumber: true,
          config: { select: { capacity: true } },
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
    orderBy: [
      { room: { floor: { block: { building: { hostel: { name: 'asc' } } } } } },
      { room: { roomNumber: 'asc' } },
      { bedNumber: 'asc' },
    ],
  });

  const byRoom = new Map<string, BedRow[]>();
  for (const bed of beds) {
    const row: BedRow = {
      bedId: bed.id,
      bedNumber: bed.bedNumber,
      roomId: bed.roomId,
      roomNumber: bed.room.roomNumber,
      capacity: bed.room.config.capacity,
      hostelName: bed.room.floor.block.building.hostel.name,
    };
    const list = byRoom.get(bed.roomId) ?? [];
    list.push(row);
    byRoom.set(bed.roomId, list);
  }

  // Only rooms where all beds are still available (clean assign)
  for (const [roomId, list] of [...byRoom.entries()]) {
    if (list.length !== list[0]!.capacity) {
      byRoom.delete(roomId);
    }
  }

  return byRoom;
}

function roomsByCapacity(
  byRoom: Map<string, BedRow[]>,
  capacity: number,
  hostelIncludes?: string,
): BedRow[][] {
  const out: BedRow[][] = [];
  for (const list of byRoom.values()) {
    if (list[0]!.capacity !== capacity) continue;
    if (hostelIncludes && !list[0]!.hostelName.toLowerCase().includes(hostelIncludes.toLowerCase())) {
      continue;
    }
    out.push(list);
  }
  return out;
}

async function allocateBed(
  adminId: string,
  studentId: string,
  bedId: string,
  roomId: string,
  byRoom: Map<string, BedRow[]>,
): Promise<void> {
  const existing = await prisma.allocationRecord.findFirst({
    where: { studentId, status: 'ACTIVE' },
    select: { id: true },
  });
  if (existing) return;

  await prisma.$transaction(
    async (tx) => {
      await tx.allocationRecord.create({
        data: {
          studentId,
          bedId,
          allocatedBy: adminId,
          status: 'ACTIVE',
          startDate: new Date('2025-08-01'),
        },
      });
      await tx.bed.update({ where: { id: bedId }, data: { status: 'OCCUPIED' } });
    },
    { maxWait: 60_000, timeout: 120_000 },
  );

  const list = byRoom.get(roomId);
  if (list) {
    const remaining = list.filter((b) => b.bedId !== bedId);
    if (remaining.length === 0) byRoom.delete(roomId);
    else byRoom.set(roomId, remaining);
  }
}

const admin = await prisma.user.findFirst({
  where: { role: 'UNIVERSITY_ADMINISTRATOR', status: 'ACTIVE' },
  orderBy: { createdAt: 'asc' },
});

if (!admin) {
  console.error('No active university administrator.');
  process.exit(1);
}

const students = await prisma.student.findMany({
  where: {
    registrationNumber: { startsWith: 'STU-2026-' },
    allocationRecords: { none: { status: 'ACTIVE' } },
  },
  orderBy: { registrationNumber: 'asc' },
  select: {
    id: true,
    registrationNumber: true,
    user: { select: { firstName: true, lastName: true } },
  },
});

if (students.length === 0) {
  console.log('No unallocated STU-2026-* students.');
  await prisma.$disconnect();
  process.exit(0);
}

const byRoom = await loadAvailableBedRooms();
let queue = [...students];

// Rahul + Arjun → first full Boys double room
const boysDoubles = roomsByCapacity(byRoom, 2, 'Boys');
const rahul = queue.find((s) => s.registrationNumber === 'STU-2026-001');
const arjun = queue.find((s) => s.registrationNumber === 'STU-2026-002');

if (rahul && arjun && boysDoubles[0]) {
  const room = boysDoubles[0];
  byRoom.delete(room[0]!.roomId);
  for (const bed of room) {
    const student = bed.bedNumber === '1' ? rahul : arjun;
    await allocateBed(admin.id, student.id, bed.bedId, bed.roomId, byRoom);
    console.log(
      'Pair (featured):',
      student.registrationNumber,
      `${student.user.firstName} ${student.user.lastName}`,
      '→',
      room[0]!.hostelName,
      'Room',
      room[0]!.roomNumber,
      'Bed',
      bed.bedNumber,
    );
  }
  queue = queue.filter((s) => s.id !== rahul.id && s.id !== arjun.id);
  boysDoubles.shift();
}

// 6 triple rooms × 3 = 18 students (3 roommates)
const tripleRooms = roomsByCapacity(byRoom, 3, 'Boys');
let tripleRoomsUsed = 0;
while (queue.length >= 3 && tripleRoomsUsed < 6 && tripleRooms[tripleRoomsUsed]) {
  const room = tripleRooms[tripleRoomsUsed]!;
  byRoom.delete(room[0]!.roomId);
  const batch = queue.splice(0, 3);
  for (let i = 0; i < 3; i++) {
    const bed = room[i]!;
    const student = batch[i]!;
    await allocateBed(admin.id, student.id, bed.bedId, bed.roomId, byRoom);
    console.log(
      'Triple:',
      student.registrationNumber,
      '→',
      bed.hostelName,
      bed.roomNumber,
      'bed',
      bed.bedNumber,
    );
  }
  tripleRoomsUsed += 1;
}

// 11 single occupants in double rooms (one bed only)
const doublesAll = roomsByCapacity(byRoom, 2);
let singles = 0;
while (queue.length > 0 && singles < 11 && doublesAll.length > 0) {
  const room = doublesAll.shift()!;
  byRoom.delete(room[0]!.roomId);
  const student = queue.shift()!;
  const bed = room[0]!;
  await allocateBed(admin.id, student.id, bed.bedId, bed.roomId, byRoom);
  console.log('Single (1 bed in double room):', student.registrationNumber, '→', bed.roomNumber, 'bed', bed.bedNumber);
  singles += 1;
}

// Remaining → pair in double rooms (roommates)
while (queue.length >= 2) {
  const doubleRoom = roomsByCapacity(byRoom, 2)[0];
  if (!doubleRoom) break;
  const room = doubleRoom;
  byRoom.delete(room[0]!.roomId);
  const a = queue.shift()!;
  const b = queue.shift()!;
  for (const [student, bed] of [
    [a, room[0]!],
    [b, room[1]!],
  ] as const) {
    await allocateBed(admin.id, student.id, bed.bedId, bed.roomId, byRoom);
    console.log(
      'Pair:',
      student.registrationNumber,
      '→',
      bed.hostelName,
      bed.roomNumber,
      'bed',
      bed.bedNumber,
    );
  }
}

// Odd one out
if (queue.length === 1) {
  const doubleRoom = roomsByCapacity(byRoom, 2)[0];
  if (doubleRoom) {
    const student = queue[0]!;
    const bed = doubleRoom[0]!;
    byRoom.delete(doubleRoom[0]!.roomId);
    await allocateBed(admin.id, student.id, bed.bedId, bed.roomId, byRoom);
    console.log('Single (remainder):', student.registrationNumber, '→', bed.roomNumber);
    queue = [];
  }
}

const remaining = await prisma.student.count({
  where: {
    registrationNumber: { startsWith: 'STU-2026-' },
    allocationRecords: { none: { status: 'ACTIVE' } },
  },
});

console.log('\n--- Allocation complete ---');
console.log(`Unallocated STU-2026-* remaining: ${remaining}`);
if (queue.length > 0) {
  console.warn(`${queue.length} student(s) could not be placed — not enough empty rooms.`);
}

await prisma.$disconnect();
