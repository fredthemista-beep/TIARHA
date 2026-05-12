// packages/engine/src/annualisation.ts
import { HEURES_ANNUELLES } from './constants';
import type {
  ParamsBaseAnnuelle, ResultatBaseAnnuelle,
  ParamsSoldeAnnuel, ResultatSoldeAnnuel,
  SaisieMensuelle, AlerteLegale,
} from './types';

function isLeapYear(annee: number): boolean {
  return (annee % 4 === 0 && annee % 100 !== 0) || annee % 400 === 0;
}

export function calculerBaseAnnuelle(params: ParamsBaseAnnuelle): ResultatBaseAnnuelle {
  const { quotite, dateDebut, dateFin, annee = new Date().getFullYear() } = params;

  const joursAnnee = isLeapYear(annee) ? 366 : 365;
  const estProratise = !!(dateDebut || dateFin);
  const heuresAnnuellesBase = HEURES_ANNUELLES * quotite;

  if (!estProratise) {
    return {
      heuresAnnuellesBase,
      heuresDues: heuresAnnuellesBase,
      joursPresence: joursAnnee,
      joursAnnee,
      estProratise: false,
    };
  }

  const startOfYear = new Date(Date.UTC(annee, 0, 1));
  const endOfYear   = new Date(Date.UTC(annee, 11, 31));
  const msPerDay    = 1000 * 60 * 60 * 24;

  const debut = dateDebut
    ? new Date(Math.max(new Date(dateDebut).getTime(), startOfYear.getTime()))
    : startOfYear;
  const fin = dateFin
    ? new Date(Math.min(new Date(dateFin).getTime(), endOfYear.getTime()))
    : endOfYear;

  const joursPresence = Math.round((fin.getTime() - debut.getTime()) / msPerDay) + 1;
  const heuresDues    = heuresAnnuellesBase * (joursPresence / joursAnnee);

  return { heuresAnnuellesBase, heuresDues, joursPresence, joursAnnee, estProratise: true };
}

function calculerAlertes(heuresRealisees: number, moisSaisisCount: number): AlerteLegale[] {
  const SEMAINES_PAR_MOIS = 4.33;

  const moyenneHebdo = moisSaisisCount > 0
    ? heuresRealisees / (moisSaisisCount * SEMAINES_PAR_MOIS)
    : null;

  const moyenneAnnuelle = heuresRealisees / 52;

  return [
    {
      type: 'SEMAINE_MAX',
      seuil: 48,
      valeurEstimee: moyenneHebdo,
      depasse: moyenneHebdo !== null && moyenneHebdo > 48,
      message: moyenneHebdo !== null
        ? `Moyenne hebdomadaire estimée : ${moyenneHebdo.toFixed(1)} h (max légal : 48 h)`
        : 'Données insuffisantes — saisir les heures par mois pour estimer',
    },
    {
      type: 'SEMAINE_MOYENNE_MAX',
      seuil: 44,
      valeurEstimee: moyenneAnnuelle,
      depasse: heuresRealisees > 0 && moyenneAnnuelle > 44,
      message: heuresRealisees > 0
        ? `Moyenne annuelle estimée : ${moyenneAnnuelle.toFixed(1)} h/semaine (max légal : 44 h sur 12 semaines)`
        : 'Aucune heure saisie',
    },
    {
      type: 'JOUR_MAX',
      seuil: 10,
      valeurEstimee: null,
      depasse: false,
      message: 'Durée journalière max 10 h — données journalières non disponibles à ce niveau',
    },
  ];
}

export function calculerSoldeAnnuel(params: ParamsSoldeAnnuel): ResultatSoldeAnnuel {
  const { heuresDues, moisSaisis = [], heuresTotalesManuelle } = params;

  const heuresRealisees = moisSaisis.length > 0
    ? moisSaisis.reduce((sum, m) => sum + m.heures, 0)
    : (heuresTotalesManuelle ?? 0);

  const moisSaisisCount = moisSaisis.length;
  const solde           = heuresRealisees - heuresDues;
  const heuresSup       = Math.max(0, solde);
  const heuresDeficit   = Math.max(0, -solde);
  const progression     = heuresDues > 0 ? heuresRealisees / heuresDues : 0;

  return {
    heuresRealisees,
    solde,
    heuresSup,
    heuresDeficit,
    progression,
    moisSaisisCount,
    alertesLegales: calculerAlertes(heuresRealisees, moisSaisisCount),
  };
}
