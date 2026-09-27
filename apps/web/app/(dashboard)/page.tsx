import Link from 'next/link';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Download,
  FileCheck2,
  HeartPulse,
  ShieldCheck,
  UserPlus,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { Topbar } from '@/components/dashboard/Topbar';

const KPI = [
  {
    label: 'Agents actifs',
    value: '1 240',
    detail: '62 % titulaires · 38 % contractuels',
    trend: '+1,8 %',
    trendDirection: 'up',
    tone: 'blue',
    icon: UsersRound,
  },
  {
    label: 'Absences en cours',
    value: '7',
    detail: '2 changements de phase à anticiper',
    trend: '+2',
    trendDirection: 'down',
    tone: 'coral',
    icon: HeartPulse,
  },
  {
    label: 'Taux d’absence',
    value: '5,6 %',
    detail: 'Objectif collectivité : moins de 6 %',
    trend: '−0,4 pt',
    trendDirection: 'up',
    tone: 'mint',
    icon: Activity,
  },
  {
    label: 'Coût estimé ce mois',
    value: '42 180 €',
    detail: 'Charges employeur et remplacements',
    trend: '+6,2 %',
    trendDirection: 'down',
    tone: 'amber',
    icon: WalletCards,
  },
] as const;

const AGENTS = [
  { initiales: 'SL', nom: 'Sophie Laurent', service: 'Direction générale', type: 'CLM', duree: 87, cout: '18 750 €', tone: 'violet' },
  { initiales: 'MD', nom: 'Martin Dubois', service: 'Ressources humaines', type: 'CMO', duree: 23, cout: '3 842 €', tone: 'blue' },
  { initiales: 'PV', nom: 'Paul Vincent', service: 'Voirie', type: 'CLD', duree: 180, cout: '42 000 €', tone: 'coral' },
  { initiales: 'AB', nom: 'Alice Bernard', service: 'Bâtiments', type: 'AT', duree: 45, cout: '6 320 €', tone: 'mint' },
  { initiales: 'JM', nom: 'Jean Moreau', service: 'Accueil', type: 'CMO', duree: 12, cout: '1 240 €', tone: 'amber' },
] as const;

