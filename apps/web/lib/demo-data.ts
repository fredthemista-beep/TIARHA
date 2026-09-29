// apps/web/lib/demo-data.ts
// Source unique des données de démonstration (aucune base de données).
// Toutes les pages du tableau de bord lisent ce fichier.

import { calculerArret, POINT_INDICE } from '@tiarh/engine';
import type { PlanType } from '@tiarh/ui';

/* ── Organisation ─────────────────────────────────────────────── */

export const ORG: { collectivite: string; initiales: string; plan: PlanType; planLabel: string } = {
  collectivite: 'Mairie de Foix',
  initiales: 'MF',
  /** Plan interne : débloque tous les simulateurs (PlanGate). Jamais affiché comme offre payante. */
  plan: 'pro',
  /** Libellé affiché partout à la place du plan : phase pilote, aucune offre payante active. */
  planLabel: 'Démo',
};

/**
 * Date d'arrêté des données de démonstration : les durées des arrêts en cours
 * et les indicateurs sont calculés à cette date.
 */
export const DEMO_AS_OF = '2026-09-29';

/* ── Types ────────────────────────────────────────────────────── */

export type StatutCode = 'tit' | 'cont';
export type Categorie = 'A' | 'B' | 'C';
export type TypeAbsence = 'CMO' | 'CLM' | 'CLD' | 'AT';
export type Position = 'Activité' | TypeAbsence;

export interface EvenementCarriere {
  date: string;
  evenement: string;
  grade: string;
  im: number;
}

export interface AbsenceAgent {
  id: string;
  type: TypeAbsence;
  debut: string;
  /** Fin effective, ou fin prévue si l'arrêt est en cours ; null si indéterminée. */
  fin: string | null;
  /** Jours d'arrêt, arrêtés à DEMO_AS_OF pour un arrêt en cours. */
  duree: number;
  enCours: boolean;
  /** Coût employeur (maintien + cotisation retraite), calculé par le moteur. */
  cout: number;
  remplacement: boolean;
  coutRemplacement: number | null;
}

export interface DocumentAgent {
  nom: string;
  date: string;
  type: 'Arrêté' | 'Contrat' | 'Évaluation' | 'Médical';
}

export interface Agent {
  id: string;
  initiales: string;
  nom: string;
  prenom: string;
  statut: StatutCode;
  cat: Categorie;
  grade: string;
  im: number;
  service: string;
  poste: string;
  tel: string;
  email: string;
  dateEntree: string;
  quotite: number;
  dateNaissance: string;
  situationFamiliale: string;
  adresse: string;
  nMatricule: string;
  position: Position;
  regime: 'CNRACL' | 'IRCANTEC';
  echelon: number;
  ancienneteEchelon: string;
  /** Date ISO du prochain avancement, ou null à l'échelon terminal. */
  prochainEchelon: string | null;
  joursCET: number;
  trimestresValides: number;
  droitConges: number;
  congesPris: number;
  carriere: EvenementCarriere[];
  absences: AbsenceAgent[];
  documents: DocumentAgent[];
}

type AbsenceSeed = Omit<AbsenceAgent, 'cout' | 'enCours' | 'remplacement' | 'coutRemplacement'> & {
  enCours?: boolean;
  coutRemplacement?: number;
};

type AgentSeed = Omit<Agent, 'initiales' | 'email' | 'regime' | 'droitConges' | 'absences' | 'documents' | 'position'> & {
  absences: AbsenceSeed[];
  documents?: DocumentAgent[];
};

/* ── Données brutes ───────────────────────────────────────────── */

