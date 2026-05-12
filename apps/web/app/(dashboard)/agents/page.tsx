import Link from 'next/link';
import { Topbar } from '@/components/dashboard/Topbar';

const AGENTS = [
  { id: 'A001', initiales: 'MD', nom: 'Dubois Martin',      prenom: 'Martin',    statut: 'tit',  cat: 'B', grade: 'Rédacteur principal 1ère cl.', im: 460, service: 'DRH',             tel: '05 56 10 21 01', dateEntree: '2008-03-12', quotite: 100 },
  { id: 'A002', initiales: 'SL', nom: 'Laurent Sophie',     prenom: 'Sophie',    statut: 'tit',  cat: 'A', grade: 'Attaché principal',             im: 620, service: 'Direction générale', tel: '05 56 10 21 02', dateEntree: '2015-09-01', quotite: 100 },
  { id: 'A003', initiales: 'JM', nom: 'Moreau Jean',        prenom: 'Jean',      statut: 'cont', cat: 'C', grade: 'Adjoint administratif',          im: 340, service: 'Accueil',          tel: '05 56 10 21 03', dateEntree: '2022-01-10', quotite: 80  },
  { id: 'A004', initiales: 'AB', nom: 'Bernard Alice',      prenom: 'Alice',     statut: 'tit',  cat: 'C', grade: 'Adjoint technique principal 2e', im: 380, service: 'Bâtiments',        tel: '05 56 10 21 04', dateEntree: '2010-06-15', quotite: 100 },
  { id: 'A005', initiales: 'TC', nom: 'Colin Thomas',       prenom: 'Thomas',    statut: 'tit',  cat: 'B', grade: 'Technicien principal 2ème cl.',  im: 500, service: 'Informatique',     tel: '05 56 10 21 05', dateEntree: '2018-04-02', quotite: 100 },
  { id: 'A006', initiales: 'MR', nom: 'Richard Marie',      prenom: 'Marie',     statut: 'cont', cat: 'B', grade: 'Rédacteur',                      im: 460, service: 'Communication',   tel: '05 56 10 21 06', dateEntree: '2021-11-15', quotite: 100 },
  { id: 'A007', initiales: 'PV', nom: 'Vincent Paul',       prenom: 'Paul',      statut: 'tit',  cat: 'A', grade: 'Ingénieur en chef',              im: 680, service: 'Voirie',           tel: '05 56 10 21 07', dateEntree: '2003-02-20', quotite: 100 },
  { id: 'A008', initiales: 'CF', nom: 'Fontaine Clara',     prenom: 'Clara',     statut: 'tit',  cat: 'C', grade: 'ATSEM principal 2ème cl.',        im: 360, service: 'Éducation',        tel: '05 56 10 21 08', dateEntree: '2013-08-28', quotite: 100 },
  { id: 'A009', initiales: 'RB', nom: 'Blanc Rémi',         prenom: 'Rémi',      statut: 'tit',  cat: 'B', grade: 'Éducateur des APS principal',    im: 490, service: 'Sports',           tel: '05 56 10 21 09', dateEntree: '2011-01-03', quotite: 100 },
  { id: 'A010', initiales: 'NP', nom: 'Petit Nathalie',     prenom: 'Nathalie',  statut: 'tit',  cat: 'A', grade: 'Bibliothécaire',                 im: 550, service: 'Culture',          tel: '05 56 10 21 10', dateEntree: '2016-10-17', quotite: 100 },
  { id: 'A011', initiales: 'KD', nom: 'Dupont Karim',       prenom: 'Karim',     statut: 'cont', cat: 'C', grade: 'Adjoint technique',              im: 340, service: 'Propreté',         tel: '05 56 10 21 11', dateEntree: '2023-03-06', quotite: 80  },
  { id: 'A012', initiales: 'EG', nom: 'Gauthier Emma',      prenom: 'Emma',      statut: 'tit',  cat: 'B', grade: 'Animateur principal 1ère cl.',   im: 470, service: 'Jeunesse',         tel: '05 56 10 21 12', dateEntree: '2019-09-01', quotite: 100 },
  { id: 'A013', initiales: 'LM', nom: 'Martinez Lucie',     prenom: 'Lucie',     statut: 'tit',  cat: 'A', grade: 'Médecin territorial',            im: 750, service: 'Santé/Prévention', tel: '05 56 10 21 13', dateEntree: '2007-05-14', quotite: 100 },
  { id: 'A014', initiales: 'HP', nom: 'Perron Hugo',        prenom: 'Hugo',      statut: 'cont', cat: 'B', grade: 'Technicien',                     im: 440, service: 'Informatique',     tel: '05 56 10 21 14', dateEntree: '2022-07-01', quotite: 100 },
  { id: 'A015', initiales: 'CS', nom: 'Simon Chloé',        prenom: 'Chloé',     statut: 'tit',  cat: 'C', grade: 'Agent de maîtrise principal',    im: 400, service: 'Restauration',     tel: '05 56 10 21 15', dateEntree: '2009-04-22', quotite: 100 },
  { id: 'A016', initiales: 'OL', nom: 'Leroy Olivier',      prenom: 'Olivier',   statut: 'tit',  cat: 'A', grade: 'Directeur territorial',          im: 830, service: 'Direction générale', tel: '05 56 10 21 16', dateEntree: '2001-11-09', quotite: 100 },
  { id: 'A017', initiales: 'AM', nom: 'Moulin Aline',       prenom: 'Aline',     statut: 'tit',  cat: 'B', grade: 'Rédacteur principal 2ème cl.',   im: 450, service: 'Finances',         tel: '05 56 10 21 17', dateEntree: '2014-02-03', quotite: 80  },
  { id: 'A018', initiales: 'VT', nom: 'Thomas Viviane',     prenom: 'Viviane',   statut: 'cont', cat: 'C', grade: 'Adjoint administratif',          im: 340, service: 'Accueil',          tel: '05 56 10 21 18', dateEntree: '2023-09-01', quotite: 100 },
  { id: 'A019', initiales: 'JC', nom: 'Chabrier Jules',     prenom: 'Jules',     statut: 'tit',  cat: 'A', grade: 'Ingénieur',                      im: 600, service: 'Urbanisme',        tel: '05 56 10 21 19', dateEntree: '2017-06-12', quotite: 100 },
  { id: 'A020', initiales: 'PR', nom: 'Renard Patricia',    prenom: 'Patricia',  statut: 'tit',  cat: 'C', grade: 'Adjoint du patrimoine principal', im: 370, service: 'Culture',          tel: '05 56 10 21 20', dateEntree: '2006-03-08', quotite: 100 },
];

