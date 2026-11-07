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
  assignedHostelIds: string[];
};
