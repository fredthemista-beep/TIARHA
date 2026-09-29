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
  FileCheck2,
  HeartPulse,
  ShieldCheck,
  UserPlus,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { Topbar } from '@/components/dashboard/Topbar';
import { TodayDate } from '@/components/dashboard/TodayDate';
import { CsvExportButton } from '@/components/dashboard/CsvExportButton';
import { DemoButton } from '@/components/ui/demo-toast';
import {
  ABSENCES_EN_COURS, AGENTS, CET_SEUIL_ALERTE, coutMensuel12Mois, getAgent, nomComplet, tauxAbsence12Mois,
} from '@/lib/demo-data';
import { fmtDateFr, fmtEuro } from '@/lib/format';

const titulaires = AGENTS.filter(a => a.statut === 'tit').length;
const contractuels = AGENTS.length - titulaires;
const coutEnCours = ABSENCES_EN_COURS.reduce((s, a) => s + a.cout + (a.coutRemplacement ?? 0), 0);
const dossiersLongs = ABSENCES_EN_COURS.filter(a => a.type === 'CLM' || a.type === 'CLD' || a.duree >= 60).length;
const taux = tauxAbsence12Mois();
const pctFr = (n: number) => (n * 100).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';

const KPI: { label: string; value: string; detail: string; tone: string; icon: typeof UsersRound; trend?: string; trendDirection?: 'up' | 'down' }[] = [
  {
    label: 'Agents (démo)',
    value: String(AGENTS.length),
    detail: `${titulaires} titulaires · ${contractuels} contractuels`,
    tone: 'blue',
    icon: UsersRound,
  },
  {
    label: 'Absences en cours',
    value: String(ABSENCES_EN_COURS.length),
    detail: `${dossiersLongs} dossiers longs à suivre`,
    tone: 'coral',
    icon: HeartPulse,
  },
  {
    label: 'Taux d’absence',
    value: pctFr(taux),
    detail: '12 mois glissants · objectif : moins de 6 %',
    trend: taux < 0.06 ? 'Sous l’objectif' : 'Au-dessus de l’objectif',
    trendDirection: taux < 0.06 ? 'up' : 'down',
    tone: 'mint',
    icon: Activity,
  },
  {
    label: 'Coût des arrêts en cours',
    value: fmtEuro(coutEnCours),
    detail: 'Maintien, charges et remplacements',
    tone: 'amber',
    icon: WalletCards,
  },
];

const TONE_BY_TYPE = { CLM: 'violet', CMO: 'amber', CLD: 'coral', AT: 'mint' } as const;

const DOSSIERS = [...ABSENCES_EN_COURS]
  .sort((a, b) => (b.cout + (b.coutRemplacement ?? 0)) - (a.cout + (a.coutRemplacement ?? 0)))
  .slice(0, 5);

/* ── Graphique : coût mensuel des arrêts, 12 derniers mois ── */
const SERIE = coutMensuel12Mois();
const TOTAL_12_MOIS = SERIE.reduce((s, m) => s + m.cout, 0);
const CHART_MAX = Math.max(4000, Math.ceil(Math.max(...SERIE.map(m => m.cout)) / 4000) * 4000);
const CHART_POINTS = SERIE.map((m, i) => ({
  x: Math.round((i * 760) / (SERIE.length - 1)),
  y: Math.round(200 - (m.cout / CHART_MAX) * 180),
}));
const CHART_LINE = CHART_POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
const CHART_AREA = `${CHART_LINE} L760 220 L0 220 Z`;
const CHART_LAST = CHART_POINTS[CHART_POINTS.length - 1];
const Y_LABELS = [1, 0.75, 0.5, 0.25, 0].map(f => (f === 0 ? '0' : `${((CHART_MAX * f) / 1000).toLocaleString('fr-FR')} k€`));

const sophie = getAgent('A002');
const sophieArret = sophie?.absences.find(a => a.enCours);
const cetAControler = AGENTS.filter(a => a.joursCET >= CET_SEUIL_ALERTE).length;

const PRIORITIES = [
  {
    label: `Valider la prolongation de ${sophie ? nomComplet(sophie) : 'Sophie Laurent'}`,
    meta: sophieArret ? `${sophieArret.type} depuis le ${fmtDateFr(sophieArret.debut)} · ${sophieArret.duree} jours` : 'CLM',
    href: '/agents/A002',
    icon: FileCheck2,
    tone: 'coral',
  },
  {
    label: 'Préparer le comité social territorial',
    meta: `Bilan des ${ABSENCES_EN_COURS.length} arrêts en cours`,
    href: '/agents/absences',
    icon: CalendarClock,
    tone: 'blue',
  },
  {
    label: `Contrôler ${cetAControler} compteurs CET`,
    meta: `Soldes ≥ ${CET_SEUIL_ALERTE} jours · plafond 60 jours`,
    href: '/simulations/heures?vue=cet',
    icon: Clock3,
    tone: 'amber',
  },
] as const;

