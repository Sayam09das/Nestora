import { z } from 'zod';

const noticeUiStatusSchema = z.enum(['Live', 'Scheduled', 'Expired', 'Draft']);
const noticeUiCategorySchema = z.enum(['General', 'Hostel Rules', 'Fees', 'Maintenance', 'Emergency', 'Events']);

export const announcementsDeskListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  q: z.string().max(100).trim().optional(),
  category: noticeUiCategorySchema.optional(),
  scope: z.string().max(150).trim().optional(),
  status: noticeUiStatusSchema.optional(),
});

export const announcementIdParamsSchema = z.object({
  noticeId: z.string().uuid(),
});

export type AnnouncementsDeskListQuery = z.infer<typeof announcementsDeskListQuerySchema>;
