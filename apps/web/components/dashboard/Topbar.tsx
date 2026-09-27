import { Bell, CircleHelp, Landmark, Search } from 'lucide-react';
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
    <header className="app-topbar">
      <div className="topbar-mobile-brand" aria-label="TIARHA">
        <Landmark aria-hidden="true" />
        <strong>TIARHA</strong>
      </div>

      <div className="topbar-heading">
        <div className="topbar-breadcrumb">
          <span>Mairie de Foix</span>
          <span aria-hidden="true">/</span>
          <strong>{title}</strong>
        </div>
        {subtitle && <span className="topbar-subtitle">{subtitle}</span>}
      </div>

      <label className="topbar-search">
        <Search aria-hidden="true" />
        <span className="sr-only">Rechercher dans TIARHA</span>
        <input type="search" placeholder="Rechercher un agent, un dossier…" />
        <kbd>⌘ K</kbd>
      </label>

      <div className="topbar-actions">
        <div className="legal-status" title="Référentiel juridique synchronisé">
          <span className="lgf-dot" />
          Textes à jour
        </div>
        <span className="plan-chip" style={{ '--plan-color': planConf.color } as React.CSSProperties}>
          {planConf.name}
        </span>
        <button type="button" className="topbar-icon-button" aria-label="Aide">
          <CircleHelp aria-hidden="true" />
        </button>
        <button type="button" className="topbar-icon-button" aria-label={`Notifications : ${notifCount} non lues`}>
          <Bell aria-hidden="true" />
          {notifCount > 0 && <span className="notification-count">{notifCount}</span>}
        </button>
        <button type="button" className="topbar-profile" aria-label="Ouvrir le profil de Fred Themista">
          <span>FT</span>
          <span className="topbar-profile-copy">
            <strong>Fred Themista</strong>
            <small>Administrateur RH</small>
          </span>
        </button>
      </div>
    </header>
  );
}
