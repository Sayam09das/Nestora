import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const dailyRegisterDeskQuerySchema = z.object({
  date: isoDate.optional(),
  hostel: z.string().optional(),
  category: z.string().optional(),
  q: z.string().optional(),
});

export type DailyRegisterDeskQuery = z.infer<typeof dailyRegisterDeskQuerySchema>;
