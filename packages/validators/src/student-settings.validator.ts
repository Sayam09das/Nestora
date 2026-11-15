import { z } from 'zod';

export const studentNotificationPreferencesBodySchema = z.object({
  emailLeaves: z.boolean().optional(),
  emailMaintenance: z.boolean().optional(),
  emailFees: z.boolean().optional(),
  emailNotices: z.boolean().optional(),
});

export type StudentNotificationPreferencesBody = z.infer<typeof studentNotificationPreferencesBodySchema>;