import { Topbar } from '@/components/dashboard/Topbar';

const MONTHS = ['Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc','Jan','Fév','Mar','Avr'];
const CHART_VALS = [28400,31200,29800,35600,22100,38900,41200,33700,29500,44800,38200,42180];
const CHART_MAX = Math.max(...CHART_VALS);

const AGENTS = [
  { initiales:'MD', nom:'Dubois Martin',  statut:'tit',  cat:'B', im:460, type:'CMO', duree:23,  cout:3842  },
  { initiales:'SL', nom:'Laurent Sophie', statut:'tit',  cat:'A', im:620, type:'CLM', duree:87,  cout:18750 },
  { initiales:'JM', nom:'Moreau Jean',    statut:'cont', cat:'C', im:340, type:'CMO', duree:12,  cout:1240  },
  { initiales:'AB', nom:'Bernard Alice',  statut:'tit',  cat:'C', im:380, type:'AT',  duree:45,  cout:6320  },
  { initiales:'TC', nom:'Colin Thomas',   statut:'tit',  cat:'B', im:500, type:'CMO', duree:8,   cout:1870  },
  { initiales:'MR', nom:'Richard Marie',  statut:'cont', cat:'B', im:460, type:'CMO', duree:30,  cout:3200  },
  { initiales:'PV', nom:'Vincent Paul',   statut:'tit',  cat:'A', im:680, type:'CLD', duree:180, cout:42000 },
];

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function PhaseBadge({ type, duree }: { type: string; duree: number }) {
  if (type === 'AT')                     return <span className="badge badge-ok">Illimité</span>;
  if (type === 'CMO' && duree <= 90)     return <span className="badge badge-cont">Phase 1</span>;
  if (type === 'CMO' && duree <= 180)    return <span className="badge badge-cmo">Phase 2</span>;
  if (type === 'CLM')                    return <span className="badge badge-clm">CLM</span>;
  if (type === 'CLD')                    return <span className="badge badge-cld">CLD</span>;
  return <span className="badge badge-cmo">Phase 3</span>;
}

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Tableau de bord agents" subtitle="Mairie de Foix" plan="pro" notifCount={3} />

      {/* Page header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <div className="page-title">Tableau de bord agents</div>
            <div className="page-subtitle">
              <span className="legal-tag">Multi-tenant RLS</span>
              Mairie de Foix · 1 240 agents actifs
            </div>
          </div>
          <div className="btn-row">
            <button className="btn-secondary">↑ Importer XLSX</button>
            <button className="btn-primary">+ Nouvel agent</button>
          </div>
        </div>
        <div className="sub-nav">
          <button className="sub-tab active">Tous les agents</button>
          <button className="sub-tab">Absences en cours (7)</button>
          <button className="sub-tab">CET — alertes (3)</button>
        </div>
      </div>

      <div className="page-body">

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          <div className="kpi-card navy">
            <div className="kpi-label">Agents actifs</div>
            <div className="kpi-value">1 240</div>
            <div className="kpi-meta">62% titulaires · 38% contractuels</div>
          </div>
          <div className="kpi-card danger">
            <div className="kpi-label">En arrêt actuellement</div>
            <div className="kpi-value danger">7</div>
            <div className="kpi-meta">
              <span style={{ color: 'var(--danger)', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 11 }}>↑ +2</span>
              vs semaine dernière
            </div>
          </div>
          <div className="kpi-card amber">
            <div className="kpi-label">Taux d&apos;absence</div>
            <div className="kpi-value amber">5,6%</div>
            <div className="kpi-meta">Moy. FPT : 13,7 j/an/ETP</div>
          </div>
          <div className="kpi-card teal">
            <div className="kpi-label">Coût absences M en cours</div>
            <div className="kpi-value teal">42 180 €</div>
            <div className="kpi-meta">Estimation charges employeur</div>
          </div>
        </div>

        {/* Bar chart card */}
        <div className="ds-card" style={{ marginBottom: 16 }}>
          <div className="ds-card-header" style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 24, height: 24, borderRadius: 5,
                  background: 'var(--info-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                }}
              >📈</span>
              Coût mensuel absences — 12 derniers mois
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>Charges employeur · €</span>
          </div>
          <div className="ds-card-body">
            <div className="chart-bars">
              {CHART_VALS.map((v, i) => {
                const h = Math.round((v / CHART_MAX) * 120);
                const isLast = i === CHART_VALS.length - 1;
                const color = isLast ? 'var(--danger)' : v > 38000 ? 'var(--amber)' : 'var(--indigo)';
                return (
                  <div key={i} className="chart-bar-wrap">
                    <div style={{
                      fontSize: 9,
                      color: isLast ? 'var(--danger)' : 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: isLast ? 700 : 400,
                    }}>
                      {Math.round(v / 1000)}k
                    </div>
                    <div
                      className="chart-bar"
                      style={{ height: h, background: color, opacity: isLast ? 1 : 0.7 }}
                    />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', padding: '0 4px' }}>
              {MONTHS.map(m => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        {/* Agents table card */}
        <div className="ds-card">
          <div className="ds-card-header" style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 24, height: 24, borderRadius: 5,
                  background: 'var(--info-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                }}
              >👥</span>
              Agents — Absences en cours et récentes
            </span>
            <button className="btn-secondary" style={{ fontSize: 11, padding: '5px 10px', height: 'auto' }}>
              ↓ Exporter XLSX
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Statut</th>
                <th>Cat.</th>
                <th>IM</th>
                <th>Type arrêt</th>
                <th>Durée</th>
                <th>Coût employeur</th>
                <th>Phase</th>
              </tr>
            </thead>
            <tbody>
              {AGENTS.map(a => (
                <tr key={a.nom}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        className="agent-avatar"
                        style={{ background: a.statut === 'tit' ? 'var(--indigo)' : 'var(--teal)' }}
                      >
                        {a.initiales}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{a.nom}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Grade {a.cat} · IM {a.im}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${a.statut}`}>
                      {a.statut === 'tit' ? 'Titulaire' : 'Contractuel'}
                    </span>
                  </td>
                  <td><strong>{a.cat}</strong></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{a.im}</td>
                  <td>
                    <span className={`badge badge-${a.type.toLowerCase()}`}>{a.type}</span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{a.duree} j</td>
                  <td className="amount-cell red">{fmt(a.cout)}</td>
                  <td><PhaseBadge type={a.type} duree={a.duree} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}
