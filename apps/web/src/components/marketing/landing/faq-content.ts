export type FaqItem = {
  id: string;
  order: string;
  question: string;
  answer: string;
  category?: string;
};

export const faqCopy = {
  eyebrow: 'HAVE QUESTIONS?',
  title: 'Everything You Need to Know.',
  description:
    'Find answers to common questions about managing students, hostel rooms, payments, and everyday operations.',
  supportPrompt:
    'Need something specific to your institution? Our team can walk you through setup, roles, and day-to-day workflows.',
  ctaLabel: 'Still have questions? Contact us',
  ctaHref: '/contact',
} as const;

export const faqItems: FaqItem[] = [
  {
    id: 'what-is',
    order: '01',
    category: 'Platform Overview',
    question: 'What is the Hostel Management System?',
    answer:
      'It is a centralized platform designed to simplify hostel administration, including student records, room allocation, attendance, fees, complaints, and daily operations.',
  },
  {
    id: 'multi-rooms',
    order: '02',
    category: 'Infrastructure',
    question: 'Can I manage multiple hostel rooms and buildings?',
    answer:
      'Yes. Nestora supports hierarchical management across multiple hostels, buildings, blocks, floors, rooms, and individual beds with real-time occupancy and status tracking.',
  },
  {
    id: 'digital-students',
    order: '03',
    category: 'Student Records',
    question: 'Can I manage student information digitally?',
    answer:
      'Yes. Administrators can maintain student profiles, personal information, guardian contacts, room assignments, and academic records in one centralized directory.',
  },
  {
    id: 'allocation',
    order: '04',
    category: 'Allocations',
    question: 'How does room and bed allocation work?',
    answer:
      'Users can view real-time room and bed availability, assign students to suitable rooms based on eligibility and preferences, and monitor occupancy status as assignments change.',
  },
  {
    id: 'fees',
    order: '05',
    category: 'Finance',
    question: 'Can I track hostel fees and pending payments?',
    answer:
      'The platform provides fee records, payment history, invoices, and pending payment tracking according to the fee structures and payment modules configured for your institution.',
  },
  {
    id: 'complaints',
    order: '06',
    category: 'Operations',
    question: 'Can students submit complaints?',
    answer:
      'Students can submit complaints or maintenance requests digitally, while authorized staff can review progress, update statuses, and log resolutions through the complaints workflow.',
  },
  {
    id: 'roles',
    order: '07',
    category: 'Permissions',
    question: 'Does the system support different user roles?',
    answer:
      'Yes. The platform is designed around Administrator, Warden, Student, and Accountant roles, with access and operational permissions tailored specifically to each role.',
  },
  {
    id: 'mobile',
    order: '08',
    category: 'Accessibility',
    question: 'Can I access the system from a mobile device?',
    answer:
      'Yes. The system delivers a responsive web experience across desktop, tablet, and mobile devices, allowing students and staff to access features directly from any modern browser without installing a separate app.',
  },
  {
    id: 'attendance',
    order: '09',
    category: 'Attendance',
    question: 'Can I monitor hostel attendance?',
    answer:
      'The attendance module helps authorized users maintain daily attendance records, record check-ins, and review attendance history across assigned hostel blocks.',
  },
  {
    id: 'security',
    order: '10',
    category: 'Security',
    question: 'Is my hostel information secure?',
    answer:
      'Yes. Access is protected by authenticated sessions, granular role-based access control (RBAC), and server-side authorization checks so users only access data relevant to their role and scope.',
  },
];
