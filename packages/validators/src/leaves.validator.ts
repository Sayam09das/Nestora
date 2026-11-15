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

export const studentLeaveTypeSchema = z.enum([
  'Medical',
  'Family',
  'Academic',
  'Emergency',
  'Personal',
]);

export const createStudentLeaveBodySchema = z
  .object({
    leaveType: studentLeaveTypeSchema,
    departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    expectedReturnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    destination: z.string().trim().min(2).max(200),
    reason: z.string().trim().min(10).max(2000),
    emergencyContact: z.string().trim().min(8).max(20),
  })
  .refine(
    (body) => body.expectedReturnDate >= body.departureDate,
    { message: 'Return date must be on or after departure.', path: ['expectedReturnDate'] },
  );

export type LeaveDeskListQuery = z.infer<typeof leaveDeskListQuerySchema>;
export type LeaveDecisionBody = z.infer<typeof leaveDecisionBodySchema>;
export type CreateStudentLeaveBody = z.infer<typeof createStudentLeaveBodySchema>;
