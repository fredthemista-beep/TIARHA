'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  CalendarDays,
  ChevronDown,
  Clock3,
  Gauge,
  HeartPulse,
  Landmark,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Pilotage',
    items: [
      { href: '/', label: 'Vue d’ensemble', shortLabel: 'Accueil', icon: LayoutDashboard },
      { href: '/agents', label: 'Dossiers agents', shortLabel: 'Agents', icon: UsersRound },
      { href: '/agents/absences', label: 'Absences & santé', shortLabel: 'Absences', icon: HeartPulse },
    ],
  },
  {
    title: 'Aide à la décision',
    items: [
      { href: '/simulations/arret', label: 'Coût des arrêts', shortLabel: 'Arrêts', icon: Activity },
      { href: '/simulations/retraite', label: 'Projection retraite', shortLabel: 'Retraite', icon: Gauge },
      { href: '/simulations/heures', label: 'Heures & CET', shortLabel: 'Heures', icon: Clock3 },
      { href: '/simulations/annualisation', label: 'Annualisation', shortLabel: 'Planning', icon: CalendarDays },
    ],
  },
];

function isItemActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  if (href === '/agents') return pathname === href || /^\/agents\/(?!absences)/.test(pathname);
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="sidebar-section">
      <p className="sidebar-section-title">{title}</p>
      <div className="sidebar-links">
        {items.map(({ href, label, shortLabel, icon: Icon }) => {
          const active = isItemActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
              title={label}
            >
              <Icon aria-hidden="true" />
              <span className="sidebar-link-label">{label}</span>
              <span className="sidebar-link-short">{shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const settingsActive = pathname.startsWith('/settings');

  return (
    <aside className="app-sidebar" aria-label="Navigation principale">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark" aria-hidden="true">
          <Landmark />
        </div>
        <div className="sidebar-brand-copy">
          <strong>TIARHA</strong>
          <span>Bureau RH territorial</span>
        </div>
      </div>

      <button type="button" className="sidebar-collectivity" aria-label="Changer de collectivité">
        <span className="sidebar-collectivity-mark">MF</span>
        <span>
          <strong>Mairie de Foix</strong>
          <small>1 240 agents · Plan Pro</small>
        </span>
        <ChevronDown aria-hidden="true" />
      </button>

      <nav className="sidebar-nav">
        {NAV_SECTIONS.map(section => (
          <NavSection key={section.title} {...section} />
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-trust-card">
          <ShieldCheck aria-hidden="true" />
          <div>
            <strong>Données protégées</strong>
            <span>RLS actif · Hébergement UE</span>
          </div>
        </div>
        <Link
          href="/settings"
          className={`sidebar-link${settingsActive ? ' is-active' : ''}`}
          aria-current={settingsActive ? 'page' : undefined}
        >
          <Settings2 aria-hidden="true" />
          <span className="sidebar-link-label">Paramètres</span>
          <span className="sidebar-link-short">Réglages</span>
        </Link>
      </div>
    </aside>
  );
}
