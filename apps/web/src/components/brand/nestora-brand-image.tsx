import Image from 'next/image';

import { brandAssets } from '@/lib/seo/config';
import { cn } from '@/lib/utils';

type NestoraBrandImageProps = {
  variant: 'mark' | 'wordmark';
  className?: string;
  priority?: boolean;
};

const layout = {
  mark: {
    src: brandAssets.mark,
    width: 40,
    height: 40,
    className: 'size-7 object-contain',
  },
  wordmark: {
    src: brandAssets.wordmark,
    width: 240,
    height: 160,
    className: 'h-12 w-auto max-w-[min(100%,15rem)] object-contain object-left sm:h-14 sm:max-w-[16rem]',
  },
} as const;

export function NestoraBrandImage({ variant, className, priority }: NestoraBrandImageProps) {
  const asset = layout[variant];
  return (
    <Image
      src={asset.src}
      alt="Nestora Hostel Management System"
      width={asset.width}
      height={asset.height}
      className={cn(asset.className, className)}
      priority={priority}
      unoptimized
    />
  );
}