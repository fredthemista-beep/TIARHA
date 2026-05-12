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

  it('utilise l\'année courante par défaut si annee non fourni', () => {
    const r = calculerBaseAnnuelle({ quotite: 1.0 });
    expect(r.heuresDues).toBeCloseTo(HEURES_ANNUELLES, 2);
    expect(r.estProratise).toBe(false);
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
    expect(r.joursPresence).toBe(366);
    expect(r.estProratise).toBe(false);
    expect(r.heuresDues).toBeCloseTo(HEURES_ANNUELLES, 2);
  });

  it('utilise 366 jours pour 2000 (divisible par 400)', () => {
    const r = calculerBaseAnnuelle({ quotite: 1.0, annee: 2000 });
    expect(r.joursAnnee).toBe(366);
    expect(r.estProratise).toBe(false);
  });

  it('utilise 365 jours pour 1900 (divisible par 100 mais pas 400)', () => {
    const r = calculerBaseAnnuelle({ quotite: 1.0, annee: 1900 });
    expect(r.joursAnnee).toBe(365);
    expect(r.estProratise).toBe(false);
  });
});

describe('calculerBaseAnnuelle — proratisation année bissextile', () => {
  it('utilise 366 au dénominateur pour une proratisation en 2024', () => {
    // 2024-01-01 → 2024-06-30 = 182 days (Jan31+Feb29+Mar31+Apr30+May31+Jun30)
    const r = calculerBaseAnnuelle({ quotite: 1.0, dateFin: '2024-06-30', annee: 2024 });
    expect(r.joursAnnee).toBe(366);
    expect(r.joursPresence).toBe(182);
    expect(r.heuresDues).toBeCloseTo(1607 * (182 / 366), 2);
    expect(r.estProratise).toBe(true);
  });
});

// ─── calculerSoldeAnnuel ─────────────────────────────────────────────────────

describe('calculerSoldeAnnuel — aucune saisie', () => {
  it('heuresRealisees=0, déficit = heuresDues', () => {
    const r = calculerSoldeAnnuel({ heuresDues: 1607 });
    expect(r.heuresRealisees).toBe(0);
    expect(r.heuresDeficit).toBeCloseTo(1607, 2);
    expect(r.heuresSup).toBe(0);
    expect(r.progression).toBe(0);
    expect(r.moisSaisisCount).toBe(0);
  });
});

describe('calculerSoldeAnnuel — total global (heuresTotalesManuelle)', () => {
  it('utilise heuresTotalesManuelle si moisSaisis vide', () => {
    const r = calculerSoldeAnnuel({ heuresDues: 1607, heuresTotalesManuelle: 1500 });
    expect(r.heuresRealisees).toBe(1500);
    expect(r.heuresDeficit).toBeCloseTo(107, 2);
    expect(r.heuresSup).toBe(0);
    expect(r.moisSaisisCount).toBe(0);
  });
});

describe('calculerSoldeAnnuel — moisSaisis sous la base', () => {
  it('calcule un déficit', () => {
    const mois: SaisieMensuelle[] = [
      { mois: 1, heures: 130 },
      { mois: 2, heures: 125 },
      { mois: 3, heures: 120 },
    ];
    const r = calculerSoldeAnnuel({ heuresDues: 1607, moisSaisis: mois });
    expect(r.heuresRealisees).toBe(375);
    expect(r.heuresSup).toBe(0);
    expect(r.heuresDeficit).toBeCloseTo(1232, 2);
    expect(r.moisSaisisCount).toBe(3);
    expect(r.progression).toBeCloseTo(375 / 1607, 4);
  });
});

describe('calculerSoldeAnnuel — moisSaisis avec heures sup', () => {
  it('calcule des heures supplémentaires', () => {
    const mois: SaisieMensuelle[] = Array.from({ length: 12 }, (_, i) => ({
      mois: (i + 1) as SaisieMensuelle['mois'],
      heures: 145,
    }));
    const r = calculerSoldeAnnuel({ heuresDues: 1607, moisSaisis: mois });
    expect(r.heuresRealisees).toBe(1740);
    expect(r.heuresSup).toBeCloseTo(133, 2);
    expect(r.heuresDeficit).toBe(0);
    expect(r.progression).toBeGreaterThan(1.0);
  });
});

describe('calculerSoldeAnnuel — moisSaisis prioritaire sur heuresTotalesManuelle', () => {
  it('ignore heuresTotalesManuelle si moisSaisis non vide', () => {
    const r = calculerSoldeAnnuel({
      heuresDues: 1607,
      moisSaisis: [{ mois: 1, heures: 200 }],
      heuresTotalesManuelle: 9999,
    });
    expect(r.heuresRealisees).toBe(200);
  });
});

describe('calculerSoldeAnnuel — heuresDues=0', () => {
  it('progression=0 si heuresDues=0 (évite division par zéro)', () => {
    const r = calculerSoldeAnnuel({ heuresDues: 0 });
    expect(r.progression).toBe(0);
  });
});

describe('calculerSoldeAnnuel — alertes légales', () => {
  it('SEMAINE_MAX : depasse=true si moyenne hebdo > 48 h', () => {
    // 12 mois × 220 h = 2640 h / (12 × 4.33) = ~50.8 h/semaine
    const mois: SaisieMensuelle[] = Array.from({ length: 12 }, (_, i) => ({
      mois: (i + 1) as SaisieMensuelle['mois'],
      heures: 220,
    }));
    const r = calculerSoldeAnnuel({ heuresDues: 1607, moisSaisis: mois });
    const alerte = r.alertesLegales.find(a => a.type === 'SEMAINE_MAX')!;
    expect(alerte.depasse).toBe(true);
    expect(alerte.valeurEstimee).toBeGreaterThan(48);
  });

  it('SEMAINE_MOYENNE_MAX : depasse=true si total annuel / 52 > 44 h', () => {
    // 2640 h / 52 = ~50.8 h
    const mois: SaisieMensuelle[] = Array.from({ length: 12 }, (_, i) => ({
      mois: (i + 1) as SaisieMensuelle['mois'],
      heures: 220,
    }));
    const r = calculerSoldeAnnuel({ heuresDues: 1607, moisSaisis: mois });
    const alerte = r.alertesLegales.find(a => a.type === 'SEMAINE_MOYENNE_MAX')!;
    expect(alerte.depasse).toBe(true);
  });

  it('SEMAINE_MAX : depasse=false et valeurEstimee=null sans moisSaisis', () => {
    const r = calculerSoldeAnnuel({ heuresDues: 1607, heuresTotalesManuelle: 3000 });
    const alerte = r.alertesLegales.find(a => a.type === 'SEMAINE_MAX')!;
    expect(alerte.depasse).toBe(false);
    expect(alerte.valeurEstimee).toBeNull();
  });

  it('JOUR_MAX : jamais depasse (données journalières non disponibles)', () => {
    const r = calculerSoldeAnnuel({ heuresDues: 1607 });
    const alerte = r.alertesLegales.find(a => a.type === 'JOUR_MAX')!;
    expect(alerte.depasse).toBe(false);
    expect(alerte.valeurEstimee).toBeNull();
  });

  it('SEMAINE_MOYENNE_MAX : depasse=false si heuresRealisees=0', () => {
    const r = calculerSoldeAnnuel({ heuresDues: 1607 });
    const alerte = r.alertesLegales.find(a => a.type === 'SEMAINE_MOYENNE_MAX')!;
    expect(alerte.depasse).toBe(false);
  });
});
