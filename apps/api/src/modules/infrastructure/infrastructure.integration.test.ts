import { randomBytes } from 'node:crypto';
import { PrismaClient } from '@nestora/database';
import type { SessionUser } from '@nestora/types';
import * as argon2 from 'argon2';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ForbiddenError } from '../../common/errors/index.js';
import * as authRepo from '../auth/auth.repository.js';
import * as infraService from './infrastructure.service.js';

const integrationEnabled =
  process.env.RUN_INTEGRATION_TESTS === '1' && Boolean(process.env.DATABASE_URL);

const runId = randomBytes(4).toString('hex');

function sessionUser(
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    status: string;
    isVerified: boolean;
    mfaEnabled: boolean;
    mustChangePassword?: boolean;
  },
  assignedHostelIds: string[] = [],
): SessionUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status,
    isVerified: user.isVerified,
    mfaEnabled: user.mfaEnabled,
    mustChangePassword: user.mustChangePassword ?? false,
    assignedHostelIds,
  };
}

describe.skipIf(!integrationEnabled)('MOD-02 infrastructure integration', () => {
  let prisma: PrismaClient;

  let adminUser: SessionUser;
  let wardenUser: SessionUser;
  let roomConfigId: string;

  const userIdsToCleanup: string[] = [];
  const universityIdsToCleanup: string[] = [];

  beforeAll(async () => {
    prisma = new PrismaClient();

    const config = await prisma.roomConfiguration.findFirst({ orderBy: { code: 'asc' } });
    if (!config) {
      throw new Error('Room configurations must be seeded before MOD-02 integration tests.');
    }
    roomConfigId = config.id;

    const passwordHash = await argon2.hash('IntegrationTest@2025!', {
      type: argon2.argon2id,
      memoryCost: 65_536,
      timeCost: 3,
      parallelism: 4,
    });

    const admin = await prisma.user.create({
      data: {
        email: authRepo.normalizeEmail(`integration-mod02-admin-${runId}@example.test`),
        passwordHash,
        role: 'UNIVERSITY_ADMINISTRATOR',
        firstName: 'Infra',
        lastName: 'Admin',
        status: 'ACTIVE',
        isVerified: true,
      },
    });
    userIdsToCleanup.push(admin.id);
    adminUser = sessionUser(admin);
  });

  afterAll(async () => {
    for (const universityId of universityIdsToCleanup) {
      const hostels = await prisma.hostel.findMany({
        where: { universityId },
        select: { id: true },
      });
      for (const hostel of hostels) {
        const buildings = await prisma.building.findMany({
          where: { hostelId: hostel.id },
          select: { id: true },
        });
        for (const building of buildings) {
          const blocks = await prisma.block.findMany({
            where: { buildingId: building.id },
            select: { id: true },
          });
          for (const block of blocks) {
            const floors = await prisma.floor.findMany({
              where: { blockId: block.id },
              select: { id: true },
            });
            for (const floor of floors) {
              const rooms = await prisma.room.findMany({
                where: { floorId: floor.id },
                select: { id: true },
              });
              for (const room of rooms) {
                await prisma.bed.deleteMany({ where: { roomId: room.id } });
                await prisma.room.delete({ where: { id: room.id } }).catch(() => undefined);
              }
              await prisma.floor.delete({ where: { id: floor.id } }).catch(() => undefined);
            }
            await prisma.block.delete({ where: { id: block.id } }).catch(() => undefined);
          }
          await prisma.building.delete({ where: { id: building.id } }).catch(() => undefined);
        }
        await prisma.hostelAssignment.deleteMany({ where: { hostelId: hostel.id } });
        await prisma.hostel.delete({ where: { id: hostel.id } }).catch(() => undefined);
      }
      await prisma.university.delete({ where: { id: universityId } }).catch(() => undefined);
    }

    for (const userId of userIdsToCleanup) {
      await prisma.hostelAssignment.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }

    await prisma.$disconnect();
  }, 120_000);

  it('admin can create full hierarchy through beds', async () => {
    const suffix = runId;
    const university = await infraService.createUniversityService(
      prisma,
      adminUser,
      {
        name: `Integration University ${suffix}`,
        code: `IU-${suffix}`.slice(0, 50),
      },
      '127.0.0.1',
    );
    universityIdsToCleanup.push(university.id);

    const hostel = await infraService.createHostelService(
      prisma,
      adminUser,
      university.id,
      {
        name: 'Alpha Hostel',
        code: `AH-${suffix}`.slice(0, 50),
        genderCategory: 'BOYS_HOSTEL',
      },
      '127.0.0.1',
    );

    const building = await infraService.createBuildingService(
      prisma,
      adminUser,
      hostel.id,
      { name: 'Main Wing', buildingNumber: '1' },
      '127.0.0.1',
    );

    const block = await infraService.createBlockService(
      prisma,
      adminUser,
      building.id,
      { name: 'North Block' },
      '127.0.0.1',
    );

    const floor = await infraService.createFloorService(
      prisma,
      adminUser,
      block.id,
      { floorNumber: 1, name: 'Ground' },
      '127.0.0.1',
    );

    const room = await infraService.createRoomService(
      prisma,
      adminUser,
      floor.id,
      {
        configId: roomConfigId,
        roomNumber: '101',
        status: 'ACTIVE',
      },
      '127.0.0.1',
    );

    if (!room) {
      throw new Error('Expected room after create.');
    }
    expect(room.config.id).toBe(roomConfigId);
    expect(room.beds).toHaveLength(room.config.capacity);

    const bed = room.beds[0];
    if (!bed) {
      throw new Error('Expected at least one bed after room create.');
    }
    const updatedBed = await infraService.updateBedService(
      prisma,
      adminUser,
      bed.id,
      { status: 'MAINTENANCE' },
      '127.0.0.1',
    );
    expect(updatedBed.status).toBe('MAINTENANCE');
  });

  it('warden scope: list hostels and deny unassigned building create', async () => {
    const suffix = `${runId}-warden`;
    const university = await infraService.createUniversityService(
      prisma,
      adminUser,
      {
        name: `Warden Scope University ${suffix}`,
        code: `WS-${suffix}`.slice(0, 50),
      },
      '127.0.0.1',
    );
    universityIdsToCleanup.push(university.id);

    const assignedHostel = await infraService.createHostelService(
      prisma,
      adminUser,
      university.id,
      {
        name: 'Assigned Hostel',
        code: `AS-${suffix}`.slice(0, 50),
        genderCategory: 'GIRLS_HOSTEL',
      },
      '127.0.0.1',
    );

    const otherHostel = await infraService.createHostelService(
      prisma,
      adminUser,
      university.id,
      {
        name: 'Other Hostel',
        code: `OS-${suffix}`.slice(0, 50),
        genderCategory: 'GIRLS_HOSTEL',
      },
      '127.0.0.1',
    );

    const wardenRow = await prisma.user.create({
      data: {
        email: authRepo.normalizeEmail(`integration-mod02-warden-${suffix}@example.test`),
        passwordHash: await argon2.hash(randomBytes(8).toString('hex')),
        role: 'HOSTEL_WARDEN',
        firstName: 'Scoped',
        lastName: 'Warden',
        status: 'ACTIVE',
        isVerified: true,
      },
    });
    userIdsToCleanup.push(wardenRow.id);

    await prisma.hostelAssignment.create({
      data: {
        userId: wardenRow.id,
        hostelId: assignedHostel.id,
        assignedBy: adminUser.id,
      },
    });

    wardenUser = sessionUser(wardenRow, [assignedHostel.id]);

    const listed = await infraService.listHostelsService(prisma, wardenUser, {});
    expect(listed.hostels).toHaveLength(1);
    expect(listed.hostels[0]?.id).toBe(assignedHostel.id);

    await infraService.createBuildingService(
      prisma,
      wardenUser,
      assignedHostel.id,
      { name: 'Warden Wing', buildingNumber: 'W1' },
      '127.0.0.1',
    );

    await expect(
      infraService.createBuildingService(
        prisma,
        wardenUser,
        otherHostel.id,
        { name: 'Forbidden Wing', buildingNumber: 'X1' },
        '127.0.0.1',
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