const SEEDS: AgentSeed[] = [
  {
    id: 'A001', nom: 'Dubois', prenom: 'Martin', statut: 'tit', cat: 'B',
    grade: 'Rédacteur principal 1ère cl.', im: 460, service: 'DRH', poste: 'Gestionnaire RH',
    tel: '05 56 10 21 01', dateEntree: '2008-03-12', quotite: 100, dateNaissance: '1977-06-15',
    situationFamiliale: 'Marié(e) — 2 enfants', adresse: '14 rue des Pyrénées, 09000 Foix',
    nMatricule: 'MAT-2008-0342', echelon: 8, ancienneteEchelon: '2 ans 4 mois', prochainEchelon: '2027-07-01',
    joursCET: 22, trimestresValides: 68, congesPris: 18,
    carriere: [
      { date: '2008-03-12', evenement: 'Recrutement', grade: 'Rédacteur', im: 350 },
      { date: '2011-09-01', evenement: 'Avancement d’échelon', grade: 'Rédacteur', im: 380 },
      { date: '2015-02-01', evenement: 'Promotion de grade', grade: 'Rédacteur principal 2ème cl.', im: 410 },
      { date: '2019-09-01', evenement: 'Promotion de grade', grade: 'Rédacteur principal 1ère cl.', im: 440 },
      { date: '2023-01-01', evenement: 'Avancement d’échelon', grade: 'Rédacteur principal 1ère cl.', im: 460 },
    ],
    absences: [
      { id: 'ABS-2026-081', type: 'CMO', debut: '2026-09-07', fin: '2026-10-09', duree: 23, enCours: true },
      { id: 'ABS-2026-051', type: 'CMO', debut: '2026-04-20', fin: '2026-05-18', duree: 29 },
      { id: 'ABS-2024-018', type: 'CMO', debut: '2024-02-05', fin: '2024-02-12', duree: 8 },
      { id: 'ABS-2023-041', type: 'CMO', debut: '2023-11-10', fin: '2023-11-24', duree: 15 },
    ],
    documents: [
      { nom: 'Arrêté de nomination', date: '2008-03-12', type: 'Arrêté' },
      { nom: 'Arrêté promotion Réd. princ. 2', date: '2015-02-01', type: 'Arrêté' },
      { nom: 'Arrêté promotion Réd. princ. 1', date: '2019-09-01', type: 'Arrêté' },
      { nom: 'Entretien professionnel 2025', date: '2025-03-15', type: 'Évaluation' },
      { nom: 'Entretien professionnel 2024', date: '2024-03-20', type: 'Évaluation' },
    ],
  },
  {
    id: 'A002', nom: 'Laurent', prenom: 'Sophie', statut: 'tit', cat: 'A',
    grade: 'Attaché principal', im: 620, service: 'Direction générale', poste: 'Directrice des affaires juridiques',
    tel: '05 56 10 21 02', dateEntree: '2015-09-01', quotite: 100, dateNaissance: '1983-11-02',
    situationFamiliale: 'Marié(e) — 1 enfant', adresse: '3 allée des Consuls, 09000 Foix',
    nMatricule: 'MAT-2015-0891', echelon: 7, ancienneteEchelon: '1 an 8 mois', prochainEchelon: '2027-01-01',
    joursCET: 45, trimestresValides: 42, congesPris: 25,
    carriere: [
      { date: '2015-09-01', evenement: 'Recrutement', grade: 'Attaché', im: 520 },
      { date: '2019-05-01', evenement: 'Promotion de grade', grade: 'Attaché principal', im: 580 },
      { date: '2022-09-01', evenement: 'Avancement d’échelon', grade: 'Attaché principal', im: 620 },
    ],
    absences: [
      { id: 'ABS-2026-047', type: 'CLM', debut: '2026-07-04', fin: null, duree: 87, enCours: true },
      { id: 'ABS-2025-009', type: 'CMO', debut: '2025-01-08', fin: '2025-01-22', duree: 15 },
    ],
    documents: [
      { nom: 'Arrêté de nomination', date: '2015-09-01', type: 'Arrêté' },
      { nom: 'Arrêté promotion Att. princ.', date: '2019-05-01', type: 'Arrêté' },
      { nom: 'Arrêté CLM — 2026', date: '2026-07-04', type: 'Arrêté' },
      { nom: 'Rapport médical CLM', date: '2026-06-29', type: 'Médical' },
      { nom: 'Entretien professionnel 2025', date: '2025-04-10', type: 'Évaluation' },
    ],
  },
  {
    id: 'A003', nom: 'Moreau', prenom: 'Jean', statut: 'cont', cat: 'C',
    grade: 'Adjoint administratif', im: 340, service: 'Accueil', poste: 'Agent d’accueil',
    tel: '05 56 10 21 03', dateEntree: '2022-01-10', quotite: 80, dateNaissance: '1994-04-22',
    situationFamiliale: 'Célibataire', adresse: '8 rue de la République, 09000 Foix',
    nMatricule: 'MAT-2022-0124', echelon: 2, ancienneteEchelon: '10 mois', prochainEchelon: '2026-11-01',
    joursCET: 0, trimestresValides: 17, congesPris: 12,
    carriere: [
      { date: '2022-01-10', evenement: 'Recrutement CDD 1 an', grade: 'Adjoint administratif', im: 340 },
      { date: '2023-01-10', evenement: 'Renouvellement CDD 3 ans', grade: 'Adjoint administratif', im: 340 },
    ],
    absences: [
      { id: 'ABS-2026-085', type: 'CMO', debut: '2026-09-18', fin: '2026-10-02', duree: 12, enCours: true },
    ],
    documents: [
      { nom: 'Contrat CDD initial', date: '2022-01-10', type: 'Contrat' },
      { nom: 'Avenant renouvellement', date: '2023-01-10', type: 'Contrat' },
      { nom: 'Entretien professionnel 2025', date: '2025-02-20', type: 'Évaluation' },
    ],
  },
  {
    id: 'A004', nom: 'Bernard', prenom: 'Alice', statut: 'tit', cat: 'C',
    grade: 'Adjoint technique principal 2e cl.', im: 380, service: 'Bâtiments', poste: 'Agent d’entretien des bâtiments',
    tel: '05 56 10 21 04', dateEntree: '2010-06-15', quotite: 100, dateNaissance: '1979-02-11',
    situationFamiliale: 'Pacsé(e) — 2 enfants', adresse: '5 chemin de Cadirac, 09000 Foix',
    nMatricule: 'MAT-2010-0415', echelon: 7, ancienneteEchelon: '2 ans 9 mois', prochainEchelon: '2027-03-01',
    joursCET: 12, trimestresValides: 98, congesPris: 14,
    carriere: [
      { date: '2010-06-15', evenement: 'Recrutement', grade: 'Adjoint technique', im: 330 },
      { date: '2014-06-15', evenement: 'Avancement d’échelon', grade: 'Adjoint technique', im: 345 },
      { date: '2018-01-01', evenement: 'Promotion de grade', grade: 'Adjoint technique principal 2e cl.', im: 360 },
      { date: '2023-12-01', evenement: 'Avancement d’échelon', grade: 'Adjoint technique principal 2e cl.', im: 380 },
    ],
    absences: [
      { id: 'ABS-2026-074', type: 'AT', debut: '2026-08-16', fin: null, duree: 45, enCours: true, coutRemplacement: 5850 },
      { id: 'ABS-2025-022', type: 'CMO', debut: '2025-03-03', fin: '2025-03-14', duree: 12 },
    ],
  },
  {
    id: 'A005', nom: 'Colin', prenom: 'Thomas', statut: 'tit', cat: 'B',
    grade: 'Technicien principal 2ème cl.', im: 500, service: 'Informatique', poste: 'Administrateur systèmes et réseaux',
    tel: '05 56 10 21 05', dateEntree: '2018-04-02', quotite: 100, dateNaissance: '1986-08-19',
    situationFamiliale: 'Marié(e) — 1 enfant', adresse: '27 avenue de Lérida, 09000 Foix',
    nMatricule: 'MAT-2018-0655', echelon: 6, ancienneteEchelon: '1 an 7 mois', prochainEchelon: '2027-06-01',
    joursCET: 18, trimestresValides: 72, congesPris: 17,
    carriere: [
      { date: '2018-04-02', evenement: 'Recrutement', grade: 'Technicien', im: 390 },
      { date: '2021-07-01', evenement: 'Promotion de grade', grade: 'Technicien principal 2ème cl.', im: 440 },
      { date: '2024-02-01', evenement: 'Avancement d’échelon', grade: 'Technicien principal 2ème cl.', im: 500 },
    ],
    absences: [
      { id: 'ABS-2026-088', type: 'CMO', debut: '2026-09-16', fin: '2026-09-30', duree: 14, enCours: true },
      { id: 'ABS-2025-071', type: 'CMO', debut: '2025-11-12', fin: '2025-11-18', duree: 7 },
    ],
  },
  {
    id: 'A006', nom: 'Richard', prenom: 'Marie', statut: 'cont', cat: 'B',
    grade: 'Rédacteur', im: 460, service: 'Communication', poste: 'Chargée de communication',
    tel: '05 56 10 21 06', dateEntree: '2021-11-15', quotite: 100, dateNaissance: '1990-05-27',
    situationFamiliale: 'Célibataire', adresse: '11 rue Labistour, 09000 Foix',
    nMatricule: 'MAT-2021-0987', echelon: 5, ancienneteEchelon: '1 an 10 mois', prochainEchelon: '2027-11-15',
    joursCET: 6, trimestresValides: 56, congesPris: 19,
    carriere: [
      { date: '2021-11-15', evenement: 'Recrutement CDD 3 ans', grade: 'Rédacteur', im: 430 },
      { date: '2024-11-15', evenement: 'Renouvellement CDD 3 ans', grade: 'Rédacteur', im: 460 },
    ],
    absences: [
      { id: 'ABS-2026-083', type: 'CMO', debut: '2026-09-01', fin: '2026-10-15', duree: 29, enCours: true },
    ],
  },
  {
    id: 'A007', nom: 'Vincent', prenom: 'Paul', statut: 'tit', cat: 'A',
    grade: 'Ingénieur en chef', im: 680, service: 'Voirie', poste: 'Responsable voirie et réseaux',
    tel: '05 56 10 21 07', dateEntree: '2003-02-20', quotite: 100, dateNaissance: '1968-09-30',
    situationFamiliale: 'Marié(e) — 3 enfants', adresse: '22 avenue du Maréchal Joffre, 09000 Foix',
    nMatricule: 'MAT-2003-0087', echelon: 12, ancienneteEchelon: '3 ans', prochainEchelon: null,
    joursCET: 58, trimestresValides: 128, congesPris: 25,
    carriere: [
      { date: '2003-02-20', evenement: 'Recrutement', grade: 'Ingénieur', im: 480 },
      { date: '2009-01-01', evenement: 'Promotion de grade', grade: 'Ingénieur principal', im: 570 },
      { date: '2016-09-01', evenement: 'Promotion de grade', grade: 'Ingénieur en chef', im: 640 },
      { date: '2021-01-01', evenement: 'Avancement d’échelon', grade: 'Ingénieur en chef', im: 680 },
    ],
    absences: [
      { id: 'ABS-2026-038', type: 'CLD', debut: '2026-04-03', fin: null, duree: 180, enCours: true, coutRemplacement: 18600 },
      { id: 'ABS-2024-055', type: 'CMO', debut: '2024-06-10', fin: '2024-07-09', duree: 30 },
    ],
    documents: [
      { nom: 'Arrêté de nomination', date: '2003-02-20', type: 'Arrêté' },
      { nom: 'Arrêté promotion Ing. en chef', date: '2016-09-01', type: 'Arrêté' },
      { nom: 'Arrêté CLD — 2026', date: '2026-04-03', type: 'Arrêté' },
      { nom: 'Avis du conseil médical', date: '2026-03-24', type: 'Médical' },
      { nom: 'Entretien professionnel 2024', date: '2024-04-05', type: 'Évaluation' },
    ],
  },
  {
    id: 'A008', nom: 'Fontaine', prenom: 'Clara', statut: 'tit', cat: 'C',
    grade: 'ATSEM principal 2ème cl.', im: 360, service: 'Éducation', poste: 'ATSEM — école maternelle du Centre',
    tel: '05 56 10 21 08', dateEntree: '2013-08-28', quotite: 100, dateNaissance: '1985-12-03',
    situationFamiliale: 'Mariée — 2 enfants', adresse: '9 rue du Rival, 09000 Foix',
    nMatricule: 'MAT-2013-0521', echelon: 6, ancienneteEchelon: '1 an 9 mois', prochainEchelon: '2027-02-01',
    joursCET: 8, trimestresValides: 76, congesPris: 20,
    carriere: [
      { date: '2013-08-28', evenement: 'Recrutement', grade: 'ATSEM 1ère cl.', im: 330 },
      { date: '2017-09-01', evenement: 'Avancement d’échelon', grade: 'ATSEM 1ère cl.', im: 340 },
      { date: '2020-01-01', evenement: 'Promotion de grade', grade: 'ATSEM principal 2ème cl.', im: 350 },
      { date: '2024-01-01', evenement: 'Avancement d’échelon', grade: 'ATSEM principal 2ème cl.', im: 360 },
    ],
    absences: [
      { id: 'ABS-2025-004', type: 'CMO', debut: '2025-01-13', fin: '2025-01-24', duree: 12 },
      { id: 'ABS-2023-052', type: 'CMO', debut: '2023-09-04', fin: '2023-09-08', duree: 5 },
    ],
  },
  {
    id: 'A009', nom: 'Blanc', prenom: 'Rémi', statut: 'tit', cat: 'B',
    grade: 'Éducateur des APS principal', im: 490, service: 'Sports', poste: 'Responsable des équipements sportifs',
    tel: '05 56 10 21 09', dateEntree: '2011-01-03', quotite: 100, dateNaissance: '1981-04-09',
    situationFamiliale: 'Marié — 3 enfants', adresse: '2 place Saint-Volusien, 09000 Foix',
    nMatricule: 'MAT-2011-0443', echelon: 9, ancienneteEchelon: '2 ans 1 mois', prochainEchelon: '2027-04-01',
    joursCET: 31, trimestresValides: 96, congesPris: 21,
    carriere: [
      { date: '2011-01-03', evenement: 'Recrutement', grade: 'Éducateur des APS', im: 370 },
      { date: '2016-07-01', evenement: 'Promotion de grade', grade: 'Éducateur des APS principal', im: 420 },
      { date: '2022-03-01', evenement: 'Avancement d’échelon', grade: 'Éducateur des APS principal', im: 490 },
    ],
    absences: [
      { id: 'ABS-2024-061', type: 'AT', debut: '2024-10-07', fin: '2024-11-05', duree: 30 },
    ],
  },
  {
    id: 'A010', nom: 'Petit', prenom: 'Nathalie', statut: 'tit', cat: 'A',
    grade: 'Bibliothécaire', im: 550, service: 'Culture', poste: 'Responsable de la médiathèque',
    tel: '05 56 10 21 10', dateEntree: '2016-10-17', quotite: 100, dateNaissance: '1980-10-30',
    situationFamiliale: 'Divorcée — 1 enfant', adresse: '16 rue Delcassé, 09000 Foix',
    nMatricule: 'MAT-2016-0712', echelon: 7, ancienneteEchelon: '2 ans 6 mois', prochainEchelon: '2026-12-01',
    joursCET: 24, trimestresValides: 92, congesPris: 16,
    carriere: [
      { date: '2016-10-17', evenement: 'Recrutement par mutation', grade: 'Bibliothécaire', im: 470 },
      { date: '2020-04-01', evenement: 'Avancement d’échelon', grade: 'Bibliothécaire', im: 510 },
      { date: '2024-04-01', evenement: 'Avancement d’échelon', grade: 'Bibliothécaire', im: 550 },
    ],
    absences: [
      { id: 'ABS-2025-037', type: 'CMO', debut: '2025-05-12', fin: '2025-05-16', duree: 5 },
    ],
  },
  {
    id: 'A011', nom: 'Dupont', prenom: 'Karim', statut: 'cont', cat: 'C',
    grade: 'Adjoint technique', im: 340, service: 'Propreté', poste: 'Agent de propreté urbaine',
    tel: '05 56 10 21 11', dateEntree: '2023-03-06', quotite: 80, dateNaissance: '1996-07-14',
    situationFamiliale: 'Célibataire', adresse: '31 route de Saint-Girons, 09000 Foix',
    nMatricule: 'MAT-2023-1102', echelon: 2, ancienneteEchelon: '1 an 6 mois', prochainEchelon: '2027-03-06',
    joursCET: 0, trimestresValides: 36, congesPris: 13,
    carriere: [
      { date: '2023-03-06', evenement: 'Recrutement CDD 1 an', grade: 'Adjoint technique', im: 340 },
      { date: '2024-03-06', evenement: 'Renouvellement CDD 3 ans', grade: 'Adjoint technique', im: 340 },
    ],
    absences: [
      { id: 'ABS-2025-079', type: 'CMO', debut: '2025-12-01', fin: '2025-12-05', duree: 5 },
    ],
  },
  {
    id: 'A012', nom: 'Gauthier', prenom: 'Emma', statut: 'tit', cat: 'B',
    grade: 'Animateur principal 1ère cl.', im: 470, service: 'Jeunesse', poste: 'Coordinatrice enfance-jeunesse',
    tel: '05 56 10 21 12', dateEntree: '2019-09-01', quotite: 100, dateNaissance: '1988-03-22',
    situationFamiliale: 'Pacsée — 1 enfant', adresse: '7 rue Noël Peyrevidal, 09000 Foix',
    nMatricule: 'MAT-2019-0803', echelon: 5, ancienneteEchelon: '1 an 3 mois', prochainEchelon: '2027-01-01',
    joursCET: 15, trimestresValides: 60, congesPris: 18,
    carriere: [
      { date: '2019-09-01', evenement: 'Recrutement par mutation', grade: 'Animateur', im: 400 },
      { date: '2022-01-01', evenement: 'Promotion de grade', grade: 'Animateur principal 2ème cl.', im: 430 },
      { date: '2025-06-01', evenement: 'Promotion de grade', grade: 'Animateur principal 1ère cl.', im: 470 },
    ],
    absences: [
      { id: 'ABS-2024-012', type: 'CMO', debut: '2024-02-19', fin: '2024-03-01', duree: 12 },
    ],
  },
  {
    id: 'A013', nom: 'Martinez', prenom: 'Lucie', statut: 'tit', cat: 'A',
    grade: 'Médecin territorial', im: 750, service: 'Santé/Prévention', poste: 'Médecin de prévention',
    tel: '05 56 10 21 13', dateEntree: '2007-05-14', quotite: 100, dateNaissance: '1972-01-25',
    situationFamiliale: 'Mariée — 2 enfants', adresse: '4 cours Gabriel Fauré, 09000 Foix',
    nMatricule: 'MAT-2007-0298', echelon: 8, ancienneteEchelon: '2 ans', prochainEchelon: '2027-05-01',
    joursCET: 52, trimestresValides: 128, congesPris: 20,
    carriere: [
      { date: '2007-05-14', evenement: 'Recrutement', grade: 'Médecin territorial 2e cl.', im: 560 },
      { date: '2013-07-01', evenement: 'Promotion de grade', grade: 'Médecin territorial 1ère cl.', im: 650 },
      { date: '2020-05-01', evenement: 'Avancement d’échelon', grade: 'Médecin territorial', im: 750 },
    ],
    absences: [],
  },
  {
    id: 'A014', nom: 'Perron', prenom: 'Hugo', statut: 'cont', cat: 'B',
    grade: 'Technicien', im: 440, service: 'Informatique', poste: 'Technicien support utilisateurs',
    tel: '05 56 10 21 14', dateEntree: '2022-07-01', quotite: 100, dateNaissance: '1993-11-08',
    situationFamiliale: 'Célibataire', adresse: '19 rue de la Faurie, 09000 Foix',
    nMatricule: 'MAT-2022-0678', echelon: 4, ancienneteEchelon: '1 an 2 mois', prochainEchelon: '2027-07-01',
    joursCET: 4, trimestresValides: 40, congesPris: 15,
    carriere: [
      { date: '2022-07-01', evenement: 'Recrutement CDD 3 ans', grade: 'Technicien', im: 420 },
      { date: '2025-07-01', evenement: 'Transformation en CDI', grade: 'Technicien', im: 440 },
    ],
    absences: [],
  },
  {
    id: 'A015', nom: 'Simon', prenom: 'Chloé', statut: 'tit', cat: 'C',
    grade: 'Agent de maîtrise principal', im: 400, service: 'Restauration', poste: 'Responsable de la cuisine centrale',
    tel: '05 56 10 21 15', dateEntree: '2009-04-22', quotite: 100, dateNaissance: '1976-06-17',
    situationFamiliale: 'Mariée — 3 enfants', adresse: '12 rue des Chapeliers, 09000 Foix',
    nMatricule: 'MAT-2009-0377', echelon: 6, ancienneteEchelon: '1 an 11 mois', prochainEchelon: '2027-09-01',
    joursCET: 27, trimestresValides: 112, congesPris: 22,
    carriere: [
      { date: '2009-04-22', evenement: 'Recrutement', grade: 'Adjoint technique', im: 330 },
      { date: '2015-01-01', evenement: 'Promotion interne', grade: 'Agent de maîtrise', im: 360 },
      { date: '2021-01-01', evenement: 'Promotion de grade', grade: 'Agent de maîtrise principal', im: 390 },
      { date: '2024-09-01', evenement: 'Avancement d’échelon', grade: 'Agent de maîtrise principal', im: 400 },
    ],
    absences: [
      { id: 'ABS-2025-041', type: 'CMO', debut: '2025-06-02', fin: '2025-06-27', duree: 26 },
    ],
  },
  {
    id: 'A016', nom: 'Leroy', prenom: 'Olivier', statut: 'tit', cat: 'A',
    grade: 'Directeur territorial', im: 830, service: 'Direction générale', poste: 'Directeur général des services',
    tel: '05 56 10 21 16', dateEntree: '2001-11-09', quotite: 100, dateNaissance: '1966-03-04',
    situationFamiliale: 'Marié — 2 enfants', adresse: '1 rue du Palais de Justice, 09000 Foix',
    nMatricule: 'MAT-2001-0051', echelon: 10, ancienneteEchelon: '5 ans', prochainEchelon: null,
    joursCET: 55, trimestresValides: 158, congesPris: 19,
    carriere: [
      { date: '2001-11-09', evenement: 'Recrutement', grade: 'Attaché', im: 480 },
      { date: '2008-01-01', evenement: 'Promotion de grade', grade: 'Attaché principal', im: 600 },
      { date: '2014-01-01', evenement: 'Promotion de grade', grade: 'Directeur territorial', im: 740 },
      { date: '2021-01-01', evenement: 'Avancement d’échelon', grade: 'Directeur territorial', im: 830 },
    ],
    absences: [],
  },
  {
    id: 'A017', nom: 'Moulin', prenom: 'Aline', statut: 'tit', cat: 'B',
    grade: 'Rédacteur principal 2ème cl.', im: 450, service: 'Finances', poste: 'Gestionnaire comptable',
    tel: '05 56 10 21 17', dateEntree: '2014-02-03', quotite: 80, dateNaissance: '1984-09-12',
    situationFamiliale: 'Mariée — 3 enfants', adresse: '6 impasse du Pech, 09000 Foix',
    nMatricule: 'MAT-2014-0566', echelon: 6, ancienneteEchelon: '1 an 7 mois', prochainEchelon: '2027-02-01',
    joursCET: 9, trimestresValides: 74, congesPris: 14,
    carriere: [
      { date: '2014-02-03', evenement: 'Recrutement', grade: 'Rédacteur', im: 370 },
      { date: '2019-02-01', evenement: 'Avancement d’échelon', grade: 'Rédacteur', im: 400 },
      { date: '2022-01-01', evenement: 'Promotion de grade', grade: 'Rédacteur principal 2ème cl.', im: 430 },
      { date: '2025-02-01', evenement: 'Avancement d’échelon', grade: 'Rédacteur principal 2ème cl.', im: 450 },
    ],
    absences: [
      { id: 'ABS-2025-066', type: 'CMO', debut: '2025-09-15', fin: '2025-09-26', duree: 12 },
    ],
  },
  {
    id: 'A018', nom: 'Thomas', prenom: 'Viviane', statut: 'cont', cat: 'C',
    grade: 'Adjoint administratif', im: 340, service: 'Accueil', poste: 'Agent d’accueil — état civil',
    tel: '05 56 10 21 18', dateEntree: '2023-09-01', quotite: 100, dateNaissance: '1999-02-02',
    situationFamiliale: 'Célibataire', adresse: '23 rue Lazéma, 09000 Foix',
    nMatricule: 'MAT-2023-1187', echelon: 1, ancienneteEchelon: '1 an', prochainEchelon: '2027-09-01',
    joursCET: 0, trimestresValides: 22, congesPris: 17,
    carriere: [
      { date: '2023-09-01', evenement: 'Recrutement CDD 1 an', grade: 'Adjoint administratif', im: 340 },
      { date: '2024-09-01', evenement: 'Renouvellement CDD 2 ans', grade: 'Adjoint administratif', im: 340 },
    ],
    absences: [
      { id: 'ABS-2026-006', type: 'CMO', debut: '2026-01-12', fin: '2026-01-16', duree: 5 },
    ],
  },
  {
    id: 'A019', nom: 'Chabrier', prenom: 'Jules', statut: 'tit', cat: 'A',
    grade: 'Ingénieur', im: 600, service: 'Urbanisme', poste: 'Chef de projet urbanisme',
    tel: '05 56 10 21 19', dateEntree: '2017-06-12', quotite: 100, dateNaissance: '1987-12-19',
    situationFamiliale: 'Pacsé — 1 enfant', adresse: '15 allées de Villote, 09000 Foix',
    nMatricule: 'MAT-2017-0744', echelon: 7, ancienneteEchelon: '2 ans 3 mois', prochainEchelon: '2026-12-12',
    joursCET: 20, trimestresValides: 64, congesPris: 21,
    carriere: [
      { date: '2017-06-12', evenement: 'Recrutement', grade: 'Ingénieur', im: 450 },
      { date: '2021-06-12', evenement: 'Avancement d’échelon', grade: 'Ingénieur', im: 530 },
      { date: '2024-06-12', evenement: 'Avancement d’échelon', grade: 'Ingénieur', im: 600 },
    ],
    absences: [],
  },
  {
    id: 'A020', nom: 'Renard', prenom: 'Patricia', statut: 'tit', cat: 'C',
    grade: 'Adjoint du patrimoine principal', im: 370, service: 'Culture', poste: 'Agent de bibliothèque',
    tel: '05 56 10 21 20', dateEntree: '2006-03-08', quotite: 100, dateNaissance: '1970-08-26',
    situationFamiliale: 'Veuve — 2 enfants', adresse: '8 rue de la Préfecture, 09000 Foix',
    nMatricule: 'MAT-2006-0233', echelon: 9, ancienneteEchelon: '2 ans 8 mois', prochainEchelon: '2027-10-01',
    joursCET: 38, trimestresValides: 136, congesPris: 23,
    carriere: [
      { date: '2006-03-08', evenement: 'Recrutement', grade: 'Adjoint du patrimoine', im: 330 },
      { date: '2014-01-01', evenement: 'Promotion de grade', grade: 'Adjoint du patrimoine principal 2e cl.', im: 350 },
      { date: '2021-01-01', evenement: 'Avancement d’échelon', grade: 'Adjoint du patrimoine principal', im: 370 },
    ],
    absences: [
      { id: 'ABS-2025-011', type: 'CMO', debut: '2025-02-03', fin: '2025-02-21', duree: 19 },
      { id: 'ABS-2023-066', type: 'CMO', debut: '2023-11-20', fin: '2023-12-08', duree: 19 },
    ],
  },
];

