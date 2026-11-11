import { z } from 'zod';

export const hostelDirectoryStatusSchema = z.enum(['Active', 'Under Setup', 'Inactive']);

export const hostelDirectoryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().max(100).trim().optional(),
  gender: z.string().max(50).trim().optional(),
  campus: z.string().max(150).trim().optional(),
  status: hostelDirectoryStatusSchema.optional(),
  occupancy: z.string().max(40).trim().optional(),
});

export type HostelDirectoryListQuery = z.infer<typeof hostelDirectoryListQuerySchema>;
