import { z } from 'zod';

export const outingDeskListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().optional(),
  hostel: z.string().optional(),
  status: z.string().optional(),
});

export const outingIdParamsSchema = z.object({
  outingId: z.string().uuid(),
});

export const outingDecisionBodySchema = z.object({
  decision: z.enum(['Approved', 'Rejected']),
  feedback: z.string().max(2000).optional(),
});

export const createStudentOutingBodySchema = z
  .object({
    outingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    departureTime: z.string().regex(/^\d{2}:\d{2}$/),
    expectedReturnTime: z.string().regex(/^\d{2}:\d{2}$/),
    destination: z.string().trim().min(2).max(255),
    isExceptional: z.boolean().optional(),
  })
  .refine((body) => body.expectedReturnTime > body.departureTime, {
    message: 'Return time must be after departure on the same day.',
    path: ['expectedReturnTime'],
  });

export type OutingDeskListQuery = z.infer<typeof outingDeskListQuerySchema>;
export type OutingDecisionBody = z.infer<typeof outingDecisionBodySchema>;
export type CreateStudentOutingBody = z.infer<typeof createStudentOutingBodySchema>;