import { z } from 'zod';

export const roomDirectoryOperationalStatusSchema = z.enum([
  'Available',
  'Full',
  'Maintenance',
  'Inactive',
]);

export const roomDirectoryOccupancyFilterSchema = z.enum([
  'Has open beds',
  'Fully occupied',
  'Vacant',
]);

export const roomDirectoryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().max(100).trim().optional(),
  hostel: z.string().max(150).trim().optional(),
  block: z.string().max(100).trim().optional(),
  floor: z.string().max(80).trim().optional(),
  roomType: z.string().max(80).trim().optional(),
  status: roomDirectoryOperationalStatusSchema.optional(),
  occupancy: roomDirectoryOccupancyFilterSchema.optional(),
});

export type RoomDirectoryListQuery = z.infer<typeof roomDirectoryListQuerySchema>;
