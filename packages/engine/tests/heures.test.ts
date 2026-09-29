// packages/engine/tests/heures.test.ts
import { calculerHeures } from '../src/heures';
import { CET_PLAFOND_JOURS } from '../src/constants';

// IM 380 : traitement annuel = 380 × 4,92278 × 12 = 22 447,8768 € → taux de base 12,3340 €/h
const TAUX_IM380 = 22447.8768 / 1820;

describe('calculerHeures — IHTS (décret 2002-60)', () => {
  it('calcule le taux horaire sur le traitement ANNUEL / 1820', () => {
    const r = calculerHeures({ indiceMajore: 380, heuresSup: 10, joursCETExistants: 0 });
    expect(r.ihtsParHeure).toBeCloseTo(12.334, 3);
  });

  it('majore les 14 premières heures de 25 %', () => {
    const r = calculerHeures({ indiceMajore: 380, heuresSup: 14, joursCETExistants: 0 });
    expect(r.ihtsTotal).toBeCloseTo(TAUX_IM380 * 14 * 1.25, 2);
  });

  it('majore les heures 15 à 25 de 27 %', () => {
    const r = calculerHeures({ indiceMajore: 380, heuresSup: 20, joursCETExistants: 0 });
    expect(r.ihtsTotal).toBeCloseTo(TAUX_IM380 * (14 * 1.25 + 6 * 1.27), 2);
  });

  it('ne rémunère pas au-delà du plafond mensuel de 25 h', () => {
    const r = calculerHeures({ indiceMajore: 380, heuresSup: 30, joursCETExistants: 0 });
    expect(r.heuresRemunerables).toBe(25);
    expect(r.plafondMensuelDepasse).toBe(true);
    expect(r.ihtsTotal).toBeCloseTo(TAUX_IM380 * (14 * 1.25 + 11 * 1.27), 2);
  });

  it("ajoute l'indemnité de résidence de la zone (zone 1 = 3 %)", () => {
    const r = calculerHeures({ indiceMajore: 380, heuresSup: 1, joursCETExistants: 0, zoneResidence: 1 });
    expect(r.ihtsParHeure).toBeCloseTo(TAUX_IM380 * 1.03, 4);
  });

  it('double les heures de nuit (+100 %)', () => {
    const r = calculerHeures({ indiceMajore: 380, heuresSup: 10, joursCETExistants: 0, majoration: 'nuit' });
    expect(r.ihtsTotal).toBeCloseTo(TAUX_IM380 * 10 * 1.25 * 2, 2);
  });

  it('majore les dimanches et jours fériés des deux tiers', () => {
    const r = calculerHeures({ indiceMajore: 380, heuresSup: 10, joursCETExistants: 0, majoration: 'dimancheFerie' });
    expect(r.ihtsTotal).toBeCloseTo(TAUX_IM380 * 10 * 1.25 * (5 / 3), 2);
  });

  it('applique la RAFP employeur (5 %), pas la CNRACL, au coût employeur', () => {
    const r = calculerHeures({ indiceMajore: 380, heuresSup: 10, joursCETExistants: 0 });
    expect(r.coutEmployeurTotal).toBeCloseTo(r.ihtsTotal * 1.05, 2);
  });
});

describe('calculerHeures — affectation', () => {
  it('en IHTS : paie les heures sans créditer le CET', () => {
    const r = calculerHeures({ indiceMajore: 380, heuresSup: 14, joursCETExistants: 0 });
    expect(r.ihtsTotal).toBeGreaterThan(0);
    expect(r.joursCET).toBe(0);
  });

  it('en CET : convertit en jours (7h = 1 jour) sans rien payer', () => {
    const r = calculerHeures({ indiceMajore: 380, heuresSup: 14, joursCETExistants: 0, affectation: 'CET' });
    expect(r.joursCET).toBe(2);
    expect(r.ihtsTotal).toBe(0);
    expect(r.cetPlafondAtteint).toBe(false);
  });

  it('en CET : ne dépasse pas le plafond', () => {
    const r = calculerHeures({
      indiceMajore: 380, heuresSup: 70, joursCETExistants: CET_PLAFOND_JOURS - 5, affectation: 'CET',
    });
    expect(r.joursCET).toBe(5);
    expect(r.cetPlafondAtteint).toBe(true);
  });

  it('en récupération : rend les heures en repos, sans paiement ni CET', () => {
    const r = calculerHeures({ indiceMajore: 380, heuresSup: 8, joursCETExistants: 0, affectation: 'recuperation' });
    expect(r.heuresRecuperation).toBe(8);
    expect(r.ihtsTotal).toBe(0);
    expect(r.joursCET).toBe(0);
  });
});
