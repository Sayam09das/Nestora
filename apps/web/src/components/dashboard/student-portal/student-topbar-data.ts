export const STUDENT_DEMO_HOSTEL = 'Sunrise Boys Hostel';
export const STUDENT_DEMO_ROOM = 'Room 204 · Bed A';
export const STUDENT_DEMO_ID = 'STU-2026-001';

export type StudentSearchHit = {
  id: string;
  label: string;
  hint: string;
  href: string;
  category: string;
};

export const SAMPLE_STUDENT_SEARCH_HITS: StudentSearchHit[] = [
  { id: 'n1', label: 'Water shutdown notice', hint: 'Block B · today', href: '/student/announcements', category: 'Notices' },
  { id: 'm1', label: 'Report maintenance issue', hint: 'Room or facility', href: '/student/maintenance', category: 'Services' },
  { id: 'l1', label: 'Weekend leave policy', hint: 'Outing rules', href: '/student/leave', category: 'Leave' },
  { id: 'c1', label: 'Raise a complaint', hint: 'Track resolution', href: '/student/complaints', category: 'Help' },
  { id: 'r1', label: 'Hostel rules', hint: 'Policies & conduct', href: '/student/rules', category: 'Information' },
];

export type StudentMessage = {
  id: string;
  from: string;
  preview: string;
  time: string;
  unread: boolean;
};

export const SAMPLE_STUDENT_MESSAGES: StudentMessage[] = [
  {
    id: 'm1',
    from: 'Hostel Warden',
    preview: 'Your leave request for this weekend is under review.',
    time: '20m ago',
    unread: true,
  },
  {
    id: 'm2',
    from: 'Admin Desk',
    preview: 'Please update your emergency contact in profile.',
    time: '1h ago',
    unread: false,
  },
];
