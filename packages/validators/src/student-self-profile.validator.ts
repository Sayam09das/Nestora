import { z } from 'zod';

export const updateStudentSelfProfileBodySchema = z.object({
  phone: z.string().max(20).trim().optional(),
  permanentAddress: z.string().max(2000).trim().optional(),
  guardianName: z.string().max(150).trim().optional(),
  guardianPhone: z.string().max(20).trim().optional(),
  guardianRelation: z.string().max(50).trim().optional(),
  profilePhotoObjectKey: z.string().max(500).trim().optional(),
});

export type UpdateStudentSelfProfileBody = z.infer<typeof updateStudentSelfProfileBodySchema>;