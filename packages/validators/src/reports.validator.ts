import { z } from 'zod';

const reportCategorySchema = z.enum([
  'Admissions',
  'Occupancy',
  'Attendance',
  'Leave',
  'Visitors',
  'Complaints',
  'Staff',
  'Fees',
  'Safety',
]);

export const reportsDeskListQuerySchema = z.object({
  q: z.string().max(100).trim().optional(),
  category: reportCategorySchema.optional(),
  hostel: z.string().max(150).trim().optional(),
  period: z.enum(['Last 7 days', 'Last 30 days', 'This term', 'Custom range']).optional(),
});

export const reportTemplateIdParamsSchema = z.object({
  reportId: z.string().min(2).max(64),
});

export const reportPreviewQuerySchema = z.object({
  hostel: z.string().max(150).trim().optional(),
  period: z.enum(['Last 7 days', 'Last 30 days', 'This term', 'Custom range']).optional(),
});

export type ReportsDeskListQuery = z.infer<typeof reportsDeskListQuerySchema>;
