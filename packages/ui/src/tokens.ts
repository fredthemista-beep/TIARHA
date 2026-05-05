// packages/ui/src/tokens.ts
// Adapted from typeui.sh "dashboard" design system
// Light-mode override for institutional FPT audience

export const colors = {
  primary:   '#107fb7',    // TIARH blue (dashboard primary #0C5CAB adapted)
  accent:    '#c76060',    // TIARH coral
  navy:      '#1a1a2e',    // sidebar / dark panels
  midBlue:   '#496ba2',
  surface:   '#ffffff',    // cards (light-mode, overrides dark dashboard surface)
  pageBg:    '#efecec',    // page background
  text:      '#1a1a2e',
  textMuted: '#6b7280',
  success:   '#10b981',    // from typeui.sh dashboard
  warning:   '#f59e0b',    // from typeui.sh dashboard
  danger:    '#ef4444',    // from typeui.sh dashboard
  border:    'rgba(0,0,0,0.07)',
} as const;

export const typography = {
  fontSans: '"IBM Plex Sans", "DM Sans", system-ui, sans-serif', // typeui.sh Dashboard font
  fontMono: '"IBM Plex Mono", "DM Mono", monospace',
  scale: ['0.75rem', '0.875rem', '1rem', '1.25rem', '1.5rem', '2rem'] as const,
} as const;

export const radius = {
  sm:  '4px',    // typeui.sh Dashboard sm
  md:  '8px',    // typeui.sh Dashboard md
  lg:  '12px',
  xl:  '16px',
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
