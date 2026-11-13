import { z } from 'zod';

const leaveUiStatusSchema = z.enum([
  'Pending Review',
  'Approved',
  'On Leave',
  'Returned',
  'Rejected',
  'Extension Pending',
  'Overstayed',
]);

const leaveUiCategorySchema = z.enum(['Medical', 'Family', 'Academic', 'Emergency', 'Personal']);

export const leaveDeskListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  q: z.string().max(100).trim().optional(),
  hostel: z.string().max(150).trim().optional(),
  category: leaveUiCategorySchema.optional(),
  status: leaveUiStatusSchema.optional(),
});

export const leaveApplicationIdParamsSchema = z.object({
  leaveId: z.string().uuid(),
});

export type LeaveDeskListQuery = z.infer<typeof leaveDeskListQuerySchema>;
