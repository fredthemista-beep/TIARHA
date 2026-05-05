import { Bell } from 'lucide-react';
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
    <header className="h-[60px] bg-white border-b border-black/5 flex items-center px-7 gap-4 shrink-0">
      <div className="flex-1">
        <p className="text-[18px] font-bold text-navy tracking-tight">{title}</p>
        {subtitle && <p className="text-[11px] text-muted">{subtitle}</p>}
      </div>
      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-[10px] px-3.5 py-2 w-52">
        <svg className="w-3.5 h-3.5 text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input placeholder="Rechercher..." className="bg-transparent text-[13px] text-navy outline-none w-full placeholder:text-muted" />
      </div>
      {/* Plan badge */}
      <span className="text-[11px] font-bold px-3.5 py-1.5 rounded-full border" style={{ color: planConf.color, background: planConf.color + '18', borderColor: planConf.color + '40' }}>
        {planConf.name}
      </span>
      {/* Bell */}
      <div className="relative cursor-pointer">
        <div className="p-2 rounded-lg bg-gray-100 flex">
          <Bell size={16} className="text-muted" />
        </div>
        {notifCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
            {notifCount}
          </span>
        )}
      </div>
    </header>
  );
}
