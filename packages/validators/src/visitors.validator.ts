import { z } from 'zod';

export const visitorDeskListQuerySchema = z.object({
  q: z.string().optional(),
  hostel: z.string().optional(),
  status: z.string().optional(),
});

export const registerVisitorBodySchema = z.object({
  studentId: z.string().uuid(),
  visitorName: z.string().min(2).max(150),
  visitorPhone: z.string().min(8).max(20),
  idProofType: z.string().min(2).max(50),
  idProofNumber: z.string().min(2).max(100),
  purpose: z.string().min(3).max(500),
  isException: z.boolean().optional(),
});

export const visitorIdParamsSchema = z.object({
  visitorId: z.string().uuid(),
});

export const visitorRejectBodySchema = z.object({
  reason: z.string().min(3).max(500).optional(),
});

export type VisitorDeskListQuery = z.infer<typeof visitorDeskListQuerySchema>;
export type RegisterVisitorBody = z.infer<typeof registerVisitorBodySchema>;
