// packages/engine/tests/arret.test.ts
import { calculerArret } from '../src/arret';
import { TAUX_CNRACL_EMPLOYEUR } from '../src/constants';

describe('calculerArret — CMO', () => {
  const agent = { indiceMajore: 400, traitementBrut: 2000, primesMenusuelles: 300 };

  it('maintient 100% pendant 90 jours CMO', () => {
    const r = calculerArret({ agent, type: 'CMO', dureeJours: 90 });
    expect(r.tauxMaintien).toBe(1.0);
    expect(r.maintienTraitement).toBeCloseTo(2000 * (90 / 30), 2);
  });

  it('maintient 50% entre 91 et 365 jours CMO', () => {
    const r = calculerArret({ agent, type: 'CMO', dureeJours: 180 });
    // 90j à 100% + 90j à 50%
    const attendu = 2000 * 3 + 2000 * 0.5 * 3;
    expect(r.maintienTraitement).toBeCloseTo(attendu, 0);
  });

  it('calcule le coût CNRACL employeur', () => {
    const r = calculerArret({ agent, type: 'CMO', dureeJours: 30 });
    expect(r.coutCNRACL).toBeCloseTo(2000 * TAUX_CNRACL_EMPLOYEUR, 2);
  });

  it('coûtEmployeur = maintienTraitement + coutCNRACL', () => {
    const r = calculerArret({ agent, type: 'CMO', dureeJours: 30 });
    expect(r.coutEmployeur).toBeCloseTo(r.maintienTraitement + r.coutCNRACL, 2);
  });
});

describe('calculerArret — CLM', () => {
  const agent = { indiceMajore: 500, traitementBrut: 2500, primesMenusuelles: 400 };

  it('maintient 100% pendant 12 mois CLM (365j)', () => {
    const r = calculerArret({ agent, type: 'CLM', dureeJours: 365 });
    expect(r.tauxMaintien).toBe(1.0);
  });

  it('maintient 50% entre 13 et 36 mois CLM', () => {
    const r = calculerArret({ agent, type: 'CLM', dureeJours: 730 });
    // 365j à 100% + 365j à 50% (traitementJournalier = 2500/30)
    const tj = 2500 / 30;
    const attendu = tj * 365 * 1.0 + tj * 365 * 0.5;
    expect(r.maintienTraitement).toBeCloseTo(attendu, 0);
  });
});

describe('calculerArret — CLD', () => {
  const agent = { indiceMajore: 450, traitementBrut: 2200, primesMenusuelles: 350 };

  it('maintient 100% pendant 36 mois CLD (1095j)', () => {
    const r = calculerArret({ agent, type: 'CLD', dureeJours: 1095 });
    expect(r.tauxMaintien).toBe(1.0);
  });

  it('maintient 50% entre 37 et 60 mois CLD', () => {
    const r = calculerArret({ agent, type: 'CLD', dureeJours: 1825 });
    const base100 = 2200 * (1095 / 30);
    const base50  = 2200 * 0.5 * (730 / 30);
    expect(r.maintienTraitement).toBeCloseTo(base100 + base50, 0);
  });
});

describe('calculerArret — invalid type', () => {
  it('throws for unknown type', () => {
    const agent = { indiceMajore: 400, traitementBrut: 2000, primesMenusuelles: 300 };
    // @ts-expect-error — testing runtime guard
    expect(() => calculerArret({ agent, type: 'INVALID', dureeJours: 30 })).toThrow('Type de congé inconnu');
  });
});
