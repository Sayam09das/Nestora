import type { Config } from 'tailwindcss';

/** Shared Tailwind preset: Nestora brand + shadcn/ui semantic tokens (CSS variables in apps/web). */
const nestoraPreset: Partial<Config> = {
  darkMode: ['class'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['var(--text-display)', { lineHeight: 'var(--leading-display)', fontWeight: '600' }],
        stat: ['var(--text-stat)', { lineHeight: '1.15', fontWeight: '600' }],
        h1: ['var(--text-h1)', { lineHeight: 'var(--leading-tight)', fontWeight: '600' }],
        h2: ['var(--text-h2)', { lineHeight: 'var(--leading-tight)', fontWeight: '600' }],
        h3: ['var(--text-h3)', { lineHeight: 'var(--leading-tight)', fontWeight: '500' }],
        body: ['var(--text-body)', { lineHeight: 'var(--leading-relaxed)', fontWeight: '400' }],
        supporting: ['var(--text-supporting)', { lineHeight: 'var(--leading-relaxed)' }],
        label: ['var(--text-label)', { lineHeight: 'var(--leading-normal)', fontWeight: '500' }],
        caption: ['var(--text-caption)', { lineHeight: 'var(--leading-normal)' }],
      },
      boxShadow: {
        nestora: 'var(--shadow-sm)',
        'nestora-md': 'var(--shadow-md)',
        'nestora-lg': 'var(--shadow-lg)',
      },
      colors: {
        nestora: {
          violet: '#8c83b8',
          sage: '#9baf9b',
          beige: '#c5a477',
          'blue-gray': '#8c9eae',
          error: '#e07a7a',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        info: 'var(--info)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground, var(--foreground))',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
};

export default nestoraPreset;
