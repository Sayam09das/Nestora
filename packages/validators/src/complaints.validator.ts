import { z } from 'zod';

export const complaintsDeskListQuerySchema = z.object({
  q: z.string().optional(),
  hostel: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const assignComplaintTicketBodySchema = z.object({
  staffUserId: z.string().uuid(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
});

export const complaintTicketIdParamsSchema = z.object({
  ticketId: z.string().uuid(),
});

export type ComplaintsDeskListQuery = z.infer<typeof complaintsDeskListQuerySchema>;
export type AssignComplaintTicketBody = z.infer<typeof assignComplaintTicketBodySchema>;
