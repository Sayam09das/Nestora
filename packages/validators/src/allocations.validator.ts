import { z } from 'zod';

export const allocationDirectoryStatusSchema = z.enum([
  'Pending',
  'Allocated',
  'Change Requested',
  'Rejected',
]);

export const allocationDirectoryTypeSchema = z.enum(['New Allocation', 'Room Change']);

export const allocationDirectoryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().max(100).trim().optional(),
  status: allocationDirectoryStatusSchema.optional(),
  type: allocationDirectoryTypeSchema.optional(),
  hostel: z.string().max(150).trim().optional(),
});

export type AllocationDirectoryListQuery = z.infer<typeof allocationDirectoryListQuerySchema>;
