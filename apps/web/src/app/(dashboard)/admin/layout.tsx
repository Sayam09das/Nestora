import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-sm font-semibold tracking-tight">
              Nestora Admin
            </Link>
            <nav className="flex gap-4 text-sm text-muted-foreground">
              <Link href="/admin/audit-logs" className="hover:text-foreground">
                Audit logs
              </Link>
            </nav>
          </div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