/* ── Construction ─────────────────────────────────────────────── */

/** Traitement brut mensuel indiciaire (IM × valeur du point). */
export function traitementBrutMensuel(im: number) {
  return Math.round(im * POINT_INDICE * 100) / 100;
}

function slug(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]+/g, '-');
}

function documentsFromCarriere(seed: AgentSeed): DocumentAgent[] {
  const docs: DocumentAgent[] = [...seed.carriere].reverse().map(ev => ({
    nom: seed.statut === 'cont' ? `${ev.evenement} — ${ev.grade}` : `Arrêté — ${ev.evenement.toLowerCase()}`,
    date: ev.date,
    type: seed.statut === 'cont' ? 'Contrat' : 'Arrêté',
  }));
  for (const abs of seed.absences.filter(a => a.enCours)) {
    docs.unshift({ nom: `Arrêt de travail ${abs.type}`, date: abs.debut, type: 'Médical' });
  }
  docs.push({ nom: 'Entretien professionnel 2025', date: '2025-04-15', type: 'Évaluation' });
  return docs;
}

function buildAgent(seed: AgentSeed): Agent {
  const absences: AbsenceAgent[] = seed.absences.map(a => {
    const r = calculerArret({
      agent: { indiceMajore: seed.im, traitementBrut: traitementBrutMensuel(seed.im), primesMenusuelles: 0 },
      type: a.type,
      dureeJours: a.duree,
      statut: seed.statut === 'tit' ? 'TITULAIRE' : 'CONTRACTUEL',
    });
    return {
      ...a,
      enCours: a.enCours ?? false,
      cout: Math.round(r.coutEmployeur),
      remplacement: a.coutRemplacement !== undefined,
      coutRemplacement: a.coutRemplacement ?? null,
    };
  });
  const enCours = absences.find(a => a.enCours);
  return {
    ...seed,
    initiales: `${seed.prenom[0]}${seed.nom[0]}`.toUpperCase(),
    email: `${slug(seed.prenom)}.${slug(seed.nom)}@mairie-foix.fr`,
    regime: seed.statut === 'tit' ? 'CNRACL' : 'IRCANTEC',
    droitConges: Math.round((25 * seed.quotite) / 100),
    position: enCours ? enCours.type : 'Activité',
    absences,
    documents: seed.documents ?? documentsFromCarriere(seed),
  };
}

