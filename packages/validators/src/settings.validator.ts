import { z } from 'zod';

const settingsCategorySchema = z.enum([
  'Institution',
  'Operations',
  'Security',
  'Communications',
  'Finance',
  'Safety',
]);

const settingsPanelStatusSchema = z.enum(['Synced', 'Draft', 'Pending approval']);

export const settingsDeskListQuerySchema = z.object({
  q: z.string().max(100).trim().optional(),
  category: settingsCategorySchema.optional(),
  scope: z.enum(['University-wide', 'Hostel overrides']).optional(),
  status: settingsPanelStatusSchema.optional(),
});

export const settingsPanelIdParamsSchema = z.object({
  panelId: z.string().min(2).max(64),
});

export type SettingsDeskListQuery = z.infer<typeof settingsDeskListQuerySchema>;
