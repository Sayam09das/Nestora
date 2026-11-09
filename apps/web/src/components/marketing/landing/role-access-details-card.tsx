'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { KeyRound } from 'lucide-react';

import {
  accessLevelLabels,
  roleAccessDetails,
  type AccessLevel,
} from '@/components/marketing/landing/roles-content';
import { cn } from '@/lib/utils';

const revealEase = [0.22, 1, 0.36, 1] as const;

const columnLabels = [
  { key: 'administrator', label: 'Admin' },
  { key: 'warden', label: 'Warden' },
  { key: 'student', label: 'Student' },
  { key: 'accountant', label: 'Accountant' },
] as const;

function AccessPill({ level }: { level: AccessLevel }) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center justify-center rounded-md px-2 py-1 text-center text-[10px] font-semibold leading-tight sm:text-[11px]',
        level === 'full' && 'bg-[var(--nestora-forest)] text-white',
        level === 'manage' && 'bg-[var(--nestora-sage-light)] text-[var(--nestora-forest-light)]',
        level === 'view' && 'bg-[var(--nestora-tan-light)] text-[var(--nestora-ink)]',
        level === 'finance' && 'bg-[var(--nestora-gold-light)] text-[var(--nestora-forest-light)]',
        level === 'none' && 'text-[var(--nestora-nav-muted)]',
      )}
    >
      {accessLevelLabels[level]}
    </span>
  );
}

type RoleAccessDetailsCardProps = {
  className?: string;
};

export function RoleAccessDetailsCard({ className }: RoleAccessDetailsCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      data-role-details
      className={cn(
        'surface-role-details flex h-full min-h-0 flex-col rounded-xl border p-5 shadow-[0_20px_48px_-32px_color-mix(in_oklch,var(--nestora-forest)_35%,transparent)] transition-[border-color,box-shadow] duration-300 ease-out sm:p-6 lg:p-7',
        'hover:border-[color-mix(in_oklch,var(--nestora-sage)_50%,var(--nestora-sage-muted))]',
        'hover:shadow-[0_26px_56px_-34px_color-mix(in_oklch,var(--nestora-forest)_42%,transparent)]',
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, ease: revealEase }}
      whileHover={
        reduceMotion ? undefined : { y: -3, transition: { duration: 0.22, ease: revealEase } }
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="surface-role-icon flex size-10 shrink-0 items-center justify-center rounded-md border">
            <KeyRound className="size-4" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-h4 font-semibold text-[var(--nestora-forest)]">
              {roleAccessDetails.title}
            </h3>
            <p className="mt-2 text-pretty text-supporting text-[var(--nestora-nav-muted)]">
              {roleAccessDetails.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-[var(--nestora-sage-muted)]">
        <table className="w-full min-w-[520px] border-collapse text-left text-caption lg:min-w-0">
          <thead>
            <tr className="surface-role-table-head border-b">
              <th
                scope="col"
                className="px-3 py-3 font-semibold text-[var(--nestora-forest)] sm:px-4"
              >
                Workspace area
              </th>
              {columnLabels.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-2 py-3 text-center font-semibold text-[var(--nestora-forest)] sm:px-3"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roleAccessDetails.rows.map((row) => (
              <tr
                key={row.area}
                className="border-b border-[var(--nestora-sage-muted)] last:border-b-0"
              >
                <th
                  scope="row"
                  className="px-3 py-3 font-medium text-[var(--nestora-ink)] sm:px-4"
                >
                  {row.area}
                </th>
                {columnLabels.map((col) => {
                  const level = row[col.key];
                  return (
                    <td key={col.key} className="px-2 py-3 text-center sm:px-3">
                      <AccessPill level={level} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-auto flex min-h-0 flex-1 flex-col justify-end gap-5 pt-5">
        <div className="rounded-lg border border-[var(--nestora-sage-muted)] bg-[color-mix(in_oklch,var(--nestora-sage-light)_40%,var(--nestora-white))] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--nestora-forest)]">
            {roleAccessDetails.legendTitle}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(['full', 'manage', 'view', 'finance'] as const).map((level) => (
              <AccessPill key={level} level={level} />
            ))}
          </div>
          <ul className="mt-3 space-y-1.5 text-[11px] leading-snug text-[var(--nestora-nav-muted)]">
            {roleAccessDetails.legendNotes.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <ul className="space-y-2 border-t border-[var(--nestora-sage-muted)] pt-5 text-caption text-[var(--nestora-nav-muted)]">
          {roleAccessDetails.highlights.map((line) => (
            <li key={line} className="flex gap-2 text-pretty">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-[var(--nestora-sage)]" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}
