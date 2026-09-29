// packages/engine/src/heures.ts
import {
  POINT_INDICE,
  TAUX_RAFP_EMPLOYEUR,
  CET_PLAFOND_JOURS,
  IHTS_DIVISEUR,
  IHTS_SEUIL_PREMIER_TAUX,
  IHTS_COEF_PREMIERES_HEURES,
  IHTS_COEF_HEURES_SUIVANTES,
  IHTS_PLAFOND_MENSUEL,
  TAUX_INDEMNITE_RESIDENCE,
} from './constants';
import type { AffectationHeures, MajorationHeures, ResultatHeures, ZoneResidence } from './types';

const HEURES_PAR_JOUR_CET = 7; // convention FPT (7h = 1 jour de CET)

/** Majoration du décret 2002-60 art. 8 — nuit +100 %, dimanche/férié +2/3, non cumulables. */
const MAJORATIONS: Record<MajorationHeures, number> = {
  standard: 1,
  nuit: 2,
  dimancheFerie: 5 / 3,
};

interface ParamsHeures {
  indiceMajore: number;
  heuresSup: number;
  joursCETExistants: number;
  zoneResidence?: ZoneResidence;       // défaut : zone 3 (0 %)
  majoration?: MajorationHeures;       // défaut : standard
  affectation?: AffectationHeures;     // défaut : IHTS (paiement)
}

/**
 * Calcule les IHTS, ou le crédit CET / la récupération, pour des heures supplémentaires mensuelles.
 * Taux horaire = (traitement brut annuel + indemnité de résidence annuelle) / 1820,
 * × 1,25 pour les 14 premières heures, × 1,27 de la 15e à la 25e.
 * Source : décret n°2002-60 du 14 janvier 2002, art. 6 à 8.
 */
export function calculerHeures(params: ParamsHeures): ResultatHeures {
  const {
    indiceMajore,
    heuresSup,
    joursCETExistants,
    zoneResidence = 3,
    majoration = 'standard',
    affectation = 'IHTS',
  } = params;

  const traitementAnnuel = indiceMajore * POINT_INDICE * 12;
  const indemniteResidence = traitementAnnuel * TAUX_INDEMNITE_RESIDENCE[zoneResidence];
  const ihtsParHeure = (traitementAnnuel + indemniteResidence) / IHTS_DIVISEUR;

  const heuresRemunerables = Math.min(heuresSup, IHTS_PLAFOND_MENSUEL);
  const plafondMensuelDepasse = heuresSup > IHTS_PLAFOND_MENSUEL;

  let ihtsTotal = 0;
  let joursCET = 0;
  let heuresRecuperation = 0;

  if (affectation === 'IHTS') {
    const premieres = Math.min(heuresRemunerables, IHTS_SEUIL_PREMIER_TAUX);
    const suivantes = heuresRemunerables - premieres;
    ihtsTotal =
      ihtsParHeure *
      (premieres * IHTS_COEF_PREMIERES_HEURES + suivantes * IHTS_COEF_HEURES_SUIVANTES) *
      MAJORATIONS[majoration];
  } else if (affectation === 'CET') {
    const joursBruts = Math.floor(heuresSup / HEURES_PAR_JOUR_CET);
    const placesDisponibles = Math.max(0, CET_PLAFOND_JOURS - joursCETExistants);
    joursCET = Math.min(joursBruts, placesDisponibles);
  } else {
    heuresRecuperation = heuresSup;
  }

  // Les IHTS ne sont pas soumises à la CNRACL : seule la RAFP employeur s'applique.
  const coutEmployeurTotal = ihtsTotal * (1 + TAUX_RAFP_EMPLOYEUR);
  const cetPlafondAtteint = joursCETExistants + joursCET >= CET_PLAFOND_JOURS;

  return {
    ihtsParHeure,
    ihtsTotal,
    coutEmployeurTotal,
    heuresRemunerables,
    plafondMensuelDepasse,
    joursCET,
    cetPlafondAtteint,
    heuresRecuperation,
  };
}
