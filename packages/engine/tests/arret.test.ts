// packages/engine/tests/arret.test.ts
import { calculerArret } from '../src/arret';

describe('calculerArret — CMO (loi 2025-127 : 90 % puis demi-traitement)', () => {
  const agent = { indiceMajore: 400, traitementBrut: 2000, primesMenusuelles: 300 };

  it('maintient 90 % pendant les 90 premiers jours', () => {
    const r = calculerArret({ agent, type: 'CMO', dureeJours: 90 });
    expect(r.tauxMaintien).toBe(0.9);
    expect(r.maintienTraitement).toBeCloseTo(5400, 2); // 3 mois × 2000 × 90 %
  });

  it('passe à demi-traitement après 90 jours', () => {
    const r = calculerArret({ agent, type: 'CMO', dureeJours: 180 });
    expect(r.maintienTraitement).toBeCloseTo(5400 + 3000, 0); // + 3 mois × 1000
  });

  it('borne la phase à demi-traitement à 270 jours (12 mois au total)', () => {
    const r = calculerArret({ agent, type: 'CMO', dureeJours: 400 });
    expect(r.maintienTraitement).toBeCloseTo(5400 + 9000, 0); // 9 mois × 1000, rien au-delà
  });

  it('applique la CNRACL employeur 2026 (37,65 %) à un titulaire', () => {
    const r = calculerArret({ agent, type: 'CMO', dureeJours: 30 });
    expect(r.regimeRetraite).toBe('CNRACL');
    expect(r.cotisationRetraiteEmployeur).toBeCloseTo(1800 * 0.3765, 2);
    expect(r.coutEmployeur).toBeCloseTo(1800 * 1.3765, 2);
  });

  it("applique l'IRCANTEC, pas la CNRACL, à un contractuel", () => {
    const r = calculerArret({ agent, type: 'CMO', dureeJours: 30, statut: 'CONTRACTUEL' });
    expect(r.statut).toBe('CONTRACTUEL');
    expect(r.regimeRetraite).toBe('IRCANTEC');
    expect(r.cotisationRetraiteEmployeur).toBeCloseTo(1800 * 0.0427, 2);
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
