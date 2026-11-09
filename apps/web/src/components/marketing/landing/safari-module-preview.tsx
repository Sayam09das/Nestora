import Image from 'next/image';

import type { FeatureModule } from '@/components/marketing/landing/features-content';

const modulePreviewSrc: Record<string, string> = {
  attendance: '/images/module-previews/attendance-preview.png',
  complaints: '/images/module-previews/complaints-preview.png',
  visitors: '/images/module-previews/visitors-preview.png',
  staff: '/images/module-previews/staff-preview.png',
  reports: '/images/module-previews/reports-preview.png',
};

type SafariModulePreviewProps = {
  module: FeatureModule;
  priority?: boolean;
};

export function SafariModulePreview({ module, priority }: SafariModulePreviewProps) {
  const src = modulePreviewSrc[module.id] ?? '/images/module-previews/attendance-preview.png';

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--nestora-sage-muted)] bg-[#ebeae5] shadow-[0_20px_48px_-28px_color-mix(in_oklch,var(--nestora-forest)_48%,transparent)]">
      <div className="flex items-center gap-2 border-b border-[var(--nestora-sage-muted)] px-3 py-2.5">
        <div className="flex shrink-0 gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#d5e3d6]" />
          <span className="size-2.5 rounded-full bg-[#e8f0e8]" />
          <span className="size-2.5 rounded-full bg-[#c5d4c6]" />
        </div>
        <div className="mx-auto min-w-0 flex-1 truncate rounded-md border border-[var(--nestora-sage-muted)] bg-[var(--nestora-white)] px-3 py-1 text-center text-[10px] font-medium text-[var(--nestora-forest)] shadow-sm">
          Nestora · {module.title}
        </div>
        <span className="w-6 shrink-0" aria-hidden />
      </div>
      <div className="relative aspect-[10/7] w-full bg-[var(--nestora-cream)]">
        <Image
          src={src}
          alt={`${module.title} workspace in Nestora`}
          fill
          className="object-cover object-top"
          sizes="(max-width: 1024px) 100vw, (max-width: 1536px) 50vw, 560px"
          quality={92}
          priority={priority}
        />
      </div>
    </div>
  );
}
