import { z } from 'zod';

export const updateSelfProfileBodySchema = z.object({
  phone: z.string().max(20).trim().optional(),
  emergencyContactName: z.string().max(150).trim().optional(),
  emergencyRelationship: z.string().max(50).trim().optional(),
  emergencyContactPhone: z.string().max(20).trim().optional(),
  profilePhotoObjectKey: z.string().max(500).trim().optional(),
});

export type UpdateSelfProfileBody = z.infer<typeof updateSelfProfileBodySchema>;
