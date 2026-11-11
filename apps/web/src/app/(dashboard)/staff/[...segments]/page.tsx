import Link from 'next/link';

import { getStaffRouteMeta } from '@/components/dashboard/staff-portal/staff-route-meta';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ segments: string[] }> };

export async function generateMetadata({ params }: PageProps) {
  const { segments } = await params;
  const pathname = `/staff/${segments.join('/')}`;
  const { title } = getStaffRouteMeta(pathname);
  return createPrivatePageMetadata(title, `${title} — staff desk (preview).`, pathname);
}

export default async function StaffSectionPlaceholder({ params }: PageProps) {
  const { segments } = await params;
  const pathname = `/staff/${segments.join('/')}`;
  const { title } = getStaffRouteMeta(pathname);

  return (
    <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
      <h2 className="text-lg font-semibold text-[var(--nestora-forest)]">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This staff module is on the roadmap. Navigation and live dashboard metrics are available today.
      </p>
      <Link
        href="/staff"
        className="mt-6 inline-block text-sm font-medium text-[var(--nestora-forest)] underline-offset-2 hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
