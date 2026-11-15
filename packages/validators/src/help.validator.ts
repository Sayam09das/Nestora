import { z } from 'zod';

export const createStudentHelpRequestBodySchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(4000),
});

export type CreateStudentHelpRequestBody = z.infer<typeof createStudentHelpRequestBodySchema>;