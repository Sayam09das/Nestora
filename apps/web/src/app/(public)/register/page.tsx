import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { nestoraPrimaryCtaClasses } from '@/components/marketing/cta-styles';
import { createPageMetadata } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils';

export const metadata = createPageMetadata({
  title: 'Register your hostel',
  path: '/register',
});

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-[var(--container-marketing)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-label font-medium text-primary">Onboarding</p>
        <h1 className="mt-2 text-h1 font-semibold text-foreground">Create your Nestora workspace</h1>
        <p className="mt-3 text-body text-muted-foreground">
          Registration connects your institution to Nestora. Full self-serve signup will land here;
          for now, contact us to pilot Nestora with your hostel team.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/contact" className={cn('h-11 min-h-11 px-7 text-body', nestoraPrimaryCtaClasses)}>
            Request access
            <ArrowUpRight className="size-4 shrink-0 text-current" aria-hidden strokeWidth={2.25} />
          </Link>
          <Link
            href="/login"
            className="text-label font-medium text-muted-foreground transition-[color,opacity] duration-150 hover:text-foreground"
          >
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
