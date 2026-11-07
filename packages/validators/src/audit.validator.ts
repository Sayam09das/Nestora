import { z } from 'zod';

/** MOD-03: University Administrator audit log query. */
export const auditListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  actorUserId: z.string().uuid().optional(),
  actionName: z.string().min(1).max(100).trim().optional(),
  entityType: z.string().min(1).max(100).trim().optional(),
  entityId: z.string().min(1).max(100).trim().optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

export type AuditListQuery = z.infer<typeof auditListQuerySchema>;
