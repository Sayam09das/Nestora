'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, History, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { AdminSettingsSaveDrawer } from '@/components/dashboard/settings/admin-settings-save-drawer';
import {
  CATEGORY_META,
  PANEL_FIELDS,
  SAMPLE_CHANGE_LOG,
  formatSettingsWhen,
  type SettingsPanel,
} from '@/components/dashboard/settings/admin-settings-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

export function AdminSettingsDetailPage({ panel }: { panel: SettingsPanel }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const meta = CATEGORY_META[panel.category];
  const Icon = meta.icon;
  const fields = PANEL_FIELDS[panel.id] ?? [];
  const history = SAMPLE_CHANGE_LOG[panel.id] ?? [];

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current) return;
      gsap.from(rootRef.current.querySelectorAll('[data-set-detail]'), {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.38,
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [reduceMotion, panel.id] },
  );

  return (
    <div ref={rootRef} className="space-y-6 pb-8">
      <div data-set-detail className="flex flex-wrap items-center gap-3">
        <Button nativeButton={false} variant="outline" size="sm" className="rounded-xl" render={<Link href="/admin/settings" className={focusRing} />}>
          <ArrowLeft className="size-4" aria-hidden />
          Settings
        </Button>
        <p className="text-xs text-muted-foreground">
          {panel.code} · <span className="font-medium text-foreground">{panel.frRef}</span>
        </p>
      </div>

      <header data-set-detail className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-[var(--nestora-forest)]">
              <Icon className="size-6" style={{ color: meta.accent }} aria-hidden />
              {panel.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{panel.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full">
              {panel.status}
            </Badge>
            <Badge variant="outline" className="rounded-full capitalize">
              {panel.risk} risk
            </Badge>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" className={cn('rounded-xl bg-[var(--nestora-forest)] text-white', focusRing)} onClick={() => setDrawerOpen(true)}>
            Review & publish
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn('rounded-xl', focusRing)}
            onClick={() => toast.success('Draft saved locally (sample).')}
          >
            Save draft
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Last modified <time dateTime={panel.lastModified}>{formatSettingsWhen(panel.lastModified)}</time> · {panel.controlsCount} controls
        </p>
      </header>

      <motion.section data-set-detail className="rounded-2xl border bg-card shadow-sm" layout>
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Configuration fields</h2>
        </div>
        <div className="divide-y">
          {fields.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">Sample field schema not loaded for this panel — wire API keys from system_configurations.</p>
          ) : (
            fields.map((field) => (
              <div key={field.key} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-medium">{field.label}</p>
                  {field.help ? <p className="text-xs text-muted-foreground">{field.help}</p> : null}
                </div>
                {field.type === 'toggle' || field.type === 'locked' ? (
                  <span className="inline-flex items-center gap-2">
                    {field.type === 'locked' ? (
                      <>
                        <Lock className="size-4 text-muted-foreground" aria-hidden />
                        <span className="text-xs text-muted-foreground">Locked</span>
                      </>
                    ) : null}
                    <Switch checked={Boolean(field.value)} disabled={field.type === 'locked'} aria-label={field.label} />
                  </span>
                ) : field.type === 'number' ? (
                  <Input type="number" defaultValue={Number(field.value)} className={cn('h-9 w-28 rounded-lg tabular-nums', focusRing)} aria-label={field.label} />
                ) : field.type === 'select' ? (
                  <select defaultValue={String(field.value)} className={cn('h-9 rounded-lg border px-2 text-sm', focusRing)} aria-label={field.label}>
                    {(field.options ?? []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input defaultValue={String(field.value)} className={cn('h-9 min-w-[12rem] rounded-lg', focusRing)} aria-label={field.label} />
                )}
              </div>
            ))
          )}
        </div>
      </motion.section>

      {history.length > 0 ? (
        <motion.section
          data-set-detail
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border bg-card shadow-sm"
        >
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <History className="size-4 text-[var(--nestora-sage)]" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--nestora-forest)]">Change history (sample)</h2>
          </div>
          <ul className="divide-y">
            {history.map((row, i) => (
              <li key={i} className="px-5 py-3 text-sm">
                <p className="text-muted-foreground">
                  <time dateTime={row.when}>{formatSettingsWhen(row.when)}</time> · {row.actor}
                </p>
                <p className="mt-0.5 text-[var(--nestora-forest)]">{row.change}</p>
              </li>
            ))}
          </ul>
        </motion.section>
      ) : null}

      <AdminSettingsSaveDrawer open={drawerOpen} onOpenChange={setDrawerOpen} preselectId={panel.id} />
    </div>
  );
}
