export type StaffStatus = 'Active' | 'On Leave' | 'Inactive';

export type StaffRecord = {
  id: string;
  staffId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hostel: string;
  status: StaffStatus;
  joinedDate: string;
};

export const STAFF_DIRECTORY_STATS = {
  total: 28,
  active: 24,
  onLeave: 3,
  inactive: 1,
} as const;

export const SAMPLE_STAFF: StaffRecord[] = [
  {
    id: '1',
    staffId: 'STF-001',
    name: 'Dr. Meena Iyer',
    email: 'meena.iyer@nestora.edu',
    phone: '+91 98XXX W101',
    role: 'Warden',
    department: 'Student Housing',
    hostel: 'Girls Hostel B',
    status: 'Active',
    joinedDate: '2019-07-01',
  },
  {
    id: '2',
    staffId: 'STF-002',
    name: 'Rajesh Khanna',
    email: 'rajesh.k@nestora.edu',
    phone: '+91 98XXX W102',
    role: 'Warden',
    department: 'Student Housing',
    hostel: 'Boys Hostel A',
    status: 'Active',
    joinedDate: '2018-08-15',
  },
  {
    id: '3',
    staffId: 'STF-003',
    name: 'Sunita Rao',
    email: 'sunita.rao@nestora.edu',
    phone: '+91 98XXX W103',
    role: 'Assistant Warden',
    department: 'Student Housing',
    hostel: 'Girls Hostel B',
    status: 'On Leave',
    joinedDate: '2020-01-10',
  },
  {
    id: '4',
    staffId: 'STF-004',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@nestora.edu',
    phone: '+91 98XXX W104',
    role: 'Maintenance Lead',
    department: 'Facilities',
    hostel: 'All Hostels',
    status: 'Active',
    joinedDate: '2017-05-22',
  },
  {
    id: '5',
    staffId: 'STF-005',
    name: 'Kavita Nambiar',
    email: 'kavita.n@nestora.edu',
    phone: '+91 98XXX W105',
    role: 'Accounts Officer',
    department: 'Finance',
    hostel: 'Central Office',
    status: 'Active',
    joinedDate: '2021-03-08',
  },
  {
    id: '6',
    staffId: 'STF-006',
    name: 'Deepak Pillai',
    email: 'deepak.p@nestora.edu',
    phone: '+91 98XXX W106',
    role: 'Security Supervisor',
    department: 'Security',
    hostel: 'Boys Hostel A',
    status: 'Active',
    joinedDate: '2016-11-30',
  },
  {
    id: '7',
    staffId: 'STF-007',
    name: 'Linda Thomas',
    email: 'linda.t@nestora.edu',
    phone: '+91 98XXX W107',
    role: 'Warden',
    department: 'Student Housing',
    hostel: 'Boys Hostel A',
    status: 'On Leave',
    joinedDate: '2019-09-01',
  },
  {
    id: '8',
    staffId: 'STF-008',
    name: 'Mohit Agarwal',
    email: 'mohit.a@nestora.edu',
    phone: '+91 98XXX W108',
    role: 'Reception',
    department: 'Administration',
    hostel: 'Central Office',
    status: 'Inactive',
    joinedDate: '2022-06-14',
  },
];

export const STATUS_FILTER_OPTIONS = ['All Status', 'Active', 'On Leave', 'Inactive'] as const;
export const ROLE_FILTER_OPTIONS = [
  'All Roles',
  'Warden',
  'Assistant Warden',
  'Maintenance Lead',
  'Accounts Officer',
  'Security Supervisor',
  'Reception',
] as const;
export const DEPARTMENT_FILTER_OPTIONS = [
  'All Departments',
  'Student Housing',
  'Facilities',
  'Finance',
  'Security',
  'Administration',
] as const;
export const HOSTEL_STAFF_FILTER_OPTIONS = [
  'All Locations',
  'Boys Hostel A',
  'Girls Hostel B',
  'All Hostels',
  'Central Office',
] as const;

export function getStaffInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function formatStaffJoinedDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}
