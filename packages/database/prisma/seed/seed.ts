import { PrismaClient, RoomConfigCode } from '@prisma/client';

const prisma = new PrismaClient();

const ROOM_CONFIGURATIONS: Array<{
  code: RoomConfigCode;
  capacity: number;
  hasAc: boolean;
  description: string;
}> = [
  { code: RoomConfigCode.SINGLE_NON_AC, capacity: 1, hasAc: false, description: 'Single Non-AC' },
  { code: RoomConfigCode.SINGLE_AC, capacity: 1, hasAc: true, description: 'Single AC' },
  { code: RoomConfigCode.DOUBLE_NON_AC, capacity: 2, hasAc: false, description: 'Double Non-AC' },
  { code: RoomConfigCode.DOUBLE_AC, capacity: 2, hasAc: true, description: 'Double AC' },
  { code: RoomConfigCode.TRIPLE_NON_AC, capacity: 3, hasAc: false, description: 'Triple Non-AC' },
  { code: RoomConfigCode.TRIPLE_AC, capacity: 3, hasAc: true, description: 'Triple AC' },
];

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Reference seed is disabled in production environments.');
  }

  for (const config of ROOM_CONFIGURATIONS) {
    await prisma.roomConfiguration.upsert({
      where: { code: config.code },
      update: {
        capacity: config.capacity,
        hasAc: config.hasAc,
        description: config.description,
      },
      create: config,
    });
  }
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
