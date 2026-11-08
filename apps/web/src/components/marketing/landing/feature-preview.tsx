import type { FeaturePreviewKind } from '@/components/marketing/landing/features-content';
import { cn } from '@/lib/utils';

type FeaturePreviewProps = {
  kind: FeaturePreviewKind;
  className?: string;
};

export function FeaturePreview({ kind, className }: FeaturePreviewProps) {
  return (
    <div
      className={cn(
        'mt-6 overflow-hidden rounded-lg border border-border bg-[color-mix(in_oklch,var(--card)_92%,var(--muted))] p-3',
        className,
      )}
      aria-hidden
    >
      {kind === 'students' && <PreviewStudents />}
      {kind === 'rooms' && <PreviewRooms />}
      {kind === 'fees' && <PreviewFees />}
      {kind === 'attendance' && <PreviewAttendance />}
      {kind === 'complaints' && <PreviewComplaints />}
      {kind === 'visitors' && <PreviewVisitors />}
      {kind === 'staff' && <PreviewStaff />}
      {kind === 'reports' && <PreviewReports />}
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11px] leading-tight">
      <span className={muted ? 'text-muted-foreground' : 'font-medium text-foreground'}>{label}</span>
      <span className="tabular-nums text-muted-foreground">{value}</span>
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

function PreviewAttendance() {
  return (
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
  );
}

function PreviewComplaints() {
  return (
    <div className="space-y-2">
      <Row label="Maintenance #184" value="Resolved" />
      <Row label="New ticket" value="In review" muted />
    </div>
  );
}

function PreviewVisitors() {
  return (
    <div className="space-y-2">
      <Row label="Today check-ins" value="4" />
      <Row label="Student B-201" value="Out 6:10 PM" muted />
    </div>
  );
}

function PreviewStaff() {
  return (
    <div className="space-y-2">
      <Row label="Warden · Block A" value="On duty" />
      <Row label="Night roster" value="Assigned" muted />
    </div>
  );
}

function PreviewReports() {
  return (
    <div className="space-y-2">
      <div className="flex h-8 items-end gap-1">
        {[40, 64, 52, 78, 60].map((h, i) => (
          <PreviewBar key={i} height={h} />
        ))}
      </div>
      <Row label="Occupancy trend" value="This month" muted />
    </div>
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
