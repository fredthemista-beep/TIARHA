// packages/engine/src/retraite.ts
import { POINT_INDICE, TRIMESTRES_RETRAITE_1965 } from './constants';
import type { ResultatRetraite } from './types';

interface ParamsRetraite {
  indiceMajore: number;
  trimestresValides: number;
  anneeNaissance: number;
  anneeDepart: number;
}

/**
 * Détermine le nombre de trimestres requis pour le taux plein selon l'année de naissance.
 * Source : Loi n°2023-270 du 14 avril 2023.
 */
function trimestresRequisTauxPlein(anneeNaissance: number): number {
  if (anneeNaissance >= 1965) return TRIMESTRES_RETRAITE_1965;
  if (anneeNaissance >= 1961) return 167 + (anneeNaissance - 1961);
  return 166; // né avant 1961
}

export function calculerRetraite(params: ParamsRetraite): ResultatRetraite {
  const { indiceMajore, trimestresValides, anneeNaissance, anneeDepart } = params;

  const trimRequisTauxPlein = trimestresRequisTauxPlein(anneeNaissance);
  const trimManquants = Math.max(0, trimRequisTauxPlein - trimestresValides);
  const trimExces = Math.max(0, trimestresValides - trimRequisTauxPlein);

  // Décote : 1.25% par trimestre manquant, plafonné à 25%
  const decote = Math.min(trimManquants * 0.0125, 0.25);

  // Surcote : 1.25% par trimestre au-delà du taux plein
  const surcote = trimExces * 0.0125;

  const tauxLiquidation = Math.min(0.75 * (1 - decote) + surcote, 0.75 + surcote);

  // Pension = IM × valeur point × taux liquidation
  const pensionBrute = indiceMajore * POINT_INDICE * tauxLiquidation;

  return {
    pensionBrute,
    tauxLiquidation,
    trimestresValides,
    trimestresRequisTauxPlein: trimRequisTauxPlein,
    decote,
    surcote,
    anneeeDepart: anneeDepart,
  };
}
