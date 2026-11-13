import { z } from 'zod';

const roleTierSchema = z.enum(['System', 'Operations', 'Resident', 'Field']);
const roleScopeSchema = z.enum(['University-wide', 'Hostel-scoped', 'Self']);
const roleRiskSchema = z.enum(['low', 'medium', 'high', 'critical']);

export const rolesDeskListQuerySchema = z.object({
  q: z.string().max(100).trim().optional(),
  tier: roleTierSchema.optional(),
  scope: roleScopeSchema.optional(),
  risk: roleRiskSchema.optional(),
});

export const roleIdParamsSchema = z.object({
  roleId: z.string().min(2).max(64),
});

export type RolesDeskListQuery = z.infer<typeof rolesDeskListQuerySchema>;
