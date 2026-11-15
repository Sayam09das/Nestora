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

export const studentComplaintCategorySchema = z.enum([
  'Maintenance',
  'Electrical',
  'Plumbing',
  'Cleaning',
  'Roommate',
  'Internet',
  'Other',
]);

export const studentComplaintPrioritySchema = z.enum(['Low', 'Medium', 'High']);

export const studentMaintenanceCategorySchema = z.enum([
  'Maintenance',
  'Electrical',
  'Plumbing',
  'Cleaning',
  'Internet',
]);

export const createStudentComplaintBodySchema = z.object({
  category: studentComplaintCategorySchema,
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(4000),
  location: z.string().trim().min(2).max(150),
  suggestedPriority: studentComplaintPrioritySchema,
});

export const createStudentMaintenanceBodySchema = z.object({
  category: studentMaintenanceCategorySchema,
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(4000),
  location: z.string().trim().min(2).max(150),
  suggestedPriority: studentComplaintPrioritySchema,
});

export type ComplaintsDeskListQuery = z.infer<typeof complaintsDeskListQuerySchema>;
export type AssignComplaintTicketBody = z.infer<typeof assignComplaintTicketBodySchema>;
export type CreateStudentComplaintBody = z.infer<typeof createStudentComplaintBodySchema>;
export type CreateStudentMaintenanceBody = z.infer<typeof createStudentMaintenanceBodySchema>;
