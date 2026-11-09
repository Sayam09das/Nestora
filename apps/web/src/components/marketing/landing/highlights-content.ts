import type { LucideIcon } from 'lucide-react';
import { BedDouble, Building2, Gauge, Users } from 'lucide-react';

export type HighlightMetric = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Numeric end value for count-up (demo placeholder). */
  value: number;
  /** Prefix shown before the animated number (e.g. none). */
  prefix?: string;
  /** Suffix after number (e.g. '+', '%'). */
  suffix?: string;
  /** If true, format with locale thousands separators. */
  formatThousands?: boolean;
};

/** Replace with live platform analytics when available. */
export const highlightMetrics: HighlightMetric[] = [
  {
    id: 'hostels',
    label: 'Hostels managed',
    description: 'Blocks and residences on one roster',
    icon: Building2,
    value: 12,
    suffix: '+',
  },
  {
    id: 'rooms',
    label: 'Total rooms',
    description: 'Inventory tracked across every block',
    icon: BedDouble,
    value: 2400,
    suffix: '+',
    formatThousands: true,
  },
  {
    id: 'capacity',
    label: 'Student capacity',
    description: 'Beds planned for allocation cycles',
    icon: Users,
    value: 4800,
    formatThousands: true,
  },
  {
    id: 'efficiency',
    label: 'Management efficiency',
    description: 'Faster allocation vs. manual registers (demo benchmark)',
    icon: Gauge,
    value: 40,
    suffix: '%',
  },
];

export const highlightsCopy = {
  eyebrow: 'Built for smarter hostel operations',
  title: 'Everything under control. One connected system.',
  description:
    'Nestora connects rooms, residents, fees, and daily warden work—so teams spend less time reconciling spreadsheets and more time running hostels.',
  disclaimer:
    'Sample metrics for demonstration. Swap in your institution’s live totals when ready.',
} as const;
