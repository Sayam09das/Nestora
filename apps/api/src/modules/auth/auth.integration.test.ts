import { createHash, randomBytes } from 'node:crypto';
import { PrismaClient } from '@nestora/database';
import { dashboardPathForRole } from '@nestora/types';
import * as argon2 from 'argon2';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/errors/index.js';
import type { Env } from '../../config/env.js';
import { loadEnv } from '../../config/env.js';
import * as authRepo from './auth.repository.js';
import * as authService from './auth.service.js';
import { listAuthActivityForAdmin } from './auth-activity.service.js';

const integrationEnabled =
  process.env.RUN_INTEGRATION_TESTS === '1' && Boolean(process.env.DATABASE_URL);

const TEST_PASSWORD = 'IntegrationTest@2025!';
const runId = randomBytes(4).toString('hex');

let lastActivationToken: string | undefined;

vi.mock('./mail.service.js', () => ({
  sendAccountActivationLink: vi.fn(async (_env: unknown, _email: string, token: string) => {
    lastActivationToken = token;
  }),
  sendPasswordResetLink: vi.fn().mockResolvedValue(undefined),
}));

function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

async function createAdminInitStyleUser(
  prisma: PrismaClient,
  email: string,
): Promise<{ userId: string; rawToken: string }> {
  const placeholderHash = await argon2.hash(randomBytes(32).toString('hex'), {
    type: argon2.argon2id,
    memoryCost: 65_536,
    timeCost: 3,
    parallelism: 4,
  });

  const user = await prisma.user.create({
    data: {
      email: authRepo.normalizeEmail(email),
      passwordHash: placeholderHash,
      role: 'UNIVERSITY_ADMINISTRATOR',
      firstName: 'Integration',
      lastName: 'Admin',
      status: 'INACTIVE',
      isVerified: false,
    },
  });

  const rawToken = randomBytes(32).toString('hex');
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256Hex(rawToken),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return { userId: user.id, rawToken };
}

async function createActiveAdmin(
  prisma: PrismaClient,
  email: string,
): Promise<{ id: string; email: string }> {
  const passwordHash = await argon2.hash(TEST_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 65_536,
    timeCost: 3,
    parallelism: 4,
  });
  const user = await prisma.user.create({
    data: {
      email: authRepo.normalizeEmail(email),
      passwordHash,
      role: 'UNIVERSITY_ADMINISTRATOR',
      firstName: 'Integration',
      lastName: 'Admin',
      status: 'ACTIVE',
      isVerified: true,
    },
  });
  return { id: user.id, email: user.email };
}

