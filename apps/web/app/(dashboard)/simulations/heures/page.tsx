'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { calculerHeures, CET_PLAFOND_JOURS, POINT_INDICE, IHTS_PLAFOND_MENSUEL } from '@tiarh/engine';
import type { AffectationHeures, MajorationHeures, ZoneResidence } from '@tiarh/engine';
import { PlanGate } from '@tiarh/ui';
import { Topbar as DsTopbar } from '@/components/dashboard/Topbar';
import { PrefillNotice } from '@/components/dashboard/PrefillNotice';
import { AGENTS, CET_SEUIL_ALERTE, ORG, nomListe } from '@/lib/demo-data';
import { readEnum, readNumber, withOption } from '@/lib/prefill';

const IM_OPTIONS = [
  { value: 340, label: 'IM 340 — Cat. C début' },
  { value: 380, label: 'IM 380 — Cat. C moyen' },
  { value: 420, label: 'IM 420 — Cat. C sommet' },
  { value: 460, label: 'IM 460 — Cat. B début' },
  { value: 540, label: 'IM 540 — Cat. B/A' },
];

const CAT_OPTIONS = ['C', 'B', 'A'] as const;

const AFFECTATION_OPTIONS = [
  { value: 'IHTS',        label: 'IHTS — Indemnité horaire' },
  { value: 'recuperation',label: 'Récupération' },
  { value: 'CET',         label: 'CET — Compte épargne-temps' },
] as const;

const MAJORATION_OPTIONS = [
  { value: 'standard',      label: 'Standard (jour ouvré)' },
  { value: 'nuit',          label: 'Nuit 22h–7h (+100 %)' },
  { value: 'dimancheFerie', label: 'Dimanche ou férié (+2/3)' },
] as const;

const ZONE_OPTIONS = [
  { value: '3', label: 'Zone 3 — sans indemnité (0 %)' },
  { value: '2', label: 'Zone 2 — indemnité 1 %' },
  { value: '1', label: 'Zone 1 — indemnité 3 %' },
] as const;

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
}

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

type HeuresForm = {
  indiceMajore: string;
  heuresSup: string;
  joursCETExistants: string;
  categorie: string;
  affectation: string;
  majoration: string;
  zoneResidence: string;
};

function computeHeures(form: HeuresForm) {
  return calculerHeures({
    indiceMajore:      Number(form.indiceMajore),
    heuresSup:         Number(form.heuresSup),
    joursCETExistants: Number(form.joursCETExistants),
    zoneResidence:     Number(form.zoneResidence) as ZoneResidence,
    majoration:        form.majoration as MajorationHeures,
    affectation:       form.affectation as AffectationHeures,
  });
}

/** État initial : paramètres d'URL (fiche agent) ou valeurs par défaut. */
function readPrefill(params: { get(k: string): string | null }) {
  const defaults: HeuresForm = {
    indiceMajore:      '380',
    heuresSup:         '14',
    joursCETExistants: '10',
    categorie:         'C',
    affectation:       'IHTS',
    majoration:        'standard',
    zoneResidence:     '3',
  };
  const im = readNumber(params, 'im', 200, 1500);
  const cet = readNumber(params, 'cet', 0, 60);
  const cat = readEnum(params, 'cat', CAT_OPTIONS);
  if (im === null || cet === null) return { prefilled: false, form: defaults };
  return {
    prefilled: true,
    form: { ...defaults, indiceMajore: String(im), joursCETExistants: String(Math.round(cet)), categorie: cat ?? defaults.categorie },
  };
}

type Vue = 'simulateur' | 'cet';

export default function HeuresPage() {
  return (
    <Suspense fallback={null}>
      <Heures />
    </Suspense>
  );
}

