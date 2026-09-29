'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { calculerArret, POINT_INDICE, TAUX_CNRACL_EMPLOYEUR, TAUX_IRCANTEC_EMPLOYEUR } from '@tiarh/engine';
import type { StatutAgent, TypeConge } from '@tiarh/engine';
import { Topbar } from '@/components/dashboard/Topbar';
import { PrefillNotice } from '@/components/dashboard/PrefillNotice';
import { getAgent } from '@/lib/demo-data';
import { readEnum, readNumber, withOption } from '@/lib/prefill';

type FormState = {
  indiceMajore: string;
  traitementBrut: string;
  primesMenusuelles: string;
  remplacementJour: string;
  type: TypeConge;
  dureeJours: string;
};

const TYPE_LABELS: Record<TypeConge, string> = {
  CMO:   'CMO — Congé Maladie Ordinaire',
  CLM:   'CLM — Congé Longue Maladie',
  CLD:   'CLD — Congé Longue Durée',
  AT:    'AT — Accident de Travail',
  CITIS: 'CITIS — Accident imputable au service',
};

/** Phases de maintien affichées — mêmes bornes que le moteur (packages/engine/src/arret.ts). */
const PHASES: Record<TypeConge, Array<{ phase: string; debut: number; fin: number | null; taux: string; color: string }>> = {
  CMO: [
    { phase: 'Phase 1 — 90 % du traitement', debut: 1,    fin: 90,   taux: '90 %',  color: 'var(--success)' },
    { phase: 'Phase 2 — Demi-traitement',    debut: 91,   fin: 360,  taux: '50 %',  color: 'var(--amber)' },
  ],
  CLM: [
    { phase: 'Phase 1 — Plein traitement',   debut: 1,    fin: 365,  taux: '100 %', color: 'var(--success)' },
    { phase: 'Phase 2 — Demi-traitement',    debut: 366,  fin: 1095, taux: '50 %',  color: 'var(--amber)' },
  ],
  CLD: [
    { phase: 'Phase 1 — Plein traitement',   debut: 1,    fin: 1095, taux: '100 %', color: 'var(--success)' },
    { phase: 'Phase 2 — Demi-traitement',    debut: 1096, fin: 1825, taux: '50 %',  color: 'var(--amber)' },
  ],
  AT: [
    { phase: 'Plein traitement',             debut: 1,    fin: null, taux: '100 %', color: 'var(--success)' },
  ],
  CITIS: [
    { phase: 'Plein traitement',             debut: 1,    fin: null, taux: '100 %', color: 'var(--success)' },
  ],
};

const pctTaux = (t: number) => (t * 100).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' %';

const IM_OPTIONS = [
  { value: 340, label: '340 — Cat. C début' },
  { value: 380, label: '380 — Cat. C moyen' },
  { value: 420, label: '420 — Cat. C sommet' },
  { value: 460, label: '460 — Cat. B début' },
  { value: 540, label: '540 — Cat. B/A' },
  { value: 620, label: '620 — Cat. A moyen' },
  { value: 750, label: '750 — Cat. A supérieur' },
];

const CAT_OPTIONS = ['C', 'B', 'A'] as const;

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
}

/* ── Styles partagés du formulaire ── */
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
  transition: 'border-color 0.15s, box-shadow 0.15s',
  appearance: 'none' as const,
};

type Statut = 'Titulaire' | 'Contractuel';

function computeArret(form: FormState, statut: Statut) {
  return calculerArret({
    agent: {
      indiceMajore:     Number(form.indiceMajore),
      traitementBrut:   Number(form.traitementBrut),
      primesMenusuelles: Number(form.primesMenusuelles),
    },
    type:       form.type,
    dureeJours: Number(form.dureeJours),
    statut:     statut === 'Titulaire' ? 'TITULAIRE' : 'CONTRACTUEL',
  });
}

