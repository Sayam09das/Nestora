import Link from 'next/link';

import { getAdminSectionLabelFromPath } from '@/components/dashboard/admin-route-meta';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AdminSectionPlaceholderProps = {
  pathname: string;
};

export function AdminSectionPlaceholder({ pathname }: AdminSectionPlaceholderProps) {
  const title = getAdminSectionLabelFromPath(pathname);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This workspace module is wired in navigation and will connect to Nestora APIs in a follow-up slice.
        </p>
      </div>
      <Card className="border-[var(--nestora-sage-muted)]">
        <CardHeader>
          <CardTitle className="text-lg">Coming soon</CardTitle>
          <CardDescription>
            Route <code className="text-xs">{pathname}</code> is registered for IA and breadcrumbs. Build out
            tables, forms, and workflows here when the backend contract is ready.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/admin"
            className="inline-flex h-9 items-center justify-center rounded-full bg-[var(--nestora-forest)] px-4 text-sm font-semibold text-white hover:bg-[color-mix(in_oklch,var(--nestora-forest),white_12%)]"
          >
            Back to dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
