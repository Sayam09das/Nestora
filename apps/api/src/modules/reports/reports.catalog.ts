export type ReportCatalogEntry = {
  id: string;
  code: string;
  title: string;
  description: string;
  category:
    | 'Admissions'
    | 'Occupancy'
    | 'Attendance'
    | 'Leave'
    | 'Visitors'
    | 'Complaints'
    | 'Staff'
    | 'Fees'
    | 'Safety';
  frRef: string;
  format: 'Chart + table' | 'Table' | 'Summary PDF';
  refresh: string;
  hostelScoped: boolean;
};

export const REPORT_CATALOG: ReportCatalogEntry[] = [
  {
    id: 'rpt-fees',
    code: 'RPT-FEE-01',
    title: 'Fee collection & dues',
    description: 'Revenue assessed, collected, outstanding balances, and waivers by hostel and semester (FR-136).',
    category: 'Fees',
    frRef: 'FR-136',
    format: 'Chart + table',
    refresh: 'Hourly',
    hostelScoped: false,
  },
  {
    id: 'rpt-occupancy',
    code: 'RPT-OCC-01',
    title: 'Hostel occupancy & beds',
    description: 'Capacity utilization, vacant beds, and maintenance holds with drill-down (FR-130).',
    category: 'Occupancy',
    frRef: 'FR-130',
    format: 'Chart + table',
    refresh: 'Every 6h',
    hostelScoped: true,
  },
  {
    id: 'rpt-attendance',
    code: 'RPT-ATT-01',
    title: 'Attendance & movement',
    description: 'Daily attendance %, unexcused absences, and late returns (FR-131).',
    category: 'Attendance',
    frRef: 'FR-131',
    format: 'Chart + table',
    refresh: 'Daily',
    hostelScoped: true,
  },
  {
    id: 'rpt-complaints',
    code: 'RPT-CMP-01',
    title: 'Complaints & maintenance',
    description: 'Ticket volume by category, SLA turnaround, staff performance (FR-134).',
    category: 'Complaints',
    frRef: 'FR-134',
    format: 'Chart + table',
    refresh: 'Daily',
    hostelScoped: true,
  },
  {
    id: 'rpt-leave',
    code: 'RPT-LVE-01',
    title: 'Leave & outing history',
    description: 'Approved/rejected leave, overstays, and destination trends (FR-132).',
    category: 'Leave',
    frRef: 'FR-132',
    format: 'Table',
    refresh: 'Daily',
    hostelScoped: true,
  },
  {
    id: 'rpt-admissions',
    code: 'RPT-ADM-01',
    title: 'Admissions & demographics',
    description: 'Verified admissions, pending verification, gender-wise enrollment (FR-129).',
    category: 'Admissions',
    frRef: 'FR-129',
    format: 'Chart + table',
    refresh: 'Weekly',
    hostelScoped: false,
  },
  {
    id: 'rpt-visitors',
    code: 'RPT-VIS-01',
    title: 'Visitor activity',
    description: 'Check-ins, peak hours, hosts, and overstay records (FR-133).',
    category: 'Visitors',
    frRef: 'FR-133',
    format: 'Table',
    refresh: 'Daily',
    hostelScoped: true,
  },
  {
    id: 'rpt-staff',
    code: 'RPT-STF-01',
    title: 'Staff attendance & tasks',
    description: 'Shift records and closed maintenance orders per worker (FR-135).',
    category: 'Staff',
    frRef: 'FR-135',
    format: 'Table',
    refresh: 'Weekly',
    hostelScoped: true,
  },
  {
    id: 'rpt-safety',
    code: 'RPT-EMG-01',
    title: 'Emergency incident summary',
    description: 'Incident categories, response timelines, and escalations (FR-138).',
    category: 'Safety',
    frRef: 'FR-138',
    format: 'Summary PDF',
    refresh: 'On demand',
    hostelScoped: false,
  },
];
