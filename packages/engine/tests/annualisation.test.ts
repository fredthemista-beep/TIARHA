// packages/engine/tests/annualisation.test.ts
import { calculerBaseAnnuelle, calculerSoldeAnnuel } from '../src/annualisation';
import { HEURES_ANNUELLES } from '../src/constants';
import type { SaisieMensuelle } from '../src/types';

// ─── calculerBaseAnnuelle ────────────────────────────────────────────────────

describe('calculerBaseAnnuelle — temps plein, année complète', () => {
  it('retourne 1607 h pour quotite=1.0 sans dates', () => {
    const r = calculerBaseAnnuelle({ quotite: 1.0, annee: 2026 });
    expect(r.heuresDues).toBeCloseTo(HEURES_ANNUELLES, 2);
    expect(r.heuresAnnuellesBase).toBeCloseTo(HEURES_ANNUELLES, 2);
    expect(r.estProratise).toBe(false);
    expect(r.joursPresence).toBe(365);
    expect(r.joursAnnee).toBe(365);
  });
});

describe('calculerBaseAnnuelle — temps partiel', () => {
  it('retourne 1285.6 h pour quotite=0.8 sans dates', () => {
    const r = calculerBaseAnnuelle({ quotite: 0.8, annee: 2026 });
    expect(r.heuresDues).toBeCloseTo(1607 * 0.8, 2);
    expect(r.estProratise).toBe(false);
  });
});

describe('calculerBaseAnnuelle — proratisation dateDebut', () => {
  it('proratise depuis le 1er juillet (≈ 6 mois)', () => {
    const r = calculerBaseAnnuelle({ quotite: 1.0, dateDebut: '2026-07-01', annee: 2026 });
    expect(r.estProratise).toBe(true);
    expect(r.joursPresence).toBe(184); // 1er juil → 31 déc 2026
    expect(r.heuresDues).toBeCloseTo(1607 * (184 / 365), 2);
  });
});

describe('calculerBaseAnnuelle — proratisation dateFin', () => {
  it('proratise jusqu\'au 30 juin (≈ 6 mois)', () => {
    const r = calculerBaseAnnuelle({ quotite: 1.0, dateFin: '2026-06-30', annee: 2026 });
    expect(r.estProratise).toBe(true);
    expect(r.joursPresence).toBe(181); // 1er jan → 30 jun 2026
    expect(r.heuresDues).toBeCloseTo(1607 * (181 / 365), 2);
  });
});

describe('calculerBaseAnnuelle — proratisation dateDebut + dateFin + quotite', () => {
  it('combine proratisation et quotite', () => {
    const r = calculerBaseAnnuelle({ quotite: 0.8, dateDebut: '2026-07-01', dateFin: '2026-12-31', annee: 2026 });
    expect(r.estProratise).toBe(true);
    expect(r.heuresDues).toBeCloseTo(1607 * 0.8 * (184 / 365), 2);
    expect(r.heuresAnnuellesBase).toBeCloseTo(1607 * 0.8, 2);
  });
});

describe('calculerBaseAnnuelle — année bissextile', () => {
  it('utilise 366 jours pour 2024', () => {
    const r = calculerBaseAnnuelle({ quotite: 1.0, annee: 2024 });
    expect(r.joursAnnee).toBe(366);
    expect(r.estProratise).toBe(false);
    expect(r.heuresDues).toBeCloseTo(HEURES_ANNUELLES, 2);
  });
});