const CSV_HEADERS = ['Matricule', 'Agent', 'Service', 'Motif', 'Début', 'Durée (j)', 'Coût employeur (€)', 'Coût remplacement (€)'];
const CSV_ROWS = ABSENCES_EN_COURS.map(a => [
  a.agent.id, nomComplet(a.agent), a.agent.service, a.type, fmtDateFr(a.debut), a.duree, a.cout, a.coutRemplacement ?? 0,
]);

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Vue d’ensemble" subtitle="Pilotage RH territorial" notifCount={3} />

      <div className="page-body dashboard-page">
        <section className="dashboard-intro" aria-labelledby="dashboard-title">
          <div>
            <span className="eyebrow"><TodayDate /></span>
            <h1 id="dashboard-title">Bonjour Fred, voici l’essentiel RH.</h1>
            <p>Les indicateurs et les échéances qui demandent votre attention aujourd’hui.</p>
          </div>
          <div className="dashboard-actions">
            <CsvExportButton filename="absences-en-cours" headers={CSV_HEADERS} rows={CSV_ROWS} />
            <DemoButton className="btn-primary"><UserPlus />Nouvel agent</DemoButton>
          </div>
        </section>

        <section className="dashboard-kpi-grid" aria-label="Indicateurs clés">
          {KPI.map(({ label, value, detail, trend, trendDirection, tone, icon: Icon }) => (
            <article className={`metric-card metric-${tone}`} key={label}>
              <div className="metric-card-top">
                <span className="metric-icon"><Icon aria-hidden="true" /></span>
                {trend && (
                  <span className={`metric-trend is-${trendDirection}`}>
                    {trendDirection === 'up' ? <ArrowUpRight aria-hidden="true" /> : <ArrowDownRight aria-hidden="true" />}
                    {trend}
                  </span>
                )}
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
                <span><i className="legend-current" />12 derniers mois</span>
              </div>
            </div>

            <div className="chart-summary">
              <div><strong>{fmtEuro(TOTAL_12_MOIS)}</strong><span>Coût employeur cumulé sur 12 mois</span></div>
            </div>

            <div className="line-chart" role="img" aria-label={`Coût mensuel des arrêts, de ${SERIE[0].mois} à ${SERIE[SERIE.length - 1].mois} : ${fmtEuro(TOTAL_12_MOIS)} au total`}>
              <div className="chart-y-axis">{Y_LABELS.map(l => <span key={l}>{l}</span>)}</div>
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
                <path className="chart-area" d={CHART_AREA} />
                <path className="chart-line-current" d={CHART_LINE} />
                <circle cx={CHART_LAST.x} cy={CHART_LAST.y} r="6" className="chart-endpoint" />
              </svg>
              <div className="chart-x-axis">{SERIE.map(m => <span key={m.mois}>{m.mois}</span>)}</div>
            </div>
          </section>

          <aside className="dashboard-panel priorities-panel" aria-labelledby="priorities-title">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">À traiter</span>
                <h2 id="priorities-title">Priorités du jour</h2>
              </div>
              <span className="count-badge">{PRIORITIES.length}</span>
            </div>

            <div className="priority-list">
              {PRIORITIES.map(({ label, meta, href, icon: Icon, tone }) => (
                <Link href={href} className="priority-item" key={label}>
                  <span className={`priority-icon tone-${tone}`}><Icon aria-hidden="true" /></span>
                  <span><strong>{label}</strong><small>{meta}</small></span>
                  <ArrowRight aria-hidden="true" />
                </Link>
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
                {DOSSIERS.map(abs => {
                  const tone = TONE_BY_TYPE[abs.type];
                  const nom = nomComplet(abs.agent);
                  return (
                    <tr key={abs.id}>
                      <td><div className="agent-cell"><span className={`agent-avatar avatar-${tone}`}>{abs.agent.initiales}</span><span><strong>{nom}</strong><small>{abs.agent.service}</small></span></div></td>
                      <td><span className={`absence-chip chip-${tone}`}>{abs.type}</span></td>
                      <td><strong>{abs.duree} jours</strong></td>
                      <td className="amount-cell">{fmtEuro(abs.cout + (abs.coutRemplacement ?? 0))}</td>
                      <td><span className="status-dot"><i />À jour</span></td>
                      <td><Link href={`/agents/${abs.agent.id}`} className="row-action" aria-label={`Ouvrir le dossier de ${nom}`}><ArrowRight /></Link></td>
                    </tr>
                  );
                })}
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