function Heures() {
  const searchParams = useSearchParams();
  const [initial] = useState(() => readPrefill(searchParams));
  const agentId = initial.prefilled ? searchParams.get('agent') : null;
  const [vue, setVue] = useState<Vue>(() => (searchParams.get('vue') === 'cet' ? 'cet' : 'simulateur'));
  const [showPanel, setShowPanel] = useState(false);
  const [form, setForm] = useState<HeuresForm>(initial.form);
  const [result, setResult] = useState<ReturnType<typeof calculerHeures> | null>(
    () => (initial.prefilled ? computeHeures(initial.form) : null),
  );

  function set(key: keyof HeuresForm, value: string) {
    setForm(p => ({ ...p, [key]: value }));
  }

  function calc() {
    setResult(computeHeures(form));
  }

  const imOptions = withOption(IM_OPTIONS, Number(form.indiceMajore), `IM ${form.indiceMajore} — dossier agent`);

  const cetAlert = result?.cetPlafondAtteint;

  return (
    <>
      <DsTopbar title="HeuresSup+" subtitle={`IHTS + CET (plafond ${CET_PLAFOND_JOURS} jours)`} />

      <div className="page-header">
        <div className="page-header-top">
          <div>
            <div className="page-title">Heures supplémentaires &amp; IHTS</div>
            <div className="page-subtitle">
              <span className="legal-tag">CGFP L621-1</span>
              <span className="legal-tag">Décret 2002-60</span>
              Calcul IHTS et suivi CET — Plafond {CET_PLAFOND_JOURS} jours
            </div>
          </div>
          <div className="btn-row">
            <button className="btn-secondary" onClick={() => setShowPanel(true)}>📄 Barème IHTS</button>
            <button className="btn-primary" onClick={calc}>↺ Recalculer</button>
          </div>
        </div>
        <div className="sub-nav">
          <button type="button" className={`sub-tab${vue === 'simulateur' ? ' active' : ''}`} onClick={() => setVue('simulateur')}>Simulateur IHTS</button>
          <button type="button" className="sub-tab" disabled title="Bientôt disponible">Suivi mensuel</button>
          <button type="button" className={`sub-tab${vue === 'cet' ? ' active' : ''}`} onClick={() => setVue('cet')}>CET — Soldes</button>
        </div>
      </div>

      <div className="page-body">
        <PlanGate required={['starter', 'pro', 'enterprise']} currentPlan={ORG.plan}>
          {vue === 'cet' && <CetSoldes />}
          {vue === 'simulateur' && (<>
          <PrefillNotice agentId={agentId} />

          <div className="notice-warning">
            <span>⚠</span>
            <div>
              <strong>Alerte CET :</strong> Vérifiez les agents approchant du plafond de {CET_PLAFOND_JOURS} jours.
            </div>
          </div>

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            <div className="kpi-card navy">
              <div className="kpi-label">HS ce mois</div>
              <div className="kpi-value large navy">{form.heuresSup} h</div>
              <div className="kpi-meta">Heures saisies</div>
            </div>
            <div className="kpi-card indigo">
              <div className="kpi-label">IHTS estimées</div>
              <div className="kpi-value large indigo">{result ? fmt(result.ihtsTotal) : '—'}</div>
              <div className="kpi-meta">Brut calculé</div>
            </div>
            <div className="kpi-card teal">
              <div className="kpi-label">Solde CET</div>
              <div className="kpi-value large teal">{form.joursCETExistants} j</div>
              <div className="kpi-meta">Jours existants</div>
            </div>
            <div className={`kpi-card ${cetAlert ? 'danger' : 'amber'}`}>
              <div className="kpi-label">Plafond CET</div>
              <div className={`kpi-value large ${cetAlert ? 'danger' : 'amber'}`}>{CET_PLAFOND_JOURS} j</div>
              <div className="kpi-meta">{cetAlert ? '⚠ Plafond atteint' : 'Marge disponible'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>

            {/* ── FORM CARD ── */}
            <div className="ds-card">
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-soft)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 16 }}>⏱</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)' }}>
                  Paramètres IHTS
                </span>
              </div>

              <div style={{ padding: '20px 20px 0' }}>

                {/* Row 1 : Catégorie + IM */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                  <div>
                    <div style={LABEL}>Catégorie</div>
                    <select style={INPUT} value={form.categorie} onChange={e => set('categorie', e.target.value)}>
                      {CAT_OPTIONS.map(c => <option key={c} value={c}>Catégorie {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={LABEL}>Indice Majoré (IM)</div>
                    <select style={INPUT} value={form.indiceMajore} onChange={e => set('indiceMajore', e.target.value)}>
                      {imOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 2 : Affectation + Majoration */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                  <div>
                    <div style={LABEL}>Affectation</div>
                    <select style={INPUT} value={form.affectation} onChange={e => set('affectation', e.target.value)}>
                      {AFFECTATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={LABEL}>Majoration</div>
                    <select style={INPUT} value={form.majoration} onChange={e => set('majoration', e.target.value)}>
                      {MAJORATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Separator */}
                <div style={{ height: 1, background: 'var(--border-soft)', marginBottom: 18 }} />

                {/* Nb heures slider */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ ...LABEL, marginBottom: 10 }}>
                    Nb heures supplémentaires —{' '}
                    <span style={{ color: 'var(--indigo)', fontFamily: 'var(--font-mono)' }}>
                      {form.heuresSup} h
                    </span>
                  </div>
                  <div className="slider-row">
                    <input type="range" min={1} max={25} className="form-range"
                      value={form.heuresSup}
                      onChange={e => set('heuresSup', e.target.value)} />
                    <span className="slider-value">{form.heuresSup} h</span>
                  </div>
                </div>

                {/* Jours CET + zone de résidence */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                  <div>
                    <div style={LABEL}>Jours CET existants</div>
                    <input type="number" style={INPUT}
                      min={0} max={60}
                      value={form.joursCETExistants}
                      onChange={e => set('joursCETExistants', e.target.value)}
                      placeholder="ex : 10" />
                  </div>
                  <div>
                    <div style={LABEL}>Indemnité de résidence</div>
                    <select style={INPUT} value={form.zoneResidence} onChange={e => set('zoneResidence', e.target.value)}>
                      {ZONE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {form.categorie === 'A' && (
                  <div className="notice-warning" style={{ marginBottom: 18 }}>
                    <span>⚠</span>
                    <div>Les IHTS sont réservées aux catégories B et C (et à certains emplois de catégorie A listés par arrêté).</div>
                  </div>
                )}

                {/* Separator */}
                <div style={{ height: 1, background: 'var(--border-soft)', marginBottom: 18 }} />

              </div>

              {/* CTA */}
              <div style={{ padding: '0 20px 20px' }}>
                <button
                  onClick={calc}
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
                  Calculer les IHTS →
                </button>
              </div>
            </div>

            {/* ── RESULTS ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

              <div className="result-hero">
                <div className="result-hero-label">IHTS total brut estimé</div>
                <div className="result-hero-amount">{result ? fmt(result.ihtsTotal) : '—'}</div>
                <div className="result-hero-sub">
                  {result
                    ? `IM ${form.indiceMajore} · ${form.heuresSup} h · ${form.affectation}`
                    : 'Renseignez les paramètres et calculez'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div className="breakdown-cell">
                  <div className="breakdown-cell-label">Taux horaire de base</div>
                  <div className="breakdown-cell-value" style={{ color: 'var(--navy)' }}>
                    {result
                      ? result.ihtsParHeure.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
                      : '—'}
                  </div>
                </div>
                <div className="breakdown-cell">
                  <div className="breakdown-cell-label">Brut total</div>
                  <div className="breakdown-cell-value" style={{ color: 'var(--indigo)' }}>
                    {result ? fmt(result.ihtsTotal) : '—'}
                  </div>
                </div>
                <div className="breakdown-cell">
                  <div className="breakdown-cell-label">Net estimé (×0,77)</div>
                  <div className="breakdown-cell-value" style={{ color: 'var(--teal)' }}>
                    {result ? fmt(result.ihtsTotal * 0.77) : '—'}
                  </div>
                </div>
                <div className="breakdown-cell">
                  <div className="breakdown-cell-label">Plafond mensuel</div>
                  <div className="breakdown-cell-value" style={{ color: 'var(--amber)' }}>{IHTS_PLAFOND_MENSUEL} h</div>
                </div>
              </div>

              {result && result.heuresRecuperation > 0 && (
                <div className="notice-info">
                  <span>ℹ️</span>
                  <div>{result.heuresRecuperation} h à rendre en repos compensateur — aucune indemnité versée.</div>
                </div>
              )}

              {result && result.joursCET > 0 && (
                <div className="ds-card" style={{ marginBottom: 0 }}>
                  <div className="ds-card-body" style={{ paddingTop: 12, paddingBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>
                        Jours CET crédités
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600,
                        color: result.cetPlafondAtteint ? 'var(--danger)' : 'var(--teal)',
                      }}>
                        +{result.joursCET} j
                      </span>
                    </div>
                    {result.cetPlafondAtteint && (
                      <div style={{
                        marginTop: 8, padding: '6px 10px',
                        background: 'var(--danger-bg)', border: '1px solid rgba(185,28,28,0.2)',
                        borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--danger)',
                        display: 'flex', gap: 6,
                      }}>
                        <span>⚠</span>
                        <span>Plafond CET de {CET_PLAFOND_JOURS} jours atteint — régularisation nécessaire.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="notice-info">
                <span>ℹ️</span>
                <div>Taux = (traitement brut annuel + indemnité de résidence) / 1820, × 1,25 jusqu&apos;à 14 h puis × 1,27. Décret n°2002-60 du 14/01/2002.</div>
              </div>
            </div>

          </div>
          </>)}
        </PlanGate>
      </div>
      {/* ── Drawer Barème IHTS ── */}
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
                  Barème IHTS — Heures supplémentaires
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Décret n°2002-60 du 14/01/2002 · CGFP L621-1
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

              {/* Formule */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)', marginBottom: 10 }}>
                  Formule de calcul
                </div>
                <div style={{
                  background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px', fontFamily: 'var(--font-mono)',
                  fontSize: 13, color: 'var(--navy)', lineHeight: 1.8,
                  border: '1px solid var(--border-soft)',
                }}>
                  Taux horaire = (IM × {POINT_INDICE} × 12 + indemnité de résidence) / 1820<br />
                  IHTS brut = taux horaire × (14 h × 1,25 + heures suivantes × 1,27) × majoration<br />
                  Net estimé = brut × 0,77
                </div>
              </div>

              {/* Coefficients */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)', marginBottom: 10 }}>
                  Coefficients de majoration
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)' }}>
                      <th style={{ padding: '7px 10px', textAlign: 'left', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Type</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Coeff.</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Base légale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { type: '14 premières heures',   coeff: '× 1,25', base: 'Art. 7 D.2002-60', color: 'var(--text-primary)' },
                      { type: 'De la 15e à la 25e',    coeff: '× 1,27', base: 'Art. 7',           color: 'var(--text-primary)' },
                      { type: 'Nuit (22h–7h)',         coeff: '+ 100 %', base: 'Art. 8',          color: 'var(--danger)' },
                      { type: 'Dimanche / jour férié', coeff: '+ 2/3',   base: 'Art. 8',          color: 'var(--indigo)' },
                    ].map((r, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border-soft)' }}>
                        <td style={{ padding: '7px 10px', fontSize: 12, color: 'var(--text-secondary)' }}>{r.type}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: r.color }}>{r.coeff}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>{r.base}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Barème IM */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)', marginBottom: 10 }}>
                  Taux horaire par indice majoré
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)' }}>
                      <th style={{ padding: '7px 10px', textAlign: 'left', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>IM</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Taux horaire</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>10 h brut</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>25 h brut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[340,380,420,460,500,540,620,700,800].map((im, i) => {
                      const taux = calculerHeures({ indiceMajore: im, heuresSup: 0, joursCETExistants: 0 }).ihtsParHeure;
                      const brut = (h: number) => calculerHeures({ indiceMajore: im, heuresSup: h, joursCETExistants: 0 }).ihtsTotal;
                      return (
                        <tr key={im} style={{ borderTop: '1px solid var(--border-soft)', background: i % 2 === 0 ? 'transparent' : 'var(--surface-2)' }}>
                          <td style={{ padding: '7px 10px', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>IM {im}</td>
                          <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{taux.toFixed(2)} €</td>
                          <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--indigo)' }}>{brut(10).toFixed(2)} €</td>
                          <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)', fontWeight: 700 }}>{brut(25).toFixed(2)} €</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Plafonds et CET */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)', marginBottom: 10 }}>
                  Plafonds réglementaires
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Plafond mensuel IHTS',  val: `${IHTS_PLAFOND_MENSUEL} h` },
                    { label: 'Plafond annuel IHTS',   val: '300 h' },
                    { label: 'Plafond CET',           val: `${CET_PLAFOND_JOURS} jours` },
                    { label: 'Monétisation CET',     val: '83 € / j (cat. C)' },
                  ].map(({ label, val }) => (
                    <div key={label} style={{
                      padding: '8px 12px', background: 'var(--surface-2)',
                      borderRadius: 'var(--radius-sm)', display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border-soft)', paddingTop: 12 }}>
                Sources : Décret n°2002-60 du 14 janvier 2002 relatif aux indemnités horaires pour travaux supplémentaires · CGFP art. L621-1 à L621-10 · Arrêté du 27 janvier 2003 portant dispositions financières relatives au CET
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/** Soldes CET de l'effectif de démonstration, du plus élevé au plus faible. */
function CetSoldes() {
  const rows = [...AGENTS].sort((a, b) => b.joursCET - a.joursCET);
  const aControler = rows.filter(a => a.joursCET >= CET_SEUIL_ALERTE).length;
  return (
    <>
      <div className={aControler > 0 ? 'notice-warning' : 'notice-info'} style={{ marginTop: 0 }}>
        <span>{aControler > 0 ? '⚠' : 'ℹ️'}</span>
        <div>
          <strong>{aControler} compteur{aControler > 1 ? 's' : ''} CET à contrôler</strong> : solde de {CET_SEUIL_ALERTE} jours ou plus,
          plafond réglementaire {CET_PLAFOND_JOURS} jours.
        </div>
      </div>
      <div className="ds-card">
        <div className="ds-card-header">
          <span style={{ fontWeight: 700, color: 'var(--navy)' }}>Soldes CET — {rows.length} agents</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Matricule</th>
              <th>Cat.</th>
              <th>Service</th>
              <th>Solde CET</th>
              <th>Marge avant plafond</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(a => {
              const alerte = a.joursCET >= CET_SEUIL_ALERTE;
              return (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{nomListe(a)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{a.id}</td>
                  <td><strong>{a.cat}</strong></td>
                  <td style={{ fontSize: 12 }}>{a.service}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: alerte ? 'var(--danger)' : 'var(--text-primary)' }}>
                    {a.joursCET} j{alerte ? ' ⚠' : ''}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{Math.max(0, CET_PLAFOND_JOURS - a.joursCET)} j</td>
                  <td>
                    <Link href={`/agents/${a.id}`} className="btn-navy">Fiche →</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
