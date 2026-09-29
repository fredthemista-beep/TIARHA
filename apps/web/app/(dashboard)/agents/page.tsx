'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/dashboard/Topbar';
import { TodayDate } from '@/components/dashboard/TodayDate';
import { CsvExportButton } from '@/components/dashboard/CsvExportButton';
import { DemoButton } from '@/components/ui/demo-toast';
import {
  AGENTS, ORG, SERVICES, ancienneteMoyenne, matchAgent, nomListe, statutLabel, type Categorie, type StatutCode,
} from '@/lib/demo-data';
import { fmtDateFr } from '@/lib/format';

const PAGE_SIZE = 10;

const FILTER_INPUT: React.CSSProperties = {
  height: 36, padding: '0 10px',
  background: 'var(--bg)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-ui)',
  fontSize: 13, color: 'var(--text-secondary)', outline: 'none',
};

const CSV_HEADERS = ['Matricule', 'Nom', 'Prénom', 'Statut', 'Catégorie', 'Grade', 'IM', 'Service', 'Quotité (%)', 'Date d’entrée', 'Téléphone', 'Email'];

const titulaires = AGENTS.filter(a => a.statut === 'tit').length;
const contractuels = AGENTS.length - titulaires;
const catA = AGENTS.filter(a => a.cat === 'A').length;
const catB = AGENTS.filter(a => a.cat === 'B').length;
const catC = AGENTS.filter(a => a.cat === 'C').length;
const tempsPartiel = AGENTS.filter(a => a.quotite < 100).length;
const quotiteMoyenne = Math.round(AGENTS.reduce((s, a) => s + a.quotite, 0) / AGENTS.length);
const ancienneteMoy = ancienneteMoyenne().toLocaleString('fr-FR', { maximumFractionDigits: 1 });


