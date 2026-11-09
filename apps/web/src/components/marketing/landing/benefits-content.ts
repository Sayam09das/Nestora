export type BenefitTextItem = {
  id: string;
  order: string;
  title: string;
  summary: string;
  featured?: boolean;
};

export const benefitsCopy = {
  eyebrow: 'Why choose us',
  title: 'Less Manual Work. More Efficient Hostel Management.',
  description:
    'Bring everyday hostel operations together, reduce administrative complexity, and maintain better control over your entire hostel.',
  footnote:
    'Nestora keeps day-to-day work in one place so teams spend less time chasing registers and more time running the hostel.',
} as const;

export const benefitItems: BenefitTextItem[] = [
  {
    id: 'centralized',
    order: '01',
    title: 'Centralized Management',
    featured: true,
    summary:
      'Manage students, rooms, staff, and hostel activities from one platform. Keep important information organized and accessible.',
  },
  {
    id: 'room-allocation',
    order: '02',
    title: 'Faster Room Allocation',
    summary:
      'Check room and bed availability easily. Simplify student room assignments and transfers, and maintain accurate occupancy information.',
  },
  {
    id: 'fee-tracking',
    order: '03',
    title: 'Transparent Fee Tracking',
    summary:
      'Monitor collected fees and pending payments. Maintain organized payment records and access fee information whenever required.',
  },
  {
    id: 'student-management',
    order: '04',
    title: 'Better Student Management',
    summary:
      'Maintain organized student profiles. Track attendance and student-related information, and simplify communication and complaint handling.',
  },
  {
    id: 'visibility',
    order: '05',
    title: 'Improved Operational Visibility',
    summary:
      'Monitor hostel occupancy and daily activities. Review reports and important operational information to make informed management decisions.',
  },
  {
    id: 'daily-operations',
    order: '06',
    title: 'Organized Daily Operations',
    summary:
      'Handle complaints, maintenance, and visitor records. Keep administrative activities structured and reduce dependence on scattered registers and spreadsheets.',
  },
];
