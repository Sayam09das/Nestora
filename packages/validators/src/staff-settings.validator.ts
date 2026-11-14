import { z } from 'zod';

export const staffNotificationPreferencesBodySchema = z
  .object({
    emailLeaves: z.boolean().optional(),
    emailMaintenance: z.boolean().optional(),
    emailFees: z.boolean().optional(),
    emailNotices: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one preference must be provided.',
  });

export type StaffNotificationPreferencesBody = z.infer<typeof staffNotificationPreferencesBodySchema>;