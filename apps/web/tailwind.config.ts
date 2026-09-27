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
        primary:  '#3974D8',
        accent:   '#E66C5C',
        navy:     '#10223F',
        midblue:  '#315D91',
        success:  '#57A88A',
        warning:  '#f59e0b',
        danger:   '#ef4444',
        surface:  '#ffffff',
        pagebg:   '#F1F5F7',
        muted:    '#7D8C99',
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
        sans: ['"Geist"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        md: '14px',
        lg: '16px',
        xl: '20px',
      },
    },
  },
  plugins: [],
};

export default config;
