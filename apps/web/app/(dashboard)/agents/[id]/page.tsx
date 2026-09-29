'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { trimestresRequisTauxPlein } from '@tiarh/engine';
import { Topbar } from '@/components/dashboard/Topbar';
import { DemoButton } from '@/components/ui/demo-toast';
import { getAgent, simulationLinks } from '@/lib/demo-data';
import { fmtDateFr, fmtEuro } from '@/lib/format';

/* ── Helpers ──────────────────────────────────────────────────── */
const fmt = fmtEuro;
const fmtDate = fmtDateFr;
function anciennete(dateEntree: string) {
  const diff = Date.now() - new Date(dateEntree).getTime();
  const ans = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  const mois = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
  return `${ans} ans ${mois} mois`;
}

const TYPE_COLOR: Record<string, { color: string; bg: string }> = {
  CMO: { color: 'var(--amber)',   bg: 'var(--amber-bg)' },
  CLM: { color: 'var(--indigo)', bg: 'var(--info-bg)' },
  CLD: { color: 'var(--danger)', bg: 'var(--danger-bg)' },
  AT:  { color: 'var(--success)', bg: 'var(--success-bg)' },
};
const DOC_ICON: Record<string, string> = {
  Arrêté: '📄', Contrat: '📋', Évaluation: '⭐', Médical: '🏥',
};

const POSITION_COLOR: Record<string, { color: string; label: string }> = {
  Activité: { color: 'var(--success)', label: 'En activité' },
  CMO:      { color: 'var(--amber)',   label: 'CMO en cours' },
  CLM:      { color: 'var(--indigo)', label: 'CLM en cours' },
  CLD:      { color: 'var(--danger)', label: 'CLD en cours' },
  AT:       { color: 'var(--amber)',  label: 'Accident de travail en cours' },
};

const DOC_BUTTON: React.CSSProperties = {
  fontSize: 11, padding: '4px 10px', height: 28,
  background: 'transparent', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
  color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)',
};

const TAB_STYLE = (active: boolean): React.CSSProperties => ({
  padding: '8px 18px', border: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: active ? 700 : 500,
  color: active ? 'var(--navy)' : 'var(--text-muted)',
  borderBottom: active ? '2px solid var(--navy)' : '2px solid transparent',
  background: 'transparent', transition: 'all 0.15s',
});

