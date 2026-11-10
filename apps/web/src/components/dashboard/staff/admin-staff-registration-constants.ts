import { SAMPLE_STAFF } from '@/components/dashboard/staff/admin-staff-data';

export const STAFF_REGISTRATION_STEPS = [
  { id: 1, title: 'Personal Information', short: 'Personal' },
  { id: 2, title: 'Professional Information', short: 'Professional' },
  { id: 3, title: 'Hostel Assignment', short: 'Hostel' },
  { id: 4, title: 'Address Information', short: 'Address' },
  { id: 5, title: 'Emergency & Family', short: 'Emergency' },
  { id: 6, title: 'Documents & Verification', short: 'Documents' },
  { id: 7, title: 'Account & Access', short: 'Account' },
] as const;

export const STAFF_DRAFT_STORAGE_KEY = 'nestora-staff-registration-draft-v1';

export const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'] as const;
export const RELATIONSHIP_OPTIONS = ['Parent', 'Spouse', 'Sibling', 'Child', 'Friend', 'Other'] as const;

export const JOB_TITLE_OPTIONS = [
  'Warden',
  'Assistant Warden',
  'Hostel Manager',
  'Security Guard',
  'Maintenance Staff',
  'Housekeeping Staff',
  'Accountant',
  'Receptionist',
  'Other',
] as const;

export const DEPARTMENT_OPTIONS = [
  'Administration',
  'Hostel Operations',
  'Security',
  'Maintenance',
  'Housekeeping',
  'Finance',
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Temporary'] as const;
export const WORK_SHIFT_OPTIONS = ['Morning', 'Evening', 'Night', 'Rotational', 'General'] as const;

export const ASSIGNED_HOSTEL_OPTIONS = ['Boys Hostel A', 'Girls Hostel B', 'All Hostels', 'Central Office'] as const;

export const HOSTEL_BLOCKS: Record<string, string[]> = {
  'Boys Hostel A': ['Block A', 'Block B', 'Block C'],
  'Girls Hostel B': ['Block D', 'Block E'],
  'All Hostels': ['—'],
  'Central Office': ['—'],
};

export const HOSTEL_FLOORS = ['Ground', 'Floor 1', 'Floor 2', 'Floor 3'] as const;

export const WARDEN_TYPE_OPTIONS = ['Chief Warden', 'Warden', 'Assistant Warden'] as const;

export const IDENTITY_PROOF_OPTIONS = ['Aadhaar Card', 'PAN Card', 'Voter ID', 'Passport', 'Other'] as const;

export const SYSTEM_ROLE_OPTIONS = ['Staff', 'Warden', 'Assistant Warden', 'Admin'] as const;

export const ACCOUNT_STATUS_OPTIONS = ['Active', 'Pending', 'Inactive'] as const;

export const COUNTRY_OPTIONS = ['India', 'Other'] as const;

/** Illustrative enrolled headcount per hostel for read-only “Assigned students”. */
export const HOSTEL_STUDENT_CAPACITY: Record<string, number> = {
  'Boys Hostel A': 220,
  'Girls Hostel B': 180,
  'All Hostels': 400,
  'Central Office': 0,
};

export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const PHOTO_ACCEPT = ['image/jpeg', 'image/png'];
export const DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;
export const DOCUMENT_ACCEPT = ['image/jpeg', 'image/png', 'application/pdf'];

export const REPORTING_MANAGER_OPTIONS = ['None', ...SAMPLE_STAFF.map((s) => s.name)];

export type StaffRegistrationForm = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  emergencyPhone: string;
  profilePhotoName: string;
  employeeId: string;
  jobTitle: string;
  department: string;
  employmentType: string;
  joiningDate: string;
  workShift: string;
  salary: string;
  reportingManager: string;
  assignedHostel: string;
  assignedBlock: string;
  assignedFloor: string;
  responsibility: string;
  dutyStartDate: string;
  wardenType: string;
  managedCapacity: string;
  securityZone: string;
  fullAddress: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  emergencyContactName: string;
  emergencyRelationship: string;
  emergencyContactPhone: string;
  alternateContact: string;
  identityProofType: string;
  identityProofNumber: string;
  identityProofDocName: string;
  employeePhotoName: string;
  qualificationDocName: string;
  appointmentDocName: string;
  loginEmail: string;
  systemRole: string;
  accountStatus: string;
  sendInvitation: boolean;
};

export function createEmptyStaffForm(): StaffRegistrationForm {
  return {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    emergencyPhone: '',
    profilePhotoName: '',
    employeeId: generateEmployeeId(),
    jobTitle: '',
    department: '',
    employmentType: '',
    joiningDate: '',
    workShift: '',
    salary: '',
    reportingManager: 'None',
    assignedHostel: '',
    assignedBlock: '',
    assignedFloor: '',
    responsibility: '',
    dutyStartDate: '',
    wardenType: '',
    managedCapacity: '',
    securityZone: '',
    fullAddress: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    emergencyContactName: '',
    emergencyRelationship: '',
    emergencyContactPhone: '',
    alternateContact: '',
    identityProofType: '',
    identityProofNumber: '',
    identityProofDocName: '',
    employeePhotoName: '',
    qualificationDocName: '',
    appointmentDocName: '',
    loginEmail: '',
    systemRole: 'Staff',
    accountStatus: 'Pending',
    sendInvitation: true,
  };
}

