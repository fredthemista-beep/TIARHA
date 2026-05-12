import { Topbar } from '@/components/dashboard/Topbar';

type Absence = {
  id: string;
  initiales: string;
  nom: string;
  statut: 'tit' | 'cont';
  cat: 'A' | 'B' | 'C';
  im: number;
  service: string;
  type: 'CMO' | 'CLM' | 'CLD' | 'AT' | 'CSS' | 'PA';
  phase: 1 | 2 | 3 | null;
  debut: string;
  fin: string | null;
  duree: number;
  coutEmployeur: number;
  remplacement: boolean;
  coutRemplacement: number | null;
};

const ABSENCES: Absence[] = [
  {
    id: 'ABS-2026-047', initiales: 'SL', nom: 'Laurent Sophie',  statut: 'tit',  cat: 'A', im: 620,
    service: 'Direction générale', type: 'CLM', phase: null,
    debut: '2026-03-15', fin: null,        duree: 58,  coutEmployeur: 18750, remplacement: false, coutRemplacement: null,
  },
  {
    id: 'ABS-2026-051', initiales: 'MD', nom: 'Dubois Martin',   statut: 'tit',  cat: 'B', im: 460,
    service: 'DRH',               type: 'CMO', phase: 1,
    debut: '2026-04-20', fin: '2026-05-19', duree: 29,  coutEmployeur: 3842,  remplacement: false, coutRemplacement: null,
  },
  {
    id: 'ABS-2026-038', initiales: 'PV', nom: 'Vincent Paul',    statut: 'tit',  cat: 'A', im: 680,
    service: 'Voirie',            type: 'CLD', phase: null,
    debut: '2025-11-01', fin: null,        duree: 192, coutEmployeur: 42000, remplacement: true,  coutRemplacement: 18600,
  },
  {
    id: 'ABS-2026-055', initiales: 'JM', nom: 'Moreau Jean',     statut: 'cont', cat: 'C', im: 340,
    service: 'Accueil',           type: 'CMO', phase: 1,
    debut: '2026-05-02', fin: '2026-05-16', duree: 14,  coutEmployeur: 1240,  remplacement: false, coutRemplacement: null,
  },
  {
    id: 'ABS-2026-029', initiales: 'AB', nom: 'Bernard Alice',   statut: 'tit',  cat: 'C', im: 380,
    service: 'Bâtiments',         type: 'AT',  phase: null,
    debut: '2025-12-10', fin: null,        duree: 153, coutEmployeur: 6320,  remplacement: true,  coutRemplacement: 9800,
  },
  {
    id: 'ABS-2026-058', initiales: 'MR', nom: 'Richard Marie',   statut: 'cont', cat: 'B', im: 460,
    service: 'Communication',     type: 'CMO', phase: 1,
    debut: '2026-05-05', fin: '2026-06-03', duree: 29,  coutEmployeur: 3200,  remplacement: false, coutRemplacement: null,
  },
  {
    id: 'ABS-2026-060', initiales: 'TC', nom: 'Colin Thomas',    statut: 'tit',  cat: 'B', im: 500,
    service: 'Informatique',      type: 'CMO', phase: 1,
    debut: '2026-05-08', fin: '2026-05-22', duree: 14,  coutEmployeur: 1870,  remplacement: false, coutRemplacement: null,
  },
];

const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  CMO: { label: 'CMO',  color: 'var(--amber)',   bg: 'var(--amber-bg)' },
  CLM: { label: 'CLM',  color: 'var(--indigo)',  bg: 'var(--info-bg)' },
  CLD: { label: 'CLD',  color: 'var(--danger)',  bg: 'var(--danger-bg)' },
  AT:  { label: 'AT',   color: 'var(--success)', bg: 'var(--success-bg)' },
  CSS: { label: 'CSS',  color: 'var(--teal)',    bg: 'var(--teal-bg)' },
  PA:  { label: 'PA',   color: 'var(--text-muted)', bg: 'var(--surface-2)' },
};

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function PhaseBadge({ type, duree }: { type: string; duree: number }) {
  if (type === 'AT')                  return <span className="badge badge-ok">Illimité</span>;
  if (type === 'CLM')                 return <span className="badge badge-clm">CLM</span>;
  if (type === 'CLD')                 return <span className="badge badge-cld">CLD</span>;
  if (type === 'CMO' && duree <= 90)  return <span className="badge badge-cont">Phase 1</span>;
  if (type === 'CMO' && duree <= 180) return <span className="badge badge-cmo">Phase 2</span>;
  return <span className="badge badge-cmo">Phase 3</span>;
}

function DureeBadge({ duree, type }: { duree: number; type: string }) {
  const isLong = (type === 'CLD') || (type === 'CLM') || duree > 90;
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 12,
      fontWeight: isLong ? 700 : 400,
      color: isLong ? 'var(--danger)' : 'var(--text-primary)',
    }}>
      {duree} j
    </span>
  );
}

const totalCout      = ABSENCES.reduce((s, a) => s + a.coutEmployeur + (a.coutRemplacement ?? 0), 0);
const avecRemplacement = ABSENCES.filter(a => a.remplacement).length;

