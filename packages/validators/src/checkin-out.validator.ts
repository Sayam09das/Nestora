import { z } from 'zod';

export const createCheckOutRequestBodySchema = z.object({
  plannedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(500).trim().optional(),
});

export const checkOutRequestIdParamsSchema = z.object({
  requestId: z.string().uuid(),
});

export const wardenCheckOutListQuerySchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'REJECTED', 'CANCELLED']).optional(),
});

const inspectionItemSchema = z.object({
  itemName: z.string().min(1).max(100).trim(),
  condition: z.enum(['INTACT', 'DAMAGED', 'MISSING']),
  damageFee: z.coerce.number().nonnegative().max(100_000).optional(),
});

export const finalizeCheckOutBodySchema = z.object({
  keysReturned: z.boolean(),
  remarks: z.string().max(500).trim().optional(),
  inspections: z.array(inspectionItemSchema).min(1).max(20),
});

export const rejectCheckOutBodySchema = z.object({
  remarks: z.string().min(8).max(500).trim(),
});

export const accountantClearanceBodySchema = z.object({
  remarks: z.string().max(500).trim().optional(),
  affirmDuesCleared: z.boolean(),
});

export const wardenCheckInBodySchema = z.object({
  allocationId: z.string().uuid(),
  keysIssued: z.boolean(),
  remarks: z.string().max(500).trim().optional(),
});

export type CreateCheckOutRequestBody = z.infer<typeof createCheckOutRequestBodySchema>;
export type FinalizeCheckOutBody = z.infer<typeof finalizeCheckOutBodySchema>;
export type RejectCheckOutBody = z.infer<typeof rejectCheckOutBodySchema>;
export type AccountantClearanceBody = z.infer<typeof accountantClearanceBodySchema>;
export type WardenCheckInBody = z.infer<typeof wardenCheckInBodySchema>;