export const AGENTS: Agent[] = SEEDS.map(buildAgent);

export function getAgent(id: string | null | undefined): Agent | undefined {
  if (!id) return undefined;
  return AGENTS.find(a => a.id === id);
}

/** « Martin Dubois » */
export function nomComplet(a: Pick<Agent, 'prenom' | 'nom'>) {
  return `${a.prenom} ${a.nom}`;
}

/** « Dubois Martin » — ordre administratif des listes. */
export function nomListe(a: Pick<Agent, 'prenom' | 'nom'>) {
  return `${a.nom} ${a.prenom}`;
}

export function statutLabel(s: StatutCode) {
  return s === 'tit' ? 'Titulaire' : 'Contractuel';
}

export const SERVICES = Array.from(new Set(AGENTS.map(a => a.service))).sort((a, b) => a.localeCompare(b, 'fr'));

/** Recherche plein texte : nom, prénom, matricule, grade (et service). */
export function matchAgent(a: Agent, query: string) {
  const q = slug(query.trim()).replace(/-/g, ' ').trim();
  if (!q) return true;
  const haystack = slug([a.nom, a.prenom, a.id, a.nMatricule, a.grade, a.service].join(' ')).replace(/-/g, ' ');
  return q.split(' ').every(term => haystack.includes(term));
}

