// apps/web/lib/arret-demo.ts
// Chiffrage d'un nouvel arrêt pour la démo (aucune persistance).
// La story s08 déplacera le cumul CMO sur 12 mois glissants dans @tiarh/engine.

import { useCallback, useEffect, useState } from 'react';
import { calculerArret } from '@tiarh/engine';
import type { TypeConge } from '@tiarh/engine';
import { traitementBrutMensuel, type AbsenceAgent, type Agent } from './demo-data';

const JOUR = 24 * 60 * 60 * 1000;

function toUtc(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** Nombre de jours d'un arrêt, bornes incluses. */
export function dureeJours(debut: string, fin: string) {
  return Math.round((toUtc(fin) - toUtc(debut)) / JOUR) + 1;
}

/**
 * Jours de CMO déjà pris dans les 12 mois précédant `debut` (hors jour de début).
 * Seule la partie de chaque arrêt comprise dans la fenêtre est comptée.
 */
export function joursCmoSur12Mois(agent: Agent, debut: string) {
  const finFenetre = toUtc(debut) - JOUR;
  const debutFenetre = finFenetre - 364 * JOUR;
  let total = 0;
  for (const a of agent.absences) {
    if (a.type !== 'CMO') continue;
    const d = toUtc(a.debut);
    const f = a.fin ? toUtc(a.fin) : d + (a.duree - 1) * JOUR;
    const lo = Math.max(d, debutFenetre);
    const hi = Math.min(f, finFenetre);
    if (hi >= lo) total += Math.round((hi - lo) / JOUR) + 1;
  }
  return total;
}

export interface ChiffrageArret {
  duree: number;
  joursAnterieurs: number;
  maintien: number;
  cotisation: number;
  coutEmployeur: number;
  regime: 'CNRACL' | 'IRCANTEC';
  tauxFin: number;
  demiTraitementDes: number | null; // jour de l'arrêt où commence le demi-traitement
}

/**
 * Coût du nouvel arrêt seul : écart entre le cumul (jours antérieurs + arrêt) et les jours antérieurs.
 * Pour un CMO, les jours pris dans les 12 mois glissants avancent le passage à demi-traitement.
 */
export function chiffrerArret(agent: Agent, type: TypeConge, debut: string, fin: string): ChiffrageArret {
  const duree = dureeJours(debut, fin);
  const joursAnterieurs = type === 'CMO' ? joursCmoSur12Mois(agent, debut) : 0;
  const statut = agent.statut === 'tit' ? 'TITULAIRE' : 'CONTRACTUEL';
  const base = { indiceMajore: agent.im, traitementBrut: traitementBrutMensuel(agent.im), primesMenusuelles: 0 };
  const avant = calculerArret({ agent: base, type, dureeJours: joursAnterieurs, statut });
  const apres = calculerArret({ agent: base, type, dureeJours: joursAnterieurs + duree, statut });
  const seuil = type === 'CMO' ? 90 : type === 'CLM' ? 365 : type === 'CLD' ? 1095 : null;
  const demiTraitementDes =
    seuil !== null && joursAnterieurs + duree > seuil ? Math.max(1, seuil - joursAnterieurs + 1) : null;
  return {
    duree,
    joursAnterieurs,
    maintien: apres.maintienTraitement - avant.maintienTraitement,
    cotisation: apres.cotisationRetraiteEmployeur - avant.cotisationRetraiteEmployeur,
    coutEmployeur: apres.coutEmployeur - avant.coutEmployeur,
    regime: apres.regimeRetraite,
    tauxFin: apres.tauxMaintien,
    demiTraitementDes,
  };
}

/* ── Arrêts saisis pendant la démo (session du navigateur uniquement) ── */


const STORE_KEY = 'tiarha:arrets-demo';
const STORE_EVENT = 'tiarha:arrets-demo';

type Store = Record<string, AbsenceAgent[]>;

function readStore(): Store {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) ?? '{}') as Store;
  } catch {
    return {};
  }
}

export function ajouterArretDemo(agentId: string, absence: AbsenceAgent) {
  const store = readStore();
  store[agentId] = [absence, ...(store[agentId] ?? [])];
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* navigation privée : l'arrêt reste visible jusqu'au prochain rechargement */
  }
  window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: store }));
}

/** Arrêts ajoutés en démo pour un agent (vide côté serveur et au premier rendu). */
export function useArretsDemo(agentId: string | undefined) {
  const [liste, setListe] = useState<AbsenceAgent[]>([]);
  const refresh = useCallback(
    (store?: Store) => setListe(agentId ? (store ?? readStore())[agentId] ?? [] : []),
    [agentId],
  );
  useEffect(() => {
    refresh();
    const on = (e: Event) => refresh((e as CustomEvent<Store>).detail);
    window.addEventListener(STORE_EVENT, on);
    return () => window.removeEventListener(STORE_EVENT, on);
  }, [refresh]);
  return liste;
}
