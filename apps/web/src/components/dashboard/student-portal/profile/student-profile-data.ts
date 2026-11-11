import { STUDENT_DEMO_ID } from '@/components/dashboard/student-portal/student-topbar-data';

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

const DEMO: Omit<StudentSelfProfile, 'fullName' | 'studentId' | 'hostel'> & {
  hostel: Omit<StudentSelfProfile['hostel'], 'hostelName'>;
} = {
  course: 'BCA',
  department: 'Computer Science',
  semester: 'Semester 5',
  academicYear: '2024 – 2027',
  accountStatus: 'Active',
  photoUrl: null,
  personal: {
    fullName: 'Arjun Sharma',
    gender: 'Male',
    dateOfBirth: '15 August 2005',
    bloodGroup: 'B+',
    phone: '+91 98765 43210',
    email: 'arjun.sharma@example.com',
    permanentAddress: 'Kolkata, West Bengal, India',
    verified: true,
  },
  academic: {
    studentId: STUDENT_DEMO_ID,
    department: 'Computer Science',
    course: 'BCA',
    semester: 'Semester 5',
    admissionYear: '2024',
    status: 'Enrolled',
  },
  hostel: {
    allocated: true,
    block: 'Block A',
    roomNumber: 'A-204',
    bedNumber: 'Bed 02',
    roomType: 'Double Sharing',
    allocationDate: '01 August 2026',
  },
  emergency: {
    guardianName: 'Rajesh Sharma',
    relationship: 'Father',
    primaryPhone: '+91 99887 76655',
    alternatePhone: '+91 98765 43211',
    address: 'Kolkata, West Bengal, India',
  },
  documents: [
    { id: 'd1', name: 'Student ID Card', status: 'verified' },
    { id: 'd2', name: 'Aadhaar Card', status: 'verified' },
    { id: 'd3', name: 'Admission Letter', status: 'pending' },
    { id: 'd4', name: 'Passport Photo', status: 'verified' },
  ],
  security: {
    email: 'arjun.sharma@example.com',
    mobile: '+91 98765 43210',
    lastLogin: '11 Nov 2026, 09:42 AM',
    mfaEnabled: false,
    activeSessions: 2,
  },
};

export function buildStudentSelfProfile(
  displayName: string,
  studentId: string,
  hostelName: string,
): StudentSelfProfile {
  return {
    ...DEMO,
    fullName: displayName,
    studentId: studentId || DEMO.academic.studentId,
    course: DEMO.course,
    department: DEMO.department,
    semester: DEMO.semester,
    academicYear: DEMO.academicYear,
    personal: {
      ...DEMO.personal,
      fullName: displayName,
    },
    academic: {
      ...DEMO.academic,
      studentId: studentId || DEMO.academic.studentId,
    },
    hostel: {
      ...DEMO.hostel,
      hostelName,
    },
    security: {
      ...DEMO.security,
      email: DEMO.personal.email,
      mobile: DEMO.personal.phone,
    },
  };
}
