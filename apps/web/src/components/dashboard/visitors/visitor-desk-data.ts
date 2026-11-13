export type VisitorDeskStatus =
  | 'Pending Approval'
  | 'Approved'
  | 'Inside'
  | 'Checked Out'
  | 'Rejected';

export type VisitorDeskRecord = {
  id: string;
  visitorRef: string;
  visitorName: string;
  visitorPhone: string;
  idProofType: string;
  idProofNumber: string;
  purpose: string;
  hostel: string;
  studentId: string;
  studentName: string;
  roomBed: string;
  status: VisitorDeskStatus;
  submittedAt: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  approvedBy: string | null;
  isException: boolean;
};

export const VISITOR_STATUS_FILTERS = [
  'All Status',
  'Pending Approval',
  'Approved',
  'Inside',
  'Checked Out',
  'Rejected',
] as const;

export const VISITOR_STATUS_STYLES: Record<VisitorDeskStatus, string> = {
  'Pending Approval':
    'border-[color-mix(in_oklch,var(--nestora-gold)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-gold)_15%,var(--card))] text-[var(--nestora-forest)]',
  Approved:
    'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-100',
  Inside:
    'border-[color-mix(in_oklch,var(--nestora-sage)_40%,var(--border))] bg-[color-mix(in_oklch,var(--nestora-sage-light)_50%,var(--card))] text-[var(--nestora-forest)]',
  'Checked Out': 'border-border bg-muted/50 text-muted-foreground',
  Rejected: 'border-destructive/30 bg-destructive/10 text-destructive',
};

export function formatVisitorTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}