/** État initial : paramètres d'URL (fiche agent) ou valeurs par défaut. */
function readPrefill(params: { get(k: string): string | null }) {
  const defaults: FormState = {
    indiceMajore:      '540',
    traitementBrut:    '2650',
    primesMenusuelles: '320',
    remplacementJour:  '130',
    type:              'CMO',
    dureeJours:        '65',
  };
  const im = readNumber(params, 'im', 200, 1500);
  const statutParam = readEnum<StatutAgent>(params, 'statut', ['TITULAIRE', 'CONTRACTUEL']);
  if (im === null || statutParam === null) {
    return { prefilled: false, form: defaults, statut: 'Titulaire' as Statut, cat: 'A' as (typeof CAT_OPTIONS)[number] };
  }
  const traitement = readNumber(params, 'traitement', 0, 20000) ?? Math.round(im * POINT_INDICE * 100) / 100;
  const type = readEnum<TypeConge>(params, 'type', ['CMO', 'CLM', 'CLD', 'AT', 'CITIS']);
  const duree = readNumber(params, 'duree', 1, 365);
  const agent = getAgent(params.get('agent'));
  return {
    prefilled: true,
    form: {
      ...defaults,
      indiceMajore: String(im),
      traitementBrut: String(traitement),
      type: type ?? defaults.type,
      dureeJours: String(duree !== null ? Math.round(duree) : Number(defaults.dureeJours)),
    },
    statut: (statutParam === 'TITULAIRE' ? 'Titulaire' : 'Contractuel') as Statut,
    cat: agent?.cat ?? ('A' as (typeof CAT_OPTIONS)[number]),
  };
}

export default function SimulArretPage() {
  return (
    <Suspense fallback={null}>
      <SimulArret />
    </Suspense>
  );
}

