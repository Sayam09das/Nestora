import Link from 'next/link';

import { getStudentRouteMeta } from '@/components/dashboard/student-portal/student-route-meta';
import { createPrivatePageMetadata } from '@/lib/seo/metadata';

type PageProps = { params: Promise<{ segments: string[] }> };

export async function generateMetadata({ params }: PageProps) {
  const { segments } = await params;
  const pathname = `/student/${segments.join('/')}`;
  const { title } = getStudentRouteMeta(pathname);
  return createPrivatePageMetadata(title, `${title} — student portal (preview).`, pathname);
}

export default async function StudentSectionPlaceholder({ params }: PageProps) {
  const { segments } = await params;
  const pathname = `/student/${segments.join('/')}`;
  const { title } = getStudentRouteMeta(pathname);

  return (
    <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
      <h2 className="text-lg font-semibold text-[var(--nestora-forest)]">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">This student module is on the roadmap.</p>
      <Link
        href="/student"
        className="mt-6 inline-block text-sm font-medium text-[var(--nestora-forest)] underline-offset-2 hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
