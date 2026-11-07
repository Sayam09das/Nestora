import { z } from 'zod';

export const createUniversityBodySchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
  address: z.string().max(1000).optional(),
  contactEmail: z.string().email().max(255).optional(),
});

export type CreateUniversityBody = z.infer<typeof createUniversityBodySchema>;
