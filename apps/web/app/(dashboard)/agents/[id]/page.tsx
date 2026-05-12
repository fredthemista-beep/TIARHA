'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Topbar } from '@/components/dashboard/Topbar';

/* ── Données agents enrichies ─────────────────────────────────── */
const AGENTS_DATA = [
  {
    id: 'A001', initiales: 'MD', nom: 'Dubois', prenom: 'Martin',
    statut: 'tit' as const, cat: 'B' as const, grade: 'Rédacteur principal 1ère cl.',
    im: 460, service: 'DRH', poste: 'Gestionnaire RH',
    tel: '05 56 10 21 01', email: 'martin.dubois@mairie-foix.fr',
    dateEntree: '2008-03-12', quotite: 100, nNaissance: '1977-06-15',
    situationFamiliale: 'Marié(e) — 2 enfants',
    adresse: '14 rue des Pyrénées, 09000 Foix',
    nMatricule: 'MAT-2008-0342',
    position: 'Activité',
    regime: 'CNRACL',
    echelon: 8, anciennetéEchelon: '2 ans 4 mois',
    prochainEchelon: '2026-07-01',
    joursCET: 22,
    trimestresValides: 68,
    droitConges: 25,
    congesPris: 18,
    carriere: [
      { date: '2008-03-12', evenement: 'Recrutement',              grade: 'Rédacteur',                     im: 350 },
      { date: '2011-09-01', evenement: 'Avancement d\'échelon',    grade: 'Rédacteur',                     im: 380 },
      { date: '2015-02-01', evenement: 'Promotion de grade',       grade: 'Rédacteur principal 2ème cl.',  im: 410 },
      { date: '2019-09-01', evenement: 'Promotion de grade',       grade: 'Rédacteur principal 1ère cl.',  im: 440 },
      { date: '2023-01-01', evenement: 'Avancement d\'échelon',    grade: 'Rédacteur principal 1ère cl.',  im: 460 },
    ],
    absences: [
      { id: 'ABS-2026-051', type: 'CMO', debut: '2026-04-20', fin: '2026-05-19', duree: 29, cout: 3842 },
      { id: 'ABS-2024-018', type: 'CMO', debut: '2024-02-05', fin: '2024-02-12', duree: 8,  cout: 1050 },
      { id: 'ABS-2023-041', type: 'CMO', debut: '2023-11-10', fin: '2023-11-24', duree: 15, cout: 1960 },
    ],
    documents: [
      { nom: 'Arrêté de nomination',           date: '2008-03-12', type: 'Arrêté' },
      { nom: 'Arrêté promotion Réd. princ. 2', date: '2015-02-01', type: 'Arrêté' },
      { nom: 'Arrêté promotion Réd. princ. 1', date: '2019-09-01', type: 'Arrêté' },
      { nom: 'Entretien professionnel 2025',   date: '2025-03-15', type: 'Évaluation' },
      { nom: 'Entretien professionnel 2024',   date: '2024-03-20', type: 'Évaluation' },
    ],
  },
  {
    id: 'A002', initiales: 'SL', nom: 'Laurent', prenom: 'Sophie',
    statut: 'tit' as const, cat: 'A' as const, grade: 'Attaché principal',
    im: 620, service: 'Direction générale', poste: 'Directrice des affaires juridiques',
    tel: '05 56 10 21 02', email: 'sophie.laurent@mairie-foix.fr',
    dateEntree: '2015-09-01', quotite: 100, nNaissance: '1983-11-02',
    situationFamiliale: 'Marié(e) — 1 enfant',
    adresse: '3 allée des Consuls, 09000 Foix',
    nMatricule: 'MAT-2015-0891',
    position: 'CLM',
    regime: 'CNRACL',
    echelon: 7, anciennetéEchelon: '1 an 8 mois',
    prochainEchelon: '2027-01-01',
    joursCET: 45,
    trimestresValides: 42,
    droitConges: 25,
    congesPris: 25,
    carriere: [
      { date: '2015-09-01', evenement: 'Recrutement',           grade: 'Attaché',          im: 520 },
      { date: '2019-05-01', evenement: 'Promotion de grade',    grade: 'Attaché principal', im: 580 },
      { date: '2022-09-01', evenement: 'Avancement d\'échelon', grade: 'Attaché principal', im: 620 },
    ],
    absences: [
      { id: 'ABS-2026-047', type: 'CLM', debut: '2026-03-15', fin: null,         duree: 58,  cout: 18750 },
      { id: 'ABS-2025-009', type: 'CMO', debut: '2025-01-08', fin: '2025-01-22', duree: 15,  cout: 4120 },
    ],
    documents: [
      { nom: 'Arrêté de nomination',         date: '2015-09-01', type: 'Arrêté' },
      { nom: 'Arrêté promotion Att. princ.', date: '2019-05-01', type: 'Arrêté' },
      { nom: 'Arrêté CLM — 2026',            date: '2026-03-15', type: 'Arrêté' },
      { nom: 'Rapport médical CLM',          date: '2026-03-10', type: 'Médical' },
      { nom: 'Entretien professionnel 2025', date: '2025-04-10', type: 'Évaluation' },
    ],
  },
  {
    id: 'A003', initiales: 'JM', nom: 'Moreau', prenom: 'Jean',
    statut: 'cont' as const, cat: 'C' as const, grade: 'Adjoint administratif',
    im: 340, service: 'Accueil', poste: 'Agent d\'accueil',
    tel: '05 56 10 21 03', email: 'jean.moreau@mairie-foix.fr',
    dateEntree: '2022-01-10', quotite: 80, nNaissance: '1994-04-22',
    situationFamiliale: 'Célibataire',
    adresse: '8 rue de la République, 09000 Foix',
    nMatricule: 'MAT-2022-0124',
    position: 'CMO',
    regime: 'IRCANTEC',
    echelon: 2, anciennetéEchelon: '10 mois',
    prochainEchelon: '2026-11-01',
    joursCET: 0,
    trimestresValides: 17,
    droitConges: 20,
    congesPris: 12,
    carriere: [
      { date: '2022-01-10', evenement: 'Recrutement CDD 1 an',   grade: 'Adjoint administratif', im: 340 },
      { date: '2023-01-10', evenement: 'Renouvellement CDD 2 ans', grade: 'Adjoint administratif', im: 340 },
    ],
    absences: [
      { id: 'ABS-2026-055', type: 'CMO', debut: '2026-05-02', fin: '2026-05-16', duree: 14, cout: 1240 },
    ],
    documents: [
      { nom: 'Contrat CDD initial',       date: '2022-01-10', type: 'Contrat' },
      { nom: 'Avenant renouvellement',    date: '2023-01-10', type: 'Contrat' },
      { nom: 'Entretien professionnel 2025', date: '2025-02-20', type: 'Évaluation' },
    ],
  },
  {
    id: 'A007', initiales: 'PV', nom: 'Vincent', prenom: 'Paul',
    statut: 'tit' as const, cat: 'A' as const, grade: 'Ingénieur en chef',
    im: 680, service: 'Voirie', poste: 'Responsable voirie et réseaux',
    tel: '05 56 10 21 07', email: 'paul.vincent@mairie-foix.fr',
    dateEntree: '2003-02-20', quotite: 100, nNaissance: '1968-09-30',
    situationFamiliale: 'Marié(e) — 3 enfants',
    adresse: '22 avenue du Maréchal Joffre, 09000 Foix',
    nMatricule: 'MAT-2003-0087',
    position: 'CLD',
    regime: 'CNRACL',
    echelon: 12, anciennetéEchelon: '3 ans',
    prochainEchelon: 'Échelon terminal',
    joursCET: 58,
    trimestresValides: 128,
    droitConges: 25,
    congesPris: 25,
    carriere: [
      { date: '2003-02-20', evenement: 'Recrutement',           grade: 'Ingénieur',         im: 480 },
      { date: '2009-01-01', evenement: 'Promotion de grade',    grade: 'Ingénieur principal', im: 570 },
      { date: '2016-09-01', evenement: 'Promotion de grade',    grade: 'Ingénieur en chef',  im: 640 },
      { date: '2021-01-01', evenement: 'Avancement d\'échelon', grade: 'Ingénieur en chef',  im: 680 },
    ],
    absences: [
      { id: 'ABS-2026-038', type: 'CLD', debut: '2025-11-01', fin: null,         duree: 192, cout: 42000 },
      { id: 'ABS-2024-055', type: 'CMO', debut: '2024-06-10', fin: '2024-07-09', duree: 30,  cout: 9100 },
    ],
    documents: [
      { nom: 'Arrêté de nomination',         date: '2003-02-20', type: 'Arrêté' },
      { nom: 'Arrêté promotion Ing. en chef', date: '2016-09-01', type: 'Arrêté' },
      { nom: 'Arrêté CLD — 2025',            date: '2025-11-01', type: 'Arrêté' },
      { nom: 'Rapport commission réforme',   date: '2025-10-20', type: 'Médical' },
      { nom: 'Entretien professionnel 2024', date: '2024-04-05', type: 'Évaluation' },
    ],
  },
];

