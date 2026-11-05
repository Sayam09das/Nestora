import type { Config } from 'tailwindcss';

const nestoraPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        nestora: {
          primary: '#1e3a5f',
          accent: '#2563eb',
        },
      },
    },
  },
};

export default nestoraPreset;
