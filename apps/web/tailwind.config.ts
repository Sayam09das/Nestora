import type { Config } from 'tailwindcss';
import nestoraPreset from '../../packages/config/tailwind/tailwind.preset';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  presets: [nestoraPreset],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
