import { z } from 'zod';

export const settingsDeskListQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  scope: z.string().optional(),
  status: z.string().optional(),
  hostel: z.string().optional(),
});

export const settingsPanelIdParamsSchema = z.object({
  panelId: z.string().min(1),
});

export const patchSettingsPanelBodySchema = z.object({
  hostel: z.string().optional(),
  fields: z.record(z.union([z.string(), z.number(), z.boolean()])),
});

export type SettingsDeskListQuery = z.infer<typeof settingsDeskListQuerySchema>;
