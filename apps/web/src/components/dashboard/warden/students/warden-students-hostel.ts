import { WARDEN_ASSIGNED_HOSTELS } from '@/components/dashboard/warden/warden-topbar-data';

/** Legacy top-bar ids mapped to sample labels (used only when that label is in live scope). */
const LEGACY_HOSTEL_LABEL: Record<string, string> = {
  'boys-a': 'Boys Hostel A',
  'girls-b': 'Girls Hostel B',
};

export function resolveWardenHostelName(selectedHostelId: string, scopeHostelNames: string[]): string {
  if (scopeHostelNames.length === 0) {
    return '';
  }
  if (scopeHostelNames.includes(selectedHostelId)) {
    return selectedHostelId;
  }
  const legacy = LEGACY_HOSTEL_LABEL[selectedHostelId];
  if (legacy && scopeHostelNames.some((name) => name.toLowerCase() === legacy.toLowerCase())) {
    return scopeHostelNames.find((name) => name.toLowerCase() === legacy.toLowerCase()) ?? '';
  }
  const fromTopBar = WARDEN_ASSIGNED_HOSTELS.find((h) => h.id === selectedHostelId)?.label;
  if (fromTopBar && scopeHostelNames.some((name) => name.toLowerCase() === fromTopBar.toLowerCase())) {
    return scopeHostelNames.find((name) => name.toLowerCase() === fromTopBar.toLowerCase()) ?? '';
  }
  return scopeHostelNames[0] ?? '';
}

export function getWardenHostelApiFilter(selectedHostelId: string, scopeHostelNames: string[]): string {
  return resolveWardenHostelName(selectedHostelId, scopeHostelNames);
}

export function getWardenHostelDisplayName(selectedHostelId: string, scopeHostelNames: string[]): string {
  const name = resolveWardenHostelName(selectedHostelId, scopeHostelNames);
  return name || 'No hostel assigned';
}