export default function AbsencesPage() {
  return (
    <>
      <Topbar title="Absences" subtitle="Suivi temps réel — FPT" plan="pro" notifCount={3} />

      <div className="page-header">
        <div className="page-header-top">
          <div>
            <div className="page-title">Absences en cours</div>
            <div className="page-subtitle">
              <span className="legal-tag">CGFP L822-1</span>
              <span className="legal-tag">Décret 87-602</span>
              Mairie de Foix · Suivi actif {ABSENCES.length} arrêts · Mai 2026
            </div>
          </div>
          <div className="btn-row">
            <button className="btn-secondary">📄 Tableaux de bord RH</button>
            <button className="btn-primary">+ Saisir un arrêt</button>
          </div>
        </div>
        <div className="sub-nav">
          <button className="sub-tab active">En cours ({ABSENCES.length})</button>
          <button className="sub-tab">Historique</button>
          <button className="sub-tab">Statistiques</button>
        </div>
      </div>

      <div className="page-body">

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          <div className="kpi-card danger">
            <div className="kpi-label">Arrêts actifs</div>
            <div className="kpi-value danger">{ABSENCES.length}</div>
            <div className="kpi-meta">
              <span style={{ color: 'var(--danger)', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 11 }}>↑ +2</span>
              {' '}vs semaine dernière
            </div>
          </div>
          <div className="kpi-card amber">
            <div className="kpi-label">Coût employeur total</div>
            <div className="kpi-value amber" style={{ fontSize: 20 }}>{fmt(totalCout)}</div>
            <div className="kpi-meta">Charges + remplacements</div>
          </div>
          <div className="kpi-card indigo">
            <div className="kpi-label">Avec remplacement</div>
            <div className="kpi-value indigo">{avecRemplacement}</div>
            <div className="kpi-meta">Postes remplacés</div>
          </div>
          <div className="kpi-card teal">
            <div className="kpi-label">Durée moy. arrêt</div>
            <div className="kpi-value teal">
              {Math.round(ABSENCES.reduce((s, a) => s + a.duree, 0) / ABSENCES.length)} j
            </div>
            <div className="kpi-meta">Tous types confondus</div>
          </div>
        </div>

        {/* Alertes */}
        <div className="notice-warning" style={{ marginBottom: 16 }}>
          <span>⚠</span>
          <div>
            <strong>Alertes :</strong> 2 agents approchent d&apos;un changement de phase CMO (90 j) ·
            1 CLD en cours depuis {'>'}180 j nécessite un bilan médical de contrôle.
          </div>
        </div>

        {/* Type breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
          {(['CMO','CLM','CLD','AT','CSS','PA'] as const).map(type => {
            const n = ABSENCES.filter(a => a.type === type).length;
            if (n === 0) return null;
            const meta = TYPE_META[type];
            return (
              <div key={type} className="ds-card" style={{ padding: 0 }}>
                <div style={{
                  padding: '12px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      display: 'inline-block', width: 8, height: 8,
                      borderRadius: '50%', background: meta.color,
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {type === 'CMO' ? 'Congé maladie ordinaire' :
                       type === 'CLM' ? 'Congé longue maladie' :
                       type === 'CLD' ? 'Congé longue durée' :
                       type === 'AT'  ? 'Accident de travail' :
                       type === 'CSS' ? 'Congé spécial santé' :
                       'Pas d\'agent'}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700,
                    color: meta.color,
                  }}>
                    {n}
                  </span>
                </div>
                <div style={{
                  height: 3,
                  background: meta.bg,
                  borderTop: `1px solid ${meta.color}22`,
                  borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
                }}>
                  <div style={{
                    height: '100%', width: `${(n / ABSENCES.length) * 100}%`,
                    background: meta.color, borderRadius: 'inherit',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Main table */}
        <div className="ds-card">
          <div className="ds-card-header" style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 24, height: 24, borderRadius: 5, background: 'var(--danger-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
              }}>📅</span>
              Arrêts en cours — {ABSENCES.length} agents concernés
            </span>
            <button className="btn-secondary" style={{ fontSize: 11, padding: '5px 10px', height: 'auto' }}>
              ↓ Exporter XLSX
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Réf.</th>
                <th>Type</th>
                <th>Début</th>
                <th>Fin prévue</th>
                <th>Durée</th>
                <th>Phase</th>
                <th>Coût employeur</th>
                <th>Remplacement</th>
                <th>Coût total</th>
              </tr>
            </thead>
            <tbody>
              {ABSENCES.map(a => {
                const meta = TYPE_META[a.type];
                const total = a.coutEmployeur + (a.coutRemplacement ?? 0);
                return (
                  <tr key={a.id}>
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
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Cat. {a.cat} · IM {a.im} · {a.service}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                      {a.id}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: meta.bg, color: meta.color,
                        fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-ui)',
                      }}>
                        {meta.label}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {new Date(a.debut).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: a.fin ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {a.fin ? new Date(a.fin).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td><DureeBadge duree={a.duree} type={a.type} /></td>
                    <td><PhaseBadge type={a.type} duree={a.duree} /></td>
                    <td className="amount-cell red">{fmt(a.coutEmployeur)}</td>
                    <td>
                      {a.remplacement
                        ? <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>✓ Oui</span>
                        : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td className="amount-cell red" style={{ fontWeight: 700 }}>
                      {fmt(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--surface-2)' }}>
                <td colSpan={7} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Total ({ABSENCES.length} arrêts)
                </td>
                <td className="amount-cell red" style={{ fontWeight: 700 }}>
                  {fmt(ABSENCES.reduce((s, a) => s + a.coutEmployeur, 0))}
                </td>
                <td />
                <td className="amount-cell red" style={{ fontWeight: 700 }}>
                  {fmt(totalCout)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Legend */}
        <div style={{
          marginTop: 12,
          display: 'flex', gap: 16, flexWrap: 'wrap',
          fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)',
        }}>
          {Object.entries(TYPE_META).map(([key, m]) => (
            <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
              {key} — {key === 'CMO' ? 'Congé maladie ordinaire' : key === 'CLM' ? 'Longue maladie' : key === 'CLD' ? 'Longue durée' : key === 'AT' ? 'Accident travail' : key === 'CSS' ? 'Congé spécial santé' : 'Autre'}
            </span>
          ))}
        </div>

      </div>
    </>
  );
}
