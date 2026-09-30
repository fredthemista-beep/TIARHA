'use client';

import { useState } from 'react';
import { SaisieArretDrawer } from '@/components/dashboard/SaisieArretDrawer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/dashboard/Topbar';
import { TodayDate } from '@/components/dashboard/TodayDate';
import { CsvExportButton } from '@/components/dashboard/CsvExportButton';
import {
  ABSENCES_EN_COURS, ABSENCES_HISTORIQUE, ORG, TYPE_ABSENCE_LABEL, nomComplet, nomListe, type AbsenceAvecAgent,
} from '@/lib/demo-data';
import { fmtDateFr } from '@/lib/format';

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

const ABSENCES = ABSENCES_EN_COURS;
const totalCout      = ABSENCES.reduce((s, a) => s + a.cout + (a.coutRemplacement ?? 0), 0);
const avecRemplacement = ABSENCES.filter(a => a.remplacement).length;
const phaseCMOProche = ABSENCES.filter(a => a.type === 'CMO' && a.duree >= 60 && a.duree <= 90).length;
const cldLongs = ABSENCES.filter(a => a.type === 'CLD' && a.duree >= 180).length;
const dossiersLongs = ABSENCES.filter(a => a.type === 'CLM' || a.type === 'CLD').length;

const CSV_HEADERS = ['Référence', 'Matricule', 'Agent', 'Statut', 'Catégorie', 'IM', 'Service', 'Type', 'Début', 'Fin', 'Durée (j)', 'Coût employeur (€)', 'Remplacement', 'Coût remplacement (€)', 'Coût total (€)'];

function csvRows(list: AbsenceAvecAgent[]) {
  return list.map(a => [
    a.id, a.agent.id, nomListe(a.agent), a.agent.statut === 'tit' ? 'Titulaire' : 'Contractuel', a.agent.cat, a.agent.im,
    a.agent.service, a.type, fmtDateFr(a.debut), a.fin ? fmtDateFr(a.fin) : '', a.duree, a.cout, a.remplacement,
    a.coutRemplacement ?? 0, a.cout + (a.coutRemplacement ?? 0),
  ]);
}

export default function AbsencesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'en-cours' | 'historique'>('en-cours');
  const [saisieOuverte, setSaisieOuverte] = useState(false);
  const openAgent = (id: string) => router.push(`/agents/${id}`);

  return (
    <>
      <Topbar title="Absences" subtitle="Suivi temps réel — FPT" notifCount={3} />

      <div className="page-header">
        <div className="page-header-top">
          <div>
            <div className="page-title">Absences en cours</div>
            <div className="page-subtitle">
              <span className="legal-tag">CGFP L822-1</span>
              <span className="legal-tag">Décret 87-602</span>
              {ORG.collectivite} · Suivi actif {ABSENCES.length} arrêts · <TodayDate format="month" />
            </div>
          </div>
          <div className="btn-row">
            <Link href="/" className="btn-secondary">📄 Tableaux de bord RH</Link>
            <button type="button" className="btn-primary" onClick={() => setSaisieOuverte(true)}>+ Saisir un arrêt</button>
          </div>
        </div>
        <div className="sub-nav">
          <button type="button" className={`sub-tab${tab === 'en-cours' ? ' active' : ''}`} onClick={() => setTab('en-cours')}>
            En cours ({ABSENCES.length})
          </button>
          <button type="button" className={`sub-tab${tab === 'historique' ? ' active' : ''}`} onClick={() => setTab('historique')}>
            Historique ({ABSENCES_HISTORIQUE.length})
          </button>
          <button type="button" className="sub-tab" disabled title="Bientôt disponible">Statistiques</button>
        </div>
      </div>

      <div className="page-body">

        {tab === 'historique' && <HistoriqueTable onOpen={openAgent} />}

        {tab === 'en-cours' && (<>
        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          <div className="kpi-card danger">
            <div className="kpi-label">Arrêts actifs</div>
            <div className="kpi-value danger">{ABSENCES.length}</div>
            <div className="kpi-meta">{dossiersLongs} en longue maladie / longue durée</div>
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
            <strong>Alertes :</strong>{' '}
            {phaseCMOProche > 0
              ? `${phaseCMOProche} agent${phaseCMOProche > 1 ? 's approchent' : ' approche'} d’un changement de phase CMO (90 j)`
              : 'Aucun agent n’approche d’un changement de phase CMO (90 j)'}
            {cldLongs > 0 && ` · ${cldLongs} CLD en cours depuis 180 j ou plus : bilan médical de contrôle à prévoir.`}
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
                       'Autre position'}
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
            <CsvExportButton
              filename="absences-en-cours"
              headers={CSV_HEADERS}
              rows={csvRows(ABSENCES)}
              icon={false}
              style={{ fontSize: 11, padding: '5px 10px', height: 'auto' }}
            />
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
                const total = a.cout + (a.coutRemplacement ?? 0);
                return (
                  <tr
                    key={a.id}
                    className="clickable-row"
                    onClick={() => openAgent(a.agent.id)}
                    title={`Ouvrir le dossier de ${nomComplet(a.agent)}`}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          className="agent-avatar"
                          style={{ background: a.agent.statut === 'tit' ? 'var(--indigo)' : 'var(--teal)' }}
                        >
                          {a.agent.initiales}
                        </div>
                        <div>
                          <Link
                            href={`/agents/${a.agent.id}`}
                            onClick={e => e.stopPropagation()}
                            style={{ fontWeight: 600, fontSize: 13, color: 'inherit', textDecoration: 'none' }}
                          >
                            {nomListe(a.agent)}
                          </Link>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Cat. {a.agent.cat} · IM {a.agent.im} · {a.agent.service}
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
                      {fmtDateFr(a.debut)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: a.fin ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {a.fin ? fmtDateFr(a.fin) : '—'}
                    </td>
                    <td><DureeBadge duree={a.duree} type={a.type} /></td>
                    <td><PhaseBadge type={a.type} duree={a.duree} /></td>
                    <td className="amount-cell red">{fmt(a.cout)}</td>
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
                  {fmt(ABSENCES.reduce((s, a) => s + a.cout, 0))}
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
              {key} — {key === 'CMO' ? 'Congé maladie ordinaire' : key === 'CLM' ? 'Longue maladie' : key === 'CLD' ? 'Longue durée' : key === 'AT' ? 'Accident travail' : key === 'CSS' ? 'Congé spécial santé' : 'Autre position'}
            </span>
          ))}
        </div>
        </>)}

      </div>
      {saisieOuverte && (
        <SaisieArretDrawer
          onClose={() => setSaisieOuverte(false)}
          onSaved={id => router.push(`/agents/${id}`)}
        />
      )}
    </>
  );
}

