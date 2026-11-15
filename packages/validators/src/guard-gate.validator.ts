import { z } from 'zod';

export const guardGateLookupBodySchema = z.object({
  token: z.string().trim().min(4).max(64),
});

export const guardGatePassActionBodySchema = z.object({
  passId: z.string().uuid(),
  remarks: z.string().max(500).trim().optional(),
});

export type GuardGateLookupBody = z.infer<typeof guardGateLookupBodySchema>;
export type GuardGatePassActionBody = z.infer<typeof guardGatePassActionBodySchema>;