/* ── Page ─────────────────────────────────────────────────────── */
export default function FicheAgentPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const agent = getAgent(id);

  const [tab, setTab] = useState<'situation' | 'absences' | 'carriere' | 'simulations' | 'documents'>('situation');

  if (!agent) {
    return (
      <>
        <Topbar title="Fiche agent" subtitle="Agent introuvable" />
        <div className="page-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, gap: 16 }}>
          <div style={{ fontSize: 40 }}>👤</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>Agent introuvable</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Matricule {id} absent des données de démonstration.</div>
          <Link href="/agents" style={{
            marginTop: 8, padding: '10px 20px',
            background: 'var(--navy)', color: 'white',
            borderRadius: 'var(--radius-sm)', textDecoration: 'none',
            fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-ui)',
          }}>← Retour à la liste</Link>
        </div>
      </>
    );
  }

  const pos = POSITION_COLOR[agent.position] ?? POSITION_COLOR['Activité'];
  const congesRestants = agent.droitConges - agent.congesPris;
  const totalAbsencesCout = agent.absences.reduce((s, a) => s + a.cout, 0);
  const trimRequis = trimestresRequisTauxPlein(Number(agent.dateNaissance.slice(0, 4)));
  const links = simulationLinks(agent);

  return (
    <>
      <Topbar title={`${agent.prenom} ${agent.nom}`} subtitle={`${agent.grade} · ${agent.service}`} />

      {/* Page header */}
      <div className="page-header">
        <div className="page-header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/agents" style={{
              fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none',
              fontFamily: 'var(--font-ui)', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              ← Liste des agents
            </Link>
            <span style={{ color: 'var(--border)' }}>/</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
              {agent.prenom} {agent.nom}
            </span>
          </div>
        </div>
        {/* Agent hero */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          padding: '20px 0 16px',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: agent.statut === 'tit' ? 'var(--indigo)' : 'var(--teal)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: 'white', fontFamily: 'var(--font-ui)',
            flexShrink: 0,
          }}>
            {agent.initiales}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)' }}>
                {agent.prenom} {agent.nom}
              </span>
              <span className={`badge badge-${agent.statut}`}>
                {agent.statut === 'tit' ? 'Titulaire' : 'Contractuel'}
              </span>
              <span style={{
                padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 700,
                background: pos.color === 'var(--success)' ? 'var(--success-bg)' : agent.position === 'CLM' ? 'var(--info-bg)' : agent.position === 'CLD' ? 'var(--danger-bg)' : 'var(--amber-bg)',
                color: pos.color,
              }}>
                {pos.label}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
              {agent.grade} · Cat. {agent.cat} · IM {agent.im} · {agent.service} · {agent.nMatricule}
            </div>
          </div>
          <div className="btn-row">
            <DemoButton className="btn-secondary" style={{ fontSize: 12 }}>✏️ Modifier</DemoButton>
            <button type="button" className="btn-secondary" style={{ fontSize: 12 }} onClick={() => window.print()}>📄 Exporter PDF</button>
            <DemoButton className="btn-primary" style={{ fontSize: 12 }}>+ Saisir un arrêt</DemoButton>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-soft)', marginTop: 4 }}>
          {([
            { key: 'situation',   label: 'Situation administrative' },
            { key: 'absences',    label: `Absences (${agent.absences.length})` },
            { key: 'carriere',    label: 'Carrière' },
            { key: 'simulations', label: 'Simulations' },
            { key: 'documents',   label: `Documents (${agent.documents.length})` },
          ] as const).map(({ key, label }) => (
            <button key={key} style={TAB_STYLE(tab === key)} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="page-body">

        {/* ── TAB : SITUATION ── */}
        {tab === 'situation' && (
          <>
            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
              <div className="kpi-card navy">
                <div className="kpi-label">Ancienneté</div>
                <div className="kpi-value large navy" style={{ fontSize: 20 }}>{anciennete(agent.dateEntree)}</div>
                <div className="kpi-meta">Depuis le {fmtDate(agent.dateEntree)}</div>
              </div>
              <div className="kpi-card teal">
                <div className="kpi-label">Solde CET</div>
                <div className={`kpi-value large ${agent.joursCET >= 50 ? 'danger' : 'teal'}`}>{agent.joursCET} j</div>
                <div className="kpi-meta">{agent.joursCET >= 50 ? '⚠ Approche du plafond' : 'Plafond 60 j'}</div>
              </div>
              <div className="kpi-card indigo">
                <div className="kpi-label">Congés restants</div>
                <div className="kpi-value large indigo">{congesRestants} j</div>
                <div className="kpi-meta">{agent.congesPris} pris sur {agent.droitConges} droits</div>
              </div>
              <div className="kpi-card amber">
                <div className="kpi-label">{agent.regime === 'CNRACL' ? 'Trimestres CNRACL' : 'Trimestres validés'}</div>
                <div className="kpi-value large amber">{agent.trimestresValides} T</div>
                <div className="kpi-meta">Sur {trimRequis} requis (génération {agent.dateNaissance.slice(0, 4)})</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Identité */}
              <div className="ds-card">
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>👤</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)' }}>Identité</span>
                </div>
                <div className="ds-card-body">
                  {[
                    { label: 'Nom complet',       val: `${agent.prenom} ${agent.nom}` },
                    { label: 'Date de naissance', val: fmtDate(agent.dateNaissance) },
                    { label: 'Situation familiale', val: agent.situationFamiliale },
                    { label: 'Adresse',           val: agent.adresse },
                    { label: 'Téléphone',         val: agent.tel },
                    { label: 'Email professionnel', val: agent.email },
                  ].map(({ label, val }) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 0', borderBottom: '1px solid var(--border-soft)',
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', textAlign: 'right', maxWidth: '60%' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Situation administrative */}
              <div className="ds-card">
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📋</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)' }}>Situation administrative</span>
                </div>
                <div className="ds-card-body">
                  {[
                    { label: 'Statut',          val: agent.statut === 'tit' ? 'Fonctionnaire titulaire' : 'Agent contractuel' },
                    { label: 'Catégorie',       val: `Catégorie ${agent.cat}` },
                    { label: 'Grade',           val: agent.grade },
                    { label: 'Échelon',         val: `Échelon ${agent.echelon} (${agent.ancienneteEchelon})` },
                    { label: 'Prochain échelon',val: agent.prochainEchelon ? fmtDate(agent.prochainEchelon) : 'Échelon terminal' },
                    { label: 'Indice Majoré',   val: `IM ${agent.im}` },
                    { label: 'Service',         val: agent.service },
                    { label: 'Poste',           val: agent.poste },
                    { label: 'Quotité',         val: `${agent.quotite} %` },
                    { label: 'Position',        val: pos.label },
                    { label: 'Régime retraite', val: agent.regime },
                  ].map(({ label, val }) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 0', borderBottom: '1px solid var(--border-soft)',
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── TAB : ABSENCES ── */}
        {tab === 'absences' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
              <div className="kpi-card danger">
                <div className="kpi-label">Arrêts total</div>
                <div className="kpi-value danger">{agent.absences.length}</div>
                <div className="kpi-meta">Historique complet</div>
              </div>
              <div className="kpi-card amber">
                <div className="kpi-label">Coût total employeur</div>
                <div className="kpi-value amber" style={{ fontSize: 20 }}>{fmt(totalAbsencesCout)}</div>
                <div className="kpi-meta">Charges incluses</div>
              </div>
              <div className="kpi-card navy">
                <div className="kpi-label">Durée totale</div>
                <div className="kpi-value navy">
                  {agent.absences.reduce((s, a) => s + a.duree, 0)} j
                </div>
                <div className="kpi-meta">Tous arrêts confondus</div>
              </div>
            </div>

            <div className="ds-card">
              <div className="ds-card-header">
                <span style={{ fontWeight: 700, color: 'var(--navy)' }}>Historique des arrêts</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Type</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Durée</th>
                    <th>Coût employeur</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {agent.absences.map(a => {
                    const meta = TYPE_COLOR[a.type] ?? { color: 'var(--text-muted)', bg: 'var(--surface-2)' };
                    const isActif = a.enCours;
                    return (
                      <tr key={a.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{a.id}</td>
                        <td>
                          <span style={{
                            padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                            background: meta.bg, color: meta.color,
                            fontSize: 11, fontWeight: 700,
                          }}>{a.type}</span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fmtDate(a.debut)}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: a.fin ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {a.fin ? `${fmtDate(a.fin)}${a.enCours ? ' (prévue)' : ''}` : '—'}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: a.duree > 30 ? 'var(--danger)' : 'var(--text-primary)' }}>
                          {a.duree} j
                        </td>
                        <td className="amount-cell red">{fmt(a.cout)}</td>
                        <td>
                          {isActif
                            ? <span className="badge badge-cmo">En cours</span>
                            : <span className="badge badge-ok">Terminé</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    <td colSpan={5} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Total</td>
                    <td className="amount-cell red" style={{ fontWeight: 700 }}>{fmt(totalAbsencesCout)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        {/* ── TAB : CARRIÈRE ── */}
        {tab === 'carriere' && (
          <div className="ds-card">
            <div className="ds-card-header">
              <span style={{ fontWeight: 700, color: 'var(--navy)' }}>Historique de carrière</span>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ position: 'relative', paddingLeft: 28 }}>
                {/* Ligne verticale */}
                <div style={{
                  position: 'absolute', left: 8, top: 8, bottom: 8,
                  width: 2, background: 'var(--border-soft)',
                }} />
                {[...agent.carriere].reverse().map((ev, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: 28 }}>
                    {/* Dot */}
                    <div style={{
                      position: 'absolute', left: -24, top: 4,
                      width: 12, height: 12, borderRadius: '50%',
                      background: i === 0 ? 'var(--navy)' : 'var(--border)',
                      border: `2px solid ${i === 0 ? 'var(--navy)' : 'var(--border)'}`,
                      boxSizing: 'border-box',
                    }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', marginBottom: 2 }}>
                          {ev.evenement}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ev.grade}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>
                          IM {ev.im}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {fmtDate(ev.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB : SIMULATIONS ── */}
        {tab === 'simulations' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              {
                href: links.arret,
                icon: '🏥', label: 'SimulArrêt',
                desc: 'Simuler le coût d\'un arrêt maladie pour cet agent',
                params: `IM ${agent.im} — ${agent.grade}`,
                color: 'var(--amber)', bg: 'var(--amber-bg)',
              },
              {
                href: links.retraite,
                icon: '👴', label: 'RetireSim',
                desc: agent.regime === 'CNRACL' ? 'Estimer la pension de retraite CNRACL' : 'Estimation indicative (agent affilié IRCANTEC)',
                params: `IM ${agent.im} — ${agent.trimestresValides} T validés`,
                color: 'var(--indigo)', bg: 'var(--info-bg)',
              },
              {
                href: links.heures,
                icon: '⏱', label: 'HeuresSup+',
                desc: 'Calculer les IHTS et suivi CET',
                params: `IM ${agent.im} — CET ${agent.joursCET} j`,
                color: 'var(--teal)', bg: 'var(--teal-bg)',
              },
              {
                href: links.annualisation,
                icon: '📊', label: 'AnnualisationRH',
                desc: 'Suivi annualisation du temps de travail',
                params: `Quotité ${agent.quotite} %`,
                color: 'var(--navy)', bg: 'var(--surface-2)',
              },
            ].map(({ href, icon, label, desc, params, color, bg }) => (
              <Link key={label} href={href} style={{ textDecoration: 'none' }}>
                <div className="ds-card" style={{
                  cursor: 'pointer', transition: 'box-shadow 0.15s',
                  borderLeft: `3px solid ${color}`,
                }}>
                  <div style={{ padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                      background: bg, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 20, flexShrink: 0,
                    }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)', marginBottom: 4 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{desc}</div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color, fontWeight: 700 }}>{params}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── TAB : DOCUMENTS ── */}
        {tab === 'documents' && (
          <div className="ds-card">
            <div className="ds-card-header" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, color: 'var(--navy)' }}>Documents — {agent.documents.length} fichiers</span>
              <DemoButton className="btn-secondary" style={{ fontSize: 11, padding: '5px 10px', height: 'auto' }}>
                + Ajouter un document
              </DemoButton>
            </div>
            <div style={{ padding: '8px 0' }}>
              {agent.documents.map((doc, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 20px', borderBottom: '1px solid var(--border-soft)',
                  transition: 'background 0.1s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 18 }}>{DOC_ICON[doc.type] ?? '📄'}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
                        {doc.nom}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {doc.type} · {fmtDate(doc.date)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <DemoButton style={DOC_BUTTON}>↓ Télécharger</DemoButton>
                    <DemoButton style={DOC_BUTTON}>👁 Aperçu</DemoButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
