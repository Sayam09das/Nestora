import { PrismaClient } from '@nestora/database';
import { afterAll, describe, expect, it } from 'vitest';
import * as finance from './finance.service.js';

const integrationEnabled =
  process.env.RUN_INTEGRATION_TESTS === '1' && Boolean(process.env.DATABASE_URL);

describe.runIf(integrationEnabled)('finance ledger detail', () => {
  const prisma = new PrismaClient();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('loads ledger without allocation as unassigned resident', async () => {
    const ledger = await prisma.studentLedger.findFirst({
      where: {
        student: {
          allocationRecords: {
            none: { status: { in: ['ACTIVE', 'TRANSFERRED', 'TERMINATED'] } },
          },
        },
      },
      select: { id: true },
    });
    if (!ledger) return;

    const detail = await finance.getFinanceLedgerDetail(prisma, ledger.id);
    expect(detail).not.toBeNull();
    expect(detail?.account.room).toBe('Unassigned');
    expect(detail?.account.hostel).toBe('—');
  });
});