let empSeq = 28;
export function generateEmployeeId(): string {
  empSeq += 1;
  return `STF-${String(empSeq).padStart(3, '0')}`;
}

export function isHostelBasedRole(jobTitle: string): boolean {
  return [
    'Warden',
    'Assistant Warden',
    'Hostel Manager',
    'Security Guard',
    'Maintenance Staff',
    'Housekeeping Staff',
  ].includes(jobTitle);
}

export function isWardenRole(jobTitle: string): boolean {
  return jobTitle === 'Warden' || jobTitle === 'Assistant Warden' || jobTitle === 'Hostel Manager';
}

export function isSecurityRole(jobTitle: string): boolean {
  return jobTitle === 'Security Guard';
}

export function derivedAssignedStudents(hostel: string): number {
  return HOSTEL_STUDENT_CAPACITY[hostel] ?? 0;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[\d\s+()-]{10,}$/;

export function validateStaffStep(step: number, form: StaffRegistrationForm): Record<string, string> {
  const errors: Record<string, string> = {};
  const req = (key: keyof StaffRegistrationForm, label: string) => {
    const value = form[key];
    if (typeof value !== 'string' || !value.trim()) {
      errors[key] = `${label} is required`;
    } else if (key === 'reportingManager' && value === 'None') {
      delete errors[key];
    }
  };

  switch (step) {
    case 1:
      req('firstName', 'First name');
      req('lastName', 'Last name');
      req('dateOfBirth', 'Date of birth');
      req('gender', 'Gender');
      req('phone', 'Phone number');
      req('email', 'Email address');
      req('emergencyPhone', 'Emergency contact number');
      if (form.phone && !phonePattern.test(form.phone.trim())) errors.phone = 'Enter a valid phone number';
      if (form.emergencyPhone && !phonePattern.test(form.emergencyPhone.trim())) {
        errors.emergencyPhone = 'Enter a valid emergency number';
      }
      if (form.email && !emailPattern.test(form.email.trim())) errors.email = 'Enter a valid email';
      break;
    case 2:
      req('employeeId', 'Employee ID');
      req('jobTitle', 'Job title');
      req('department', 'Department');
      req('employmentType', 'Employment type');
      req('joiningDate', 'Joining date');
      req('workShift', 'Work shift');
      break;
    case 3:
      req('dutyStartDate', 'Duty start date');
      if (isHostelBasedRole(form.jobTitle)) {
        req('assignedHostel', 'Assigned hostel');
      }
      if (isWardenRole(form.jobTitle)) {
        req('wardenType', 'Warden type');
      }
      if (isSecurityRole(form.jobTitle)) {
        req('workShift', 'Work shift');
      }
      break;
    case 4:
      req('fullAddress', 'House / street address');
      req('city', 'City');
      req('state', 'State');
      req('pinCode', 'PIN code');
      req('country', 'Country');
      if (form.pinCode && !/^\d{6}$/.test(form.pinCode.trim())) errors.pinCode = 'PIN must be 6 digits';
      break;
    case 5:
      req('emergencyContactName', 'Emergency contact name');
      req('emergencyRelationship', 'Relationship');
      req('emergencyContactPhone', 'Emergency phone');
      if (form.emergencyContactPhone && !phonePattern.test(form.emergencyContactPhone.trim())) {
        errors.emergencyContactPhone = 'Enter a valid phone number';
      }
      break;
    case 6:
      req('identityProofType', 'Identity proof type');
      req('identityProofNumber', 'Identity proof number');
      req('identityProofDocName', 'Identity proof document');
      break;
    case 7:
      req('loginEmail', 'Login email');
      req('systemRole', 'Assigned role');
      req('accountStatus', 'Account status');
      if (form.loginEmail && !emailPattern.test(form.loginEmail.trim())) errors.loginEmail = 'Enter a valid email';
      break;
    default:
      break;
  }
  return errors;
}

export function validateAllStaffSteps(form: StaffRegistrationForm): Record<string, string> {
  return STAFF_REGISTRATION_STEPS.reduce<Record<string, string>>((acc, s) => {
    return { ...acc, ...validateStaffStep(s.id, form) };
  }, {});
}

export function validatePhotoFile(file: File): string | null {
  if (!PHOTO_ACCEPT.includes(file.type)) return 'Use JPG or PNG only';
  if (file.size > PHOTO_MAX_BYTES) return 'Photo must be 2 MB or smaller';
  return null;
}

export function validateDocumentFile(file: File): string | null {
  if (!DOCUMENT_ACCEPT.includes(file.type)) return 'Use JPG, PNG, or PDF only';
  if (file.size > DOCUMENT_MAX_BYTES) return 'Each file must be 5 MB or smaller';
  return null;
}

export function suggestedSystemRole(jobTitle: string): string {
  if (jobTitle === 'Warden' || jobTitle === 'Hostel Manager') return 'Warden';
  if (jobTitle === 'Assistant Warden') return 'Assistant Warden';
  return 'Staff';
}
