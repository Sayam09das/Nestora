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

export const recordOfflinePaymentBodySchema = z.object({
  ledgerId: z.string().uuid(),
  amount: z.coerce.number().positive().max(1_000_000),
  paymentMode: z.enum(['CASH', 'DD', 'NEFT', 'UPI']),
  transactionReference: z.string().min(2).max(100).trim(),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const feeAdjustmentIdParamsSchema = z.object({
  adjustmentId: z.string().uuid(),
});

export const decideFeeAdjustmentBodySchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  remarks: z.string().max(300).trim().optional(),
});

export const proposeFeeWaiverBodySchema = z.object({
  ledgerId: z.string().uuid(),
  amount: z.coerce.number().positive().max(500_000),
  reason: z.string().min(8).max(500).trim(),
});

export type RecordOfflinePaymentBody = z.infer<typeof recordOfflinePaymentBodySchema>;
export type DecideFeeAdjustmentBody = z.infer<typeof decideFeeAdjustmentBodySchema>;
export type ProposeFeeWaiverBody = z.infer<typeof proposeFeeWaiverBodySchema>;