const PRIORITIES = [
  { label: 'Valider la prolongation de Sophie Laurent', meta: 'Échéance aujourd’hui · CLM', icon: FileCheck2, tone: 'coral' },
  { label: 'Préparer le comité social territorial', meta: 'Demain · 09:30', icon: CalendarClock, tone: 'blue' },
  { label: 'Contrôler 3 compteurs CET', meta: 'Avant vendredi', icon: Clock3, tone: 'amber' },
] as const;

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Vue d’ensemble" subtitle="Pilotage RH territorial" plan="pro" notifCount={3} />

      <div className="page-body dashboard-page">
        <section className="dashboard-intro" aria-labelledby="dashboard-title">
          <div>
            <span className="eyebrow">Samedi 27 septembre 2026</span>
            <h1 id="dashboard-title">Bonjour Fred, voici l’essentiel RH.</h1>
            <p>Les indicateurs et les échéances qui demandent votre attention aujourd’hui.</p>
          </div>
          <div className="dashboard-actions">
            <button type="button" className="btn-secondary"><Download />Exporter</button>
            <Link href="/agents" className="btn-primary"><UserPlus />Nouvel agent</Link>
          </div>
        </section>

        <section className="dashboard-kpi-grid" aria-label="Indicateurs clés">
          {KPI.map(({ label, value, detail, trend, trendDirection, tone, icon: Icon }) => (
            <article className={`metric-card metric-${tone}`} key={label}>
              <div className="metric-card-top">
                <span className="metric-icon"><Icon aria-hidden="true" /></span>
                <span className={`metric-trend is-${trendDirection}`}>
                  {trendDirection === 'up' ? <ArrowUpRight aria-hidden="true" /> : <ArrowDownRight aria-hidden="true" />}
                  {trend}
                </span>
              </div>
              <strong className="metric-value">{value}</strong>
              <span className="metric-label">{label}</span>
              <p>{detail}</p>
            </article>
          ))}
        </section>

        <div className="dashboard-primary-grid">
          <section className="dashboard-panel chart-panel" aria-labelledby="cost-chart-title">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Analyse sur 12 mois</span>
                <h2 id="cost-chart-title">Coût des absences</h2>
              </div>
              <div className="chart-legend" aria-label="Légende">
                <span><i className="legend-current" />2026</span>
                <span><i className="legend-previous" />2025</span>
              </div>
            </div>

            <div className="chart-summary">
              <div><strong>421 680 €</strong><span>Total annuel estimé</span></div>
              <span className="positive-delta"><ArrowDownRight /> −4,8 % vs 2025</span>
            </div>

            <div className="line-chart" role="img" aria-label="Le coût mensuel des absences progresse jusqu’en mars puis recule légèrement en avril">
              <div className="chart-y-axis"><span>50 k€</span><span>40 k€</span><span>30 k€</span><span>20 k€</span><span>10 k€</span></div>
              <svg viewBox="0 0 760 220" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="costArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--indigo)" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="var(--indigo)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g className="chart-grid-lines">
                  <line x1="0" y1="20" x2="760" y2="20" /><line x1="0" y1="65" x2="760" y2="65" />
                  <line x1="0" y1="110" x2="760" y2="110" /><line x1="0" y1="155" x2="760" y2="155" />
                  <line x1="0" y1="200" x2="760" y2="200" />
                </g>
                <path className="chart-area" d="M0 154 C55 140 72 132 126 138 S210 116 252 126 S332 83 380 92 S458 64 506 71 S584 40 632 57 S706 35 760 46 L760 220 L0 220 Z" />
                <path className="chart-line-previous" d="M0 164 C55 151 76 148 126 150 S205 132 252 139 S330 112 380 117 S456 88 506 94 S584 70 632 74 S708 58 760 66" />
                <path className="chart-line-current" d="M0 154 C55 140 72 132 126 138 S210 116 252 126 S332 83 380 92 S458 64 506 71 S584 40 632 57 S706 35 760 46" />
                <circle cx="760" cy="46" r="6" className="chart-endpoint" />
              </svg>
              <div className="chart-x-axis"><span>Mai</span><span>Juin</span><span>Juil.</span><span>Août</span><span>Sept.</span><span>Oct.</span><span>Nov.</span><span>Déc.</span><span>Janv.</span><span>Févr.</span><span>Mars</span><span>Avr.</span></div>
            </div>
          </section>

          <aside className="dashboard-panel priorities-panel" aria-labelledby="priorities-title">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">À traiter</span>
                <h2 id="priorities-title">Priorités du jour</h2>
              </div>
              <span className="count-badge">3</span>
            </div>

            <div className="priority-list">
              {PRIORITIES.map(({ label, meta, icon: Icon, tone }) => (
                <button type="button" className="priority-item" key={label}>
                  <span className={`priority-icon tone-${tone}`}><Icon aria-hidden="true" /></span>
                  <span><strong>{label}</strong><small>{meta}</small></span>
                  <ArrowRight aria-hidden="true" />
                </button>
              ))}
            </div>

            <div className="compliance-card">
              <div className="compliance-icon"><ShieldCheck aria-hidden="true" /></div>
              <div>
                <strong>Référentiel à jour</strong>
                <span>Dernière synchronisation aujourd’hui à 06:15</span>
              </div>
              <CheckCircle2 aria-hidden="true" />
            </div>
          </aside>
        </div>

        <section className="dashboard-panel agents-panel" aria-labelledby="agents-watch-title">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Suivi opérationnel</span>
              <h2 id="agents-watch-title">Dossiers à surveiller</h2>
            </div>
            <Link href="/agents/absences" className="text-link">Voir toutes les absences <ArrowRight /></Link>
          </div>

          <div className="responsive-table">
            <table className="data-table modern-table">
              <thead><tr><th>Agent</th><th>Motif</th><th>Durée</th><th>Coût employeur</th><th>État du dossier</th><th><span className="sr-only">Action</span></th></tr></thead>
              <tbody>
                {AGENTS.map(agent => (
                  <tr key={agent.nom}>
                    <td><div className="agent-cell"><span className={`agent-avatar avatar-${agent.tone}`}>{agent.initiales}</span><span><strong>{agent.nom}</strong><small>{agent.service}</small></span></div></td>
                    <td><span className={`absence-chip chip-${agent.tone}`}>{agent.type}</span></td>
                    <td><strong>{agent.duree} jours</strong></td>
                    <td className="amount-cell">{agent.cout}</td>
                    <td><span className="status-dot"><i />À jour</span></td>
                    <td><button type="button" className="row-action" aria-label={`Ouvrir le dossier de ${agent.nom}`}><ArrowRight /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="dashboard-footer-note">
          <CircleAlert aria-hidden="true" />
          <span>Les données affichées sont des données de démonstration. Les calculs sont fournis à titre indicatif.</span>
        </div>
      </div>
    </>
  );
}
