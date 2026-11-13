import { z } from 'zod';

export const leaveDeskListQuerySchema = z.object({
  q: z.string().optional(),
  hostel: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
});

export const leaveDecisionBodySchema = z.object({
  decision: z.enum(['Approved', 'Rejected']),
  feedback: z.string().max(2000).optional(),
});

export const leaveIdParamsSchema = z.object({
  leaveId: z.string().uuid(),
});

export type LeaveDeskListQuery = z.infer<typeof leaveDeskListQuerySchema>;
export type LeaveDecisionBody = z.infer<typeof leaveDecisionBodySchema>;
