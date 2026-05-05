// packages/engine/tests/retraite.test.ts
import { calculerRetraite } from '../src/retraite';
import { POINT_INDICE, TRIMESTRES_RETRAITE_1965 } from '../src/constants';

describe('calculerRetraite — taux plein', () => {
  it('calcule la pension à taux plein (75%) pour 172 trimestres', () => {
    const r = calculerRetraite({
      indiceMajore: 500,
      trimestresValides: 172,
      anneeNaissance: 1965,
      anneeDepart: 2029,
    });
    expect(r.tauxLiquidation).toBe(0.75);
    expect(r.decote).toBe(0);
    expect(r.pensionBrute).toBeCloseTo(500 * POINT_INDICE * 0.75, 2);
  });

  it('calcule la surcote pour trimestres au-delà de 172', () => {
    const r = calculerRetraite({
      indiceMajore: 500,
      trimestresValides: 176,   // 4 trimestres de surcote
      anneeNaissance: 1965,
      anneeDepart: 2029,
    });
    // Surcote : +1.25% par trimestre au-delà du taux plein
    expect(r.surcote).toBeCloseTo(4 * 0.0125, 4);
    expect(r.pensionBrute).toBeGreaterThan(500 * POINT_INDICE * 0.75);
  });
});

describe('calculerRetraite — décote', () => {
  it('applique une décote pour trimestres manquants', () => {
    const r = calculerRetraite({
      indiceMajore: 500,
      trimestresValides: 160,   // 12 trimestres manquants
      anneeNaissance: 1965,
      anneeDepart: 2029,
    });
    // Décote : -1.25% par trimestre manquant (plafonné à 25%)
    expect(r.decote).toBeCloseTo(12 * 0.0125, 4);
    expect(r.tauxLiquidation).toBeLessThan(0.75);
  });

  it('plafonne la décote à 25%', () => {
    const r = calculerRetraite({
      indiceMajore: 500,
      trimestresValides: 120,  // 52 trimestres manquants → décote > 25%
      anneeNaissance: 1965,
      anneeDepart: 2029,
    });
    expect(r.decote).toBe(0.25);
  });
});

describe('calculerRetraite — trimestres requis', () => {
  it('retourne 172 trimestres requis pour né en 1965', () => {
    const r = calculerRetraite({
      indiceMajore: 400,
      trimestresValides: 172,
      anneeNaissance: 1965,
      anneeDepart: 2029,
    });
    expect(r.trimestresRequisTauxPlein).toBe(TRIMESTRES_RETRAITE_1965);
  });

  it('retourne les trimestres validés dans le résultat', () => {
    const r = calculerRetraite({
      indiceMajore: 400,
      trimestresValides: 160,
      anneeNaissance: 1965,
      anneeDepart: 2029,
    });
    expect(r.trimestresValides).toBe(160);
    expect(r.anneeeDepart).toBe(2029);
  });
});

describe('calculerRetraite — année naissance < 1965', () => {
  it('calcule 169 trimestres requis pour né en 1963', () => {
    const r = calculerRetraite({ indiceMajore: 400, trimestresValides: 170, anneeNaissance: 1963, anneeDepart: 2027 });
    expect(r.trimestresRequisTauxPlein).toBe(169); // 167 + (1963-1961) = 169
  });

  it('calcule 166 trimestres pour né avant 1961', () => {
    const r = calculerRetraite({ indiceMajore: 400, trimestresValides: 166, anneeNaissance: 1958, anneeDepart: 2022 });
    expect(r.trimestresRequisTauxPlein).toBe(166);
  });
});
