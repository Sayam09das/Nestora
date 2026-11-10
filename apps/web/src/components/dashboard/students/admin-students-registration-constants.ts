export const REGISTRATION_STEPS = [
  { id: 1, title: 'Personal Information', short: 'Personal' },
  { id: 2, title: 'Academic Information', short: 'Academic' },
  { id: 3, title: 'Address Information', short: 'Address' },
  { id: 4, title: 'Guardian Information', short: 'Guardian' },
  { id: 5, title: 'Hostel & Room Allocation', short: 'Hostel' },
  { id: 6, title: 'Account & Documents', short: 'Account' },
] as const;

export const DRAFT_STORAGE_KEY = 'nestora-student-registration-draft-v1';

export const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'] as const;
export const RELATIONSHIP_OPTIONS = ['Parent', 'Guardian', 'Sibling', 'Spouse', 'Other'] as const;
export const STAY_DURATION_OPTIONS = ['1 semester', '1 year', '2 years', 'Full programme'] as const;
export const ACCOUNT_STATUS_OPTIONS = ['Active', 'Pending', 'Inactive'] as const;

export const COURSE_OPTIONS = [
  'B.Tech CSE',
  'B.Tech ECE',
  'B.Tech ME',
  'B.Tech IT',
  'B.Sc Physics',
  'B.Sc Chemistry',
  'BBA',
] as const;

export const ACADEMIC_YEARS = ['2021', '2022', '2023', '2024', '2025'] as const;

export const HOSTEL_OPTIONS = ['Boys Hostel A', 'Girls Hostel B'] as const;

/** Sample inventory — only listed beds are assignable (prevents double allocation in UI). */
export const HOSTEL_INVENTORY: Record<
  (typeof HOSTEL_OPTIONS)[number],
  Record<string, { label: string; availableBeds: string[] }>
> = {
  'Boys Hostel A': {
    'A-201': { label: 'A-201 (Floor 2)', availableBeds: ['B2'] },
    'A-204': { label: 'A-204 (Floor 2)', availableBeds: ['B1'] },
    'A-210': { label: 'A-210 (Floor 2)', availableBeds: ['B1', 'B2'] },
  },
  'Girls Hostel B': {
    'B-108': { label: 'B-108 (Floor 1)', availableBeds: ['B2'] },
    'B-112': { label: 'B-112 (Floor 1)', availableBeds: ['B1'] },
    'B-212': { label: 'B-212 (Floor 2)', availableBeds: ['B1', 'B2'] },
  },
};

export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const PHOTO_ACCEPT = ['image/jpeg', 'image/png'];
export const DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;
export const DOCUMENT_ACCEPT = ['image/jpeg', 'image/png', 'application/pdf'];

export type StudentRegistrationForm = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  profilePhotoName: string;
  profilePhotoObjectKey: string;
  profilePhotoUrl: string;
  documentUploads: {
    objectKey: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }[];
  studentId: string;
  admissionDate: string;
  course: string;
  academicYear: string;
  college: string;
  rollNumber: string;
  fullAddress: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  guardianName: string;
  relationship: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianAddress: string;
  hostel: string;
  roomNumber: string;
  bedNumber: string;
  checkInDate: string;
  stayDuration: string;
  loginEmail: string;
  accountStatus: string;
  documentNames: string[];
  roomAllocationStatus: string;
};

export function createEmptyRegistrationForm(): StudentRegistrationForm {
  return {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    profilePhotoName: '',
    profilePhotoObjectKey: '',
    profilePhotoUrl: '',
    documentUploads: [],
    studentId: generateStudentId(),
    admissionDate: '',
    course: '',
    academicYear: '',
    college: '',
    rollNumber: '',
    fullAddress: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    guardianName: '',
    relationship: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianAddress: '',
    hostel: '',
    roomNumber: '',
    bedNumber: '',
    checkInDate: '',
    stayDuration: '',
    loginEmail: '',
    accountStatus: 'Pending',
    documentNames: [],
    roomAllocationStatus: 'Unassigned',
  };
}

