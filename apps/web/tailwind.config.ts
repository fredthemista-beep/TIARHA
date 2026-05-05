import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // TIARH design tokens
        primary:  '#107fb7',
        accent:   '#c76060',
        navy:     '#1a1a2e',
        midblue:  '#496ba2',
        success:  '#10b981',
        warning:  '#f59e0b',
        danger:   '#ef4444',
        surface:  '#ffffff',
        pagebg:   '#efecec',
        muted:    '#6b7280',
        // shadcn/ui CSS-variable aliases
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
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'DM Sans', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'DM Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
