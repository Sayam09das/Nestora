import type { ReactNode } from 'react';

import type { RoleId } from '@/components/marketing/landing/roles-content';
import { cn } from '@/lib/utils';

type RoleInterfacePreviewProps = {
  roleId: RoleId;
  className?: string;
  featured?: boolean;
};

function PreviewShell({
  title,
  children,
  featured: _featured,
}: {
  title: string;
  children: ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={cn('surface-role-preview min-h-[8.75rem] overflow-hidden rounded-lg border p-3.5')}
      aria-hidden
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--nestora-sage-muted)] pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--nestora-forest)]">
          {title}
        </span>
        <span className="rounded-full bg-[var(--nestora-forest-light)] px-2 py-0.5 text-[9px] font-semibold text-[var(--nestora-white)]">
          Scoped view
        </span>
      </div>
      <div className="mt-2.5 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11px] leading-tight">
      <span className="text-[var(--nestora-nav-muted)]">{label}</span>
      <span
        className={cn(
          'tabular-nums',
          highlight ? 'font-semibold text-[var(--nestora-forest)]' : 'text-[var(--nestora-ink)]',
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ModulePill({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={cn(
        'rounded-md px-2 py-1 text-[10px] font-medium',
        on
          ? 'bg-[var(--nestora-forest)] text-white'
          : 'bg-[var(--nestora-sage-muted)] text-[var(--nestora-nav-muted)] line-through decoration-[var(--nestora-nav-muted)]',
      )}
    >
      {label}
    </span>
  );
}

function PreviewAdministrator() {
  return (
    <PreviewShell title="Control center · All modules" featured>
      <div className="flex flex-wrap gap-1.5">
        {['Students', 'Rooms', 'Staff', 'Fees', 'Reports', 'Settings'].map((m) => (
          <ModulePill key={m} label={m} on />
        ))}
      </div>
      <Row label="Permissions" value="Configure roles" highlight />
      <Row label="Last audit" value="Today · 09:15" />
    </PreviewShell>
  );
}

function PreviewWarden() {
  return (
    <PreviewShell title="Tonight · Block B">
      <Row label="Roll call" value="186 / 192 present" highlight />
      <Row label="Open complaints" value="3 in review" />
      <Row label="Visitors on premises" value="1" />
      <Row label="Room transfers" value="View queue" />
    </PreviewShell>
  );
}

function PreviewStudent() {
  return (
    <PreviewShell title="My hostel">
      <Row label="Room" value="B-204 · Bed A" highlight />
      <Row label="Attendance" value="Present · Nov 8" />
      <Row label="Term fee" value="Paid" />
      <Row label="Complaint #912" value="In progress" />
    </PreviewShell>
  );
}

function PreviewAccountant() {
  return (
    <PreviewShell title="Fee ledger · Fall term">
      <Row label="Collected" value="₹18.4L" highlight />
      <Row label="Pending dues" value="12 students" />
      <Row label="Receipts issued" value="248" />
      <Row label="Collection report" value="Ready to export" />
    </PreviewShell>
  );
}

export function RoleInterfacePreview({
  roleId,
  className,
  featured: _featured,
}: RoleInterfacePreviewProps) {
  return (
    <div className={className}>
      {roleId === 'administrator' && <PreviewAdministrator />}
      {roleId === 'warden' && <PreviewWarden />}
      {roleId === 'student' && <PreviewStudent />}
      {roleId === 'accountant' && <PreviewAccountant />}
    </div>
  );
}
