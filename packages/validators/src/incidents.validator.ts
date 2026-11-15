import { z } from 'zod';

export const incidentsDeskListQuerySchema = z.object({
  q: z.string().optional(),
  hostel: z.string().optional(),
  type: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const incidentIdParamsSchema = z.object({
  incidentId: z.string().uuid(),
});

export const patchIncidentSeverityBodySchema = z.object({
  officialSeverity: z.enum(['Low', 'Medium', 'High', 'Critical']),
  notes: z.string().max(2000).optional(),
});

export const incidentActionBodySchema = z.object({
  actionTaken: z.string().min(3).max(2000),
});

export const resolveIncidentBodySchema = z.object({
  actionTaken: z.string().min(3).max(2000),
});

export const staffReportIncidentBodySchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(5000),
  location: z.string().trim().min(2).max(150),
  incidentType: z.enum(['Fire', 'Medical', 'Security', 'Missing student', 'Infrastructure', 'Other']),
  initialSeverity: z.enum(['Low', 'Medium', 'High', 'Critical']),
});

export type IncidentsDeskListQuery = z.infer<typeof incidentsDeskListQuerySchema>;
export type PatchIncidentSeverityBody = z.infer<typeof patchIncidentSeverityBodySchema>;
export type IncidentActionBody = z.infer<typeof incidentActionBodySchema>;
export type ResolveIncidentBody = z.infer<typeof resolveIncidentBodySchema>;
export const studentReportIncidentBodySchema = staffReportIncidentBodySchema;

export type StaffReportIncidentBody = z.infer<typeof staffReportIncidentBodySchema>;
export type StudentReportIncidentBody = z.infer<typeof studentReportIncidentBodySchema>;