const SERVICES = ['Tous', 'DRH', 'Direction générale', 'Accueil', 'Bâtiments', 'Informatique', 'Communication', 'Voirie', 'Éducation', 'Sports', 'Culture', 'Propreté', 'Jeunesse', 'Santé/Prévention', 'Finances', 'Restauration', 'Urbanisme'];

export default function AgentsPage() {
  const titulaires  = AGENTS.filter(a => a.statut === 'tit').length;
  const contractuels = AGENTS.filter(a => a.statut === 'cont').length;
  const catA = AGENTS.filter(a => a.cat === 'A').length;
  const catB = AGENTS.filter(a => a.cat === 'B').length;
  const catC = AGENTS.filter(a => a.cat === 'C').length;

  return (
    <>
      <Topbar title="Agents" subtitle="Mairie de Foix — RH" plan="pro" notifCount={3} />

      <div className="page-header">
        <div className="page-header-top">
          <div>
            <div className="page-title">Liste des agents</div>
            <div className="page-subtitle">
              <span className="legal-tag">CGFP</span>
              <span className="legal-tag">Loi 84-53</span>
              Mairie de Foix · {AGENTS.length} agents affichés · Extrait 1 240 actifs
            </div>
          </div>
          <div className="btn-row">
            <button className="btn-secondary">↑ Importer XLSX</button>
            <button className="btn-primary">+ Nouvel agent</button>
          </div>
        </div>
        <div className="sub-nav">
          <button className="sub-tab active">Tous les agents</button>
          <button className="sub-tab">Titulaires ({titulaires})</button>
          <button className="sub-tab">Contractuels ({contractuels})</button>
        </div>
      </div>

      <div className="page-body">

        {/* KPI strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          <div className="kpi-card navy">
            <div className="kpi-label">Total agents</div>
            <div className="kpi-value">1 240</div>
            <div className="kpi-meta">{titulaires} titulaires · {contractuels} contractuels (extrait)</div>
          </div>
          <div className="kpi-card indigo">
            <div className="kpi-label">Répartition catégories</div>
            <div className="kpi-value indigo" style={{ fontSize: 16, fontWeight: 700, lineHeight: '1.6' }}>
              A : {catA} · B : {catB} · C : {catC}
            </div>
            <div className="kpi-meta">Extrait affiché</div>
          </div>
          <div className="kpi-card teal">
            <div className="kpi-label">Quotité moyenne</div>
            <div className="kpi-value teal">94 %</div>
            <div className="kpi-meta">3 agents à temps partiel</div>
          </div>
          <div className="kpi-card amber">
            <div className="kpi-label">Ancienneté moyenne</div>
            <div className="kpi-value amber">11,4 ans</div>
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
              type="text"
              placeholder="Rechercher un agent…"
              style={{
                height: 36, padding: '0 12px', flex: '1 1 220px', minWidth: 180,
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-ui)',
                fontSize: 13, color: 'var(--text-primary)', outline: 'none',
              }}
            />
            <select style={{
              height: 36, padding: '0 10px',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-ui)',
              fontSize: 13, color: 'var(--text-secondary)', outline: 'none',
            }}>
              {SERVICES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select style={{
              height: 36, padding: '0 10px',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-ui)',
              fontSize: 13, color: 'var(--text-secondary)', outline: 'none',
            }}>
              <option>Toutes catégories</option>
              <option>Catégorie A</option>
              <option>Catégorie B</option>
              <option>Catégorie C</option>
            </select>
            <button className="btn-secondary" style={{ fontSize: 12, padding: '0 12px', height: 36, whiteSpace: 'nowrap' }}>
              ↓ Exporter XLSX
            </button>
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
              Répertoire agents — {AGENTS.length} résultats
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mis à jour le 12/05/2026</span>
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
              {AGENTS.map(a => (
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
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.tel}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{a.id}</td>
                  <td>
                    <span className={`badge badge-${a.statut}`}>
                      {a.statut === 'tit' ? 'Titulaire' : 'Contractuel'}
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
                    {new Date(a.dateEntree).toLocaleDateString('fr-FR')}
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
              Affichage 1–{AGENTS.length} sur 1 240 agents
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {['←', '1', '2', '3', '…', '62', '→'].map((p, i) => (
                <button key={i} style={{
                  width: 30, height: 30, border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', background: p === '1' ? 'var(--navy)' : 'transparent',
                  color: p === '1' ? 'white' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-ui)', fontSize: 12, cursor: 'pointer',
                }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
