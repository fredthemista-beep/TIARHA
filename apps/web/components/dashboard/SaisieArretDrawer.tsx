'use client';
// apps/web/components/dashboard/SaisieArretDrawer.tsx
// Saisie d'un arrêt en démo : chiffrage immédiat par le moteur, ajout à la session du navigateur.

import { useEffect, useMemo, useState } from 'react';
import { AGENTS, getAgent, nomComplet, nomListe, type TypeAbsence } from '@/lib/demo-data';
import { ajouterArretDemo, chiffrerArret } from '@/lib/arret-demo';
import { fmtDateFr, fmtEuro } from '@/lib/format';
import { showToast } from '@/components/ui/demo-toast';

const TYPES: Array<{ value: TypeAbsence; label: string; titulaireSeul: boolean }> = [
  { value: 'CMO', label: 'CMO — Congé de maladie ordinaire', titulaireSeul: false },
  { value: 'CLM', label: 'CLM — Congé de longue maladie', titulaireSeul: true },
  { value: 'CLD', label: 'CLD — Congé de longue durée', titulaireSeul: true },
  { value: 'AT',  label: 'AT — Accident de travail', titulaireSeul: false },
];

const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em',
  color: 'var(--text-secondary)', marginBottom: 7, display: 'block',
};
const INPUT: React.CSSProperties = {
  width: '100%', height: 40, padding: '0 12px', background: 'var(--bg)',
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 14,
  color: 'var(--text-primary)',
};

function isoAujourdhui() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function ajouterJours(iso: string, n: number) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, (d ?? 1) + n));
  return dt.toISOString().slice(0, 10);
}

export function SaisieArretDrawer({
  agentId,
  onClose,
  onSaved,
}: {
  /** Agent imposé (depuis sa fiche) ; absent = choix dans la liste (page Absences). */
  agentId?: string;
  onClose: () => void;
  /** Appelé après l'ajout, avec l'agent concerné. */
  onSaved?: (agentId: string) => void;
}) {
  const [choixAgent, setChoixAgent] = useState(agentId ?? AGENTS[0]?.id ?? '');
  const agent = getAgent(agentId ?? choixAgent);
  const [type, setType] = useState<TypeAbsence>('CMO');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');

  useEffect(() => {
    const d = isoAujourdhui();
    setDebut(d);
    setFin(ajouterJours(d, 14));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const contractuel = agent?.statut === 'cont';
  const typeInterdit = contractuel && TYPES.find(t => t.value === type)?.titulaireSeul;

  const erreur =
    !agent ? 'Choisissez un agent.'
    : !debut || !fin ? 'Renseignez les dates de début et de fin.'
    : fin < debut ? 'La date de fin doit être postérieure ou égale à la date de début.'
    : typeInterdit ? 'CLM et CLD sont réservés aux titulaires : un contractuel relève du congé de grave maladie.'
    : null;

  const chiffrage = useMemo(
    () => (agent && !erreur ? chiffrerArret(agent, type, debut, fin) : null),
    [agent, erreur, type, debut, fin],
  );

  function enregistrer() {
    if (!agent || !chiffrage) return;
    ajouterArretDemo(agent.id, {
      id: `DEMO-${Date.now().toString(36).toUpperCase()}`,
      type,
      debut,
      fin,
      duree: chiffrage.duree,
      enCours: debut <= isoAujourdhui() && fin >= isoAujourdhui(),
      cout: Math.round(chiffrage.coutEmployeur),
      remplacement: false,
      coutRemplacement: null,
    });
    showToast(`Arrêt ajouté au dossier de ${nomComplet(agent)} — démo, non enregistré`);
    onClose();
    onSaved?.(agent.id);
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,45,82,0.35)', zIndex: 200 }} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="saisie-arret-titre"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(480px, 100vw)', zIndex: 201,
          background: 'var(--surface)', boxShadow: '-8px 0 32px rgba(15,45,82,0.18)',
          display: 'flex', flexDirection: 'column', overflowY: 'auto',
        }}
      >
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div id="saisie-arret-titre" style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>Saisir un arrêt</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Mode démo — rien n&apos;est enregistré en base</div>
          </div>
          <button type="button" aria-label="Fermer" onClick={onClose} className="btn-secondary" style={{ width: 32, height: 32, padding: 0 }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {agentId ? (
            agent && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--navy)' }}>{nomComplet(agent)}</strong> · {agent.statut === 'tit' ? 'Titulaire' : 'Contractuel'} · IM {agent.im}
              </div>
            )
          ) : (
            <label>
              <span style={LABEL}>Agent</span>
              <select style={INPUT} value={choixAgent} onChange={e => setChoixAgent(e.target.value)}>
                {[...AGENTS].sort((a, b) => nomListe(a).localeCompare(nomListe(b), 'fr')).map(a => (
                  <option key={a.id} value={a.id}>{nomListe(a)} — {a.statut === 'tit' ? 'Titulaire' : 'Contractuel'}</option>
                ))}
              </select>
            </label>
          )}

          <label>
            <span style={LABEL}>Type de congé</span>
            <select style={INPUT} value={type} onChange={e => setType(e.target.value as TypeAbsence)}>
              {TYPES.map(t => (
                <option key={t.value} value={t.value} disabled={contractuel && t.titulaireSeul}>
                  {t.label}{contractuel && t.titulaireSeul ? ' (titulaires)' : ''}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              <span style={LABEL}>Début</span>
              <input type="date" style={INPUT} value={debut} onChange={e => setDebut(e.target.value)} />
            </label>
            <label>
              <span style={LABEL}>Fin</span>
              <input type="date" style={INPUT} value={fin} min={debut} onChange={e => setFin(e.target.value)} />
            </label>
          </div>

          {erreur && debut && (
            <div role="alert" className="notice-warning" style={{ margin: 0 }}>
              <span>⚠</span><div>{erreur}</div>
            </div>
          )}

          {chiffrage && (
            <div className="ds-card" style={{ margin: 0 }}>
              <div className="ds-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>Coût employeur de cet arrêt</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--danger)' }}>{fmtEuro(chiffrage.coutEmployeur)}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {chiffrage.duree} jour{chiffrage.duree > 1 ? 's' : ''} du {fmtDateFr(debut)} au {fmtDateFr(fin)}<br />
                  Maintien de traitement : {fmtEuro(chiffrage.maintien)} · Cotisation {chiffrage.regime} : {fmtEuro(chiffrage.cotisation)}
                </div>
                {type === 'CMO' && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    CMO déjà pris sur les 12 derniers mois : <strong>{chiffrage.joursAnterieurs} j</strong>
                  </div>
                )}
                {chiffrage.demiTraitementDes !== null ? (
                  <div className="notice-warning" style={{ margin: 0 }}>
                    <span>⚠</span>
                    <div>Passage à demi-traitement à partir du {chiffrage.demiTraitementDes}<sup>e</sup> jour de cet arrêt.</div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--success)' }}>
                    Maintien à {Math.round(chiffrage.tauxFin * 100)} % sur toute la durée.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="btn-row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="button" className="btn-primary" onClick={enregistrer} disabled={!chiffrage} style={!chiffrage ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
              Ajouter l&apos;arrêt
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
