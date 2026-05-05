// packages/ui/src/KpiCard.tsx
import React from 'react';
import { colors, radius, typography } from './tokens';

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  trend: number;        // positive = up, negative = down
  accentColor?: string;
  sparkData?: number[];
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 120, h = 40;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const pathD = `M${pts.join(' L')}`;
  const fillD = `${pathD} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <path d={fillD} fill={color} opacity={0.12} />
      <path d={pathD} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function KpiCard({ label, value, sub, trend, accentColor = colors.primary, sparkData }: KpiCardProps) {
  const trendUp = trend >= 0;
  return (
    <div style={{
      background: colors.surface,
      borderRadius: radius.xl,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      border: `1px solid ${colors.border}`,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: typography.fontSans,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
          <p style={{ fontSize: '1.625rem', fontWeight: 700, fontFamily: typography.fontMono, color: colors.text, lineHeight: 1 }}>{value}</p>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: trendUp ? colors.success : colors.danger, background: trendUp ? '#f0fdf4' : '#fef2f2', padding: '3px 8px', borderRadius: 20 }}>
          {trendUp ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      </div>
      {sparkData && <Sparkline data={sparkData} color={accentColor} />}
      {sub && <p style={{ fontSize: '0.6875rem', color: colors.textMuted, marginTop: -2 }}>{sub}</p>}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 4, height: '100%', background: accentColor }} />
    </div>
  );
}
