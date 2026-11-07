import { describe, expect, it } from 'vitest';
import { buildAuditLogWhere } from './audit-query.js';

describe('buildAuditLogWhere', () => {
  it('combines optional filters', () => {
    const where = buildAuditLogWhere({
      actionName: 'HOSTEL_CREATED',
      entityType: 'Hostel',
      actorUserId: '00000000-0000-4000-8000-000000000001',
      from: '2025-01-01T00:00:00.000Z',
      to: '2025-12-31T23:59:59.000Z',
    });
    expect(where.actionName).toBe('HOSTEL_CREATED');
    expect(where.entityType).toBe('Hostel');
    expect(where.actorUserId).toBe('00000000-0000-4000-8000-000000000001');
    const ts = where.timestamp;
    expect(ts && typeof ts === 'object' && 'gte' in ts ? ts.gte : undefined).toEqual(
      new Date('2025-01-01T00:00:00.000Z'),
    );
    expect(ts && typeof ts === 'object' && 'lte' in ts ? ts.lte : undefined).toEqual(
      new Date('2025-12-31T23:59:59.000Z'),
    );
  });
});
