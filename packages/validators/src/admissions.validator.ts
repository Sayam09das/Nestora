import { z } from 'zod';

export const admissionVerificationDecisionSchema = z.enum(['APPROVED', 'REJECTED']);

export const admissionTierVerificationBodySchema = z
  .object({
    decision: admissionVerificationDecisionSchema,
    comments: z.string().max(2000).trim().optional(),
  })
  .strict()
  .superRefine((body, ctx) => {
    if (body.decision === 'REJECTED') {
      const comments = body.comments?.trim() ?? '';
      if (comments.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Rejection requires remarks of at least 8 characters.',
          path: ['comments'],
        });
      }
    }
  });

export const admissionApplicationIdParamsSchema = z.object({
  applicationId: z.string().uuid(),
});

export type AdmissionTierVerificationBody = z.infer<typeof admissionTierVerificationBodySchema>;