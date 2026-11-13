'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Lock, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  CATEGORY_META,
  PANEL_FIELDS,
  formatSettingsWhen,
  type SettingField,
  type SettingsPanel,
} from '@/components/dashboard/settings/admin-settings-data';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

type Props = {
  panel: SettingsPanel | null;
  fields?: SettingField[];
  loading?: boolean;
  detailBasePath?: string;
  onPersistField?: (key: string, value: boolean) => Promise<void>;
};

export function AdminSettingsTunePanel({
  panel,
  fields: fieldsProp,
  loading,
  detailBasePath = '/admin/settings',
  onPersistField,
}: Props) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const liveFields = Boolean(fieldsProp?.length);
  const fields = useMemo(() => {
    if (fieldsProp?.length) return fieldsProp;
    return panel ? PANEL_FIELDS[panel.id] ?? [] : [];
  }, [fieldsProp, panel]);
  const [local, setLocal] = useState<Record<string, string | number | boolean>>({});

  useGSAP(
    () => {
      if (reduceMotion || !rootRef.current || !panel) return;
      const rows = rootRef.current.querySelectorAll('[data-set-row]');
      if (!rows.length) return;
      gsap.from(rows, {
        opacity: 0,
        x: 12,
        duration: 0.35,
        stagger: 0.05,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      });
    },
    { scope: rootRef, dependencies: [panel?.id, reduceMotion], revertOnUpdate: true },
  );

  if (!panel) {
    return (
      <section className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
        Select a panel to preview quick controls.
      </section>
    );
  }

  const meta = CATEGORY_META[panel.category];
  const Icon = meta.icon;
  const valueFor = (key: string, fallback: string | number | boolean) =>
    key in local ? local[key] : fallback;

  return (
    <motion.section
      ref={rootRef}
      data-set-reveal
      layout
      className="overflow-hidden rounded-2xl border bg-card shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-5">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">
            <SlidersHorizontal className="size-3.5" aria-hidden />
            Quick tune
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold text-[var(--nestora-forest)]">
            <Icon className="size-5" style={{ color: meta.accent }} aria-hidden />
            {panel.title}
          </h2>
          <p className="text-xs text-muted-foreground">
            {panel.status} · updated {formatSettingsWhen(panel.lastModified)}
          </p>
        </div>
        <Button
          nativeButton={false}
          size="sm"
          className={cn('rounded-xl', focusRing)}
          render={<Link href={`${detailBasePath}/${panel.id}`}>Full editor</Link>}
        />
      </header>
      <div className="space-y-4 p-4 sm:p-5">
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Detailed controls live on the full panel page. Open the editor to adjust all values.
          </p>
        ) : (
          fields.map((field) => (
            <div key={field.key} data-set-row className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-[color-mix(in_oklch,var(--nestora-cream)_12%,var(--card))] px-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--nestora-forest)]">{field.label}</p>
                {field.help ? <p className="text-[11px] text-muted-foreground">{field.help}</p> : null}
              </div>
              {field.type === 'toggle' || field.type === 'locked' ? (
                <span className="inline-flex items-center gap-2">
                  {field.type === 'locked' ? <Lock className="size-3.5 text-muted-foreground" aria-hidden /> : null}
                  <Switch
                    checked={Boolean(valueFor(field.key, field.value))}
                    disabled={field.type === 'locked'}
                    onCheckedChange={(v) => {
                      if (liveFields && field.wardenEditable && onPersistField) {
                        void onPersistField(field.key, v).then(() => {
                          setLocal((s) => ({ ...s, [field.key]: v }));
                          toast.success('Preference saved.');
                        });
                        return;
                      }
                      if (liveFields && field.type !== 'locked') {
                        toast.message('Use Review & publish to apply policy changes.');
                        return;
                      }
                      setLocal((s) => ({ ...s, [field.key]: v }));
                      toast.message('Saved locally (sample).');
                    }}
                    aria-label={field.label}
                  />
                </span>
              ) : field.type === 'number' ? (
                <Input
                  type="number"
                  readOnly={liveFields}
                  className={cn('h-9 w-24 rounded-lg tabular-nums', focusRing)}
                  value={Number(valueFor(field.key, field.value))}
                  onChange={(e) => setLocal((s) => ({ ...s, [field.key]: Number(e.target.value) }))}
                  aria-label={field.label}
                />
              ) : field.type === 'select' ? (
                <select
                  className={cn('h-9 rounded-lg border px-2 text-xs', focusRing)}
                  value={String(valueFor(field.key, field.value))}
                  onChange={(e) => setLocal((s) => ({ ...s, [field.key]: e.target.value }))}
                  aria-label={field.label}
                >
                  {(field.options ?? []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  className={cn('h-9 min-w-[10rem] rounded-lg', focusRing)}
                  value={String(valueFor(field.key, field.value))}
                  onChange={(e) => setLocal((s) => ({ ...s, [field.key]: e.target.value }))}
                  aria-label={field.label}
                />
              )}
            </div>
          ))
        )}
      </div>
    </motion.section>
  );
}
