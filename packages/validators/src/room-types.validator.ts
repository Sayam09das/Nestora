import { z } from 'zod';

export const roomTypeStatusSchema = z.enum(['Active', 'Inactive']);

export const roomTypeDirectoryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().max(100).trim().optional(),
  hostel: z.string().max(150).trim().optional(),
  category: z.string().max(50).trim().optional(),
  capacity: z.string().max(40).trim().optional(),
  price: z.string().max(40).trim().optional(),
  status: roomTypeStatusSchema.optional(),
});

export type RoomTypeDirectoryListQuery = z.infer<typeof roomTypeDirectoryListQuerySchema>;
