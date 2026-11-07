import type {
  BedStatus,
  GenderCategory,
  Prisma,
  PrismaClient,
  RoomStatus,
} from '@nestora/database';

type Db = PrismaClient | Prisma.TransactionClient;

export function listUniversities(prisma: Db) {
  return prisma.university.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
      contactEmail: true,
      createdAt: true,
    },
  });
}

export function findUniversityById(prisma: Db, id: string) {
  return prisma.university.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
      contactEmail: true,
      createdAt: true,
    },
  });
}

export function createUniversity(
  prisma: Db,
  data: { name: string; code: string; address?: string; contactEmail?: string },
) {
  return prisma.university.create({
    data: {
      name: data.name,
      code: data.code,
      address: data.address,
      contactEmail: data.contactEmail,
    },
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
      contactEmail: true,
      createdAt: true,
    },
  });
}

export function updateUniversity(prisma: Db, id: string, data: Prisma.UniversityUpdateInput) {
  return prisma.university.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
      contactEmail: true,
      createdAt: true,
    },
  });
}

export function deleteUniversity(prisma: Db, id: string) {
  return prisma.university.delete({ where: { id } });
}

export async function countHostels(prisma: Db, where: Prisma.HostelWhereInput): Promise<number> {
  return prisma.hostel.count({ where });
}

