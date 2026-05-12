'use client';
import { useState } from 'react';
import {
  calculerBaseAnnuelle,
  calculerSoldeAnnuel,
  HEURES_ANNUELLES,
} from '@tiarh/engine';
import type { SaisieMensuelle, ResultatBaseAnnuelle, ResultatSoldeAnnuel } from '@tiarh/engine';
import { Topbar } from '@/components/dashboard/Topbar';
import { PlanGate } from '@tiarh/ui';

const MOIS_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'] as const;

const LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.10em',
  color: 'var(--text-secondary)',
  marginBottom: 7,
  fontFamily: 'var(--font-ui)',
};

const INPUT: React.CSSProperties = {
  width: '100%',
  height: 42,
  padding: '0 12px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-ui)',
  fontSize: 14,
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color 0.15s',
  appearance: 'none' as const,
};

type AlerteType = 'SEMAINE_MAX' | 'SEMAINE_MOYENNE_MAX' | 'JOUR_MAX';
const ALERTE_LABELS: Record<AlerteType, string> = {
  SEMAINE_MAX:         'Durée hebdomadaire max — 48 h/semaine',
  SEMAINE_MOYENNE_MAX: 'Moyenne hebdomadaire — 44 h sur 12 semaines',
  JOUR_MAX:            'Durée journalière max — 10 h/jour',
};

