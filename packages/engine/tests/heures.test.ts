// packages/engine/tests/heures.test.ts
import { calculerHeures } from '../src/heures';
import { POINT_INDICE, TAUX_CNRACL_EMPLOYEUR, CET_PLAFOND_JOURS } from '../src/constants';

describe('calculerHeures — IHTS', () => {
  it('calcule IHTS = IM × POINT_INDICE / 1820', () => {
    const r = calculerHeures({ indiceMajore: 400, heuresSup: 10, joursCETExistants: 0 });
    const ihtsParHeure = 400 * POINT_INDICE / 1820;
    expect(r.ihtsParHeure).toBeCloseTo(ihtsParHeure, 4);
    expect(r.ihtsTotal).toBeCloseTo(ihtsParHeure * 10, 4);
  });

  it('inclut les charges CNRACL dans le coût employeur', () => {
    const r = calculerHeures({ indiceMajore: 400, heuresSup: 10, joursCETExistants: 0 });
    expect(r.coutEmployeurTotal).toBeCloseTo(r.ihtsTotal * (1 + TAUX_CNRACL_EMPLOYEUR), 2);
  });
});

describe('calculerHeures — CET', () => {
  it('convertit les heures en jours CET (7h = 1 jour)', () => {
    const r = calculerHeures({ indiceMajore: 400, heuresSup: 14, joursCETExistants: 0 });
    expect(r.joursCET).toBe(2);
  });

  it('signale quand le plafond CET est atteint', () => {
    const r = calculerHeures({
      indiceMajore: 400,
      heuresSup: 7,
      joursCETExistants: CET_PLAFOND_JOURS, // déjà au plafond
    });
    expect(r.cetPlafondAtteint).toBe(true);
    expect(r.joursCET).toBe(0); // pas de crédit supplémentaire
  });

  it('ne dépasse pas le plafond CET', () => {
    const r = calculerHeures({
      indiceMajore: 400,
      heuresSup: 70,                // 10 jours
      joursCETExistants: CET_PLAFOND_JOURS - 5, // 5 jours restants avant plafond
    });
    expect(r.joursCET).toBe(5);      // seulement 5 crédités
    expect(r.cetPlafondAtteint).toBe(true);
  });

  it('cetPlafondAtteint est false quand plafond non atteint', () => {
    const r = calculerHeures({ indiceMajore: 400, heuresSup: 7, joursCETExistants: 0 });
    expect(r.cetPlafondAtteint).toBe(false);
    expect(r.joursCET).toBe(1);
  });
});