describe.skipIf(!integrationEnabled)('auth MOD-01 integration', () => {
  let prisma: PrismaClient;
  let env: Env;

  const emailsToCleanup: string[] = [];

  beforeAll(() => {
    prisma = new PrismaClient();
    const { PRIVILEGED_MFA_ENFORCED: _ignored, ...restEnv } = process.env;
    env = loadEnv({
      ...restEnv,
      NODE_ENV: 'test',
    });
  });

  afterAll(async () => {
    for (const email of emailsToCleanup) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
        await prisma.session.deleteMany({ where: { userId: user.id } });
        await prisma.hostelAssignment.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
      }
    }
    await prisma.$disconnect();
  }, 60_000);

  it('admin:init style activate → login returns role with dashboardPath mapping', async () => {
    const email = `integration-mod01-admin-${runId}@example.test`;
    emailsToCleanup.push(email);

    const { rawToken } = await createAdminInitStyleUser(prisma, email);
    await authService.activateAccount(
      prisma,
      env,
      { token: rawToken, password: TEST_PASSWORD, passwordConfirm: TEST_PASSWORD },
      '127.0.0.1',
    );

    const login = await authService.login(
      prisma,
      env,
      { email, password: TEST_PASSWORD },
      '127.0.0.1',
      'vitest',
    );

    expect(login.mfaStep).toBeUndefined();
    expect(login.user.role).toBe('UNIVERSITY_ADMINISTRATOR');
    expect(dashboardPathForRole(login.user.role)).toBe('/admin');
    expect(login.sessionToken.length).toBeGreaterThan(32);
  });

  it('rejects provisioning STUDENT without full student registration', async () => {
    const adminEmail = `integration-mod01-prov-admin-${runId}@example.test`;
    const studentEmail = `integration-mod01-student-${runId}@example.test`;
    emailsToCleanup.push(adminEmail, studentEmail);

    const admin = await createActiveAdmin(prisma, adminEmail);

    await expect(
      authService.provisionUser(
        prisma,
        env,
        { id: admin.id, role: 'UNIVERSITY_ADMINISTRATOR' },
        {
          email: studentEmail,
          firstName: 'Test',
          lastName: 'Student',
          role: 'STUDENT',
        },
        '127.0.0.1',
      ),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('provision with unknown hostelId fails before user is created', async () => {
    const adminEmail = `integration-mod01-hostel-admin-${runId}@example.test`;
    emailsToCleanup.push(adminEmail);

    const admin = await createActiveAdmin(prisma, adminEmail);
    const fakeHostelId = '00000000-0000-4000-8000-000000000099';

    await expect(
      authService.provisionUser(
        prisma,
        env,
        { id: admin.id, role: 'UNIVERSITY_ADMINISTRATOR' },
        {
          email: `integration-mod01-staff-${runId}@example.test`,
          firstName: 'Staff',
          lastName: 'User',
          role: 'HOSTEL_STAFF',
          hostelId: fakeHostelId,
        },
        '127.0.0.1',
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('warden cannot provision staff for an unassigned hostel', async () => {
    const suffix = `${runId}-warden-scope`;
    const adminEmail = `integration-mod01-${suffix}-admin@example.test`;
    const wardenEmail = `integration-mod01-${suffix}-warden@example.test`;
    emailsToCleanup.push(adminEmail, wardenEmail);

    const admin = await createActiveAdmin(prisma, adminEmail);

    const university = await prisma.university.create({
      data: {
        name: `Integration University ${suffix}`,
        code: `INT-${suffix}`.slice(0, 50),
      },
    });

    const hostelA = await prisma.hostel.create({
      data: {
        universityId: university.id,
        name: 'Hostel A',
        code: `HA-${suffix}`.slice(0, 50),
        genderCategory: 'BOYS_HOSTEL',
      },
    });
    const hostelB = await prisma.hostel.create({
      data: {
        universityId: university.id,
        name: 'Hostel B',
        code: `HB-${suffix}`.slice(0, 50),
        genderCategory: 'GIRLS_HOSTEL',
      },
    });

    await authService.provisionUser(
      prisma,
      env,
      { id: admin.id, role: 'UNIVERSITY_ADMINISTRATOR' },
      {
        email: wardenEmail,
        firstName: 'Warden',
        lastName: 'One',
        role: 'HOSTEL_WARDEN',
        hostelId: hostelA.id,
      },
      '127.0.0.1',
    );

    const warden = await prisma.user.findUniqueOrThrow({ where: { email: wardenEmail } });
    const wardenActivated = await prisma.user.update({
      where: { id: warden.id },
      data: { status: 'ACTIVE', isVerified: true, passwordHash: await argon2.hash(TEST_PASSWORD) },
    });

    await expect(
      authService.provisionUser(
        prisma,
        env,
        { id: wardenActivated.id, role: 'HOSTEL_WARDEN' },
        {
          email: `integration-mod01-${suffix}-staff@example.test`,
          firstName: 'Scoped',
          lastName: 'Staff',
          role: 'HOSTEL_STAFF',
          hostelId: hostelB.id,
        },
        '127.0.0.1',
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('auth activity lists LOGIN_SUCCESS after login', async () => {
    const email = `integration-mod01-audit-${runId}@example.test`;
    emailsToCleanup.push(email);

    const { rawToken } = await createAdminInitStyleUser(prisma, email);
    await authService.activateAccount(
      prisma,
      env,
      { token: rawToken, password: TEST_PASSWORD, passwordConfirm: TEST_PASSWORD },
      '127.0.0.1',
    );

    const login = await authService.login(
      prisma,
      env,
      { email, password: TEST_PASSWORD },
      '127.0.0.1',
      'vitest',
    );

    const { events } = await listAuthActivityForAdmin(prisma, {
      userId: login.user.id,
      action: 'LOGIN_SUCCESS',
      limit: 10,
    });

    expect(events.some((e) => e.actionName === 'LOGIN_SUCCESS')).toBe(true);
  });
});
