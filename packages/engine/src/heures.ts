// packages/engine/src/heures.ts
import { POINT_INDICE, TAUX_CNRACL_EMPLOYEUR, CET_PLAFOND_JOURS } from './constants';
import type { ResultatHeures } from './types';

const HEURES_PAR_JOUR_CET = 7; // convention FPT (7h = 1 jour de CET)

interface ParamsHeures {
  indiceMajore: number;
  heuresSup: number;
  joursCETExistants: number;
}

/**
 * Calcule les IHTS et le crédit CET pour des heures supplémentaires.
 * Formule IHTS : IM × POINT_INDICE / 1820
 * Source : Décret n°2002-60 du 14 janvier 2002.
 */
export function calculerHeures(params: ParamsHeures): ResultatHeures {
  const { indiceMajore, heuresSup, joursCETExistants } = params;

  const ihtsParHeure = (indiceMajore * POINT_INDICE) / 1820;
  const ihtsTotal = ihtsParHeure * heuresSup;
  const coutEmployeurTotal = ihtsTotal * (1 + TAUX_CNRACL_EMPLOYEUR);

  // CET : conversion heures → jours, respect du plafond
  const joursBruts = Math.floor(heuresSup / HEURES_PAR_JOUR_CET);
  const placesDisponibles = Math.max(0, CET_PLAFOND_JOURS - joursCETExistants);
  const joursCET = Math.min(joursBruts, placesDisponibles);
  const cetPlafondAtteint = joursCETExistants + joursCET >= CET_PLAFOND_JOURS;

  return {
    ihtsParHeure,
    ihtsTotal,
    coutEmployeurTotal,
    joursCET,
    cetPlafondAtteint,
  };
}
