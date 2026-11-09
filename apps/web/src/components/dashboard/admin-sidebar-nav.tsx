'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import type { AdminNavCollapsible, AdminNavEntry, AdminNavGroup, AdminNavLink } from '@/components/dashboard/admin-nav-items';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/35';

const motionEase = [0.22, 1, 0.36, 1] as const;

type AdminSidebarNavProps = {
  groups: AdminNavGroup[];
  collapsed: boolean;
};

const NAV_OPEN_STORAGE_KEY = 'nestora-admin-nav-open';

function NavIconButton({
  active,
  children,
  className,
}: {
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
        active
          ? 'border-[color-mix(in_oklch,var(--nestora-gold)_35%,white)] bg-white/10'
          : 'border-white/10 bg-white/[0.04] group-hover:border-white/20',
        className,
      )}
    >
      {children}
    </span>
  );
}

function SidebarNavLink({
  item,
  collapsed,
  reduceMotion,
}: {
  item: AdminNavLink;
  collapsed: boolean;
  reduceMotion: boolean | null;
}) {
  const pathname = usePathname();
  const active = item.isActive(pathname);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group relative flex rounded-xl transition-colors duration-200',
        collapsed ? 'items-center justify-center px-2 py-2.5' : 'items-start gap-3 px-3 py-2.5',
        active ? 'bg-white/[0.1] text-white' : 'text-white/75 hover:bg-white/[0.06] hover:text-white',
        focusRing,
      )}
    >
      {active && !reduceMotion ? (
        <motion.span
          layoutId="admin-sidebar-active"
          className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-[var(--nestora-gold)]"
          transition={{ type: 'spring', stiffness: 520, damping: 34 }}
          aria-hidden
        />
      ) : active ? (
        <span
          className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-[var(--nestora-gold)]"
          aria-hidden
        />
      ) : null}
      <NavIconButton active={active} className={!collapsed ? 'ml-1' : undefined}>
        <Icon
          className={cn('size-4', active ? 'text-[var(--nestora-gold)]' : 'text-white/80')}
          aria-hidden
        />
      </NavIconButton>
      {!collapsed ? (
        <span className="min-w-0 pt-0.5">
          <span className="block text-sm font-semibold leading-none">{item.label}</span>
          {item.description ? (
            <span className="mt-1 hidden text-[11px] leading-snug text-white/55 group-hover:text-white/65 xl:block">
              {item.description}
            </span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}

function SidebarNavCollapsible({
  item,
  collapsed,
  open,
  onToggle,
  reduceMotion,
}: {
  item: AdminNavCollapsible;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  reduceMotion: boolean | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const active = item.isActive(pathname);
  const Icon = item.icon;

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'group relative flex w-full items-center justify-center rounded-xl px-2 py-2.5 transition-colors',
            active ? 'bg-white/[0.1] text-white' : 'text-white/75 hover:bg-white/[0.06] hover:text-white',
            focusRing,
          )}
          aria-label={item.label}
        >
          <NavIconButton active={active}>
            <Icon
              className={cn('size-4', active ? 'text-[var(--nestora-gold)]' : 'text-white/80')}
              aria-hidden
            />
          </NavIconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={12}
          className="min-w-44 rounded-xl border-[var(--nestora-sage-muted)]"
        >
          <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {item.label}
          </p>
          {item.children.map((child) => (
            <DropdownMenuItem
              key={child.href}
              className={child.isActive(pathname) ? 'font-semibold' : undefined}
              onClick={() => router.push(child.href)}
            >
              {child.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          'group relative flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200',
          active ? 'bg-white/[0.08] text-white' : 'text-white/75 hover:bg-white/[0.06] hover:text-white',
          focusRing,
        )}
      >
        {active && !reduceMotion ? (
          <motion.span
            layoutId="admin-sidebar-active"
            className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-[var(--nestora-gold)]"
            transition={{ type: 'spring', stiffness: 520, damping: 34 }}
            aria-hidden
          />
        ) : active ? (
          <span
            className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-[var(--nestora-gold)]"
            aria-hidden
          />
        ) : null}
        <NavIconButton active={active} className="ml-1">
          <Icon
            className={cn('size-4', active ? 'text-[var(--nestora-gold)]' : 'text-white/80')}
            aria-hidden
          />
        </NavIconButton>
        <span className="min-w-0 flex-1 pt-0.5">
          <span className="flex items-center gap-2">
            <span className="block text-sm font-semibold leading-none">{item.label}</span>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: motionEase }}
              className="ml-auto"
              aria-hidden
            >
              <ChevronDown className="size-3.5 text-white/55" />
            </motion.span>
          </span>
          {item.description ? (
            <span className="mt-1 hidden text-[11px] leading-snug text-white/55 xl:block">{item.description}</span>
          ) : null}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="submenu"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: motionEase }}
            className="overflow-hidden"
          >
            <ul className="ml-4 space-y-0.5 border-l border-white/10 py-0.5 pl-3">
              {item.children.map((child, index) => {
                const childActive = child.isActive(pathname);
                return (
                  <motion.li
                    key={child.href}
                    initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduceMotion ? 0 : index * 0.04, duration: 0.2 }}
                  >
                    <Link
                      href={child.href}
                      aria-current={childActive ? 'page' : undefined}
                      className={cn(
                        'block rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
                        childActive
                          ? 'bg-white/[0.1] text-[var(--nestora-gold)]'
                          : 'text-white/65 hover:bg-white/[0.06] hover:text-white',
                        focusRing,
                      )}
                    >
                      {child.label}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function AdminSidebarNav({ groups, collapsed }: AdminSidebarNavProps) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NAV_OPEN_STORAGE_KEY);
      if (raw) {
        setOpenIds(JSON.parse(raw) as Record<string, boolean>);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const auto: Record<string, boolean> = {};
    for (const group of groups) {
      for (const item of group.items) {
        if (item.kind === 'collapsible' && item.isActive(pathname)) {
          auto[item.id] = true;
        }
      }
    }
    if (Object.keys(auto).length > 0) {
      setOpenIds((prev) => ({ ...prev, ...auto }));
    }
  }, [pathname, groups]);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(NAV_OPEN_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const isOpen = (item: AdminNavCollapsible) => openIds[item.id] ?? item.isActive(pathname);

  return (
    <nav className="flex-1 space-y-4 pb-2 xl:space-y-5">
      {groups.map((group, groupIndex) => (
        <motion.div
          key={group.id}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: motionEase, delay: groupIndex * 0.04 }}
        >
          {!collapsed ? (
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">
              {group.label}
            </p>
          ) : groupIndex > 0 ? (
            <div className="mx-auto mb-2 h-px w-8 bg-white/15" aria-hidden />
          ) : null}
          <ul className="space-y-1">
            {group.items.map((entry: AdminNavEntry) => (
              <li key={entry.id} data-admin-side-item>
                {entry.kind === 'link' ? (
                  <SidebarNavLink item={entry} collapsed={collapsed} reduceMotion={reduceMotion} />
                ) : (
                  <SidebarNavCollapsible
                    item={entry}
                    collapsed={collapsed}
                    open={isOpen(entry)}
                    onToggle={() => toggle(entry.id)}
                    reduceMotion={reduceMotion}
                  />
                )}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </nav>
  );
}
