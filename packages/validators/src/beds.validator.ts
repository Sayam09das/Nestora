import { z } from 'zod';

export const bedDirectoryUiStatusSchema = z.enum(['Available', 'Occupied', 'Reserved', 'Maintenance']);

export const bedDirectoryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().max(100).trim().optional(),
  hostel: z.string().max(150).trim().optional(),
  block: z.string().max(100).trim().optional(),
  floor: z.string().max(80).trim().optional(),
  room: z.string().max(50).trim().optional(),
  status: bedDirectoryUiStatusSchema.optional(),
});

export type BedDirectoryListQuery = z.infer<typeof bedDirectoryListQuerySchema>;
