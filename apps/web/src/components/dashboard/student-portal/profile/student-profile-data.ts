export type VerificationStatus = 'verified' | 'pending';

export type StudentProfileDocument = {
  id: string;
  name: string;
  status: VerificationStatus;
};

export type StudentSelfProfile = {
  fullName: string;
  studentId: string;
  course: string;
  department: string;
  semester: string;
  academicYear: string;
  accountStatus: 'Active' | 'Inactive';
  photoUrl: string | null;
  personal: {
    fullName: string;
    gender: string;
    dateOfBirth: string;
    bloodGroup: string;
    phone: string;
    email: string;
    permanentAddress: string;
    verified: boolean;
  };
  academic: {
    studentId: string;
    department: string;
    course: string;
    semester: string;
    admissionYear: string;
    status: string;
  };
  hostel: {
    allocated: boolean;
    hostelName: string;
    block: string;
    roomNumber: string;
    bedNumber: string;
    roomType: string;
    allocationDate: string;
  };
  emergency: {
    guardianName: string;
    relationship: string;
    primaryPhone: string;
    alternatePhone: string;
    address: string;
  };
  documents: StudentProfileDocument[];
  security: {
    email: string;
    mobile: string;
    lastLogin: string;
    mfaEnabled: boolean;
    activeSessions: number;
  };
};