export default function AgentsPage() {
  const [query, setQuery] = useState('');
  const [service, setService] = useState('Tous');
  const [cat, setCat] = useState<Categorie | 'Toutes'>('Toutes');
  const [statut, setStatut] = useState<StatutCode | 'tous'>('tous');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => AGENTS.filter(a =>
    matchAgent(a, query)
    && (service === 'Tous' || a.service === service)
    && (cat === 'Toutes' || a.cat === cat)
    && (statut === 'tous' || a.statut === statut),
  ), [query, service, cat, statut]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = query !== '' || service !== 'Tous' || cat !== 'Toutes' || statut !== 'tous';

  function resetFilters() {
    setQuery(''); setService('Tous'); setCat('Toutes'); setStatut('tous'); setPage(1);
  }

  const csvRows = filtered.map(a => [
    a.id, a.nom, a.prenom, statutLabel(a.statut), a.cat, a.grade, a.im, a.service, a.quotite, fmtDateFr(a.dateEntree), a.tel, a.email,
  ]);

  return (
    <>
      <Topbar title="Agents" subtitle={`${ORG.collectivite} — RH`} notifCount={3} />

      <div className="page-header">
        <div className="page-header-top">
          <div>
            <div className="page-title">Liste des agents</div>
            <div className="page-subtitle">
              <span className="legal-tag">CGFP</span>
              <span className="legal-tag">Loi 84-53</span>
              {ORG.collectivite} · {AGENTS.length} agents (démo)
            </div>
          </div>
          <div className="btn-row">
            <DemoButton className="btn-secondary">↑ Importer</DemoButton>
            <DemoButton className="btn-primary">+ Nouvel agent</DemoButton>
          </div>
        </div>
        <div className="sub-nav">
          {([
            { key: 'tous', label: `Tous les agents (${AGENTS.length})` },
            { key: 'tit', label: `Titulaires (${titulaires})` },
            { key: 'cont', label: `Contractuels (${contractuels})` },
          ] as const).map(t => (
            <button
              key={t.key}
              type="button"
              className={`sub-tab${statut === t.key ? ' active' : ''}`}
              aria-pressed={statut === t.key}
              onClick={() => { setStatut(t.key); setPage(1); }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="page-body">

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          <div className="kpi-card navy">
            <div className="kpi-label">Total agents</div>
            <div className="kpi-value">{AGENTS.length}</div>
            <div className="kpi-meta">{titulaires} titulaires · {contractuels} contractuels (démo)</div>
          </div>
          <div className="kpi-card indigo">
            <div className="kpi-label">Répartition catégories</div>
            <div className="kpi-value indigo" style={{ fontSize: 16, fontWeight: 700, lineHeight: '1.6' }}>
              A : {catA} · B : {catB} · C : {catC}
            </div>
            <div className="kpi-meta">Effectif de démonstration</div>
          </div>
          <div className="kpi-card teal">
            <div className="kpi-label">Quotité moyenne</div>
            <div className="kpi-value teal">{quotiteMoyenne} %</div>
            <div className="kpi-meta">{tempsPartiel} agents à temps partiel</div>
          </div>
          <div className="kpi-card amber">
            <div className="kpi-label">Ancienneté moyenne</div>
            <div className="kpi-value amber">{ancienneteMoy} ans</div>
            <div className="kpi-meta">Depuis date d&apos;entrée</div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="ds-card" style={{ marginBottom: 16 }}>
          <div style={{
            padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          }}>
            <input
              type="search"
              placeholder="Rechercher un agent (nom, prénom, matricule, grade)…"
              aria-label="Rechercher un agent"
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
              style={{
                height: 36, padding: '0 12px', flex: '1 1 220px', minWidth: 180,
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-ui)',
                fontSize: 13, color: 'var(--text-primary)', outline: 'none',
              }}
            />
            <select
              aria-label="Filtrer par service"
              style={FILTER_INPUT}
              value={service}
              onChange={e => { setService(e.target.value); setPage(1); }}
            >
              <option value="Tous">Tous les services</option>
              {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              aria-label="Filtrer par catégorie"
              style={FILTER_INPUT}
              value={cat}
              onChange={e => { setCat(e.target.value as Categorie | 'Toutes'); setPage(1); }}
            >
              <option value="Toutes">Toutes catégories</option>
              <option value="A">Catégorie A</option>
              <option value="B">Catégorie B</option>
              <option value="C">Catégorie C</option>
            </select>
            <CsvExportButton
              filename="agents"
              headers={CSV_HEADERS}
              rows={csvRows}
              icon={false}
              style={{ fontSize: 12, padding: '0 12px', height: 36, whiteSpace: 'nowrap' }}
            />
          </div>
        </div>

        {/* Agents table */}
        <div className="ds-card">
          <div className="ds-card-header" style={{ justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 24, height: 24, borderRadius: 5, background: 'var(--info-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
              }}>👥</span>
              Répertoire agents — {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mis à jour le <TodayDate format="short" /></span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Matricule</th>
                <th>Statut</th>
                <th>Cat.</th>
                <th>Grade</th>
                <th>IM</th>
                <th>Service</th>
                <th>Quotité</th>
                <th>Entrée</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    Aucun agent ne correspond à ces critères.{' '}
                    <button
                      type="button"
                      onClick={resetFilters}
                      style={{ border: 0, background: 'none', color: 'var(--indigo)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
                    >
                      Réinitialiser les filtres
                    </button>
                  </td>
                </tr>
              )}
              {rows.map(a => (
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
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{nomListe(a)}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.tel}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{a.id}</td>
                  <td>
                    <span className={`badge badge-${a.statut}`}>
                      {statutLabel(a.statut)}
                    </span>
                  </td>
                  <td><strong>{a.cat}</strong></td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 200 }}>{a.grade}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{a.im}</td>
                  <td style={{ fontSize: 12 }}>{a.service}</td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 12,
                      color: a.quotite < 100 ? 'var(--amber)' : 'var(--text-secondary)',
                      fontWeight: a.quotite < 100 ? 700 : 400,
                    }}>
                      {a.quotite} %
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                    {fmtDateFr(a.dateEntree)}
                  </td>
                  <td>
                    <Link href={`/agents/${a.id}`} className="btn-navy">
                      Fiche →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{
            padding: '12px 20px', borderTop: '1px solid var(--border-soft)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {filtered.length === 0
                ? 'Aucun résultat'
                : `Affichage ${(currentPage - 1) * PAGE_SIZE + 1}–${(currentPage - 1) * PAGE_SIZE + rows.length} sur ${filtered.length} agent${filtered.length > 1 ? 's' : ''}${hasFilters ? ' filtrés' : ' (démo)'}`}
            </span>
            {pageCount > 1 && (
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { key: 'prev', label: '←', target: currentPage - 1, disabled: currentPage === 1, aria: 'Page précédente' },
                  ...Array.from({ length: pageCount }, (_, i) => ({
                    key: `p${i + 1}`, label: String(i + 1), target: i + 1, disabled: false, aria: `Page ${i + 1}`,
                  })),
                  { key: 'next', label: '→', target: currentPage + 1, disabled: currentPage === pageCount, aria: 'Page suivante' },
                ].map(p => {
                  const active = p.label === String(currentPage);
                  return (
                    <button
                      key={p.key}
                      type="button"
                      aria-label={p.aria}
                      aria-current={active ? 'page' : undefined}
                      disabled={p.disabled}
                      onClick={() => setPage(p.target)}
                      style={{
                        width: 30, height: 30, border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', background: active ? 'var(--navy)' : 'transparent',
                        color: active ? 'white' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-ui)', fontSize: 12,
                        cursor: p.disabled ? 'not-allowed' : 'pointer', opacity: p.disabled ? 0.4 : 1,
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
