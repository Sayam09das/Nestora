export type SettingFieldTemplate = {
  key: string;
  label: string;
  type: 'toggle' | 'number' | 'text' | 'select' | 'locked';
  defaultValue: string | number | boolean;
  help?: string;
  options?: string[];
};

export const PANEL_FIELD_TEMPLATES: Record<string, SettingFieldTemplate[]> = {
  'cfg-general': [
    { key: 'univ_name', label: 'University display name', type: 'text', defaultValue: 'Nestora State University' },
    {
      key: 'session',
      label: 'Active academic session',
      type: 'select',
      defaultValue: '2025–26',
      options: ['2024–25', '2025–26', '2026–27'],
    },
    {
      key: 'timezone',
      label: 'Default timezone',
      type: 'select',
      defaultValue: 'Asia/Kolkata',
      options: ['Asia/Kolkata', 'Asia/Dubai', 'UTC'],
    },
    { key: 'locale', label: 'Number & currency locale', type: 'select', defaultValue: 'en-IN', options: ['en-IN', 'en-US'] },
  ],
  'cfg-hostel-ops': [
    { key: 'active_hostels', label: 'Active hostels', type: 'number', defaultValue: 0 },
    { key: 'hostel_rules', label: 'Published hostel rules', type: 'number', defaultValue: 0, help: 'FR-100' },
    { key: 'warden_assignments', label: 'Wardens assigned', type: 'number', defaultValue: 0 },
  ],
  'cfg-attendance': [
    { key: 'roll_cutoff', label: 'Roll call lock (minutes after curfew)', type: 'number', defaultValue: 45 },
    { key: 'absence_threshold', label: 'Consecutive absence alert threshold', type: 'number', defaultValue: 3, help: 'FR-051 / MOD-09' },
    { key: 'extended_leave_admin_days', label: 'Extended leave admin threshold (days)', type: 'number', defaultValue: 7, help: 'ODR-002' },
    { key: 'open_discrepancies', label: 'Open attendance discrepancies', type: 'number', defaultValue: 0, help: 'FR-049' },
    { key: 'records_today', label: 'Attendance records today', type: 'number', defaultValue: 0 },
    { key: 'auto_escalate', label: 'Notify administrator on threshold', type: 'toggle', defaultValue: true, help: 'FR-051' },
  ],
  'cfg-notifications': [
    { key: 'live_notices', label: 'Live notices', type: 'number', defaultValue: 0, help: 'FR-120' },
    { key: 'scheduled_notices', label: 'Scheduled notices', type: 'number', defaultValue: 0 },
    { key: 'emergency_lock', label: 'Emergency & fee notices', type: 'locked', defaultValue: true, help: 'Always on — FR-121' },
    { key: 'disciplinary_lock', label: 'Disciplinary summons', type: 'locked', defaultValue: true, help: 'FR-121' },
  ],
  'cfg-incidents': [
    { key: 'open_incidents', label: 'Open emergency incidents', type: 'number', defaultValue: 0, help: 'FR-114' },
    { key: 'escalated', label: 'Escalated incidents', type: 'number', defaultValue: 0 },
    { key: 'guardian_auto', label: 'Auto-notify guardians (High/Critical)', type: 'toggle', defaultValue: true, help: 'FR-116' },
  ],
  'cfg-visitors': [
    { key: 'visitors_today', label: 'Visitor check-ins today', type: 'number', defaultValue: 0 },
    { key: 'open_visits', label: 'Active visits on campus', type: 'number', defaultValue: 0, help: 'FR-062' },
  ],
  'cfg-fees': [
    { key: 'pending_adjustments', label: 'Pending fee adjustments', type: 'number', defaultValue: 0, help: 'FR-078' },
    { key: 'active_schedules', label: 'Active fee schedules', type: 'number', defaultValue: 0 },
    { key: 'auto_late', label: 'Apply late fee automatically', type: 'toggle', defaultValue: true },
    { key: 'grace_days', label: 'Late fee grace period (days)', type: 'number', defaultValue: 7, help: 'FR-078' },
    { key: 'late_fee_flat_amount', label: 'Automatic late fee amount (INR)', type: 'number', defaultValue: 500 },
  ],
  'cfg-security': [
    { key: 'mfa_enabled', label: 'Staff with MFA enabled', type: 'number', defaultValue: 0 },
    { key: 'admin_users', label: 'University administrators', type: 'number', defaultValue: 0, help: 'FR-140' },
    { key: 'session_idle_min', label: 'Session idle timeout (minutes)', type: 'number', defaultValue: 60 },
  ],
  'cfg-maintenance': [
    { key: 'open_tickets', label: 'Open maintenance tickets', type: 'number', defaultValue: 0, help: 'FR-072' },
    { key: 'assigned_tickets', label: 'Assigned in progress', type: 'number', defaultValue: 0 },
    { key: 'auto_close_hours', label: 'Auto-close resolved tickets (hours)', type: 'number', defaultValue: 72, help: 'MOD-12' },
  ],
  'cfg-roles': [
    { key: 'staff_accounts', label: 'Hostel staff accounts', type: 'number', defaultValue: 0 },
    { key: 'warden_accounts', label: 'Warden accounts', type: 'number', defaultValue: 0, help: 'FR-019' },
  ],
};
