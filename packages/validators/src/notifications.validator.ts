import { z } from 'zod';

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  unreadOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

export const notificationIdParamsSchema = z.object({
  notificationId: z.string().uuid(),
});

export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;