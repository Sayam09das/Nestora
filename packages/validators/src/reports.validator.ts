import { z } from 'zod';

export const reportsDeskListQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  hostel: z.string().optional(),
  period: z.string().optional(),
});

export const reportIdParamsSchema = z.object({
  reportId: z.string().min(1),
});

export const reportTemplateIdParamsSchema = reportIdParamsSchema;

export const reportPreviewQuerySchema = z.object({
  hostel: z.string().optional(),
  period: z.string().optional(),
});

export type ReportsDeskListQuery = z.infer<typeof reportsDeskListQuerySchema>;