/* ── Absences ─────────────────────────────────────────────────── */

export interface AbsenceAvecAgent extends AbsenceAgent {
  agent: Agent;
}

export const ABSENCES: AbsenceAvecAgent[] = AGENTS.flatMap(agent =>
  agent.absences.map(abs => ({ ...abs, agent })),
).sort((a, b) => b.debut.localeCompare(a.debut));

export const ABSENCES_EN_COURS = ABSENCES.filter(a => a.enCours);
export const ABSENCES_HISTORIQUE = ABSENCES.filter(a => !a.enCours);

export const TYPE_ABSENCE_LABEL: Record<TypeAbsence, string> = {
  CMO: 'Congé maladie ordinaire',
  CLM: 'Congé longue maladie',
  CLD: 'Congé longue durée',
  AT: 'Accident de travail',
};

/** Paramètres de simulation dérivés d'un dossier agent (liens de la fiche). */
export function simulationLinks(a: Agent) {
  const naissance = a.dateNaissance.slice(0, 4);
  const enCours = a.absences.find(abs => abs.enCours);
  const arret = new URLSearchParams({
    agent: a.id,
    im: String(a.im),
    statut: a.statut === 'tit' ? 'TITULAIRE' : 'CONTRACTUEL',
    traitement: String(traitementBrutMensuel(a.im)),
  });
  if (enCours) {
    arret.set('type', enCours.type);
    arret.set('duree', String(enCours.duree));
  }
  return {
    retraite: `/simulations/retraite?${new URLSearchParams({ agent: a.id, im: String(a.im), trim: String(a.trimestresValides), naissance })}`,
    arret: `/simulations/arret?${arret}`,
    heures: `/simulations/heures?${new URLSearchParams({ agent: a.id, im: String(a.im), cet: String(a.joursCET), cat: a.cat })}`,
    annualisation: `/simulations/annualisation?${new URLSearchParams({ agent: a.id, quotite: String(a.quotite) })}`,
  };
}

