export type StudentStatus = 'Active' | 'Pending' | 'Inactive';

export type StudentRecord = {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  academicYear: string;
  hostel: string;
  room: string;
  status: StudentStatus;
  joinedDate: string;
};

export const STUDENT_DIRECTORY_STATS = {
  total: 450,
  active: 412,
  pending: 28,
  inactive: 10,
} as const;

export const SAMPLE_STUDENTS: StudentRecord[] = [
  {
    id: '1',
    studentId: 'STU-001',
    name: 'Aarav Sharma',
    email: 'aarav@example.com',
    phone: '+91 98XXX X2101',
    course: 'B.Tech CSE',
    academicYear: '2024',
    hostel: 'Boys Hostel A',
    room: 'A-204',
    status: 'Active',
    joinedDate: '2024-08-12',
  },
  {
    id: '2',
    studentId: 'STU-002',
    name: 'Priya Das',
    email: 'priya@example.com',
    phone: '+91 98XXX X2102',
    course: 'B.Sc Physics',
    academicYear: '2023',
    hostel: 'Girls Hostel B',
    room: 'B-108',
    status: 'Active',
    joinedDate: '2023-07-18',
  },
  {
    id: '3',
    studentId: 'STU-003',
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    phone: '+91 98XXX X2103',
    course: 'B.Tech ECE',
    academicYear: '2025',
    hostel: 'Not allocated',
    room: '—',
    status: 'Pending',
    joinedDate: '2025-01-09',
  },
  {
    id: '4',
    studentId: 'STU-004',
    name: 'Ananya Roy',
    email: 'ananya@example.com',
    phone: '+91 98XXX X2104',
    course: 'BBA',
    academicYear: '2022',
    hostel: 'Girls Hostel B',
    room: 'B-212',
    status: 'Active',
    joinedDate: '2022-08-01',
  },
  {
    id: '5',
    studentId: 'STU-005',
    name: 'Rohan Gupta',
    email: 'rohan@example.com',
    phone: '+91 98XXX X2105',
    course: 'B.Tech ME',
    academicYear: '2021',
    hostel: 'Not allocated',
    room: '—',
    status: 'Inactive',
    joinedDate: '2021-08-20',
  },
  {
    id: '6',
    studentId: 'STU-006',
    name: 'Isha Patel',
    email: 'isha@example.com',
    phone: '+91 98XXX X2106',
    course: 'B.Tech CSE',
    academicYear: '2024',
    hostel: 'Girls Hostel B',
    room: 'B-115',
    status: 'Active',
    joinedDate: '2024-08-14',
  },
  {
    id: '7',
    studentId: 'STU-007',
    name: 'Kabir Singh',
    email: 'kabir@example.com',
    phone: '+91 98XXX X2107',
    course: 'B.Tech IT',
    academicYear: '2023',
    hostel: 'Boys Hostel A',
    room: 'A-310',
    status: 'Pending',
    joinedDate: '2023-08-05',
  },
  {
    id: '8',
    studentId: 'STU-008',
    name: 'Neha Kapoor',
    email: 'neha@example.com',
    phone: '+91 98XXX X2108',
    course: 'B.Sc Chemistry',
    academicYear: '2022',
    hostel: 'Girls Hostel B',
    room: 'B-220',
    status: 'Active',
    joinedDate: '2022-07-28',
  },
];

export const HOSTEL_FILTER_OPTIONS = ['All Hostels', 'Boys Hostel A', 'Girls Hostel B', 'Not allocated'] as const;
export const STATUS_FILTER_OPTIONS = ['All Status', 'Active', 'Pending', 'Inactive'] as const;
export const COURSE_FILTER_OPTIONS = [
  'All Courses',
  'B.Tech CSE',
  'B.Tech ECE',
  'B.Tech ME',
  'B.Tech IT',
  'B.Sc Physics',
  'B.Sc Chemistry',
  'BBA',
] as const;
export const YEAR_FILTER_OPTIONS = ['All Years', '2021', '2022', '2023', '2024', '2025'] as const;

export function getStudentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function formatJoinedDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}
