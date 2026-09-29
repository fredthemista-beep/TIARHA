// packages/engine/tests/retraite.test.ts
import { calculerRetraite, trimestresRequisTauxPlein, ageLegalDepart } from '../src/retraite';

// IM 500 : traitement mensuel = 500 × 4,92278 = 2 461,39 €
const TRAITEMENT_IM500 = 2461.39;

describe('calculerRetraite — taux plein', () => {
  it('liquide à 75 % avec la durée requise, départ à 67 ans', () => {
    const r = calculerRetraite({ indiceMajore: 500, trimestresValides: 172, anneeNaissance: 1966, anneeDepart: 2033 });
    expect(r.tauxLiquidation).toBe(0.75);
    expect(r.decote).toBe(0);
    expect(r.pensionBrute).toBeCloseTo(TRAITEMENT_IM500 * 0.75, 1);
  });
});

describe('calculerRetraite — prorata', () => {
  it('proratise le taux aux trimestres acquis : 42 / 172', () => {
    const r = calculerRetraite({ indiceMajore: 500, trimestresValides: 42, anneeNaissance: 1966, anneeDepart: 2033 });
    expect(r.tauxLiquidation).toBeCloseTo(0.75 * 42 / 172, 5);
    expect(r.decote).toBe(0); // départ à 67 ans : décote annulée
  });
});

describe('calculerRetraite — décote', () => {
  it('retient 1,25 % par trimestre manquant', () => {
    // 1966, départ à 65 ans : 12 manquants en durée, 8 avant 67 ans → 8 retenus
    const r = calculerRetraite({ indiceMajore: 500, trimestresValides: 160, anneeNaissance: 1966, anneeDepart: 2031 });
    expect(r.trimestresDecote).toBe(8);
    expect(r.decote).toBeCloseTo(0.10, 5);
    expect(r.tauxEffectif).toBeCloseTo(0.75 * (160 / 172) * 0.90, 5);
  });

  it('limite la décote à 20 trimestres', () => {
    // départ à 60 ans : 52 manquants en durée, 28 avant 67 ans → plafonné à 20
    const r = calculerRetraite({ indiceMajore: 500, trimestresValides: 120, anneeNaissance: 1966, anneeDepart: 2026 });
    expect(r.trimestresDecote).toBe(20);
    expect(r.decote).toBeCloseTo(0.25, 5);
  });
});

describe('calculerRetraite — surcote', () => {
  it('ne compte que les trimestres au-delà de la durée requise ET après l’âge légal', () => {
    // 1966 : âge légal 63,25 ; départ à 65 ans → 7 trimestres après l'âge légal, 8 en excédent
    const r = calculerRetraite({ indiceMajore: 500, trimestresValides: 180, anneeNaissance: 1966, anneeDepart: 2031 });
    expect(r.surcote).toBeCloseTo(7 * 0.0125, 5);
    expect(r.pensionBrute).toBeCloseTo(TRAITEMENT_IM500 * 0.75 * (1 + 7 * 0.0125), 1);
  });

  it('signale un départ avant l’âge légal, sans surcote', () => {
    const r = calculerRetraite({ indiceMajore: 500, trimestresValides: 176, anneeNaissance: 1966, anneeDepart: 2028 });
    expect(r.departAvantAgeLegal).toBe(true);
    expect(r.surcote).toBe(0);
    expect(r.anneeeDepart).toBe(2028);
  });
});

describe('trimestres requis et âge légal (réforme 2023, suspension LFSS 2026)', () => {
  it.each([
    [1955, 166], [1958, 167], [1961, 168], [1962, 169], [1963, 170], [1964, 170], [1965, 171], [1966, 172], [1975, 172],
  ])('né en %i : %i trimestres', (annee, attendu) => {
    expect(trimestresRequisTauxPlein(annee)).toBe(attendu);
  });

  it.each([
    [1960, 62], [1962, 62.5], [1964, 62.75], [1965, 63], [1968, 63.75], [1970, 64],
  ])('né en %i : âge légal %f', (annee, attendu) => {
    expect(ageLegalDepart(annee)).toBe(attendu);
  });
});
