import { z } from 'zod';

const financeLedgerStatusSchema = z.enum(['Current', 'Due soon', 'Overdue', 'Cleared']);

export const financeDeskListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().max(100).trim().optional(),
  hostel: z.string().max(150).trim().optional(),
  status: financeLedgerStatusSchema.optional(),
});

export const financeLedgerIdParamsSchema = z.object({
  ledgerId: z.string().uuid(),
});

export type FinanceDeskListQuery = z.infer<typeof financeDeskListQuerySchema>;