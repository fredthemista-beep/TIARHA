// packages/engine/src/types.ts

export type StatutAgent = 'TITULAIRE' | 'CONTRACTUEL';
export type CategorieAgent = 'A' | 'B' | 'C';
export type TypeConge = 'CMO' | 'CLM' | 'CLD' | 'AT' | 'CITIS';

export interface AgentBase {
  indiceMajore: number;         // IM brut
  traitementBrut: number;       // € mensuel
  primesMenusuelles: number;    // RIFSEEP etc.
}

/** Résultat d'une simulation d'arrêt maladie */
export interface ResultatArret {
  type: TypeConge;
  dureeJours: number;
  maintienTraitement: number;   // € total maintenu par l'employeur
  coutEmployeur: number;        // maintien + charges patronales CNRACL
  coutCNRACL: number;           // part CNRACL employeur sur la période
  tauxMaintien: number;         // 0.0–1.0 (fraction du traitement maintenu)
}

/** Résultat d'une simulation de retraite CNRACL */
export interface ResultatRetraite {
  pensionBrute: number;         // € mensuel
  tauxLiquidation: number;      // 0.0–0.75
  trimestresValides: number;
  trimestresRequisTauxPlein: number;
  decote: number;               // % appliqué si < taux plein (0.0 si taux plein)
  surcote: number;              // % appliqué si > taux plein
  anneeeDepart: number;
}

/** Résultat d'une simulation heures supplémentaires / CET */
export interface ResultatHeures {
  ihtsParHeure: number;         // € brut par heure sup
  ihtsTotal: number;            // € brut total
  coutEmployeurTotal: number;   // IHTS + charges
  joursCET: number;             // jours à créditer au CET
  cetPlafondAtteint: boolean;
}
