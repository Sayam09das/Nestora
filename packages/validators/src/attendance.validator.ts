import { z } from 'zod';

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD');

export const nightAttendanceSessionQuerySchema = z.object({
  date: isoDateString,
});

export const upsertNightAttendanceMarkBodySchema = z.object({
  date: isoDateString,
  studentId: z.string().uuid(),
  mark: z.enum(['Present', 'Absent', 'On Leave']),
});

export const clearNightAttendanceMarkBodySchema = z.object({
  date: isoDateString,
  studentId: z.string().uuid(),
});

export type NightAttendanceSessionQuery = z.infer<typeof nightAttendanceSessionQuerySchema>;
export type UpsertNightAttendanceMarkBody = z.infer<typeof upsertNightAttendanceMarkBodySchema>;
export type ClearNightAttendanceMarkBody = z.infer<typeof clearNightAttendanceMarkBodySchema>;
