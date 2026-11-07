import Link from 'next/link';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = createPrivatePageMetadata(
  'Administration',
  'University administrator dashboard.',
  '/admin',
);

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
        <p className="text-muted-foreground text-sm">University administrator tools (MS-1).</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Audit trail</CardTitle>
          <CardDescription>
            Immutable log of authentication, user management, and infrastructure changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/admin/audit-logs"
            className="inline-flex h-8 items-center justify-center bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/80"
          >
            Open audit logs
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
