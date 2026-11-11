/**
 * Seeds demo infrastructure matching UI/docs targets:
 *
 * | Category (doc RoomConfigCode) | Capacity | Rooms (total) | Beds |
 * |------------------------------|----------|---------------|------|
 * | Double Non-AC                | 2        | 60            | 120  |
 * | Double AC                    | 2        | 60            | 120  |
 * | Triple Non-AC                | 3        | 30            | 90   |
 * | Triple AC                    | 3        | 30            | 90   |
 * | Single Non-AC                | 1        | 0             | 0    |
 * | Single AC                    | 1        | 0             | 0    |
 * | **Total**                    |          | **180**       | **420** |
 *
 * Per hostel (Boys A, Girls B, Graduate C): 60 rooms, 140 beds
 *   → 20 Double Non-AC, 20 Double AC, 10 Triple Non-AC, 10 Triple AC
 *
 * See docs/07-database-design.md § RoomConfiguration (six standard types).
 */
import { prisma, type RoomConfiguration } from '@nestora/database';
import { defaultBedNumbers } from '../src/modules/infrastructure/infrastructure.helpers.js';

type ConfigCode =
  | 'SINGLE_NON_AC'
  | 'SINGLE_AC'
  | 'DOUBLE_NON_AC'
  | 'DOUBLE_AC'
  | 'TRIPLE_NON_AC'
  | 'TRIPLE_AC';

const TARGET_ROOMS = 180;
const TARGET_BEDS = 420;

const HOSTELS = [
  { name: 'Boys Hostel A', code: 'BOYS-A', gender: 'BOYS_HOSTEL' as const },
  { name: 'Girls Hostel B', code: 'GIRLS-B', gender: 'GIRLS_HOSTEL' as const },
  { name: 'Graduate Wing C', code: 'GRAD-C', gender: 'BOYS_HOSTEL' as const },
] as const;

const BLOCKS = ['Block A', 'Block B', 'Block C'] as const;

const FLOORS: { floorNumber: number; name: string }[] = [
  { floorNumber: 0, name: 'Ground Floor' },
  { floorNumber: 1, name: '1st Floor' },
  { floorNumber: 2, name: '2nd Floor' },
  { floorNumber: 3, name: '3rd Floor' },
];

/** Per hostel: counts per config code (sums to 60 rooms / 140 beds each). */
const ROOM_MIX_PER_HOSTEL: Record<ConfigCode, number> = {
  SINGLE_NON_AC: 0,
  SINGLE_AC: 0,
  DOUBLE_NON_AC: 20,
  DOUBLE_AC: 20,
  TRIPLE_NON_AC: 10,
  TRIPLE_AC: 10,
};

async function ensureRoomConfigurations(): Promise<Map<ConfigCode, RoomConfiguration>> {
  const defs: Array<{
    code: ConfigCode;
    capacity: number;
    hasAc: boolean;
    description: string;
  }> = [
    { code: 'SINGLE_NON_AC', capacity: 1, hasAc: false, description: 'Single Non-AC' },
    { code: 'SINGLE_AC', capacity: 1, hasAc: true, description: 'Single AC' },
    { code: 'DOUBLE_NON_AC', capacity: 2, hasAc: false, description: 'Double Non-AC' },
    { code: 'DOUBLE_AC', capacity: 2, hasAc: true, description: 'Double AC' },
    { code: 'TRIPLE_NON_AC', capacity: 3, hasAc: false, description: 'Triple Non-AC' },
    { code: 'TRIPLE_AC', capacity: 3, hasAc: true, description: 'Triple AC' },
  ];

  const map = new Map<ConfigCode, RoomConfiguration>();
  for (const config of defs) {
    const row = await prisma.roomConfiguration.upsert({
      where: { code: config.code },
      update: {
        capacity: config.capacity,
        hasAc: config.hasAc,
        description: config.description,
      },
      create: config,
    });
    map.set(config.code, row);
  }
  return map;
}

async function printBedSummary(): Promise<void> {
  const grouped = await prisma.bed.groupBy({
    by: ['status'],
    _count: { _all: true },
  });
  const byConfig = await prisma.room.groupBy({
    by: ['configId'],
    _count: { _all: true },
  });
  const configs = await prisma.roomConfiguration.findMany();
  const configById = new Map(configs.map((c) => [c.id, c]));

  let rooms = 0;
  let beds = 0;
  console.log('\nRoom inventory by documented configuration:');
  for (const row of byConfig) {
    const cfg = configById.get(row.configId);
    if (!cfg) continue;
    const roomCount = row._count._all;
    const bedCount = roomCount * cfg.capacity;
    rooms += roomCount;
    beds += bedCount;
    console.log(
      `  ${cfg.description.padEnd(16)} capacity ${cfg.capacity} → ${roomCount} rooms, ${bedCount} beds`,
    );
  }
  console.log(`  TOTAL                              → ${rooms} rooms, ${beds} beds (target ${TARGET_ROOMS}/${TARGET_BEDS})`);
  console.log('\nBed status:');
  for (const row of grouped) {
    console.log(`  ${row.status}: ${row._count._all}`);
  }
}

