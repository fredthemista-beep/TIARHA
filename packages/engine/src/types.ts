// packages/engine/src/types.ts

export type StatutAgent = 'TITULAIRE' | 'CONTRACTUEL';
export type CategorieAgent = 'A' | 'B' | 'C';
export type TypeConge = 'CMO' | 'CLM' | 'CLD' | 'AT' | 'CITIS';
export type RegimeRetraite = 'CNRACL' | 'IRCANTEC';
export type ZoneResidence = 1 | 2 | 3;
export type MajorationHeures = 'standard' | 'nuit' | 'dimancheFerie';
export type AffectationHeures = 'IHTS' | 'CET' | 'recuperation';

export interface AgentBase {
  indiceMajore: number;         // IM brut
  traitementBrut: number;       // € mensuel
  primesMenusuelles: number;    // RIFSEEP etc.
}

/** Résultat d'une simulation d'arrêt maladie */
export interface ResultatArret {
  type: TypeConge;
  dureeJours: number;
  statut: StatutAgent;
  maintienTraitement: number;   // € total maintenu par l'employeur
  coutEmployeur: number;        // maintien + cotisation retraite employeur
  regimeRetraite: RegimeRetraite; // CNRACL (titulaire) ou IRCANTEC (contractuel)
  cotisationRetraiteEmployeur: number; // part employeur retraite sur la période
  tauxMaintien: number;         // 0.0–1.0 (fraction du traitement maintenu)
}

/** Résultat d'une simulation de retraite CNRACL */
export interface ResultatRetraite {
  pensionBrute: number;         // € mensuel
  tauxLiquidation: number;      // 75 % × trimestres liquidables / requis (0.0–0.75)
  tauxEffectif: number;         // taux après décote / surcote — pension = traitement × tauxEffectif
  trimestresValides: number;
  trimestresRequisTauxPlein: number;
  trimestresDecote: number;     // trimestres retenus pour la décote (≤ 20)
  decote: number;               // coefficient de minoration (0.0 si aucune)
  surcote: number;              // coefficient de majoration (0.0 si aucune)
  ageDepart: number;            // âge en années révolues l'année du départ
  ageLegal: number;             // âge légal de la génération (ex : 62.75)
  departAvantAgeLegal: boolean;
  anneeeDepart: number;
}

/** Résultat d'une simulation heures supplémentaires / CET */
export interface ResultatHeures {
  ihtsParHeure: number;         // € brut — taux horaire de base (avant coefficient)
  ihtsTotal: number;            // € brut total versé (0 si CET ou récupération)
  coutEmployeurTotal: number;   // IHTS + RAFP employeur
  heuresRemunerables: number;   // heures retenues après plafond mensuel (25 h)
  plafondMensuelDepasse: boolean;
  joursCET: number;             // jours à créditer au CET
  cetPlafondAtteint: boolean;
  heuresRecuperation: number;   // heures à rendre en repos compensateur
}

// --- Annualisation ---

export interface ParamsBaseAnnuelle {
  quotite: number;       // 0.0–1.0 (ex : 0.8 pour 80 %)
  dateDebut?: string;    // 'YYYY-MM-DD' — arrivée en cours d'année
  dateFin?: string;      // 'YYYY-MM-DD' — départ en cours d'année
  annee?: number;        // année civile de référence (défaut : année courante)
}

export interface ResultatBaseAnnuelle {
  heuresAnnuellesBase: number;  // 1607 × quotite (sans proratisation)
  heuresDues: number;           // après proratisation si dates fournies
  joursPresence: number;        // jours de présence effective dans l'année
  joursAnnee: number;           // jours calendaires de l'année de référence
  estProratise: boolean;
}

export interface SaisieMensuelle {
  mois: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  heures: number;
}

export interface ParamsSoldeAnnuel {
  heuresDues: number;
  moisSaisis?: SaisieMensuelle[];      // optionnel — prend le pas sur heuresTotalesManuelle
  heuresTotalesManuelle?: number;      // total global si pas de suivi mensuel — si les deux sont absents : heuresRealisees = 0
}

export interface AlerteLegale {
  type: 'SEMAINE_MAX' | 'SEMAINE_MOYENNE_MAX' | 'JOUR_MAX';
  seuil: number;
  valeurEstimee: number | null;  // null si données insuffisantes
  depasse: boolean;
  message: string;               // libellé métier en français
}

export interface ResultatSoldeAnnuel {
  heuresRealisees: number;
  solde: number;              // positif = heures sup, négatif = déficit
  heuresSup: number;          // max(0, solde)
  heuresDeficit: number;      // max(0, -solde)
  progression: number;        // heuresRealisees / heuresDues (peut dépasser 1.0)
  moisSaisisCount: number;
  alertesLegales: AlerteLegale[];
}
