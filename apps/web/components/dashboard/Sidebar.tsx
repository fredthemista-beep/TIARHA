'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid, CircleDollarSign, Calendar, Clock,
  BarChart3, Settings,
} from 'lucide-react';

const NAV = [
  { href: '/',                              label: 'Tableau de bord', Icon: LayoutGrid },
  { href: '/simulations/arret',             label: 'SimulArrêt',       Icon: CircleDollarSign },
  { href: '/simulations/retraite',          label: 'RetireSim',        Icon: BarChart3 },
  { href: '/simulations/heures',            label: 'HeuresSup+',       Icon: Calendar },
  { href: '/simulations/annualisation',     label: 'AnnualisationRH',  Icon: Clock },
  { href: '/settings',                      label: 'Paramètres',        Icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] bg-navy flex flex-col py-5 shrink-0">
      {/* Logo */}
      <div className="px-5 pb-6 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
            <path d="M6 9h20M6 15h13M6 21h16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="24" cy="21" r="3" fill="white"/>
          </svg>
        </div>
        <div>
          <p className="text-white text-sm font-bold leading-tight">TIARH</p>
          <p className="text-[10px] text-midblue font-medium">TerritorialRH Suite</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2.5">
        {NAV.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium transition-all ${
                active
                  ? 'bg-accent/20 text-accent'
                  : 'text-[#8b9ab3] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
