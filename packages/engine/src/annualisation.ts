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

export function calculerSoldeAnnuel(_params: ParamsSoldeAnnuel): ResultatSoldeAnnuel {
  throw new Error('Not implemented');
}