async function main(): Promise<void> {
  const existingRooms = await prisma.room.count();
  if (existingRooms >= TARGET_ROOMS) {
    console.log(`Already have ${existingRooms} rooms (target ${TARGET_ROOMS}). Skipping create.`);
    await printBedSummary();
    return;
  }

  const configs = await ensureRoomConfigurations();

  let university = await prisma.university.findFirst({ where: { code: 'NESTORA-DEMO' } });
  if (!university) {
    university = await prisma.university.create({
      data: {
        name: 'Nestora Demo University',
        code: 'NESTORA-DEMO',
        contactEmail: 'admin@nestora.test',
      },
    });
  }

  let roomSerial = 0;

  for (const hostelMeta of HOSTELS) {
    let hostel = await prisma.hostel.findFirst({
      where: { code: hostelMeta.code },
    });
    if (!hostel) {
      hostel = await prisma.hostel.create({
        data: {
          universityId: university.id,
          name: hostelMeta.name,
          code: hostelMeta.code,
          genderCategory: hostelMeta.gender,
          isActive: true,
        },
      });
    }

    let building = await prisma.building.findFirst({
      where: { hostelId: hostel.id, buildingNumber: '1' },
    });
    if (!building) {
      building = await prisma.building.create({
        data: {
          hostelId: hostel.id,
          name: 'Main Building',
          buildingNumber: '1',
        },
      });
    }

    const floorSlots: { floorId: string; blockLabel: string; floorNumber: number }[] = [];

    for (const blockName of BLOCKS) {
      let block = await prisma.block.findFirst({
        where: { buildingId: building.id, name: blockName },
      });
      if (!block) {
        block = await prisma.block.create({
          data: { buildingId: building.id, name: blockName },
        });
      }

      for (const floorMeta of FLOORS) {
        let floor = await prisma.floor.findFirst({
          where: { blockId: block.id, floorNumber: floorMeta.floorNumber },
        });
        if (!floor) {
          floor = await prisma.floor.create({
            data: {
              blockId: block.id,
              floorNumber: floorMeta.floorNumber,
              name: floorMeta.name,
            },
          });
        }
        floorSlots.push({
          floorId: floor.id,
          blockLabel: blockName.replace('Block ', ''),
          floorNumber: floorMeta.floorNumber,
        });
      }
    }

    const configQueue: ConfigCode[] = [];
    for (const [code, count] of Object.entries(ROOM_MIX_PER_HOSTEL) as [ConfigCode, number][]) {
      for (let i = 0; i < count; i += 1) {
        configQueue.push(code);
      }
    }

    let localIndex = 0;
    for (const code of configQueue) {
      if (roomSerial >= TARGET_ROOMS) break;
      const config = configs.get(code);
      if (!config) continue;

      const slot = floorSlots[localIndex % floorSlots.length]!;
      localIndex += 1;
      roomSerial += 1;

      const roomNumber = `${slot.blockLabel}-${slot.floorNumber}${String(Math.ceil(localIndex / floorSlots.length)).padStart(2, '0')}`;

      const exists = await prisma.room.findFirst({
        where: { floorId: slot.floorId, roomNumber },
      });
      if (exists) {
        const bedCount = await prisma.bed.count({ where: { roomId: exists.id } });
        if (bedCount === 0) {
          await prisma.bed.createMany({
            data: defaultBedNumbers(config.capacity).map((bedNumber) => ({
              roomId: exists.id,
              bedNumber,
              status: 'AVAILABLE' as const,
            })),
          });
        }
        continue;
      }

      await prisma.$transaction(async (tx) => {
        const room = await tx.room.create({
          data: {
            floorId: slot.floorId,
            configId: config.id,
            roomNumber,
            status: 'ACTIVE',
          },
        });
        await tx.bed.createMany({
          data: defaultBedNumbers(config.capacity).map((bedNumber) => ({
            roomId: room.id,
            bedNumber,
            status: 'AVAILABLE' as const,
          })),
        });
      });
    }
  }

  const totalRooms = await prisma.room.count();
  const totalBeds = await prisma.bed.count();
  console.log(`Seeded ${totalRooms} rooms and ${totalBeds} beds.`);
  await printBedSummary();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
