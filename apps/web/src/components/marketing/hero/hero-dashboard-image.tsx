import Image from 'next/image';

import { cn } from '@/lib/utils';

const HERO_DASHBOARD_SRC = '/images/hero-dashboard.jpg';
const HERO_DASHBOARD_WIDTH = 3840;
const HERO_DASHBOARD_HEIGHT = 2160;

type HeroDashboardImageProps = {
  className?: string;
};

export function HeroDashboardImage({ className }: HeroDashboardImageProps) {
  return (
    <figure
      className={cn('relative mx-auto w-full max-w-5xl', className)}
      aria-label="Nestora product preview"
    >
      <div
        className="pointer-events-none absolute -inset-4 sm:-inset-6 -z-10 rounded-[2.5rem] opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, color-mix(in oklch, var(--nestora-sage) 24%, transparent), color-mix(in oklch, var(--nestora-tan) 10%, transparent), transparent 70%)',
        }}
        aria-hidden
      />

      <div className="overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--foreground)_8%,var(--border))] bg-card shadow-[0_24px_80px_-28px_color-mix(in_oklch,var(--nestora-forest)_45%,transparent)] sm:rounded-3xl">
        <Image
          src={HERO_DASHBOARD_SRC}
          alt="Nestora dashboard: room beds, live occupancy, and gate pass activity for a university hostel block"
          width={HERO_DASHBOARD_WIDTH}
          height={HERO_DASHBOARD_HEIGHT}
          className="h-auto w-full bg-card"
          priority
          fetchPriority="high"
          quality={95}
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 92vw, 80rem"
        />
      </div>

      <figcaption className="mt-3 text-center text-caption text-muted-foreground">
        Product preview — illustrative sample data for marketing.
      </figcaption>
    </figure>
  );
}
