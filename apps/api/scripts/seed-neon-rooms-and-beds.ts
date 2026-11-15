/**
 * Seeds demo infrastructure matching product targets:
 *
 * | Sharing type   | Rooms | Beds/room | Total beds |
 * |----------------|-------|-----------|------------|
 * | Single Sharing | 30    | 1         | 30         |
 * | Double Sharing | 120   | 2         | 240        |
 * | Triple Sharing | 90    | 3         | 270        |
 * | **Total**      | **240** | —       | **540**    |
 *
 * Per hostel (Boys A, Girls B, Graduate C): 80 rooms, 180 beds
 *   → 10 Single (5 Non-AC + 5 AC), 40 Double, 30 Triple
 *
 * Idempotent: tops up each hostel toward the mix without deleting existing inventory.
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

export const TARGET_ROOMS = 240;
export const TARGET_BEDS = 540;

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

/** Per hostel: counts per config code (sums to 80 rooms / 180 beds each). */
const ROOM_MIX_PER_HOSTEL: Record<ConfigCode, number> = {
  SINGLE_NON_AC: 5,
  SINGLE_AC: 5,
  DOUBLE_NON_AC: 20,
  DOUBLE_AC: 20,
  TRIPLE_NON_AC: 15,
  TRIPLE_AC: 15,
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

async function countRoomsByConfigForHostel(hostelId: string): Promise<Map<ConfigCode, number>> {
  const rows = await prisma.room.findMany({
    where: {
      floor: { block: { building: { hostelId } } },
    },
    select: { config: { select: { code: true } } },
  });
  const map = new Map<ConfigCode, number>();
  for (const row of rows) {
    const code = row.config.code as ConfigCode;
    map.set(code, (map.get(code) ?? 0) + 1);
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
  const byCapacity = new Map<number, { rooms: number; beds: number }>();

  console.log('\nRoom inventory by configuration:');
  for (const row of byConfig) {
    const cfg = configById.get(row.configId);
    if (!cfg) continue;
    const roomCount = row._count._all;
    const bedCount = roomCount * cfg.capacity;
    rooms += roomCount;
    beds += bedCount;
    const capRow = byCapacity.get(cfg.capacity) ?? { rooms: 0, beds: 0 };
    capRow.rooms += roomCount;
    capRow.beds += bedCount;
    byCapacity.set(cfg.capacity, capRow);
    console.log(
      `  ${cfg.description.padEnd(16)} capacity ${cfg.capacity} → ${roomCount} rooms, ${bedCount} beds`,
    );
  }
  console.log(`  TOTAL                              → ${rooms} rooms, ${beds} beds (target ${TARGET_ROOMS}/${TARGET_BEDS})`);
  console.log('\nBy sharing type (capacity):');
  for (const capacity of [1, 2, 3]) {
    const row = byCapacity.get(capacity);
    const label = capacity === 1 ? 'Single' : capacity === 2 ? 'Double' : 'Triple';
    console.log(`  ${label} Sharing: ${row?.rooms ?? 0} rooms, ${row?.beds ?? 0} beds`);
  }
  console.log('\nBed status:');
  for (const row of grouped) {
    console.log(`  ${row.status}: ${row._count._all}`);
  }
}

async function main(): Promise<void> {
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

  let createdThisRun = 0;

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

    const existingByConfig = await countRoomsByConfigForHostel(hostel.id);
    const configQueue: ConfigCode[] = [];
    for (const [code, targetCount] of Object.entries(ROOM_MIX_PER_HOSTEL) as [ConfigCode, number][]) {
      const have = existingByConfig.get(code) ?? 0;
      const deficit = Math.max(0, targetCount - have);
      for (let i = 0; i < deficit; i += 1) {
        configQueue.push(code);
      }
    }

    if (configQueue.length === 0) {
      console.log(`${hostelMeta.name}: inventory already at target mix.`);
      continue;
    }

    let localIndex = await prisma.room.count({
      where: { floor: { block: { building: { hostelId: hostel.id } } } },
    });

    for (const code of configQueue) {
      const config = configs.get(code);
      if (!config) continue;

      const slot = floorSlots[localIndex % floorSlots.length]!;
      localIndex += 1;

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
      createdThisRun += 1;
    }

    console.log(`${hostelMeta.name}: added ${configQueue.length} room(s) toward target mix.`);
  }

  const totalRooms = await prisma.room.count();
  const totalBeds = await prisma.bed.count();
  console.log(`\nInventory now: ${totalRooms} rooms, ${totalBeds} beds (created this run: ${createdThisRun}).`);
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
