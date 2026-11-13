import { AlertTriangle, Flame, Hammer, HeartPulse, Shield, UserX, type LucideIcon } from 'lucide-react';

export type IncidentType =
  | 'Fire'
  | 'Medical'
  | 'Security'
  | 'Missing student'
  | 'Infrastructure'
  | 'Other';

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentStatus = 'Reported' | 'Acknowledged' | 'In progress' | 'Resolved';

export type IncidentDeskRecord = {
  id: string;
  incidentRef: string;
  title: string;
  description: string;
  incidentType: IncidentType;
  location: string;
  hostel: string;
  reportedByName: string;
  initialSeverity: IncidentSeverity;
  officialSeverity: IncidentSeverity | null;
  effectiveSeverity: IncidentSeverity;
  status: IncidentStatus;
  isEscalated: boolean;
  reportedAt: string;
  resolvedAt: string | null;
  updatedAt: string;
  lastActionAt: string | null;
};

export type IncidentActionLogEntry = {
  id: string;
  actionTaken: string;
  actorName: string;
  at: string;
};

export type IncidentsDeskSummary = {
  generatedAt: string;
  activeIncidents: number;
  unacknowledged: number;
  escalated: number;
  criticalOpen: number;
  resolvedThisWeek: number;
  facets: {
    hostels: string[];
    types: IncidentType[];
  };
};

export const INCIDENT_TYPE_FILTERS = [
  'All Types',
  'Fire',
  'Medical',
  'Security',
  'Missing student',
  'Infrastructure',
  'Other',
] as const;

export const INCIDENT_SEVERITY_FILTERS = ['All Severities', 'Low', 'Medium', 'High', 'Critical'] as const;

export const INCIDENT_STATUS_FILTERS = [
  'All Status',
  'Reported',
  'Acknowledged',
  'In progress',
  'Resolved',
] as const;

export const TYPE_META: Record<
  IncidentType,
  { icon: LucideIcon; accent: string }
> = {
  Fire: { icon: Flame, accent: '#dc2626' },
  Medical: { icon: HeartPulse, accent: '#e11d48' },
  Security: { icon: Shield, accent: '#2563eb' },
  'Missing student': { icon: UserX, accent: '#7c3aed' },
  Infrastructure: { icon: Hammer, accent: '#b45309' },
  Other: { icon: AlertTriangle, accent: '#78716c' },
};

export function formatIncidentWhen(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function mapPanelSeverity(
  severity: string,
): 'Critical' | 'High' | 'Medium' {
  if (severity === 'CRITICAL') return 'Critical';
  if (severity === 'HIGH') return 'High';
  return 'Medium';
}

export function mapPanelStatus(status: string): 'Open' | 'Acknowledged' | 'In progress' {
  if (status === 'ACKNOWLEDGED') return 'Acknowledged';
  if (status === 'IN_PROGRESS') return 'In progress';
  return 'Open';
}