function SimulArret() {
  const searchParams = useSearchParams();
  const [initial] = useState(() => readPrefill(searchParams));
  const agentId = initial.prefilled ? searchParams.get('agent') : null;
  const [showPanel, setShowPanel] = useState(false);
  const [statut, setStatut] = useState<Statut>(initial.statut);
  const [categorie, setCategorie] = useState<string>(initial.cat);
  const [form, setForm] = useState<FormState>(initial.form);
  const [result, setResult] = useState<ReturnType<typeof calculerArret> | null>(
    () => (initial.prefilled ? computeArret(initial.form, initial.statut) : null),
  );

  function set(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleCalculate() {
    setResult(computeArret(form, statut));
  }

  const imOptions = withOption(IM_OPTIONS, Number(form.indiceMajore), `${form.indiceMajore} — dossier agent`);

  const duree    = Number(form.dureeJours);
  const rempJour = Number(form.remplacementJour);
  const rempTotal = rempJour * duree;
  const grandTotal = result ? result.coutEmployeur + rempTotal : null;
  const primesProrated = result
    ? Number(form.primesMenusuelles) * (duree / 30)
    : null;

  return (
    <>
      <Topbar title="SimulArrêt" subtitle="Coût employeur arrêts maladie" />

      {/* Page header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <div className="page-title">SimulArrêt — Coût employeur</div>
            <div className="page-subtitle">
              <span className="legal-tag">CGFP L822-1</span>
              <span className="legal-tag">Décret 87-602</span>
              Calcul du maintien de traitement et charges employeur
            </div>
          </div>
          <div className="btn-row">
            <button className="btn-secondary" onClick={() => setShowPanel(true)}>📄 Aide réglementaire</button>
            <button className="btn-primary" onClick={handleCalculate}>↺ Recalculer</button>
          </div>
        </div>
        <div className="sub-nav">
          <button type="button" className={`sub-tab${showPanel ? '' : ' active'}`} onClick={() => setShowPanel(false)}>Simulation</button>
          <button type="button" className={`sub-tab${showPanel ? ' active' : ''}`} onClick={() => setShowPanel(true)}>Formules &amp; règles</button>
          <button type="button" className="sub-tab" disabled title="Bientôt disponible">Historique calculs</button>
        </div>
      </div>

      <div className="page-body">

        <PrefillNotice agentId={agentId} />

        {/* Notice */}
        <div className="notice-warning">
          <span>⚠</span>
          <div>
            <strong>Texte modifié :</strong> Loi n°84-53 art. 41 — version 2019 applicable. Moteur à jour.
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          <div className="kpi-card navy">
            <div className="kpi-label">Coût total estimé</div>
            <div className="kpi-value large navy">
              {grandTotal !== null ? fmt(grandTotal) : '—'}
            </div>
            <div className="kpi-meta">Charge employeur + remplacement</div>
          </div>
          <div className="kpi-card indigo">
            <div className="kpi-label">Traitement maintenu</div>
            <div className="kpi-value large indigo">
              {result ? fmt(result.maintienTraitement) : '—'}
            </div>
            <div className="kpi-meta">Net maintenu</div>
          </div>
          <div className="kpi-card teal">
            <div className="kpi-label">Durée simulée</div>
            <div className="kpi-value large teal">{form.dureeJours} j</div>
            <div className="kpi-meta">Jours d&apos;absence</div>
          </div>
          <div className="kpi-card amber">
            <div className="kpi-label">Remplacement</div>
            <div className="kpi-value large amber">
              {result ? fmt(rempTotal) : `${rempJour} €/j`}
            </div>
            <div className="kpi-meta">Coût vacation estimé</div>
          </div>
        </div>

        {/* Main 2-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>

          {/* ── FORM CARD ── */}
          <div className="ds-card">
            {/* Card header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-soft)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>👤</span>
              <span style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--navy)',
                fontFamily: 'var(--font-ui)',
              }}>
                Paramètres de l&apos;agent
              </span>
            </div>

            <div style={{ padding: '20px 20px 0' }}>

              {/* Row 1 : STATUT + CATÉGORIE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>

                <div>
                  <div style={LABEL}>Statut</div>
                  <div style={{
                    display: 'flex',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    background: 'var(--bg)',
                  }}>
                    {(['Titulaire', 'Contractuel'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setStatut(s)}
                        style={{
                          flex: 1,
                          height: 42,
                          fontSize: 13,
                          fontWeight: 600,
                          fontFamily: 'var(--font-ui)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background 0.15s, color 0.15s',
                          background: statut === s ? 'var(--navy)' : 'transparent',
                          color: statut === s ? '#fff' : 'var(--text-muted)',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={LABEL}>Catégorie</div>
                  <select
                    style={INPUT}
                    value={categorie}
                    onChange={e => setCategorie(e.target.value)}
                  >
                    {CAT_OPTIONS.map(c => (
                      <option key={c} value={c}>Catégorie {c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2 : IM + TYPE CONGÉ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>

                <div>
                  <div style={LABEL}>Indice Majoré (IM)</div>
                  <select
                    style={INPUT}
                    value={form.indiceMajore}
                    onChange={e => set('indiceMajore', e.target.value)}
                  >
                    {imOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={LABEL}>Type de Congé</div>
                  <select
                    style={INPUT}
                    value={form.type}
                    onChange={e => set('type', e.target.value as TypeConge)}
                  >
                    {(Object.keys(TYPE_LABELS) as TypeConge[]).map(t => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Separator */}
              <div style={{ height: 1, background: 'var(--border-soft)', margin: '2px 0 18px' }} />

              {/* DURÉE — full width slider */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ ...LABEL, marginBottom: 10 }}>
                  Durée de l&apos;arrêt —{' '}
                  <span style={{ color: 'var(--indigo)', fontFamily: 'var(--font-mono)' }}>
                    {form.dureeJours} jours
                  </span>
                </div>
                <div className="slider-row">
                  <input
                    type="range"
                    min={1}
                    max={365}
                    className="form-range"
                    value={form.dureeJours}
                    onChange={e => set('dureeJours', e.target.value)}
                  />
                  <span className="slider-value">{form.dureeJours} j</span>
                </div>
              </div>

              {/* Row 3 : TRAITEMENT + PRIMES */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>

                <div>
                  <div style={LABEL}>Traitement Brut Mensuel</div>
                  <input
                    type="number"
                    style={INPUT}
                    value={form.traitementBrut}
                    onChange={e => set('traitementBrut', e.target.value)}
                    placeholder="ex : 2 650"
                  />
                </div>

                <div>
                  <div style={LABEL}>Primes Mensuelles</div>
                  <input
                    type="number"
                    style={INPUT}
                    value={form.primesMenusuelles}
                    onChange={e => set('primesMenusuelles', e.target.value)}
                    placeholder="ex : 320"
                  />
                </div>
              </div>

              {/* COÛT REMPLACEMENT/JOUR — full width slider */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ ...LABEL, marginBottom: 10 }}>
                  Coût Remplacement/Jour —{' '}
                  <span style={{ color: 'var(--indigo)', fontFamily: 'var(--font-mono)' }}>
                    {form.remplacementJour} €
                  </span>
                </div>
                <div className="slider-row">
                  <input
                    type="range"
                    min={0}
                    max={400}
                    step={5}
                    className="form-range"
                    value={form.remplacementJour}
                    onChange={e => set('remplacementJour', e.target.value)}
                  />
                  <span className="slider-value">{form.remplacementJour} €</span>
                </div>
              </div>

              {/* Separator */}
              <div style={{ height: 1, background: 'var(--border-soft)', marginBottom: 18 }} />

            </div>

            {/* CTA button — full width, hors padding pour coller aux bords */}
            <div style={{ padding: '0 20px 20px' }}>
              <button
                onClick={handleCalculate}
                style={{
                  width: '100%',
                  height: 48,
                  background: 'var(--navy)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'var(--font-ui)',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                  transition: 'background 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--navy-mid)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--navy)')}
              >
                Calculer le coût employeur →
              </button>
            </div>
          </div>

          {/* ── RESULTS PANEL ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Hero résultat */}
            <div className="result-hero">
              <div className="result-hero-label">Coût total estimé — Charge employeur</div>
              <div className="result-hero-amount">
                {grandTotal !== null ? fmt(grandTotal) : '—'}
              </div>
              <div className="result-hero-sub">
                {result
                  ? `IM ${form.indiceMajore} · ${form.type} · ${form.dureeJours} jours`
                  : 'Renseignez les paramètres et calculez'}
              </div>
            </div>

            {/* Breakdown 2×2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div className="breakdown-cell">
                <div className="breakdown-cell-label">Maintien traitement</div>
                <div className="breakdown-cell-value" style={{ color: 'var(--danger)' }}>
                  {result ? fmt(result.maintienTraitement) : '—'}
                </div>
              </div>
              <div className="breakdown-cell">
                <div className="breakdown-cell-label">Charges {result ? result.regimeRetraite : 'retraite'}</div>
                <div className="breakdown-cell-value" style={{ color: 'var(--danger)' }}>
                  {result ? fmt(result.cotisationRetraiteEmployeur) : '—'}
                </div>
              </div>
              <div className="breakdown-cell">
                <div className="breakdown-cell-label">Remplacement</div>
                <div className="breakdown-cell-value" style={{ color: 'var(--amber)' }}>
                  {result ? fmt(rempTotal) : `${rempJour} €/j`}
                </div>
              </div>
              <div className="breakdown-cell">
                <div className="breakdown-cell-label">Primes proratisées</div>
                <div className="breakdown-cell-value" style={{ color: 'var(--teal)' }}>
                  {primesProrated !== null ? fmt(primesProrated) : '—'}
                </div>
              </div>
            </div>

            {/* Phase timeline */}
            <div className="ds-card" style={{ marginBottom: 0 }}>
              <div className="ds-card-header">📅 Phases réglementaires</div>
              <div className="ds-card-body" style={{ paddingTop: 12 }}>
                {PHASES[form.type].map(p => ({
                  phase: p.phase,
                  range: p.fin === null ? `J${p.debut} → consolidation` : `J${p.debut}–J${p.fin}`,
                  desc: `${p.taux} du traitement indiciaire`,
                  color: p.color,
                  active: duree >= p.debut,
                })).map((p, idx, arr) => (
                  <div key={p.phase} style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: p.active ? p.color : 'var(--border)',
                        border: '2px solid white',
                        marginTop: 4, flexShrink: 0,
                        boxShadow: p.active ? `0 0 0 2px ${p.color}30` : 'none',
                      }} />
                      {idx < arr.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: 'var(--border)', margin: '2px 0' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: idx < arr.length - 1 ? 14 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{
                          fontSize: 12, fontWeight: 700,
                          color: p.active ? 'var(--text-primary)' : 'var(--text-muted)',
                        }}>
                          {p.phase}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {p.range}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {statut === 'Contractuel' && (
              <div className="notice-warning">
                <span>⚠</span>
                <div>
                  {form.type === 'CLM' || form.type === 'CLD'
                    ? 'CLM et CLD sont réservés aux titulaires : un contractuel relève du congé de grave maladie.'
                    : 'Contractuel : cotisation IRCANTEC au lieu de la CNRACL. Les durées de maintien dépendent de l\'ancienneté (décret n°88-145) et les IJSS ne sont pas déduites.'}
                </div>
              </div>
            )}

            {/* Legal notice */}
            <div className="notice-info">
              <span>ℹ️</span>
              <div>
                Résultats indicatifs. Base légale : CGFP art. L822-1 et L822-3 (loi n°2025-127), décret n°87-602,
                CNRACL employeur {pctTaux(TAUX_CNRACL_EMPLOYEUR)} · IRCANTEC {pctTaux(TAUX_IRCANTEC_EMPLOYEUR)} (2026).
              </div>
            </div>
          </div>

        </div>
      </div>
      {/* ── Drawer Aide réglementaire ── */}
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
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 480,
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
                  Aide réglementaire — Congés maladie
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  CGFP art. L822-1 · Décret n°87-602 du 30/07/1987
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

            {/* Content */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* CMO */}
              {([
                {
                  type: 'CMO', label: 'Congé Maladie Ordinaire', color: 'var(--amber)', bg: 'var(--amber-bg)',
                  lignes: [
                    { phase: 'Phase 1  (j 1–90)',   plein: '90 %', demi: '—' },
                    { phase: 'Phase 2  (j 91–360)',  plein: '50 %', demi: '—' },
                  ],
                  note: 'Durée max : 12 mois sur une période de 12 mois consécutifs. 90 % pendant 3 mois pour les arrêts depuis le 01/03/2025 (loi n°2025-127, art. 189). Contractuels : durées selon l\'ancienneté (décret n°88-145, art. 7).',
                },
                {
                  type: 'CLM', label: 'Congé Longue Maladie', color: 'var(--indigo)', bg: 'var(--info-bg)',
                  lignes: [
                    { phase: 'Année 1',    plein: '100 %', demi: '—' },
                    { phase: 'Années 2–3', plein: '50 %',  demi: '—' },
                  ],
                  note: 'Réservé aux titulaires. Durée max 3 ans. Affections désignées par décret ou présentant un caractère invalidant.',
                },
                {
                  type: 'CLD', label: 'Congé Longue Durée', color: 'var(--danger)', bg: 'var(--danger-bg)',
                  lignes: [
                    { phase: 'Années 1–3', plein: '100 %', demi: '—' },
                    { phase: 'Années 4–5', plein: '50 %',  demi: '—' },
                  ],
                  note: 'Titulaires uniquement. Affections longue durée (ALD) : tuberculose, cancer, maladie mentale, polio, déficit immunitaire.',
                },
                {
                  type: 'AT', label: 'Accident de Travail / CITIS', color: 'var(--success)', bg: 'var(--success-bg)',
                  lignes: [
                    { phase: 'Durée illimitée', plein: '100 %', demi: '—' },
                  ],
                  note: 'Plein traitement jusqu\'à guérison ou consolidation. Frais médicaux pris en charge. CITIS : même régime, imputable au service (L822-20 CGFP).',
                },
              ] as const).map(({ type, label, color, bg, lignes, note }) => (
                <div key={type}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                  }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                      background: bg, color, fontSize: 11, fontWeight: 700,
                    }}>{type}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
                      {label}
                    </span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-2)' }}>
                        <th style={{ padding: '6px 10px', textAlign: 'left', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Période</th>
                        <th style={{ padding: '6px 10px', textAlign: 'center', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Traitement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lignes.map((l, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--border-soft)' }}>
                          <td style={{ padding: '7px 10px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>{l.phase}</td>
                          <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color }}>
                            {l.plein}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{
                    fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5,
                    padding: '6px 10px', background: bg,
                    borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${color}`,
                  }}>
                    {note}
                  </div>
                </div>
              ))}

              {/* Charges employeur */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)', marginBottom: 8 }}>
                  Charges employeur rappel
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'CNRACL employeur', val: pctTaux(TAUX_CNRACL_EMPLOYEUR) },
                    { label: 'RAFP employeur',   val: '5 %' },
                    { label: 'IRCANTEC (TA)',    val: pctTaux(TAUX_IRCANTEC_EMPLOYEUR) },
                    { label: 'Cotis. chômage',   val: '0 % (FPT)' },
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
                Sources : CGFP art. L822-1 à L822-26 · Décret n°87-602 du 30 juillet 1987 · Loi n°84-53 du 26 janvier 1984 · Circulaire NOR RDFF1427139C du 26/09/2014
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
