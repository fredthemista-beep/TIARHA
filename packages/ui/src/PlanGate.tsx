// packages/ui/src/PlanGate.tsx
import React from 'react';
import type { PlanType } from './tokens';
import { PLAN_CONFIG, colors, radius, typography } from './tokens';

interface PlanGateProps {
  required: PlanType[];
  currentPlan: PlanType;
  children: React.ReactNode;
}

function UpgradePrompt({ currentPlan, requiredPlan }: { currentPlan: PlanType; requiredPlan: PlanType }) {
  const plan = PLAN_CONFIG[requiredPlan];
  return (
    <div style={{
      padding: '24px',
      borderRadius: radius.lg,
      border: `1px dashed ${colors.border}`,
      textAlign: 'center',
      fontFamily: typography.fontSans,
    }}>
      <p style={{ fontSize: '0.875rem', color: colors.textMuted, marginBottom: 12 }}>
        Fonctionnalité disponible à partir du plan <strong style={{ color: plan.color }}>{plan.name}</strong>
      </p>
      <a href="/settings/billing" style={{
        display: 'inline-block',
        padding: '8px 20px',
        borderRadius: radius.md,
        background: colors.primary,
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 600,
        textDecoration: 'none',
      }}>
        Passer au plan {plan.name} ({plan.price}) →
      </a>
    </div>
  );
}

export function PlanGate({ required, currentPlan, children }: PlanGateProps) {
  if (required.includes(currentPlan)) return <>{children}</>;
  return <UpgradePrompt currentPlan={currentPlan} requiredPlan={required[0]!} />;
}
