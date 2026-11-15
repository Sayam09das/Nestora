import { z } from 'zod';

export const createRoomChangeBodySchema = z.object({
  preferredConfigId: z.string().uuid(),
  reason: z.string().min(8).max(500).trim(),
});

export const roomChangeIdParamsSchema = z.object({
  requestId: z.string().uuid(),
});

export const approveRoomChangeBodySchema = z.object({
  bedId: z.string().uuid(),
  remarks: z.string().max(300).trim().optional(),
});

export const rejectRoomChangeBodySchema = z.object({
  remarks: z.string().min(8).max(500).trim(),
});

export type CreateRoomChangeBody = z.infer<typeof createRoomChangeBodySchema>;
export type ApproveRoomChangeBody = z.infer<typeof approveRoomChangeBodySchema>;