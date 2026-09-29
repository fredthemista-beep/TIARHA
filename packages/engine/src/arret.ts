// packages/engine/src/arret.ts
import { TAUX_CNRACL_EMPLOYEUR, TAUX_IRCANTEC_EMPLOYEUR } from './constants';
import type { AgentBase, RegimeRetraite, ResultatArret, StatutAgent, TypeConge } from './types';

interface ParamsArret {
  agent: AgentBase;
  type: TypeConge;
  dureeJours: number;
  statut?: StatutAgent;          // défaut : TITULAIRE
}

/**
 * Règles de maintien de traitement par type de congé maladie.
 * [periodeJours, tauxMaintien][]  — dans l'ordre chronologique.
 * Source : CGFP art. L822-3 modifié par la loi n°2025-127 art. 189
 * (CMO à 90 % pendant 3 mois pour les arrêts à compter du 01/03/2025).
 */
const REGLES: Record<TypeConge, Array<[number, number]>> = {
  CMO:   [[90, 0.9], [270, 0.5]],          // 3 mois à 90 % + 9 mois à demi-traitement
  CLM:   [[365, 1.0], [730, 0.5]],         // 1 an + 2 ans
  CLD:   [[1095, 1.0], [730, 0.5]],        // 3 ans + 2 ans
  AT:    [[Infinity, 1.0]],                 // accident de travail : 100% illimité
  CITIS: [[Infinity, 1.0]],                 // imputable au service
};

const REGIME: Record<StatutAgent, { regime: RegimeRetraite; taux: number }> = {
  TITULAIRE:   { regime: 'CNRACL',   taux: TAUX_CNRACL_EMPLOYEUR },
  CONTRACTUEL: { regime: 'IRCANTEC', taux: TAUX_IRCANTEC_EMPLOYEUR },
};

export function calculerArret(params: ParamsArret): ResultatArret {
  const { agent, type, dureeJours, statut = 'TITULAIRE' } = params;
  const regles = REGLES[type];
  if (regles === undefined) throw new Error(`Type de congé inconnu : ${type}`);

  const traitementJournalier = agent.traitementBrut / 30;
  let maintienTotal = 0;
  let joursRestants = dureeJours;
  let tauxDernierePeriode = 0;

  for (const [dureeMax, taux] of regles) {
    if (joursRestants <= 0) break;
    const joursAppliques = Math.min(joursRestants, dureeMax);
    maintienTotal += traitementJournalier * joursAppliques * taux;
    joursRestants -= joursAppliques;
    tauxDernierePeriode = taux;
  }

  const { regime, taux } = REGIME[statut];
  const cotisationRetraiteEmployeur = maintienTotal * taux;
  const coutEmployeur = maintienTotal + cotisationRetraiteEmployeur;

  return {
    type,
    dureeJours,
    statut,
    maintienTraitement: maintienTotal,
    coutEmployeur,
    regimeRetraite: regime,
    cotisationRetraiteEmployeur,
    tauxMaintien: tauxDernierePeriode,
  };
}
