import type { ReactNode } from 'react';

import type { FeaturePreviewKind } from '@/components/marketing/landing/features-content';
import { cn } from '@/lib/utils';

type FeaturePreviewProps = {
  kind: FeaturePreviewKind;
  className?: string;
  size?: 'default' | 'compact';
};

export function FeaturePreview({ kind, className, size = 'default' }: FeaturePreviewProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-[color-mix(in_oklch,var(--card)_92%,var(--muted))]',
        size === 'default' && 'min-h-[7.75rem] p-3',
        size === 'compact' && 'p-2.5',
        size === 'default' && 'flex w-full flex-col justify-center',
        className,
      )}
      aria-hidden
    >
      {kind === 'students' && <PreviewStudents />}
      {kind === 'rooms' && <PreviewRooms />}
      {kind === 'fees' && <PreviewFees />}
      {kind === 'gate' && <PreviewGate />}
      {kind === 'attendance' && <PreviewAttendance />}
      {kind === 'complaints' && <PreviewComplaints />}
      {kind === 'visitors' && <PreviewVisitors />}
      {kind === 'staff' && <PreviewStaff />}
      {kind === 'reports' && <PreviewReports />}
    </div>
  );
}

function PreviewFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--nestora-sage-muted)] pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--nestora-forest)]">
          {title}
        </span>
        <span className="size-1.5 rounded-full bg-[var(--nestora-sage)]" aria-hidden />
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11px] leading-tight">
      <span
        className={
          muted ? 'text-[var(--nestora-nav-muted)]' : 'font-medium text-[var(--nestora-ink)]'
        }
      >
        {label}
      </span>
      <span className="tabular-nums text-[var(--nestora-nav-muted)]">{value}</span>
    </div>
  );
}

function PreviewStudents() {
  return (
    <div className="space-y-2">
      <Row label="A. Sharma · B-204" value="Active" />
      <Row label="Guardian on file" value="Yes" muted />
      <Row label="Academic year" value="2025–26" muted />
    </div>
  );
}

function PreviewRooms() {
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[72, 88, 45, 100].map((w, i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-primary" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
      <Row label="Block B · Floor 2" value="186/192 beds" />
    </div>
  );
}

function PreviewFees() {
  return (
    <div className="space-y-2">
      <Row label="Term hostel fee" value="Paid" />
      <Row label="Pending follow-ups" value="3" muted />
      <Row label="Last receipt" value="#4821" muted />
    </div>
  );
}

function PreviewGate() {
  return (
    <div className="space-y-2">
      <Row label="Active outings" value="14" />
      <Row label="Overnight approved" value="3" />
      <Row label="Returns by 22:30" value="6 pending" muted />
      <Row label="In-dorm headcount" value="186 / 192" muted />
    </div>
  );
}

function PreviewAttendance() {
  return (
    <PreviewFrame title="Roll call · Floor 2">
      <div className="flex gap-1">
      {['M', 'T', 'W', 'T', 'F'].map((day, i) => (
        <span
          key={`${day}-${i}`}
          className={cn(
            'flex size-6 items-center justify-center rounded-md text-[10px] font-semibold',
            i < 4
              ? 'bg-[color-mix(in_oklch,var(--primary)_22%,var(--card))] text-[var(--nestora-forest)]'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {day}
        </span>
      ))}
      </div>
      <Row label="Present today" value="118 / 124" />
      <Row label="Absent follow-up" value="2 flagged" muted />
    </PreviewFrame>
  );
}

function PreviewComplaints() {
  return (
    <PreviewFrame title="Tickets · Block B">
      <Row label="Maintenance #184" value="Resolved" />
      <Row label="Room B-312 · WiFi" value="In review" />
      <Row label="Assigned to" value="Facilities" muted />
      <Row label="Opened" value="2 days ago" muted />
    </PreviewFrame>
  );
}

function PreviewVisitors() {
  return (
    <PreviewFrame title="Gate log · Today">
      <Row label="Check-ins" value="4" />
      <Row label="On premises" value="1 visitor" />
      <Row label="Host · B-201" value="Checked out 6:10 PM" muted />
      <Row label="ID verified" value="Yes" muted />
    </PreviewFrame>
  );
}

function PreviewStaff() {
  return (
    <PreviewFrame title="Duty roster · Week 12">
      <Row label="Warden · Block A" value="On duty" />
      <Row label="Asst. warden · Block B" value="Evening shift" />
      <Row label="Night roster" value="Assigned" />
      <Row label="Security desk" value="R. Mehta · 6 PM–2 AM" muted />
    </PreviewFrame>
  );
}

function PreviewReports() {
  return (
    <PreviewFrame title="Operations snapshot">
      <div className="flex h-8 items-end gap-1">
        {[40, 64, 52, 78, 60].map((h, i) => (
          <PreviewBar key={i} height={h} />
        ))}
      </div>
      <Row label="Occupancy" value="94% beds filled" />
      <Row label="Fees collected" value="₹18.4L this term" muted />
      <Row label="Period" value="November 2025" muted />
    </PreviewFrame>
  );
}

function PreviewBar({ height }: { height: number }) {
  return (
    <div
      className="w-full rounded-sm bg-[color-mix(in_oklch,var(--primary)_35%,var(--border))]"
      style={{ height: `${height}%` }}
    />
  );
}