function HistoriqueTable({ onOpen }: { onOpen: (id: string) => void }) {
  const total = ABSENCES_HISTORIQUE.reduce((s, a) => s + a.cout, 0);
  return (
    <div className="ds-card">
      <div className="ds-card-header" style={{ justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, color: 'var(--navy)' }}>
          Arrêts terminés — {ABSENCES_HISTORIQUE.length} arrêts
        </span>
        <CsvExportButton
          filename="absences-historique"
          headers={CSV_HEADERS}
          rows={csvRows(ABSENCES_HISTORIQUE)}
          icon={false}
          style={{ fontSize: 11, padding: '5px 10px', height: 'auto' }}
        />
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Agent</th>
            <th>Réf.</th>
            <th>Type</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Durée</th>
            <th>Coût employeur</th>
          </tr>
        </thead>
        <tbody>
          {ABSENCES_HISTORIQUE.map(a => {
            const meta = TYPE_META[a.type];
            return (
              <tr
                key={a.id}
                className="clickable-row"
                onClick={() => onOpen(a.agent.id)}
                title={`Ouvrir le dossier de ${nomComplet(a.agent)}`}
              >
                <td>
                  <Link
                    href={`/agents/${a.agent.id}`}
                    onClick={e => e.stopPropagation()}
                    style={{ fontWeight: 600, fontSize: 13, color: 'inherit', textDecoration: 'none' }}
                  >
                    {nomListe(a.agent)}
                  </Link>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.agent.service}</div>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{a.id}</td>
                <td>
                  <span
                    title={TYPE_ABSENCE_LABEL[a.type]}
                    style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                      background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700,
                    }}
                  >
                    {meta.label}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fmtDateFr(a.debut)}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{a.fin ? fmtDateFr(a.fin) : '—'}</td>
                <td><DureeBadge duree={a.duree} type={a.type} /></td>
                <td className="amount-cell red">{fmt(a.cout)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: 'var(--surface-2)' }}>
            <td colSpan={6} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
              Total ({ABSENCES_HISTORIQUE.length} arrêts)
            </td>
            <td className="amount-cell red" style={{ fontWeight: 700 }}>{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
