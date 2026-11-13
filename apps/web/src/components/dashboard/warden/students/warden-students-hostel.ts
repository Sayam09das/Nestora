export type WardenHostelOption = { id: string; label: string };

export function resolveWardenHostelName(
  selectedHostelId: string,
  scopeHostelNames: string[],
  assignedHostels: WardenHostelOption[] = [],
): string {
  const fromAssigned = assignedHostels.find((h) => h.id === selectedHostelId)?.label;
  if (fromAssigned) {
    return fromAssigned;
  }
  if (!selectedHostelId && assignedHostels.length > 0) {
    return assignedHostels[0]!.label;
  }
  if (scopeHostelNames.length === 0) {
    return '';
  }
  if (scopeHostelNames.length === 1) {
    return scopeHostelNames[0]!;
  }
  return scopeHostelNames[0] ?? '';
}

/** Hostel name for directory query params (`?hostel=` — not UUID). */
export function getWardenHostelApiFilter(
  selectedHostelId: string,
  scopeHostelNames: string[],
  assignedHostels: WardenHostelOption[] = [],
): string {
  const name = resolveWardenHostelName(selectedHostelId, scopeHostelNames, assignedHostels);
  return name;
}

export function getWardenHostelDisplayName(
  selectedHostelId: string,
  scopeHostelNames: string[],
  assignedHostels: WardenHostelOption[] = [],
): string {
  const name = resolveWardenHostelName(selectedHostelId, scopeHostelNames, assignedHostels);
  return name || 'No hostel assigned';
}
