// packages/engine/src/retraite.ts
import { POINT_INDICE, TRIMESTRES_RETRAITE_1965, AGE_ANNULATION_DECOTE, AGE_DEPART_RETRAITE } from './constants';
import type { ResultatRetraite } from './types';

interface ParamsRetraite {
  indiceMajore: number;
  trimestresValides: number;   // retenus à la fois comme liquidables et comme durée d'assurance
  anneeNaissance: number;
  anneeDepart: number;
}

const TAUX_PAR_TRIMESTRE = 0.0125;
const DECOTE_MAX_TRIMESTRES = 20;

/**
 * Trimestres requis pour le taux plein selon l'année de naissance.
 * Source : loi n°2023-270 du 14 avril 2023, modifiée par la LFSS 2026 (suspension au 01/09/2026).
 * Granularité annuelle : 1961 retient 168 (janv.–août), 1965 retient 171 (avril–déc.).
 */
export function trimestresRequisTauxPlein(anneeNaissance: number): number {
  if (anneeNaissance >= 1966) return TRIMESTRES_RETRAITE_1965;
  if (anneeNaissance === 1965) return 171;
  if (anneeNaissance >= 1963) return 170;
  if (anneeNaissance === 1962) return 169;
  if (anneeNaissance === 1961) return 168;
  if (anneeNaissance >= 1958) return 167;
  return 166;
}

/**
 * Âge légal d'ouverture des droits (catégorie sédentaire), en années décimales.
 * Même source et même granularité que trimestresRequisTauxPlein.
 */
export function ageLegalDepart(anneeNaissance: number): number {
  if (anneeNaissance >= 1969) return AGE_DEPART_RETRAITE;
  if (anneeNaissance >= 1965) return 63 + (anneeNaissance - 1965) * 0.25;
  if (anneeNaissance >= 1963) return 62.75;
  if (anneeNaissance === 1962) return 62.5;
  return 62;
}

/**
 * Pension CNRACL = traitement indiciaire × 75 % × (trimestres liquidables / requis)
 *                  × (1 − décote) × (1 + surcote).
 * Décote : 1,25 % par trimestre manquant, retenu au plus favorable entre la durée d'assurance
 * et l'âge d'annulation (67 ans), dans la limite de 20 trimestres.
 * Surcote : 1,25 % par trimestre au-delà de la durée requise, accompli après l'âge légal.
 */
export function calculerRetraite(params: ParamsRetraite): ResultatRetraite {
  const { indiceMajore, trimestresValides, anneeNaissance, anneeDepart } = params;

  const trimRequis = trimestresRequisTauxPlein(anneeNaissance);
  const ageDepart = anneeDepart - anneeNaissance;
  const ageLegal = ageLegalDepart(anneeNaissance);

  const tauxLiquidation = 0.75 * (Math.min(trimestresValides, trimRequis) / trimRequis);

  const manquantsDuree = Math.max(0, trimRequis - trimestresValides);
  const manquantsAge = Math.max(0, (AGE_ANNULATION_DECOTE - ageDepart) * 4);
  const trimestresDecote = Math.min(manquantsDuree, manquantsAge, DECOTE_MAX_TRIMESTRES);
  const decote = trimestresDecote * TAUX_PAR_TRIMESTRE;

  const trimestresApresAgeLegal = Math.max(0, Math.floor((ageDepart - ageLegal) * 4));
  const trimestresSurcote = Math.min(Math.max(0, trimestresValides - trimRequis), trimestresApresAgeLegal);
  const surcote = trimestresSurcote * TAUX_PAR_TRIMESTRE;

  const tauxEffectif = tauxLiquidation * (1 - decote) * (1 + surcote);
  const pensionBrute = indiceMajore * POINT_INDICE * tauxEffectif;

  return {
    pensionBrute,
    tauxLiquidation,
    tauxEffectif,
    trimestresValides,
    trimestresRequisTauxPlein: trimRequis,
    trimestresDecote,
    decote,
    surcote,
    ageDepart,
    ageLegal,
    departAvantAgeLegal: ageDepart < ageLegal,
    anneeeDepart: anneeDepart,
  };
}
