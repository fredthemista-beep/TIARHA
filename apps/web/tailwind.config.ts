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
