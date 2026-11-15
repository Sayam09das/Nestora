import { z } from 'zod';

/** MOD-03: University Administrator audit log query. */
export const auditListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().max(200).trim().optional(),
  actorUserId: z.string().uuid().optional(),
  actionName: z.string().min(1).max(100).trim().optional(),
  entityType: z.string().min(1).max(100).trim().optional(),
  entityId: z.string().min(1).max(100).trim().optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

export const auditLogIdParamsSchema = z.object({
  auditLogId: z.string().uuid(),
});

export type AuditListQuery = z.infer<typeof auditListQuerySchema>;