export default function AnnualisationPage() {
  const currentYear = new Date().getFullYear();

  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'saisie' | 'alertes'>('saisie');
  const [form, setForm] = useState({
    quotite:               '100',
    annee:                 String(currentYear),
    dateDebut:             '',
    dateFin:               '',
    heuresTotalesManuelle: '',
  });
  const [moisInputs, setMoisInputs]   = useState<Record<number, string>>({});
  const [base,  setBase]  = useState<ResultatBaseAnnuelle | null>(null);
  const [solde, setSolde] = useState<ResultatSoldeAnnuel  | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm(p => ({ ...p, [key]: value }));
  }

  function buildMoisSaisis(inputs: Record<number, string>): SaisieMensuelle[] {
    return Object.entries(inputs)
      .filter(([, v]) => v !== '' && !isNaN(Number(v)))
      .flatMap(([k, v]) => {
        const m = Number(k);
        if (m < 1 || m > 12) return [];
        return [{ mois: m as SaisieMensuelle['mois'], heures: Number(v) }];
      });
  }

  function calculer() {
    const quotite = Math.min(1, Math.max(0.01, Number(form.quotite) / 100));
    const resultBase = calculerBaseAnnuelle({
      quotite,
      annee:     Number(form.annee),
      dateDebut: form.dateDebut || undefined,
      dateFin:   form.dateFin   || undefined,
    });
    setBase(resultBase);
    setSolde(calculerSoldeAnnuel({
      heuresDues:             resultBase.heuresDues,
      moisSaisis:             buildMoisSaisis(moisInputs),
      heuresTotalesManuelle:  form.heuresTotalesManuelle !== '' ? Number(form.heuresTotalesManuelle) : undefined,
    }));
  }

  function onMoisChange(mois: number, valeur: string) {
    const next = { ...moisInputs, [mois]: valeur };
    setMoisInputs(next);
    if (!base) return;
    setSolde(calculerSoldeAnnuel({
      heuresDues:             base.heuresDues,
      moisSaisis:             buildMoisSaisis(next),
      heuresTotalesManuelle:  form.heuresTotalesManuelle !== '' ? Number(form.heuresTotalesManuelle) : undefined,
    }));
  }

  /* ── Calculs graphique ── */
  const cibleMensuelle = base ? base.heuresDues / 12 : HEURES_ANNUELLES / 12;
  const chartMax       = Math.max(cibleMensuelle * 1.35, ...Array.from({ length: 12 }, (_, i) => Number(moisInputs[i + 1] ?? 0)));
  const CHART_H        = 130;

  function barColor(heures: number | null): string {
    if (heures === null) return 'var(--border)';
    if (heures === 0)    return 'var(--border)';
    if (heures > cibleMensuelle * 1.15) return 'var(--amber)';
    if (heures >= cibleMensuelle * 0.85) return 'var(--indigo)';
    return 'var(--danger)';
  }

  /* ── Alertes couleurs ── */
  function alerteStyle(depasse: boolean, valeur: number | null) {
    if (valeur === null) return { bg: 'var(--surface-2)', dot: 'var(--text-muted)', text: 'var(--text-muted)' };
    if (depasse)         return { bg: 'var(--warning-bg)', dot: 'var(--warning)', text: 'var(--warning)' };
    return { bg: 'var(--success-bg)', dot: 'var(--success)', text: 'var(--success)' };
  }

  const progression = solde ? solde.progression : 0;

  return (
    <>
      <Topbar
        title="AnnualisationRH"
        subtitle={`Annualisation du temps de travail — base ${HEURES_ANNUELLES} h (FPT)`}
        plan="starter"
      />

      {/* Page header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <div className="page-title">AnnualisationRH — Temps de travail</div>
            <div className="page-subtitle">
              <span className="legal-tag">Décret 2000-815</span>
              <span className="legal-tag">CGFP D1332-22</span>
              Base {HEURES_ANNUELLES} h annuelles · Prorata et suivi mensuel
            </div>
          </div>
          <div className="btn-row">
            <button className="btn-secondary" onClick={() => setShowPanel(true)}>📄 Décret 2000-815</button>
            <button className="btn-primary" onClick={calculer}>↺ Recalculer</button>
          </div>
        </div>
        <div className="sub-nav">
          <button className="sub-tab active">Simulation</button>
          <button className="sub-tab">Suivi d&apos;équipe</button>
          <button className="sub-tab">Historique</button>
        </div>
      </div>

      <div className="page-body">
        <PlanGate required={['starter', 'pro', 'enterprise']} currentPlan="starter">

          {/* ── KPI strip ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            <div className="kpi-card navy">
              <div className="kpi-label">Base annuelle due</div>
              <div className="kpi-value large navy">
                {base ? base.heuresDues.toFixed(0) + ' h' : '— h'}
              </div>
              <div className="kpi-meta">{HEURES_ANNUELLES} h × {form.quotite} %</div>
            </div>
            <div className="kpi-card indigo">
              <div className="kpi-label">Heures réalisées</div>
              <div className="kpi-value large indigo">
                {solde ? solde.heuresRealisees.toFixed(0) + ' h' : '— h'}
              </div>
              <div className="kpi-meta">
                {solde
                  ? solde.moisSaisisCount > 0 ? `${solde.moisSaisisCount} mois saisis` : 'saisie globale'
                  : 'non calculé'}
              </div>
            </div>
            <div className={`kpi-card ${solde && solde.heuresSup > 0 ? 'amber' : solde && solde.heuresDeficit > 0 ? 'danger' : 'teal'}`}>
              <div className="kpi-label">Solde</div>
              <div className={`kpi-value large ${solde && solde.heuresSup > 0 ? 'amber' : solde && solde.heuresDeficit > 0 ? 'danger' : 'teal'}`}>
                {solde
                  ? solde.heuresSup > 0
                    ? '+' + solde.heuresSup.toFixed(0) + ' h'
                    : '−' + solde.heuresDeficit.toFixed(0) + ' h'
                  : '— h'}
              </div>
              <div className="kpi-meta">
                {solde
                  ? solde.heuresSup > 0 ? 'HS à régulariser' : 'Déficit à rattraper'
                  : 'non calculé'}
              </div>
            </div>
            <div className="kpi-card teal">
              <div className="kpi-label">Progression</div>
              <div className="kpi-value large teal">
                {solde ? (solde.progression * 100).toFixed(1) + ' %' : '— %'}
              </div>
              <div className="kpi-meta">De la base annuelle</div>
            </div>
          </div>

          {/* ── 2-col : Formulaire + Résultats ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* FORM CARD */}
            <div className="ds-card">
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-soft)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 16 }}>📊</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)' }}>
                  Paramètres agent
                </span>
              </div>

              <div style={{ padding: '20px 20px 0' }}>

                {/* Quotité + Année */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                  <div>
                    <div style={LABEL}>Quotité (%)</div>
                    <input type="number" min={1} max={100} style={INPUT}
                      value={form.quotite} onChange={e => set('quotite', e.target.value)} />
                  </div>
                  <div>
                    <div style={LABEL}>Année de référence</div>
                    <input type="number" style={INPUT}
                      value={form.annee} onChange={e => set('annee', e.target.value)} />
                  </div>
                </div>

                {/* Dates prorata */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                  <div>
                    <div style={LABEL}>Date arrivée <span style={{ fontWeight: 400, fontSize: 10, textTransform: 'none' }}>(optionnel)</span></div>
                    <input type="date" style={INPUT}
                      value={form.dateDebut} onChange={e => set('dateDebut', e.target.value)} />
                  </div>
                  <div>
                    <div style={LABEL}>Date départ <span style={{ fontWeight: 400, fontSize: 10, textTransform: 'none' }}>(optionnel)</span></div>
                    <input type="date" style={INPUT}
                      value={form.dateFin} onChange={e => set('dateFin', e.target.value)} />
                  </div>
                </div>

                {/* Séparateur */}
                <div style={{ height: 1, background: 'var(--border-soft)', marginBottom: 18 }} />

                {/* Saisie globale */}
                <div style={{ marginBottom: 18 }}>
                  <div style={LABEL}>
                    Total heures réalisées{' '}
                    <span style={{ fontWeight: 400, fontSize: 10, textTransform: 'none' }}>— saisie globale (optionnel)</span>
                  </div>
                  <input type="number" min={0} style={INPUT}
                    value={form.heuresTotalesManuelle}
                    onChange={e => set('heuresTotalesManuelle', e.target.value)}
                    placeholder="ex : 1 740" />
                </div>

                {/* Info */}
                <div style={{
                  background: 'var(--info-bg)',
                  border: '1px solid rgba(29,78,216,0.15)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  marginBottom: 18,
                  display: 'flex', gap: 8,
                }}>
                  <span>ℹ️</span>
                  <div>
                    Base légale : <strong>{HEURES_ANNUELLES} h</strong> = 228 j × 7 h + journée solidarité.
                    La saisie mensuelle prend le pas sur la saisie globale.
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--border-soft)', marginBottom: 18 }} />
              </div>

              {/* CTA */}
              <div style={{ padding: '0 20px 20px' }}>
                <button
                  onClick={calculer}
                  style={{
                    width: '100%', height: 48,
                    background: 'var(--navy)', color: 'white',
                    border: 'none', borderRadius: 'var(--radius-sm)',
                    fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-ui)',
                    cursor: 'pointer', letterSpacing: '0.02em',
                    transition: 'background 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--navy-mid)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--navy)')}
                >
                  Calculer l&apos;annualisation →
                </button>
              </div>
            </div>

            {/* RESULTS PANEL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

              {/* Hero */}
              <div className="result-hero">
                <div className="result-hero-label">Base annuelle due — {form.annee}</div>
                <div className="result-hero-amount">
                  {base ? base.heuresDues.toFixed(1) + ' h' : '— h'}
                </div>
                <div className="result-hero-sub">
                  {base
                    ? `${HEURES_ANNUELLES} h × ${form.quotite} %${base.estProratise ? ` × prorata ${base.joursPresence}/${base.joursAnnee} j` : ''}`
                    : 'Renseignez les paramètres et calculez'}
                </div>
              </div>

              {/* Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div className="breakdown-cell">
                  <div className="breakdown-cell-label">Heures réalisées</div>
                  <div className="breakdown-cell-value" style={{ color: 'var(--indigo)' }}>
                    {solde ? solde.heuresRealisees.toFixed(1) + ' h' : '—'}
                  </div>
                </div>
                <div className="breakdown-cell">
                  <div className="breakdown-cell-label">Solde fin d&apos;année</div>
                  <div className="breakdown-cell-value" style={{
                    color: solde
                      ? solde.heuresSup > 0 ? 'var(--amber)' : 'var(--danger)'
                      : 'var(--text-muted)',
                  }}>
                    {solde
                      ? solde.heuresSup > 0
                        ? '+' + solde.heuresSup.toFixed(1) + ' h'
                        : '−' + solde.heuresDeficit.toFixed(1) + ' h'
                      : '—'}
                  </div>
                </div>
                <div className="breakdown-cell">
                  <div className="breakdown-cell-label">Mois saisis</div>
                  <div className="breakdown-cell-value" style={{ color: 'var(--teal)' }}>
                    {solde ? solde.moisSaisisCount + ' / 12' : '—'}
                  </div>
                </div>
                <div className="breakdown-cell">
                  <div className="breakdown-cell-label">Cible mensuelle</div>
                  <div className="breakdown-cell-value" style={{ color: 'var(--navy)' }}>
                    {cibleMensuelle.toFixed(1)} h
                  </div>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="ds-card" style={{ marginBottom: 0 }}>
                <div className="ds-card-body" style={{ paddingTop: 14, paddingBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      Avancement annuel
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {solde ? (progression * 100).toFixed(1) + ' %' : '—'}
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      transition: 'width 0.4s ease',
                      background: progression > 1.1
                        ? 'var(--amber)'
                        : progression >= 0.9
                        ? 'var(--success)'
                        : 'var(--indigo)',
                      width: `${Math.min(100, progression * 100)}%`,
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 5 }}>
                    <span>0 h</span>
                    <span>{base ? base.heuresDues.toFixed(0) + ' h dues' : '—'}</span>
                  </div>
                </div>
              </div>

              <div className="notice-info">
                <span>ℹ️</span>
                <div>Décret n°2000-815 du 25/08/2000 · CGFP art. D1332-22</div>
              </div>
            </div>
          </div>

          {/* ── GRAPHIQUE MENSUEL (full-width) ── */}
          {base && (
            <div className="ds-card" style={{ marginBottom: 16 }}>
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 5,
                    background: 'var(--info-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                  }}>📈</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)' }}>
                    Heures réalisées — mois par mois
                  </span>
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Cible : <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--indigo)' }}>{cibleMensuelle.toFixed(1)} h</strong> / mois
                </span>
              </div>
              <div style={{ padding: '20px 20px 12px' }}>

                {/* Bars */}
                <div style={{ position: 'relative' }}>
                  {/* Ligne de référence (cible mensuelle) */}
                  <div style={{
                    position: 'absolute',
                    left: 0, right: 0,
                    bottom: CHART_H * (cibleMensuelle / chartMax),
                    height: 1,
                    background: 'var(--indigo)',
                    opacity: 0.4,
                    borderTop: '1.5px dashed var(--indigo)',
                    zIndex: 1,
                  }} />

                  <div style={{
                    display: 'flex', alignItems: 'flex-end',
                    gap: 8, height: CHART_H,
                    borderBottom: '2px solid var(--border-soft)',
                    paddingBottom: 0,
                    position: 'relative',
                  }}>
                    {MOIS_LABELS.map((label, i) => {
                      const mois = i + 1;
                      const val  = moisInputs[mois] !== '' && moisInputs[mois] !== undefined
                        ? Number(moisInputs[mois])
                        : null;
                      const h = val !== null && chartMax > 0
                        ? Math.max(4, Math.round((val / chartMax) * CHART_H))
                        : 6;
                      const color = barColor(val);
                      const isEntered = val !== null;

                      return (
                        <div key={mois} style={{
                          flex: 1, display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'flex-end', height: '100%',
                          gap: 3,
                        }}>
                          {isEntered && (
                            <span style={{
                              fontSize: 9, fontFamily: 'var(--font-mono)',
                              color: color === 'var(--border)' ? 'var(--text-muted)' : color,
                              fontWeight: 600,
                            }}>
                              {val}
                            </span>
                          )}
                          <div style={{
                            width: '100%', height: h,
                            background: color,
                            opacity: isEntered ? 1 : 0.25,
                            borderRadius: '3px 3px 0 0',
                            transition: 'height 0.3s ease',
                            cursor: 'pointer',
                          }} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Labels mois */}
                <div style={{
                  display: 'flex', gap: 8, marginTop: 6, paddingBottom: 4,
                }}>
                  {MOIS_LABELS.map((label, i) => (
                    <div key={i} style={{
                      flex: 1, textAlign: 'center',
                      fontSize: 10, color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {label}
                    </div>
                  ))}
                </div>

                {/* Légende */}
                <div style={{
                  display: 'flex', gap: 16, marginTop: 10,
                  paddingTop: 10, borderTop: '1px solid var(--border-soft)',
                  fontSize: 11, color: 'var(--text-muted)',
                }}>
                  {[
                    { color: 'var(--indigo)', label: 'Dans la cible (±15%)' },
                    { color: 'var(--amber)',  label: 'Dépassement (>+15%)' },
                    { color: 'var(--danger)', label: 'Sous la cible (<−15%)' },
                    { color: 'var(--border)', label: 'Non renseigné' },
                  ].map(({ color, label }) => (
                    <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                      {label}
                    </span>
                  ))}
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 16, height: 1, borderTop: '1.5px dashed var(--indigo)', opacity: 0.6 }} />
                    Cible mensuelle
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── SAISIE MENSUELLE + ALERTES ── */}
          <div className="ds-card">
            {/* Sub-nav interne */}
            <div style={{
              display: 'flex', borderBottom: '1px solid var(--border-soft)',
              padding: '0 20px',
            }}>
              {([
                { key: 'saisie',  label: 'Saisie mensuelle' },
                { key: 'alertes', label: 'Alertes légales' },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '10px 16px',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13, fontWeight: 600,
                    color: activeTab === tab.key ? 'var(--indigo)' : 'var(--text-muted)',
                    background: 'none', border: 'none',
                    borderBottom: activeTab === tab.key ? '2px solid var(--indigo)' : '2px solid transparent',
                    cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Saisie mensuelle */}
            {activeTab === 'saisie' && (
              <div style={{ padding: 20 }}>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ ...LABEL, marginBottom: 2, display: 'block' }}>Heures réalisées par mois</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Saisir les heures de chaque mois. Prend le pas sur la saisie globale. Cible : {cibleMensuelle.toFixed(1)} h/mois.
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
                  {MOIS_LABELS.map((label, i) => {
                    const mois     = i + 1;
                    const val      = moisInputs[mois] ?? '';
                    const entered  = val !== '' && !isNaN(Number(val));
                    const over     = entered && Number(val) > cibleMensuelle * 1.15;
                    const under    = entered && Number(val) < cibleMensuelle * 0.85;
                    const bg       = over ? 'var(--warning-bg)' : under ? 'var(--danger-bg)' : entered ? 'var(--info-bg)' : 'var(--surface-2)';
                    const labelClr = over ? 'var(--warning)' : under ? 'var(--danger)' : entered ? 'var(--indigo)' : 'var(--text-muted)';

                    return (
                      <div key={mois} style={{
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 10px 8px',
                        background: bg,
                        border: `1px solid ${entered ? 'transparent' : 'var(--border-soft)'}`,
                        transition: 'background 0.15s',
                      }}>
                        <div style={{
                          fontSize: 10, fontWeight: 800,
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                          color: labelClr, marginBottom: 6,
                        }}>
                          {label}
                        </div>
                        <input
                          type="number"
                          min={0}
                          value={val}
                          onChange={e => onMoisChange(mois, e.target.value)}
                          placeholder="— h"
                          style={{
                            width: '100%', background: 'transparent',
                            border: 'none', outline: 'none',
                            fontFamily: 'var(--font-mono)', fontSize: 14,
                            fontWeight: 700, color: labelClr,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {solde && solde.moisSaisisCount > 0 && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-soft)' }}>
                    <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden', marginBottom: 5 }}>
                      <div style={{
                        height: '100%', borderRadius: 2, background: 'var(--indigo)',
                        width: `${(solde.moisSaisisCount / 12) * 100}%`,
                        transition: 'width 0.3s',
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {solde.moisSaisisCount} mois sur 12 renseignés
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Alertes légales */}
            {activeTab === 'alertes' && (
              <div style={{ padding: 20 }}>
                <div style={{ marginBottom: 14 }}>
                  <span style={{ ...LABEL, marginBottom: 2, display: 'block' }}>Alertes légales</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Estimations basées sur les heures saisies. CGFP art. D1332-22 · Décret n°2000-815.
                  </span>
                </div>

                {!solde ? (
                  <div className="notice-info" style={{ margin: 0 }}>
                    <span>ℹ️</span>
                    <div>Lancez un calcul pour voir les alertes légales.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {solde.alertesLegales.map(alerte => {
                      const { bg, dot, text } = alerteStyle(alerte.depasse, alerte.valeurEstimee);
                      return (
                        <div key={alerte.type} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12,
                          padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: bg,
                        }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: dot, flexShrink: 0, marginTop: 3,
                          }} />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: text, marginBottom: 2 }}>
                              {ALERTE_LABELS[alerte.type as AlerteType] ?? alerte.type}
                            </div>
                            <div style={{ fontSize: 11, color: text, opacity: 0.8 }}>
                              {alerte.message}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

        </PlanGate>
      </div>

      {/* ── Drawer Décret 2000-815 ── */}
      {showPanel && (
        <>
          <div
            onClick={() => setShowPanel(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15,45,82,0.35)',
              zIndex: 200, backdropFilter: 'blur(2px)',
            }}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 500,
            background: 'var(--surface)', zIndex: 201,
            boxShadow: '-4px 0 24px rgba(15,45,82,0.14)',
            display: 'flex', flexDirection: 'column', overflowY: 'auto',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--border-soft)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1,
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)' }}>
                  Décret n°2000-815 — Temps de travail FPT
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Décret du 25/08/2000 · CGFP art. D1332-22 et suivants
                </div>
              </div>
              <button
                onClick={() => setShowPanel(false)}
                style={{
                  width: 32, height: 32, border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', background: 'transparent',
                  cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Base légale */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)', marginBottom: 10 }}>
                  Base annuelle légale
                </div>
                <div style={{
                  background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px', fontFamily: 'var(--font-mono)',
                  fontSize: 13, color: 'var(--navy)', lineHeight: 1.8,
                  border: '1px solid var(--border-soft)',
                }}>
                  {HEURES_ANNUELLES} h / an = 228 jours × 7 h<br />
                  + 1 journée solidarité (7 h)<br />
                  Base hebdomadaire : 35 h (ou 39 h avec RTT)
                </div>
              </div>

              {/* Durées maximales */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)', marginBottom: 10 }}>
                  Durées maximales réglementaires
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)' }}>
                      <th style={{ padding: '7px 10px', textAlign: 'left', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Limite</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Valeur</th>
                      <th style={{ padding: '7px 10px', textAlign: 'left', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Référence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { limite: 'Durée journalière',         val: '10 h / jour',        ref: 'Art. 3 D.2000-815' },
                      { limite: 'Amplitude maximale',        val: '12 h',               ref: 'Art. 3' },
                      { limite: 'Durée hebdomadaire',        val: '48 h / semaine',     ref: 'Art. 3' },
                      { limite: 'Moy. hebdo sur 12 semaines',val: '44 h',               ref: 'Directive 2003/88/CE' },
                      { limite: 'Repos minimal quotidien',   val: '11 h consécutives',  ref: 'Art. 3' },
                      { limite: 'Repos hebdomadaire',        val: '35 h consécutives',  ref: 'Art. 3' },
                    ].map((r, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border-soft)', background: i % 2 === 0 ? 'transparent' : 'var(--surface-2)' }}>
                        <td style={{ padding: '7px 10px', fontSize: 12, color: 'var(--text-secondary)' }}>{r.limite}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{r.val}</td>
                        <td style={{ padding: '7px 10px', fontSize: 11, color: 'var(--text-muted)' }}>{r.ref}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cycles */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)', marginBottom: 10 }}>
                  Cycles de travail autorisés
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: '35 h / semaine',          note: 'Semaine classique — sans RTT',          color: 'var(--indigo)' },
                    { label: '39 h / semaine + 20 RTT', note: 'Standard FPT avec jours RTT',           color: 'var(--teal)' },
                    { label: '4 jours / semaine',       note: 'Possible si accord local + 1 607 h/an', color: 'var(--amber)' },
                    { label: 'Cycle variable',          note: 'Annualisation sur accord de service',   color: 'var(--success)' },
                  ].map(({ label, note, color }) => (
                    <div key={label} style={{
                      padding: '10px 12px', background: 'var(--surface-2)',
                      borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${color}`,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color }}>{label}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jours de carence */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)', marginBottom: 10 }}>
                  Rappel — Jour de carence
                </div>
                <div style={{
                  padding: '10px 14px', background: 'var(--warning-bg)',
                  border: '1px solid rgba(138,94,0,0.2)', borderRadius: 'var(--radius-sm)',
                  fontSize: 12, color: 'var(--warning)', lineHeight: 1.6,
                }}>
                  1 jour de carence non rémunéré dès le 1er jour d&apos;arrêt maladie (art. 115 loi 2018-1317). S&apos;applique aux titulaires et contractuels sauf accident de travail.
                </div>
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border-soft)', paddingTop: 12 }}>
                Sources : Décret n°2000-815 du 25 août 2000 relatif à l&apos;aménagement et à la réduction du temps de travail dans la FPT · Modifié par décret n°2001-623 du 12 juillet 2001 · CGFP art. D1332-22 · Directive européenne 2003/88/CE
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
