'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AGENTS = [
  { href: '/',                  label: 'Tableau de bord', icon: '👥' },
  { href: '/agents',            label: 'Liste des agents', icon: '📋' },
  { href: '/agents/absences',   label: 'Absences en cours', icon: '📅' },
] as const;

const SIMULATEURS = [
  { href: '/simulations/arret',        label: 'SimulArrêt',      icon: '🩺' },
  { href: '/simulations/retraite',     label: 'RetireSim',       icon: '📊' },
  { href: '/simulations/heures',       label: 'HeuresSup+',      icon: '⏱' },
  { href: '/simulations/annualisation',label: 'AnnualisationRH', icon: '🗓' },
] as const;

const PARAMETRES = [
  { href: '/settings', label: 'Paramètres', icon: '⚙️' },
] as const;

function NavSection({ title, items }: { title: string; items: readonly { href: string; label: string; icon: string }[] }) {
  const pathname = usePathname();
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          padding: '10px 16px 5px',
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-ui)',
        }}
      >
        {title}
      </div>
      {items.map(({ href, label, icon }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '8px 14px 8px 14px',
              marginLeft: 0,
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              fontFamily: 'var(--font-ui)',
              color: active ? 'var(--navy)' : 'var(--text-secondary)',
              background: active ? 'var(--info-bg)' : 'transparent',
              borderLeft: active ? '2px solid var(--indigo)' : '2px solid transparent',
              textDecoration: 'none',
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseEnter={e => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside
      style={{
        width: 'var(--sidebar-w)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      {/* Org header */}
      <div
        style={{
          padding: '16px 16px 14px',
          borderBottom: '1px solid var(--border-soft)',
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--navy)',
            fontFamily: 'var(--font-ui)',
            marginBottom: 2,
          }}
        >
          Mairie de Foix
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          Service RH — 1 247 agents
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, paddingTop: 8 }}>
        <NavSection title="Agents" items={AGENTS} />
        <NavSection title="Simulateurs" items={SIMULATEURS} />
        <NavSection title="Paramètres" items={PARAMETRES} />
      </nav>

      {/* Footer version */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-soft)',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--success)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Moteur v1.0.0
        </span>
      </div>
    </aside>
  );
}
