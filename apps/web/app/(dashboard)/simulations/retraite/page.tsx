'use client';
import { useState } from 'react';
import { calculerRetraite, POINT_INDICE, TRIMESTRES_RETRAITE_1965 } from '@tiarh/engine';
import { Topbar } from '@/components/dashboard/Topbar';

const IM_OPTIONS = [
  { value: 350, label: 'IM 350 — Cat. C' },
  { value: 450, label: 'IM 450 — Cat. B' },
  { value: 500, label: 'IM 500 — Cat. B/A' },
  { value: 600, label: 'IM 600 — Cat. A' },
  { value: 700, label: 'IM 700 — Cat. A sup.' },
  { value: 800, label: 'IM 800 — Hors-classe' },
];

function fmt(n: number, suffix = ' €/mois') {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + suffix;
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

export default function RetireSimPage() {
  const [showPanel, setShowPanel] = useState(false);
  const [form, setForm] = useState({
    indiceMajore:      '500',
    trimestresValides: '172',
    anneeNaissance:    '1965',
    anneeDepart:       '2029',
  });
  const [result, setResult] = useState<ReturnType<typeof calculerRetraite> | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm(p => ({ ...p, [key]: value }));
  }

  function calc() {
    setResult(calculerRetraite({
      indiceMajore:      Number(form.indiceMajore),
      trimestresValides: Number(form.trimestresValides),
      anneeNaissance:    Number(form.anneeNaissance),
      anneeDepart:       Number(form.anneeDepart),
    }));
  }

  const trimestres = Number(form.trimestresValides);
  const hasDecote  = result && result.decote > 0;
  const hasSurcote = result && result.surcote > 0;

  return (
    <>
      <Topbar title="RetireSim" subtitle="Pension CNRACL — Réforme 2023" plan="pro" />

      <div className="page-header">
        <div className="page-header-top">
          <div>
            <div className="page-title">RetireSim — Pension CNRACL</div>
            <div className="page-subtitle">
              <span className="legal-tag">CNRACL</span>
              <span className="legal-tag">Loi 2023-270</span>
              Simulation pension retraite — Réforme 2023 ({TRIMESTRES_RETRAITE_1965} trimestres)
            </div>
          </div>
          <div className="btn-row">
            <button className="btn-secondary" onClick={() => setShowPanel(true)}>📄 Barème CNRACL</button>
            <button className="btn-primary" onClick={calc}>↺ Recalculer</button>
          </div>
        </div>
        <div className="sub-nav">
          <button className="sub-tab active">Simulation</button>
          <button className="sub-tab">Barème</button>
          <button className="sub-tab">Historique</button>
        </div>
      </div>

      <div className="page-body">

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          <div className="kpi-card navy">
            <div className="kpi-label">Pension brute</div>
            <div className="kpi-value large navy">{result ? fmt(result.pensionBrute) : '—'}</div>
            <div className="kpi-meta">Mensuelle brute</div>
          </div>
          <div className="kpi-card indigo">
            <div className="kpi-label">Taux liquidation</div>
            <div className="kpi-value large indigo">
              {result ? (result.tauxLiquidation * 100).toFixed(1) + ' %' : '—'}
            </div>
            <div className="kpi-meta">Taux appliqué</div>
          </div>
          <div className="kpi-card teal">
            <div className="kpi-label">Trimestres validés</div>
            <div className="kpi-value large teal">{form.trimestresValides} T</div>
            <div className="kpi-meta">Sur {TRIMESTRES_RETRAITE_1965} requis</div>
          </div>
          <div className={`kpi-card ${hasDecote ? 'danger' : 'amber'}`}>
            <div className="kpi-label">Décote</div>
            <div className={`kpi-value large ${hasDecote ? 'danger' : 'amber'}`}>
              {result ? (result.decote > 0 ? '−' + (result.decote * 100).toFixed(1) + '%' : 'Aucune') : '—'}
            </div>
            <div className="kpi-meta">{hasDecote ? 'Décote appliquée' : 'Taux plein atteint'}</div>
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
              <span style={{ fontSize: 16 }}>👤</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)' }}>
                Paramètres agent
              </span>
            </div>

            <div style={{ padding: '20px 20px 0' }}>

              {/* Row 1 : IM + Année naissance */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                <div>
                  <div style={LABEL}>Indice Majoré (IM)</div>
                  <select style={INPUT} value={form.indiceMajore} onChange={e => set('indiceMajore', e.target.value)}>
                    {IM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <div style={LABEL}>Année de naissance</div>
                  <input type="number" style={INPUT} value={form.anneeNaissance}
                    onChange={e => set('anneeNaissance', e.target.value)} />
                </div>
              </div>

              {/* Row 2 : Année départ */}
              <div style={{ marginBottom: 18 }}>
                <div style={LABEL}>Année de départ prévue</div>
                <input type="number" style={{ ...INPUT, width: '50%' }} value={form.anneeDepart}
                  onChange={e => set('anneeDepart', e.target.value)} />
              </div>

              {/* Separator */}
              <div style={{ height: 1, background: 'var(--border-soft)', marginBottom: 18 }} />

              {/* Trimestres slider */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ ...LABEL, marginBottom: 10 }}>
                  Trimestres validés —{' '}
                  <span style={{ color: 'var(--indigo)', fontFamily: 'var(--font-mono)' }}>
                    {form.trimestresValides} T
                  </span>
                </div>
                <div className="slider-row">
                  <input type="range" min={1} max={172} className="form-range"
                    value={form.trimestresValides}
                    onChange={e => set('trimestresValides', e.target.value)} />
                  <span className="slider-value">{form.trimestresValides} T</span>
                </div>
              </div>

              {/* Info box */}
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
                  Point d&apos;indice :{' '}
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--navy)' }}>{POINT_INDICE} €</strong>
                  {' '}· Trimestres taux plein (1965+) :{' '}
                  <strong style={{ color: 'var(--navy)' }}>{TRIMESTRES_RETRAITE_1965}</strong>
                </div>
              </div>

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
                Calculer la pension →
              </button>
            </div>
          </div>

          {/* ── RESULTS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            <div className="result-hero">
              <div className="result-hero-label">Pension CNRACL brute mensuelle estimée</div>
              <div className="result-hero-amount">{result ? fmt(result.pensionBrute) : '—'}</div>
              <div className="result-hero-sub">
                {result
                  ? `IM ${form.indiceMajore} · ${form.trimestresValides} T · Départ ${form.anneeDepart}`
                  : 'Renseignez les paramètres et calculez'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div className="breakdown-cell">
                <div className="breakdown-cell-label">Pension brute</div>
                <div className="breakdown-cell-value" style={{ color: 'var(--navy)' }}>
                  {result ? fmt(result.pensionBrute) : '—'}
                </div>
              </div>
              <div className="breakdown-cell">
                <div className="breakdown-cell-label">Taux liquidation</div>
                <div className="breakdown-cell-value" style={{ color: hasDecote ? 'var(--danger)' : 'var(--success)' }}>
                  {result ? (result.tauxLiquidation * 100).toFixed(2) + ' %' : '—'}
                </div>
              </div>
              <div className="breakdown-cell">
                <div className="breakdown-cell-label">Décote</div>
                <div className="breakdown-cell-value" style={{ color: hasDecote ? 'var(--danger)' : 'var(--success)' }}>
                  {result
                    ? (result.decote > 0 ? '−' + (result.decote * 100).toFixed(2) + ' %' : 'Aucune')
                    : '—'}
                </div>
              </div>
              <div className="breakdown-cell">
                <div className="breakdown-cell-label">Surcote</div>
                <div className="breakdown-cell-value" style={{ color: hasSurcote ? 'var(--success)' : 'var(--text-muted)' }}>
                  {result
                    ? (result.surcote > 0 ? '+' + (result.surcote * 100).toFixed(2) + ' %' : 'Aucune')
                    : '—'}
                </div>
              </div>
            </div>

            {result && (
              <div className="ds-card" style={{ marginBottom: 0 }}>
                <div className="ds-card-body" style={{ paddingTop: 12, paddingBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Progression trimestres
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                      {form.trimestresValides} / {result.trimestresRequisTauxPlein} T
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      background: trimestres >= result.trimestresRequisTauxPlein ? 'var(--success)' : 'var(--indigo)',
                      width: `${Math.min(100, (trimestres / result.trimestresRequisTauxPlein) * 100)}%`,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              </div>
            )}

            <div className="notice-info">
              <span>ℹ️</span>
              <div>CNRACL · Loi n°2023-270 du 14/04/2023 · Moteur v1.0.0</div>
            </div>
          </div>

        </div>
      </div>
      {/* ── Drawer Barème CNRACL ── */}
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
                  Barème CNRACL — Pension retraite
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  CNRACL · Loi n°2023-270 du 14 avril 2023 (réforme)
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
                  Pension = IM × {POINT_INDICE} € × taux liquidation<br />
                  Taux liquidation = min(75%, T_validés / T_requis × 75%)<br />
                  Décote = 1,25 % × trimestres manquants (max 20 %)<br />
                  Surcote = 1,25 % × trimestres au-delà du taux plein
                </div>
              </div>

              {/* Âge légal */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)', marginBottom: 10 }}>
                  Âge légal de départ (réforme 2023)
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)' }}>
                      <th style={{ padding: '7px 10px', textAlign: 'left', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Génération</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Âge légal</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Trimestres requis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { gen: 'Né avant 1958',      age: '62 ans',    trim: '166–167 T' },
                      { gen: 'Né en 1958–1960',    age: '62–63 ans', trim: '167–169 T' },
                      { gen: 'Né en 1961–1963',    age: '63–64 ans', trim: '169–172 T' },
                      { gen: 'Né en 1964',         age: '64 ans',    trim: '172 T' },
                      { gen: 'Né en 1965 et après',age: '64 ans',    trim: '172 T' },
                    ].map((r, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border-soft)', background: i % 2 === 0 ? 'transparent' : 'var(--surface-2)' }}>
                        <td style={{ padding: '7px 10px', fontSize: 12, color: 'var(--text-secondary)' }}>{r.gen}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{r.age}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--indigo)' }}>{r.trim}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Taux de liquidation */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)', marginBottom: 10 }}>
                  Exemples de taux de liquidation
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-2)' }}>
                      <th style={{ padding: '7px 10px', textAlign: 'left', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Trimestres validés</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Taux liquidation</th>
                      <th style={{ padding: '7px 10px', textAlign: 'center', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Décote</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { t: '120 T', taux: '52,33 %', decote: '−20,00 %' },
                      { t: '140 T', taux: '61,05 %', decote: '−13,75 %' },
                      { t: '155 T', taux: '67,61 %', decote: '−7,50 %' },
                      { t: '165 T', taux: '71,97 %', decote: '−3,13 %' },
                      { t: '172 T (taux plein)', taux: '75,00 %', decote: '0 %' },
                      { t: '180 T (surcote)',    taux: '79,50 %', decote: '+5,00 %' },
                    ].map((r, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border-soft)', background: i === 4 ? 'var(--success-bg)' : 'transparent' }}>
                        <td style={{ padding: '7px 10px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: i >= 4 ? 700 : 400 }}>{r.t}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: i >= 4 ? 'var(--success)' : 'var(--navy)' }}>{r.taux}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: i < 4 ? 'var(--danger)' : 'var(--success)' }}>{r.decote}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paramètres clés */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-ui)', marginBottom: 10 }}>
                  Paramètres de référence
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Point d\'indice FPT', val: `${POINT_INDICE} €` },
                    { label: 'Taux maximum', val: '75 %' },
                    { label: 'Décote / trimestre', val: '1,25 %' },
                    { label: 'Décote max', val: '20 %' },
                    { label: 'Surcote / trimestre', val: '1,25 %' },
                    { label: 'Cotisation CNRACL', val: '11,10 % agent' },
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
                Sources : Loi n°84-53 du 26/01/1984 · Loi n°2023-270 du 14/04/2023 (réforme des retraites) · Décret n°2003-1306 relatif au régime de retraite des fonctionnaires affiliés à la CNRACL · CNRACL — caisse nationale de retraites des agents des collectivités locales
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
