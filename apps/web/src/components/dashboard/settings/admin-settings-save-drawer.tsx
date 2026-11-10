'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SAMPLE_PANELS } from '@/components/dashboard/settings/admin-settings-data';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = { open: boolean; onOpenChange: (o: boolean) => void; preselectId?: string };

export function AdminSettingsSaveDrawer({ open, onOpenChange, preselectId }: Props) {
  const [panelId, setPanelId] = useState('');
  const [note, setNote] = useState('');
  const [env, setEnv] = useState<'staging' | 'production'>('staging');

  useEffect(() => {
    if (!open) {
      setPanelId('');
      setNote('');
      setEnv('staging');
      return;
    }
    if (preselectId) setPanelId(preselectId);
  }, [open, preselectId]);

  const publish = () => {
    if (!panelId) {
      toast.error('Select a panel to publish.');
      return;
    }
    if (!note.trim()) {
      toast.error('Add a change summary for the audit trail (FR-140).');
      return;
    }
    toast.success(`Config published to ${env} (sample).`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle className="text-lg text-[var(--nestora-forest)]">Review & publish</SheetTitle>
          <SheetDescription>Versioned rollout with audit note. Production requires secondary approval when risk is high.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 p-5">
          <label className="block space-y-1">
            <span className="text-xs font-medium">Panel</span>
            <select value={panelId} onChange={(e) => setPanelId(e.target.value)} className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}>
              <option value="">Select panel</option>
              {SAMPLE_PANELS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} · {p.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Target environment</span>
            <select
              value={env}
              onChange={(e) => setEnv(e.target.value as 'staging' | 'production')}
              className={cn('h-10 w-full rounded-xl border px-3 text-sm', focusRing)}
            >
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">Change summary</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className={cn('w-full rounded-xl border px-3 py-2 text-sm', focusRing)}
              placeholder="What changed and why…"
            />
          </label>
        </div>
        <SheetFooter className="border-t p-5 sm:flex-col sm:space-x-0">
          <Button type="button" className={cn('w-full rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} onClick={publish}>
            Publish configuration
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
