import Link from 'next/link';

import { getWardenRouteMeta } from '@/components/dashboard/warden/warden-route-meta';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ segments: string[] }> };

export async function generateMetadata({ params }: PageProps) {
  const { segments } = await params;
  const pathname = `/warden/${segments.join('/')}`;
  const { title } = getWardenRouteMeta(pathname);
  return createPrivatePageMetadata(title, `${title} — warden desk (preview).`, pathname);
}

export default async function WardenSectionPlaceholder({ params }: PageProps) {
  const { segments } = await params;
  const pathname = `/warden/${segments.join('/')}`;
  const { title } = getWardenRouteMeta(pathname);

  return (
    <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
      <h2 className="text-lg font-semibold text-[var(--nestora-forest)]">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">This warden module is on the roadmap. Navigation and top bar are live.</p>
      <Link href="/warden" className="mt-6 inline-block text-sm font-medium text-[var(--nestora-forest)] underline-offset-2 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
