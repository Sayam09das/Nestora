import { z } from 'zod';

export const studentDirectoryStatusSchema = z.enum(['Active', 'Pending', 'Inactive']);

export const studentDirectoryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().max(100).trim().optional(),
  status: studentDirectoryStatusSchema.optional(),
  hostel: z.string().max(150).trim().optional(),
  course: z.string().max(100).trim().optional(),
  academicYear: z.string().max(20).trim().optional(),
});

export type StudentDirectoryListQuery = z.infer<typeof studentDirectoryListQuerySchema>;

const registrationGenderSchema = z.enum(['Male', 'Female', 'Non-binary', 'Prefer not to say']);

export const registerStudentBodySchema = z
  .object({
    firstName: z.string().min(1).max(100).trim(),
    lastName: z.string().min(1).max(100).trim(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    gender: registrationGenderSchema,
    phone: z.string().min(10).max(20).trim(),
    contactEmail: z.string().email().max(255),
    loginEmail: z.string().email().max(255),
    registrationNumber: z.string().min(1).max(50).trim(),
    admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    course: z.string().min(1).max(100).trim(),
    academicYear: z.string().min(1).max(20).trim(),
    college: z.string().max(100).trim().optional(),
    fullAddress: z.string().min(1).max(500).trim(),
    city: z.string().min(1).max(100).trim(),
    state: z.string().min(1).max(100).trim(),
    pinCode: z.string().regex(/^\d{6}$/),
    country: z.string().min(1).max(100).trim().default('India'),
    guardianName: z.string().min(1).max(150).trim(),
    relationship: z.string().min(1).max(50).trim(),
    guardianPhone: z.string().min(10).max(20).trim(),
    guardianEmail: z.union([z.literal(''), z.string().email().max(255)]).optional(),
    guardianAddress: z.string().max(500).trim().optional(),
    /** Public bucket object key from POST /uploads/student-profile. */
    profilePhotoObjectKey: z.string().max(500).trim().optional(),
    documentUploads: z
      .array(
        z
          .object({
            objectKey: z.string().min(1).max(500).trim(),
            fileName: z.string().min(1).max(255).trim(),
            mimeType: z.string().min(1).max(100).trim(),
            fileSize: z.number().int().positive(),
          })
          .strict(),
      )
      .max(10)
      .optional(),
    currentSemester: z.string().min(1).max(20).trim().optional(),
  })
  .strict();

export type RegisterStudentBody = z.infer<typeof registerStudentBodySchema>;
