export type SessionUser = {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  status: string;
  /** True after email OTP verification (registration or manual verification flow). */
  isVerified: boolean;
  mfaEnabled: boolean;
  /** FR-008: when true, only password-change and minimal session routes are allowed until cleared. */
  mustChangePassword: boolean;
  assignedHostelIds: string[];
};