let studentIdSeq = 451;

export function generateStudentId(): string {
  studentIdSeq += 1;
  return `STU-${String(studentIdSeq).padStart(3, '0')}`;
}

export function getRoomsForHostel(hostel: string) {
  if (!hostel || !(hostel in HOSTEL_INVENTORY)) {
    return [];
  }
  return Object.entries(HOSTEL_INVENTORY[hostel as keyof typeof HOSTEL_INVENTORY]).map(([id, meta]) => ({
    id,
    label: meta.label,
    availableBeds: meta.availableBeds,
  }));
}

export function getBedsForRoom(hostel: string, roomId: string): string[] {
  const hostelMap = HOSTEL_INVENTORY[hostel as keyof typeof HOSTEL_INVENTORY];
  if (!hostelMap || !roomId) {
    return [];
  }
  return hostelMap[roomId]?.availableBeds ?? [];
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[\d\s+()-]{10,}$/;

export function validateRegistrationStep(
  step: number,
  form: StudentRegistrationForm,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const req = (key: keyof StudentRegistrationForm, label: string) => {
    const value = form[key];
    if (typeof value !== 'string' || !value.trim()) {
      errors[key] = `${label} is required`;
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
      if (form.phone && !phonePattern.test(form.phone.trim())) {
        errors.phone = 'Enter a valid phone number';
      }
      if (form.email && !emailPattern.test(form.email.trim())) {
        errors.email = 'Enter a valid email address';
      }
      break;
    case 2:
      req('studentId', 'Student ID');
      req('admissionDate', 'Admission date');
      req('course', 'Course / department');
      req('academicYear', 'Academic year');
      break;
    case 3:
      req('fullAddress', 'Full address');
      req('city', 'City');
      req('state', 'State');
      req('pinCode', 'PIN code');
      if (form.pinCode && !/^\d{6}$/.test(form.pinCode.trim())) {
        errors.pinCode = 'PIN code must be 6 digits';
      }
      break;
    case 4:
      req('guardianName', 'Guardian name');
      req('relationship', 'Relationship');
      req('guardianPhone', 'Guardian phone');
      if (form.guardianPhone && !phonePattern.test(form.guardianPhone.trim())) {
        errors.guardianPhone = 'Enter a valid phone number';
      }
      if (form.guardianEmail && !emailPattern.test(form.guardianEmail.trim())) {
        errors.guardianEmail = 'Enter a valid email address';
      }
      break;
    case 5:
      req('hostel', 'Hostel');
      if (form.hostel) {
        req('roomNumber', 'Room number');
        req('bedNumber', 'Bed number');
        const beds = getBedsForRoom(form.hostel, form.roomNumber);
        if (form.bedNumber && !beds.includes(form.bedNumber)) {
          errors.bedNumber = 'This bed is not available';
        }
      }
      break;
    case 6:
      req('loginEmail', 'Login email');
      if (form.loginEmail && !emailPattern.test(form.loginEmail.trim())) {
        errors.loginEmail = 'Enter a valid login email';
      }
      req('accountStatus', 'Account status');
      break;
    default:
      break;
  }

  return errors;
}

export function validateAllSteps(form: StudentRegistrationForm): Record<string, string> {
  return REGISTRATION_STEPS.reduce<Record<string, string>>((acc, step) => {
    return { ...acc, ...validateRegistrationStep(step.id, form) };
  }, {});
}

export function validatePhotoFile(file: File): string | null {
  if (!PHOTO_ACCEPT.includes(file.type)) {
    return 'Use JPG or PNG only';
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return 'Photo must be 2 MB or smaller';
  }
  return null;
}

export function validateDocumentFile(file: File): string | null {
  if (!DOCUMENT_ACCEPT.includes(file.type)) {
    return 'Use JPG, PNG, or PDF only';
  }
  if (file.size > DOCUMENT_MAX_BYTES) {
    return 'Each file must be 5 MB or smaller';
  }
  return null;
}
