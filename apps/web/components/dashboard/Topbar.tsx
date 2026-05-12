import { PLAN_CONFIG, type PlanType } from '@tiarh/ui';

interface TopbarProps {
  title: string;
  subtitle?: string;
  plan: PlanType;
  notifCount?: number;
}

export function Topbar({ title, subtitle, plan, notifCount = 0 }: TopbarProps) {
  const planConf = PLAN_CONFIG[plan];

  return (
    <header
      style={{
        height: 'var(--topbar-h)',
        background: 'var(--navy)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '14px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 20,
      }}
    >
      {/* Logo FP */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: 'var(--indigo)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontFamily: 'var(--font-ui)',
          fontSize: 13,
          fontWeight: 900,
          color: 'white',
          letterSpacing: '-0.03em',
        }}
      >
        FP
      </div>

      {/* Brand name */}
      <div style={{ flexShrink: 0 }}>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            fontWeight: 700,
            color: 'white',
            letterSpacing: '0.02em',
          }}
        >
          TIARH
        </span>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            color: 'rgba(255,255,255,0.45)',
            marginLeft: 6,
          }}
        >
          TerritorialRH Suite
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 24,
          background: 'rgba(255,255,255,0.15)',
          flexShrink: 0,
        }}
      />

      {/* Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: 'rgba(255,255,255,0.55)',
          fontFamily: 'var(--font-ui)',
        }}
      >
        <span>Mairie de Foix</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>›</span>
        <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{title}</span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Légifrance badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 4,
          padding: '5px 10px',
          flexShrink: 0,
        }}
      >
        <div
          className="lgf-dot"
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#4ADE80',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.75)',
            fontFamily: 'var(--font-ui)',
            letterSpacing: '0.02em',
          }}
        >
          Légifrance · Textes à jour
        </span>
      </div>

      {/* Plan badge */}
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 3,
          border: `1px solid ${planConf.color}50`,
          color: planConf.color,
          background: planConf.color + '20',
          fontFamily: 'var(--font-ui)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        {planConf.name}
      </span>

      {/* Export button */}
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '0 12px',
          height: 32,
          background: 'var(--indigo)',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'var(--font-ui)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <span>↓</span>
        <span>Exporter</span>
      </button>

      {/* Avatar FT */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--navy-mid)',
          border: '2px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.9)',
          fontFamily: 'var(--font-ui)',
          flexShrink: 0,
          cursor: 'pointer',
        }}
        title="Fred Themista"
      >
        FT
      </div>

      {notifCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#EF4444',
            color: 'white',
            fontSize: 9,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {notifCount}
        </div>
      )}
    </header>
  );
}
