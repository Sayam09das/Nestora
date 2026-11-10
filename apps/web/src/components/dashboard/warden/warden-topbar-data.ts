import type { LucideIcon } from 'lucide-react';
import { BedDouble, MessageSquareWarning, UserRound } from 'lucide-react';

/** Wardens only see hostels they are assigned to (sample). */
export type WardenHostel = {
  id: string;
  label: string;
  shortLabel: string;
  rooms: number;
  occupancy: string;
};

export const WARDEN_ASSIGNED_HOSTELS: WardenHostel[] = [
  { id: 'boys-a', label: 'Boys Hostel A', shortLabel: 'Boys A', rooms: 186, occupancy: '96%' },
  { id: 'girls-b', label: 'Girls Hostel B', shortLabel: 'Girls B', rooms: 142, occupancy: '91%' },
];

export const WARDEN_HOSTEL_STORAGE_KEY = 'nestora-warden-selected-hostel';

export type WardenSearchHit = {
  id: string;
  category: 'Students' | 'Rooms' | 'Complaints';
  label: string;
  hint: string;
  href: string;
  icon: LucideIcon;
};

export const SAMPLE_WARDEN_SEARCH_HITS: WardenSearchHit[] = [
  {
    id: 'stu-8821',
    category: 'Students',
    label: 'Ananya Sharma',
    hint: 'NSU/24/8821 · B-204',
    href: '/warden/students',
    icon: UserRound,
  },
  {
    id: 'room-b204',
    category: 'Rooms',
    label: 'B-204 Double AC',
    hint: 'Girls Hostel B · 2/2 occupied',
    href: '/warden/students',
    icon: BedDouble,
  },
  {
    id: 'cmp-1042',
    category: 'Complaints',
    label: 'Water pressure — B block',
    hint: 'Open · Maintenance',
    href: '/warden/complaints',
    icon: MessageSquareWarning,
  },
];

export type WardenMessage = {
  id: string;
  from: string;
  role: string;
  preview: string;
  time: string;
  unread: boolean;
};

export const SAMPLE_WARDEN_MESSAGES: WardenMessage[] = [
  {
    id: 'msg-1',
    from: 'University Admin',
    role: 'Central office',
    preview: 'Fee reminder batch approved for your block.',
    time: '25m',
    unread: true,
  },
  {
    id: 'msg-2',
    from: 'Security desk',
    role: 'Gate',
    preview: 'Weekend visitor cap raised to 40 per day.',
    time: '2h',
    unread: true,
  },
  {
    id: 'msg-3',
    from: 'Maintenance lead',
    role: 'Operations',
    preview: 'Plumber assigned to ticket #1042.',
    time: 'Yesterday',
    unread: false,
  },
];
