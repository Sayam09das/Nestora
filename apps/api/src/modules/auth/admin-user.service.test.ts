import { describe, expect, it, vi } from 'vitest';

vi.mock('../audit/audit.service.js', () => ({
  logAuditEventInTransaction: vi.fn(),
}));

import type { PrismaClient } from '@nestora/database';
import { ForbiddenError } from '../../common/errors/index.js';
import { updateUserStatusByAdmin } from './admin-user.service.js';

describe('updateUserStatusByAdmin', () => {
  it('rejects self-deactivation', async () => {
    const prisma = {} as PrismaClient;
    await expect(
      updateUserStatusByAdmin(
        prisma,
        { id: 'same-id', role: 'UNIVERSITY_ADMINISTRATOR' },
        'same-id',
        'INACTIVE',
        undefined,
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
