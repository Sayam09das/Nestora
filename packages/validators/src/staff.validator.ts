import { z } from 'zod';

export const staffDirectoryStatusSchema = z.enum(['Active', 'On Leave', 'Inactive']);

export const staffDirectoryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().max(100).trim().optional(),
  status: staffDirectoryStatusSchema.optional(),
  role: z.string().max(100).trim().optional(),
  department: z.string().max(100).trim().optional(),
  hostel: z.string().max(150).trim().optional(),
  variant: z.enum(['all', 'wardens']).optional(),
});

export type StaffDirectoryListQuery = z.infer<typeof staffDirectoryListQuerySchema>;

export const staffDocumentKindSchema = z.enum([
  'IDENTITY_PROOF',
  'EMPLOYEE_PHOTO',
  'QUALIFICATION',
  'APPOINTMENT',
]);

export const registerStaffBodySchema = z
  .object({
    firstName: z.string().min(1).max(100).trim(),
    lastName: z.string().min(1).max(100).trim(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    phone: z.string().min(10).max(20).trim(),
    contactEmail: z.string().email().max(255),
    loginEmail: z.string().email().max(255),
    employeeNumber: z.string().min(1).max(50).trim(),
    jobTitle: z.string().min(1).max(100).trim(),
    department: z.string().min(1).max(100).trim(),
    employmentType: z.string().min(1).max(50).trim(),
    joiningDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    workShift: z.string().min(1).max(50).trim(),
    assignedHostel: z.string().max(150).trim().optional(),
    fullAddress: z.string().min(1).max(500).trim(),
    city: z.string().min(1).max(100).trim(),
    state: z.string().min(1).max(100).trim(),
    pinCode: z.string().regex(/^\d{6}$/),
    country: z.string().min(1).max(100).trim().default('India'),
    emergencyContactName: z.string().min(1).max(150).trim(),
    emergencyRelationship: z.string().min(1).max(50).trim(),
    emergencyContactPhone: z.string().min(10).max(20).trim(),
    identityProofType: z.string().min(1).max(50).trim(),
    identityProofNumber: z.string().min(1).max(80).trim(),
    accountStatus: z.enum(['Active', 'Pending', 'Inactive']),
    sendInvitation: z.boolean(),
    profilePhotoObjectKey: z.string().max(500).trim().optional(),
    documentUploads: z
      .array(
        z
          .object({
            kind: staffDocumentKindSchema,
            objectKey: z.string().min(1).max(500).trim(),
            fileName: z.string().min(1).max(255).trim(),
            mimeType: z.string().min(1).max(100).trim(),
            fileSize: z.number().int().positive(),
          })
          .strict(),
      )
      .max(12)
      .optional(),
  })
  .strict();

export type RegisterStaffBody = z.infer<typeof registerStaffBodySchema>;