/* ── Indicateurs (arrêtés à DEMO_AS_OF) ───────────────────────── */

const DAY = 86_400_000;
const asOf = Date.parse(`${DEMO_AS_OF}T00:00:00Z`);

function isoToMs(iso: string) {
  return Date.parse(`${iso}T00:00:00Z`);
}

/** Jours d'absence de l'intervalle [from, to[ (ms UTC) pour une absence. */
function joursDansIntervalle(abs: AbsenceAgent, from: number, to: number) {
  const debut = isoToMs(abs.debut);
  const fin = debut + abs.duree * DAY; // exclusif
  return Math.max(0, Math.round((Math.min(fin, to) - Math.max(debut, from)) / DAY));
}

/** Taux d'absence sur 12 mois glissants : jours d'arrêt / (agents × 365). */
export function tauxAbsence12Mois() {
  const from = asOf - 365 * DAY;
  const jours = ABSENCES.reduce((s, a) => s + joursDansIntervalle(a, from, asOf + DAY), 0);
  return jours / (AGENTS.length * 365);
}

/** Coût employeur mensuel des arrêts sur les 12 derniers mois (réparti au prorata des jours). */
export function coutMensuel12Mois(): { mois: string; cout: number }[] {
  const ref = new Date(asOf);
  const out: { mois: string; cout: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const start = Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() - i, 1);
    const end = Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() - i + 1, 1);
    const cout = ABSENCES.reduce((s, a) => {
      const jours = joursDansIntervalle(a, start, end);
      if (jours === 0) return s;
      const parJour = (a.cout + (a.coutRemplacement ?? 0)) / a.duree;
      return s + jours * parJour;
    }, 0);
    const label = new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'UTC' }).format(new Date(start));
    out.push({ mois: label.charAt(0).toUpperCase() + label.slice(1), cout: Math.round(cout) });
  }
  return out;
}

/** Ancienneté moyenne en années à DEMO_AS_OF. */
export function ancienneteMoyenne() {
  const total = AGENTS.reduce((s, a) => s + (asOf - isoToMs(a.dateEntree)) / (365.25 * DAY), 0);
  return total / AGENTS.length;
}

export const CET_SEUIL_ALERTE = 50;
