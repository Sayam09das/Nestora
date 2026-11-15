import type {
  StudentProfileDocument,
  StudentSelfProfile,
} from '@/components/dashboard/student-portal/profile/student-profile-data';
import type { StudentSelfProfileDesk } from '@/lib/api/student-profile';

function formatLastLogin(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function formatSemesterLabel(semester: string): string {
  const trimmed = semester.trim();
  if (!trimmed || trimmed === '—') return '—';
  if (/semester/i.test(trimmed)) return trimmed;
  return `Semester ${trimmed}`;
}

export function mapStudentProfileDesk(desk: StudentSelfProfileDesk): StudentSelfProfile {
  const fullName = `${desk.account.firstName} ${desk.account.lastName}`.trim() || 'Student';
  const accountStatus: StudentSelfProfile['accountStatus'] =
    desk.account.status === 'ACTIVE' ? 'Active' : 'Inactive';
  const phone = desk.account.phone?.trim() || '—';

  return {
    fullName,
    studentId: desk.academic.registrationNumber,
    course: desk.academic.course,
    department: desk.academic.department,
    semester: formatSemesterLabel(desk.academic.currentSemester),
    academicYear: desk.academic.academicYear,
    accountStatus,
    photoUrl: desk.account.profilePhotoUrl,
    personal: {
      fullName,
      gender: desk.personal.gender,
      dateOfBirth: desk.personal.dateOfBirth,
      bloodGroup: desk.personal.bloodGroup?.trim() || '—',
      phone,
      email: desk.account.email,
      permanentAddress: desk.personal.permanentAddress,
      verified: desk.personal.identityVerified,
    },
    academic: {
      studentId: desk.academic.registrationNumber,
      department: desk.academic.department,
      course: desk.academic.course,
      semester: formatSemesterLabel(desk.academic.currentSemester),
      admissionYear: desk.academic.admissionYear,
      status: desk.academic.status,
    },
    hostel: {
      allocated: desk.hostel.allocated,
      hostelName: desk.hostel.hostelName ?? 'No hostel assigned',
      block: desk.hostel.block ?? '—',
      roomNumber: desk.hostel.roomNumber ?? '—',
      bedNumber: desk.hostel.bedNumber ?? '—',
      roomType: desk.hostel.roomType ?? '—',
      allocationDate: desk.hostel.allocationDate ?? '—',
    },
    emergency: {
      guardianName: desk.guardian.name,
      relationship: desk.guardian.relationship,
      primaryPhone: desk.guardian.primaryPhone,
      alternatePhone: desk.guardian.alternatePhone ?? '—',
      address: desk.guardian.address,
    },
    documents: desk.documents.map(
      (doc): StudentProfileDocument => ({
        id: doc.id,
        name: doc.name,
        status: doc.status,
      }),
    ),
    security: {
      email: desk.account.email,
      mobile: phone,
      lastLogin: formatLastLogin(desk.account.lastLoginAt),
      mfaEnabled: desk.account.mfaEnabled,
      activeSessions: desk.security.activeSessions,
    },
  };
}