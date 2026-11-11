import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/** Nestora typography scale — register as font-size so `text-body` does not clobber `text-white`. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display',
            'stat',
            'h1',
            'h2',
            'h3',
            'h4',
            'body',
            'supporting',
            'label',
            'caption',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