export function listHostels(
  prisma: Db,
  where: Prisma.HostelWhereInput,
  skip: number,
  take: number,
) {
  return prisma.hostel.findMany({
    where,
    skip,
    take,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      universityId: true,
      name: true,
      code: true,
      genderCategory: true,
      wardenInCharge: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export function findHostelById(prisma: Db, id: string) {
  return prisma.hostel.findUnique({
    where: { id },
    select: {
      id: true,
      universityId: true,
      name: true,
      code: true,
      genderCategory: true,
      wardenInCharge: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export function createHostel(
  prisma: Db,
  data: {
    universityId: string;
    name: string;
    code: string;
    genderCategory: GenderCategory;
    wardenInCharge?: string | null;
    isActive?: boolean;
  },
) {
  return prisma.hostel.create({
    data,
    select: {
      id: true,
      universityId: true,
      name: true,
      code: true,
      genderCategory: true,
      wardenInCharge: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export function updateHostel(prisma: Db, id: string, data: Prisma.HostelUpdateInput) {
  return prisma.hostel.update({
    where: { id },
    data,
    select: {
      id: true,
      universityId: true,
      name: true,
      code: true,
      genderCategory: true,
      wardenInCharge: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export function deleteHostel(prisma: Db, id: string) {
  return prisma.hostel.delete({ where: { id } });
}

export async function countBuildings(prisma: Db, where: Prisma.BuildingWhereInput) {
  return prisma.building.count({ where });
}

export function listBuildings(
  prisma: Db,
  where: Prisma.BuildingWhereInput,
  skip: number,
  take: number,
) {
  return prisma.building.findMany({
    where,
    skip,
    take,
    orderBy: { buildingNumber: 'asc' },
  });
}

export function findBuildingById(prisma: Db, id: string) {
  return prisma.building.findUnique({ where: { id } });
}

export function createBuilding(
  prisma: Db,
  data: { hostelId: string; name: string; buildingNumber: string },
) {
  return prisma.building.create({ data });
}

export function updateBuilding(prisma: Db, id: string, data: Prisma.BuildingUpdateInput) {
  return prisma.building.update({ where: { id }, data });
}

export function deleteBuilding(prisma: Db, id: string) {
  return prisma.building.delete({ where: { id } });
}

export async function countBlocks(prisma: Db, where: Prisma.BlockWhereInput) {
  return prisma.block.count({ where });
}

export function listBlocks(prisma: Db, where: Prisma.BlockWhereInput, skip: number, take: number) {
  return prisma.block.findMany({
    where,
    skip,
    take,
    orderBy: { name: 'asc' },
  });
}

export function findBlockById(prisma: Db, id: string) {
  return prisma.block.findUnique({ where: { id } });
}

export function createBlock(prisma: Db, data: { buildingId: string; name: string }) {
  return prisma.block.create({ data });
}

export function updateBlock(prisma: Db, id: string, data: Prisma.BlockUpdateInput) {
  return prisma.block.update({ where: { id }, data });
}

export function deleteBlock(prisma: Db, id: string) {
  return prisma.block.delete({ where: { id } });
}

export async function countFloors(prisma: Db, where: Prisma.FloorWhereInput) {
  return prisma.floor.count({ where });
}

export function listFloors(prisma: Db, where: Prisma.FloorWhereInput, skip: number, take: number) {
  return prisma.floor.findMany({
    where,
    skip,
    take,
    orderBy: { floorNumber: 'asc' },
  });
}

export function findFloorById(prisma: Db, id: string) {
  return prisma.floor.findUnique({ where: { id } });
}

export function createFloor(
  prisma: Db,
  data: { blockId: string; floorNumber: number; name?: string | null },
) {
  return prisma.floor.create({ data });
}

export function updateFloor(prisma: Db, id: string, data: Prisma.FloorUpdateInput) {
  return prisma.floor.update({ where: { id }, data });
}

export function deleteFloor(prisma: Db, id: string) {
  return prisma.floor.delete({ where: { id } });
}

export function listRoomConfigurations(prisma: Db) {
  return prisma.roomConfiguration.findMany({
    orderBy: { code: 'asc' },
  });
}

export function findRoomConfigurationById(prisma: Db, id: string) {
  return prisma.roomConfiguration.findUnique({ where: { id } });
}

export async function countRooms(prisma: Db, where: Prisma.RoomWhereInput) {
  return prisma.room.count({ where });
}

export function listRooms(prisma: Db, where: Prisma.RoomWhereInput, skip: number, take: number) {
  return prisma.room.findMany({
    where,
    skip,
    take,
    orderBy: { roomNumber: 'asc' },
    include: { config: true },
  });
}

export function findRoomById(prisma: Db, id: string) {
  return prisma.room.findUnique({
    where: { id },
    include: { config: true, beds: { orderBy: { bedNumber: 'asc' } } },
  });
}

export function createRoom(
  prisma: Db,
  data: { floorId: string; configId: string; roomNumber: string; status?: RoomStatus },
) {
  return prisma.room.create({
    data,
    include: { config: true },
  });
}

export function updateRoom(prisma: Db, id: string, data: Prisma.RoomUpdateInput) {
  return prisma.room.update({
    where: { id },
    data,
    include: { config: true },
  });
}

export function deleteRoom(prisma: Db, id: string) {
  return prisma.room.delete({ where: { id } });
}

export async function countBedsInRoom(prisma: Db, roomId: string) {
  return prisma.bed.count({ where: { roomId } });
}

export async function countBeds(prisma: Db, where: Prisma.BedWhereInput) {
  return prisma.bed.count({ where });
}

export function listBeds(prisma: Db, where: Prisma.BedWhereInput, skip: number, take: number) {
  return prisma.bed.findMany({
    where,
    skip,
    take,
    orderBy: { bedNumber: 'asc' },
  });
}

export function findBedById(prisma: Db, id: string) {
  return prisma.bed.findUnique({ where: { id } });
}

export function createBed(
  prisma: Db,
  data: { roomId: string; bedNumber: string; status?: BedStatus },
) {
  return prisma.bed.create({ data });
}

export function createBedsMany(
  prisma: Db,
  data: { roomId: string; bedNumber: string; status: BedStatus }[],
) {
  return prisma.bed.createMany({ data });
}

export function updateBed(prisma: Db, id: string, data: Prisma.BedUpdateInput) {
  return prisma.bed.update({ where: { id }, data });
}

export function deleteBed(prisma: Db, id: string) {
  return prisma.bed.delete({ where: { id } });
}
