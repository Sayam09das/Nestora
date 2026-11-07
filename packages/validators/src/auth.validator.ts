import { z } from 'zod';

export const roleEnumSchema = z.enum([
  'UNIVERSITY_ADMINISTRATOR',
  'HOSTEL_WARDEN',
  'STUDENT',
  'HOSTEL_STAFF',
  'SECURITY_GUARD',
  'ACCOUNTANT',
]);

export const loginBodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(256),
  mfaCode: z.string().min(6).max(32).optional(),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export const registerBodySchema = z
  .object({
    email: z.string().email().max(255),
    password: z.string().min(12).max(128),
    passwordConfirm: z.string().min(12).max(128),
    firstName: z.string().min(1).max(100).trim(),
    lastName: z.string().min(1).max(100).trim(),
    phoneNumber: z.string().max(20).trim().optional(),
    role: roleEnumSchema.default('STUDENT'),
  })
  .strict();

export type RegisterBody = z.infer<typeof registerBodySchema>;

export const otpEmailBodySchema = z.object({
  email: z.string().email().max(255),
  code: z.string().regex(/^\d{6}$/),
});

export const emailOnlyBodySchema = z.object({
  email: z.string().email().max(255),
});

export const resendOtpBodySchema = emailOnlyBodySchema;

export const verifyRegistrationOtpBodySchema = otpEmailBodySchema;

export const forgotPasswordBodySchema = emailOnlyBodySchema;

export const verifyPasswordResetOtpBodySchema = otpEmailBodySchema;

export const resetPasswordBodySchema = z
  .object({
    email: z.string().email().max(255),
    resetToken: z.string().min(64).max(128),
    newPassword: z.string().min(12).max(128),
    newPasswordConfirm: z.string().min(12).max(128),
  })
  .strict();

/** FR-004: single-use token from the reset link in email. */
export const resetPasswordLinkBodySchema = z
  .object({
    token: z.string().min(64).max(128),
    newPassword: z.string().min(12).max(128),
    newPasswordConfirm: z.string().min(12).max(128),
  })
  .strict();

/** FR-005 / FR-006: admin-provisioned account activation. */
export const activateAccountBodySchema = z
  .object({
    token: z.string().min(64).max(128),
    password: z.string().min(12).max(128),
    passwordConfirm: z.string().min(12).max(128),
  })
  .strict();

export const provisionUserBodySchema = z
  .object({
    email: z.string().email().max(255),
    firstName: z.string().min(1).max(100).trim(),
    lastName: z.string().min(1).max(100).trim(),
    phoneNumber: z.string().max(20).trim().optional(),
    role: roleEnumSchema,
    /** Required for Hostel Staff / Security Guard (FR-006 warden scope). */
    hostelId: z.string().uuid().optional(),
  })
  .strict();

export const changePasswordBodySchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(12).max(128),
    newPasswordConfirm: z.string().min(12).max(128),
  })
  .strict();

export const verifyEmailBodySchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

export const mfaVerifyBodySchema = z.object({
  code: z.string().min(6).max(32),
});

export const mfaDisableBodySchema = z.object({
  password: z.string().min(1).max(128),
  mfaCode: z.string().min(6).max(32),
});

export const sessionIdParamsSchema = z.object({
  sessionId: z.string().uuid(),
});

export const userIdParamsSchema = z.object({
  userId: z.string().uuid(),
});

export const userStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']);

export const adminListUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: userStatusSchema.optional(),
  role: roleEnumSchema.optional(),
  q: z.string().max(100).trim().optional(),
});

/** FR-009: filter auth-related audit events. */
export const adminAuthActivityQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  userId: z.string().uuid().optional(),
  action: z.string().max(64).trim().optional(),
});

export const adminUpdateUserStatusBodySchema = z
  .object({
    status: userStatusSchema,
  })
  .strict();

export const adminUpdateUserRoleBodySchema = z
  .object({
    role: roleEnumSchema,
  })
  .strict();

/** FR-008: admin assigns a known temporary password; user must change it on next login. */
export const adminSetTemporaryPasswordBodySchema = z
  .object({
    temporaryPassword: z.string().min(12).max(128),
  })
  .strict();
