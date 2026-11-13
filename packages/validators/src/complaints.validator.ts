import { z } from 'zod';

const complaintUiStatusSchema = z.enum([
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
  'Reopened',
]);

const complaintUiCategorySchema = z.enum(['Electrical', 'Plumbing', 'Carpentry', 'Cleaning', 'Civil']);
const complaintUiPrioritySchema = z.enum(['Low', 'Medium', 'High', 'Critical']);

export const complaintsDeskListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  q: z.string().max(100).trim().optional(),
  hostel: z.string().max(150).trim().optional(),
  category: complaintUiCategorySchema.optional(),
  priority: complaintUiPrioritySchema.optional(),
  status: complaintUiStatusSchema.optional(),
});

export const complaintTicketIdParamsSchema = z.object({
  ticketId: z.string().uuid(),
});

export const assignComplaintTicketBodySchema = z.object({
  staffUserId: z.string().uuid(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
});

export type ComplaintsDeskListQuery = z.infer<typeof complaintsDeskListQuerySchema>;
export type AssignComplaintTicketBody = z.infer<typeof assignComplaintTicketBodySchema>;