/* ── Helpers ──────────────────────────────────────────────────── */
function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR');
}
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
  const agent = AGENTS_DATA.find(a => a.id === id);

  const [tab, setTab] = useState<'situation' | 'absences' | 'carriere' | 'simulations' | 'documents'>('situation');

  if (!agent) {
    return (
      <>
        <Topbar title="Fiche agent" subtitle="Agent introuvable" plan="pro" />
        <div className="page-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, gap: 16 }}>
          <div style={{ fontSize: 40 }}>👤</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)' }}>Agent introuvable</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Matricule {id} non trouvé dans la base de données.</div>
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

  return (
    <>
      <Topbar title={`${agent.prenom} ${agent.nom}`} subtitle={`${agent.grade} · ${agent.service}`} plan="pro" />

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
            <button className="btn-secondary" style={{ fontSize: 12 }}>✏️ Modifier</button>
            <button className="btn-secondary" style={{ fontSize: 12 }}>📄 Exporter PDF</button>
            <button className="btn-primary" style={{ fontSize: 12 }}>+ Saisir arrêt</button>
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
                <div className="kpi-label">Trimestres CNRACL</div>
                <div className="kpi-value large amber">{agent.trimestresValides} T</div>
                <div className="kpi-meta">Sur 172 requis</div>
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
                    { label: 'Date de naissance', val: fmtDate(agent.nNaissance) },
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
                    { label: 'Échelon',         val: `Échelon ${agent.echelon} (${agent.anciennetéEchelon})` },
                    { label: 'Prochain échelon',val: agent.prochainEchelon },
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
                    const isActif = !a.fin;
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
                          {a.fin ? fmtDate(a.fin) : '—'}
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
                href: '/simulations/arret',
                icon: '🏥', label: 'SimulArrêt',
                desc: 'Simuler le coût d\'un arrêt maladie pour cet agent',
                params: `IM ${agent.im} — ${agent.grade}`,
                color: 'var(--amber)', bg: 'var(--amber-bg)',
              },
              {
                href: '/simulations/retraite',
                icon: '👴', label: 'RetireSim',
                desc: 'Estimer la pension de retraite CNRACL',
                params: `IM ${agent.im} — ${agent.trimestresValides} T validés`,
                color: 'var(--indigo)', bg: 'var(--info-bg)',
              },
              {
                href: '/simulations/heures',
                icon: '⏱', label: 'HeuresSup+',
                desc: 'Calculer les IHTS et suivi CET',
                params: `IM ${agent.im} — CET ${agent.joursCET} j`,
                color: 'var(--teal)', bg: 'var(--teal-bg)',
              },
              {
                href: '/simulations/annualisation',
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
              <button className="btn-secondary" style={{ fontSize: 11, padding: '5px 10px', height: 'auto' }}>
                + Ajouter un document
              </button>
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
                    <button style={{
                      fontSize: 11, padding: '4px 10px', height: 28,
                      background: 'transparent', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)',
                    }}>↓ Télécharger</button>
                    <button style={{
                      fontSize: 11, padding: '4px 10px', height: 28,
                      background: 'transparent', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)',
                    }}>👁 Aperçu</button>
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
