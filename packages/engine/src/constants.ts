// packages/engine/src/constants.ts

/**
 * Point d'indice FPT — valeur MENSUELLE brute au 01/07/2023 (décret 2023-519),
 * inchangée en 2026. Traitement annuel = IM × POINT_INDICE × 12.
 */
export const POINT_INDICE = 4.92278;

/** Taux cotisation employeur CNRACL au 01/01/2026 (décret 2025-86 : 34,65 % en 2025, +3 pts/an jusqu'en 2028) */
export const TAUX_CNRACL_EMPLOYEUR = 0.3765;

/** Taux cotisation agent CNRACL */
export const TAUX_CNRACL_AGENT = 0.111;

/** Taux cotisation employeur IRCANTEC tranche A au 01/01/2026 (contractuels) */
export const TAUX_IRCANTEC_EMPLOYEUR = 0.0427;

/** Taux cotisation employeur RAFP (régime additionnel, assis sur les primes et IHTS des titulaires) */
export const TAUX_RAFP_EMPLOYEUR = 0.05;

/** Plafond CET en jours */
export const CET_PLAFOND_JOURS = 60;

/** Trimestres requis pour le taux plein, génération 1966 et suivantes (loi 2023-270, LFSS 2026) */
export const TRIMESTRES_RETRAITE_1965 = 172;

/** Âge d'annulation de la décote — catégorie sédentaire */
export const AGE_ANNULATION_DECOTE = 67;

/** Durée légale annuelle en heures */
export const HEURES_ANNUELLES = 1607;

/** Âge légal de départ cible de la réforme 2023 (génération 1969+ — réforme suspendue jusqu'au 01/01/2028) */
export const AGE_DEPART_RETRAITE = 64;

// --- IHTS (décret 2002-60, art. 7 et 8) ---

/** Diviseur du taux horaire IHTS */
export const IHTS_DIVISEUR = 1820;

/** Nombre d'heures majorées au premier coefficient */
export const IHTS_SEUIL_PREMIER_TAUX = 14;

/** Coefficient des 14 premières heures */
export const IHTS_COEF_PREMIERES_HEURES = 1.25;

/** Coefficient de la 15e à la 25e heure */
export const IHTS_COEF_HEURES_SUIVANTES = 1.27;

/** Plafond mensuel d'heures supplémentaires rémunérables */
export const IHTS_PLAFOND_MENSUEL = 25;

/** Taux de l'indemnité de résidence par zone (appliqué au traitement brut) */
export const TAUX_INDEMNITE_RESIDENCE = { 1: 0.03, 2: 0.01, 3: 0 } as const;

/** Version du moteur — incluse dans les simulations archivées */
export const ENGINE_VERSION = '1.1.0';
