import type { Config } from 'tailwindcss';
import nestoraPreset from '../../packages/config/tailwind/tailwind.preset';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  presets: [nestoraPreset],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
