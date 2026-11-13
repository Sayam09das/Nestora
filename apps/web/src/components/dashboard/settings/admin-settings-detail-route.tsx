'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AdminSettingsDetailPage } from '@/components/dashboard/settings/admin-settings-detail-page';
import type { SettingField, SettingsPanel } from '@/components/dashboard/settings/admin-settings-data';
import { fetchSettingsPanelDetail } from '@/lib/api/settings';
import { Button } from '@/components/ui/button';

export function AdminSettingsDetailRoute({
  panelId,
  listHref = '/admin/settings',
  hostel,
}: {
  panelId: string;
  listHref?: string;
  hostel?: string;
}) {
  const [panel, setPanel] = useState<SettingsPanel | null>(null);
  const [fields, setFields] = useState<SettingField[]>([]);
  const [changeLog, setChangeLog] = useState<Array<{ when: string; actor: string; change: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchSettingsPanelDetail(panelId, { hostel });
      if (cancelled) return;
      if (result.detail) {
        setPanel(result.detail.panel);
        setFields(result.detail.fields);
        setChangeLog(result.detail.changeLog);
        setError(null);
      } else {
        setError(result.error ?? 'Panel not found.');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [panelId, hostel]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-[var(--nestora-sage)]" aria-hidden />
        <p className="text-sm text-muted-foreground">Loading settings panel…</p>
      </div>
    );
  }

  if (!panel) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-sm text-destructive">{error ?? 'Panel not found.'}</p>
        <Button nativeButton={false} variant="outline" className="rounded-xl" render={<Link href={listHref}>Back to settings</Link>} />
      </div>
    );
  }

  return <AdminSettingsDetailPage panel={panel} fields={fields} changeLog={changeLog} listHref={listHref} />;
}
