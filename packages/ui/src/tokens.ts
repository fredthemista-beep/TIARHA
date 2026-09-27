// packages/ui/src/tokens.ts
// Adapted from typeui.sh "dashboard" design system
// Light-mode override for institutional FPT audience

export const colors = {
  primary:   '#3974D8',    // action blue
  accent:    '#E66C5C',    // alert / emphasis coral
  navy:      '#10223F',    // sidebar / dark panels
  midBlue:   '#315D91',
  surface:   '#ffffff',    // cards (light-mode, overrides dark dashboard surface)
  pageBg:    '#F1F5F7',    // page background
  text:      '#122033',
  textMuted: '#7D8C99',
  success:   '#57A88A',
  warning:   '#f59e0b',    // from typeui.sh dashboard
  danger:    '#ef4444',    // from typeui.sh dashboard
  border:    'rgba(0,0,0,0.07)',
} as const;

export const typography = {
  fontSans: '"Geist", system-ui, sans-serif',
  fontMono: '"Geist Mono", ui-monospace, monospace',
  scale: ['0.75rem', '0.875rem', '1rem', '1.25rem', '1.5rem', '2rem'] as const,
} as const;

export const radius = {
  sm:  '8px',
  md:  '14px',
  lg:  '20px',
  xl:  '24px',
} as const;

export const spacing = {
  sm: '8px',     // typeui.sh Dashboard 8pt grid
  md: '16px',
  lg: '24px',
  xl: '32px',
} as const;

export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';

export const PLAN_CONFIG: Record<PlanType, { name: string; price: string; agents: string; color: string; appLimit: number }> = {
  free:       { name: 'Gratuit',    price: '0 €',        agents: '0–50',    color: colors.textMuted, appLimit: 2 },
  starter:    { name: 'Starter',    price: '49 €/mois',  agents: '50–350',  color: colors.midBlue,   appLimit: 4 },
  pro:        { name: 'Pro',        price: '149 €/mois', agents: '350–2000',color: colors.primary,   appLimit: 7 },
  enterprise: { name: 'Entreprise', price: 'Sur devis',  agents: '2000+',   color: colors.accent,    appLimit: 10 },
};
