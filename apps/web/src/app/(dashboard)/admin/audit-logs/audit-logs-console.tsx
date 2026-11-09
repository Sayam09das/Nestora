'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ApiPaginationMeta } from '@nestora/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type AuditListFilters, type AuditLogRow, fetchAuditLogs } from '@/lib/api/audit';

const emptyFilters: AuditListFilters = {
  page: 1,
  limit: 20,
  actionName: '',
  entityType: '',
  entityId: '',
  actorUserId: '',
  from: '',
  to: '',
};

function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AuditLogsConsole() {
  const [filters, setFilters] = useState<AuditListFilters>(emptyFilters);
  const [draft, setDraft] = useState<AuditListFilters>(emptyFilters);
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [pagination, setPagination] = useState<ApiPaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(async (active: AuditListFilters) => {
    setLoading(true);
    setError(undefined);
    const cleaned: AuditListFilters = {
      page: active.page ?? 1,
      limit: active.limit ?? 20,
      ...(active.actionName ? { actionName: active.actionName } : {}),
      ...(active.entityType ? { entityType: active.entityType } : {}),
      ...(active.entityId ? { entityId: active.entityId } : {}),
      ...(active.actorUserId ? { actorUserId: active.actorUserId } : {}),
      ...(active.from ? { from: active.from } : {}),
      ...(active.to ? { to: active.to } : {}),
    };
    const result = await fetchAuditLogs(cleaned);
    setLogs(result.logs);
    setPagination(result.pagination);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load(filters);
  }, [filters, load]);

  function applyFilters() {
    setFilters({ ...draft, page: 1 });
  }

  function goToPage(page: number) {
    setFilters((prev) => ({ ...prev, page }));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-lg border border-border bg-background p-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="actionName">Action</Label>
          <Input
            id="actionName"
            placeholder="e.g. HOSTEL_CREATED"
            value={draft.actionName ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, actionName: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="entityType">Entity type</Label>
          <Input
            id="entityType"
            placeholder="e.g. Hostel"
            value={draft.entityType ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, entityType: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="entityId">Entity ID</Label>
          <Input
            id="entityId"
            value={draft.entityId ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, entityId: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="actorUserId">Actor user ID</Label>
          <Input
            id="actorUserId"
            value={draft.actorUserId ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, actorUserId: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="from">From (ISO)</Label>
          <Input
            id="from"
            placeholder="2025-01-01T00:00:00.000Z"
            value={draft.from ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to">To (ISO)</Label>
          <Input
            id="to"
            placeholder="2025-12-31T23:59:59.000Z"
            value={draft.to ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
          />
        </div>
        <div className="flex items-end md:col-span-3">
          <Button type="button" onClick={applyFilters} disabled={loading}>
            Apply filters
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground text-center">
                  Loading…
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground text-center">
                  No audit entries match your filters.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {formatTimestamp(row.timestamp)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{row.actionName}</TableCell>
                  <TableCell className="text-xs">
                    <span className="text-muted-foreground">{row.entityType}</span>
                    <span className="block font-mono">{row.entityId}</span>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="block">{row.actorRole}</span>
                    <span className="font-mono text-muted-foreground">
                      {row.actorUserId ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{row.ipAddress ?? '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination ? (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {pagination.page} of {pagination.total_pages} ({pagination.total_records} records)
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || pagination.page <= 1}
              onClick={() => goToPage(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || pagination.page >= pagination.total_pages}
              onClick={() => goToPage(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
