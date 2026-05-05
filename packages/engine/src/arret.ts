// packages/engine/src/arret.ts
import { TAUX_CNRACL_EMPLOYEUR } from './constants';
import type { AgentBase, ResultatArret, TypeConge } from './types';

interface ParamsArret {
  agent: AgentBase;
  type: TypeConge;
  dureeJours: number;
}

/**
 * Règles de maintien de traitement par type de congé maladie.
 * [periodeJours, tauxMaintien][]  — dans l'ordre chronologique.
 * Source : CGFP Livre III + circulaire 2022.
 */
const REGLES: Record<TypeConge, Array<[number, number]>> = {
  CMO:   [[90, 1.0], [275, 0.5]],          // 3 mois + 9 mois
  CLM:   [[365, 1.0], [730, 0.5]],         // 1 an + 2 ans
  CLD:   [[1095, 1.0], [730, 0.5]],        // 3 ans + 2 ans
  AT:    [[Infinity, 1.0]],                 // accident de travail : 100% illimité
  CITIS: [[Infinity, 1.0]],                 // imputable au service
};

export function calculerArret(params: ParamsArret): ResultatArret {
  const { agent, type, dureeJours } = params;
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

  const coutCNRACL = maintienTotal * TAUX_CNRACL_EMPLOYEUR;
  const coutEmployeur = maintienTotal + coutCNRACL;

  return {
    type,
    dureeJours,
    maintienTraitement: maintienTotal,
    coutEmployeur,
    coutCNRACL,
    tauxMaintien: tauxDernierePeriode,
  };
}
