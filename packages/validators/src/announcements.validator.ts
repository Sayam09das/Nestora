import { z } from 'zod';

export const announcementsDeskListQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  scope: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const announcementIdParamsSchema = z.object({
  noticeId: z.string().uuid(),
});

export const studentAcknowledgeNoticeBodySchema = z.object({
  noticeId: z.string().uuid(),
});

export type AnnouncementsDeskListQuery = z.infer<typeof announcementsDeskListQuerySchema>;
export type StudentAcknowledgeNoticeBody = z.infer<typeof studentAcknowledgeNoticeBodySchema>;
