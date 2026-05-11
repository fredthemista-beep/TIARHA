# AnnualisationRH Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter le module AnnualisationRH au monorepo TIARH — calcul de la base annuelle 1 607 h, proratisation, suivi mensuel hybride, alertes légales, UI 3 onglets.

**Architecture:** Pipeline 2 fonctions pures TypeScript dans `packages/engine` (`calculerBaseAnnuelle` → `calculerSoldeAnnuel`), testées à 100% avec Jest, exposées via `packages/engine/src/index.ts`. Page Next.js 14 App Router avec 3 onglets (shadcn Tabs) dans `apps/web`.

**Tech Stack:** TypeScript strict, Jest + ts-jest (coverage 100% obligatoire), Next.js 14 App Router (`'use client'`), `@base-ui/react/tabs` (via `components/ui/tabs.tsx`), `@tiarh/engine`, `@tiarh/ui`, lucide-react, Tailwind CSS.

---

## File Map

| Action | Fichier |
|--------|---------|
| Modifier | `packages/engine/src/types.ts` |
| Créer | `packages/engine/src/annualisation.ts` |
| Modifier | `packages/engine/src/index.ts` |
| Créer | `packages/engine/tests/annualisation.test.ts` |
| Créer | `apps/web/app/(dashboard)/simulations/annualisation/page.tsx` |
| Modifier | `apps/web/components/dashboard/Sidebar.tsx` |

---

## Task 1 — Types engine

**Files:**
- Modify: `packages/engine/src/types.ts`

- [ ] **Step 1 : Ajouter les 6 interfaces à la fin de `types.ts`**

```typescript
// --- Annualisation ---

export interface ParamsBaseAnnuelle {
  quotite: number;       // 0.0–1.0 (ex : 0.8 pour 80 %)
  dateDebut?: string;    // 'YYYY-MM-DD' — arrivée en cours d'année
  dateFin?: string;      // 'YYYY-MM-DD' — départ en cours d'année
  annee?: number;        // année civile de référence (défaut : année courante)
}

export interface ResultatBaseAnnuelle {
  heuresAnnuellesBase: number;  // 1607 × quotite (sans proratisation)
  heuresDues: number;           // après proratisation si dates fournies
  joursPresence: number;        // jours de présence effective dans l'année
  joursAnnee: number;           // jours calendaires de l'année de référence
  estProratise: boolean;
}

export interface SaisieMensuelle {
  mois: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  heures: number;
}

export interface ParamsSoldeAnnuel {
  heuresDues: number;
  moisSaisis?: SaisieMensuelle[];      // optionnel — prend le pas sur heuresTotalesManuelle
  heuresTotalesManuelle?: number;      // total global si pas de suivi mensuel
}

export interface AlerteLegale {
  type: 'SEMAINE_MAX' | 'SEMAINE_MOYENNE_MAX' | 'JOUR_MAX';
  seuil: number;
  valeurEstimee: number | null;  // null si données insuffisantes
  depasse: boolean;
  message: string;               // libellé métier en français
}

export interface ResultatSoldeAnnuel {
  heuresRealisees: number;
  solde: number;              // positif = heures sup, négatif = déficit
  heuresSup: number;          // max(0, solde)
  heuresDeficit: number;      // max(0, -solde)
  progression: number;        // heuresRealisees / heuresDues (peut dépasser 1.0)
  moisSaisisCount: number;
  alertesLegales: AlerteLegale[];
}
```

- [ ] **Step 2 : Vérifier que TypeScript compile**

```bash
cd /chemin/vers/territorialrh-store/packages/engine && pnpm exec tsc --noEmit
```

Attendu : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add packages/engine/src/types.ts
git commit -m "feat(engine): add annualisation types"
```

---

## Task 2 — `calculerBaseAnnuelle` (TDD)

**Files:**
- Create: `packages/engine/tests/annualisation.test.ts`
- Create: `packages/engine/src/annualisation.ts`

- [ ] **Step 1 : Créer le fichier de tests avec tous les cas `calculerBaseAnnuelle`**

Créer `packages/engine/tests/annualisation.test.ts` :

```typescript
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
```

- [ ] **Step 2 : Vérifier que les tests échouent (fonction pas encore créée)**

```bash
cd packages/engine && pnpm exec jest tests/annualisation.test.ts --no-coverage --testNamePattern="calculerBaseAnnuelle"
```

Attendu : FAIL — `Cannot find module '../src/annualisation'`.

- [ ] **Step 3 : Créer `packages/engine/src/annualisation.ts` avec `calculerBaseAnnuelle`**

```typescript
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

  const startOfYear = new Date(annee, 0, 1);
  const endOfYear   = new Date(annee, 11, 31);
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
```

- [ ] **Step 4 : Lancer les tests `calculerBaseAnnuelle` — doivent passer**

```bash
cd packages/engine && pnpm exec jest tests/annualisation.test.ts --no-coverage --testNamePattern="calculerBaseAnnuelle"
```

Attendu : 6 tests PASS.

- [ ] **Step 5 : Commit**

```bash
git add packages/engine/src/annualisation.ts packages/engine/tests/annualisation.test.ts
git commit -m "feat(engine): add calculerBaseAnnuelle with proratisation"
```

---

## Task 3 — `calculerSoldeAnnuel` (TDD)

**Files:**
- Modify: `packages/engine/tests/annualisation.test.ts`
- Modify: `packages/engine/src/annualisation.ts`

- [ ] **Step 1 : Ajouter les cas de test `calculerSoldeAnnuel` dans le fichier de tests existant**

Ajouter après le dernier `describe` de `calculerBaseAnnuelle` :

```typescript
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
```

- [ ] **Step 2 : Vérifier que les nouveaux tests échouent**

```bash
cd packages/engine && pnpm exec jest tests/annualisation.test.ts --no-coverage --testNamePattern="calculerSoldeAnnuel"
```

Attendu : FAIL — `Not implemented`.

- [ ] **Step 3 : Implémenter `calculerSoldeAnnuel` dans `annualisation.ts`**

Remplacer la fonction stub par l'implémentation complète. La fonction interne `calculerAlertes` doit être définie juste avant `calculerSoldeAnnuel` :

```typescript
function calculerAlertes(heuresRealisees: number, moisSaisisCount: number): AlerteLegale[] {
  const SEMAINES_PAR_MOIS = 4.33;

  const moyenneHebdo = moisSaisisCount > 0
    ? heuresRealisees / (moisSaisisCount * SEMAINES_PAR_MOIS)
    : null;

  const moyenneAnnuelle = heuresRealisees / 52;

  return [
    {
      type: 'SEMAINE_MAX',
      seuil: 48,
      valeurEstimee: moyenneHebdo,
      depasse: moyenneHebdo !== null && moyenneHebdo > 48,
      message: moyenneHebdo !== null
        ? `Moyenne hebdomadaire estimée : ${moyenneHebdo.toFixed(1)} h (max légal : 48 h)`
        : 'Données insuffisantes — saisir les heures par mois pour estimer',
    },
    {
      type: 'SEMAINE_MOYENNE_MAX',
      seuil: 44,
      valeurEstimee: moyenneAnnuelle,
      depasse: heuresRealisees > 0 && moyenneAnnuelle > 44,
      message: heuresRealisees > 0
        ? `Moyenne annuelle estimée : ${moyenneAnnuelle.toFixed(1)} h/semaine (max légal : 44 h sur 12 semaines)`
        : 'Aucune heure saisie',
    },
    {
      type: 'JOUR_MAX',
      seuil: 10,
      valeurEstimee: null,
      depasse: false,
      message: 'Durée journalière max 10 h — données journalières non disponibles à ce niveau',
    },
  ];
}

export function calculerSoldeAnnuel(params: ParamsSoldeAnnuel): ResultatSoldeAnnuel {
  const { heuresDues, moisSaisis = [], heuresTotalesManuelle } = params;

  const heuresRealisees = moisSaisis.length > 0
    ? moisSaisis.reduce((sum, m) => sum + m.heures, 0)
    : (heuresTotalesManuelle ?? 0);

  const moisSaisisCount = moisSaisis.length;
  const solde           = heuresRealisees - heuresDues;
  const heuresSup       = Math.max(0, solde);
  const heuresDeficit   = Math.max(0, -solde);
  const progression     = heuresDues > 0 ? heuresRealisees / heuresDues : 0;

  return {
    heuresRealisees,
    solde,
    heuresSup,
    heuresDeficit,
    progression,
    moisSaisisCount,
    alertesLegales: calculerAlertes(heuresRealisees, moisSaisisCount),
  };
}
```

- [ ] **Step 4 : Lancer la suite complète avec coverage**

```bash
cd packages/engine && pnpm exec jest tests/annualisation.test.ts --coverage
```

Attendu : tous les tests PASS, coverage 100 % sur `annualisation.ts`.

- [ ] **Step 5 : Lancer la suite complète du projet pour vérifier qu'on n'a rien cassé**

```bash
cd packages/engine && pnpm exec jest --coverage
```

Attendu : tous les tests PASS, coverage global 100 %.

- [ ] **Step 6 : Commit**

```bash
git add packages/engine/src/annualisation.ts packages/engine/tests/annualisation.test.ts
git commit -m "feat(engine): add calculerSoldeAnnuel + alertes légales (100% coverage)"
```

---

## Task 4 — Export engine

**Files:**
- Modify: `packages/engine/src/index.ts`

- [ ] **Step 1 : Ajouter l'export dans `index.ts`**

Ajouter à la fin du fichier (après `export * from './heures';`) :

```typescript
export * from './annualisation';
```

- [ ] **Step 2 : Vérifier le build TypeScript**

```bash
cd packages/engine && pnpm exec tsc --noEmit
```

Attendu : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add packages/engine/src/index.ts
git commit -m "feat(engine): export annualisation module"
```

---

## Task 5 — Page UI

**Files:**
- Create: `apps/web/app/(dashboard)/simulations/annualisation/page.tsx`

- [ ] **Step 1 : Créer le dossier et la page**

```bash
mkdir -p apps/web/app/\(dashboard\)/simulations/annualisation
```

Créer `apps/web/app/(dashboard)/simulations/annualisation/page.tsx` :

```typescript
'use client';
import { useState } from 'react';
import {
  calculerBaseAnnuelle,
  calculerSoldeAnnuel,
  HEURES_ANNUELLES,
} from '@tiarh/engine';
import type { SaisieMensuelle, ResultatBaseAnnuelle, ResultatSoldeAnnuel } from '@tiarh/engine';
import { Topbar } from '@/components/dashboard/Topbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { colors, PlanGate } from '@tiarh/ui';

const MOIS_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'] as const;

export default function AnnualisationPage() {
  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState({
    quotite: '100',
    annee: String(currentYear),
    dateDebut: '',
    dateFin: '',
    heuresTotalesManuelle: '',
  });

  // moisSaisis : clé = numéro du mois (1–12), valeur = string de l'input
  const [moisInputs, setMoisInputs] = useState<Record<number, string>>({});

  const [base, setBase] = useState<ResultatBaseAnnuelle | null>(null);
  const [solde, setSolde] = useState<ResultatSoldeAnnuel | null>(null);

  function calculer() {
    const quotite = Math.min(1, Math.max(0.01, Number(form.quotite) / 100));
    const annee = Number(form.annee);

    const resultBase = calculerBaseAnnuelle({
      quotite,
      annee,
      dateDebut: form.dateDebut || undefined,
      dateFin:   form.dateFin   || undefined,
    });
    setBase(resultBase);

    const moisSaisis: SaisieMensuelle[] = Object.entries(moisInputs)
      .filter(([, v]) => v !== '' && !isNaN(Number(v)))
      .map(([k, v]) => ({ mois: Number(k) as SaisieMensuelle['mois'], heures: Number(v) }));

    const resultSolde = calculerSoldeAnnuel({
      heuresDues: resultBase.heuresDues,
      moisSaisis,
      heuresTotalesManuelle: form.heuresTotalesManuelle !== ''
        ? Number(form.heuresTotalesManuelle)
        : undefined,
    });
    setSolde(resultSolde);
  }

  // Recalcul réactif quand un mois change (base doit déjà être calculée)
  function onMoisChange(mois: number, valeur: string) {
    const next = { ...moisInputs, [mois]: valeur };
    setMoisInputs(next);

    if (!base) return;
    const moisSaisis: SaisieMensuelle[] = Object.entries(next)
      .filter(([, v]) => v !== '' && !isNaN(Number(v)))
      .map(([k, v]) => ({ mois: Number(k) as SaisieMensuelle['mois'], heures: Number(v) }));
    setSolde(calculerSoldeAnnuel({
      heuresDues: base.heuresDues,
      moisSaisis,
      heuresTotalesManuelle: form.heuresTotalesManuelle !== ''
        ? Number(form.heuresTotalesManuelle)
        : undefined,
    }));
  }

  const alerteCouleur = (depasse: boolean, valeurEstimee: number | null) => {
    if (valeurEstimee === null) return { bg: '#f1f5f9', dot: colors.textMuted, text: '#64748b' };
    if (depasse)               return { bg: '#fef3c7', dot: colors.warning,    text: '#92400e' };
    return                            { bg: '#dcfce7', dot: colors.success,    text: '#166534' };
  };

  return (
    <>
      <Topbar
        title="AnnualisationRH"
        subtitle={`Annualisation du temps de travail — base ${HEURES_ANNUELLES} h (FPT)`}
        plan="starter"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <PlanGate required={['starter', 'pro', 'enterprise']} currentPlan="starter">
          <div className="max-w-4xl flex flex-col gap-6">

            {/* ── Formulaire paramètres ── */}
            <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm">
              <p className="text-sm font-bold text-navy mb-4">Paramètres agent</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium text-navy">Quotité (%)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={form.quotite}
                    onChange={e => setForm(p => ({ ...p, quotite: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium text-navy">Année de référence</Label>
                  <Input
                    type="number"
                    value={form.annee}
                    onChange={e => setForm(p => ({ ...p, annee: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium text-navy">Date arrivée (optionnel)</Label>
                  <Input
                    type="date"
                    value={form.dateDebut}
                    onChange={e => setForm(p => ({ ...p, dateDebut: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium text-navy">Date départ (optionnel)</Label>
                  <Input
                    type="date"
                    value={form.dateFin}
                    onChange={e => setForm(p => ({ ...p, dateFin: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <Label className="text-xs font-medium text-navy">
                    Total heures réalisées — saisie globale (optionnel, remplacé par le suivi mensuel)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.heuresTotalesManuelle}
                    onChange={e => setForm(p => ({ ...p, heuresTotalesManuelle: e.target.value }))}
                    className="text-sm"
                    placeholder="ex : 1 740"
                  />
                </div>
              </div>
              <Button onClick={calculer} className="bg-midblue hover:bg-midblue/90 text-white">
                Calculer
              </Button>
            </div>

            {/* ── Onglets résultats ── */}
            {base && solde && (
              <Tabs defaultValue="calcul">
                <TabsList className="mb-4">
                  <TabsTrigger value="calcul">Calcul annuel</TabsTrigger>
                  <TabsTrigger value="mensuel">Suivi mensuel</TabsTrigger>
                  <TabsTrigger value="alertes">Alertes légales</TabsTrigger>
                </TabsList>

                {/* ── Onglet 1 : Calcul annuel ── */}
                <TabsContent value="calcul">
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* KPI Base */}
                      <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm text-center">
                        <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Base annuelle due</p>
                        <p className="text-2xl font-bold text-navy font-mono">
                          {base.heuresDues.toFixed(1)} h
                        </p>
                        <p className="text-[10px] text-muted mt-1">
                          {HEURES_ANNUELLES} h × {form.quotite} %
                          {base.estProratise && ` × prorata ${base.joursPresence}/${base.joursAnnee} j`}
                        </p>
                      </div>
                      {/* KPI Réalisées */}
                      <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm text-center">
                        <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Heures réalisées</p>
                        <p className="text-2xl font-bold font-mono" style={{ color: colors.primary }}>
                          {solde.heuresRealisees.toFixed(1)} h
                        </p>
                        <p className="text-[10px] text-muted mt-1">
                          {solde.moisSaisisCount > 0
                            ? `${solde.moisSaisisCount} mois saisis`
                            : 'saisie globale'}
                        </p>
                      </div>
                      {/* KPI Solde */}
                      {solde.heuresSup > 0 ? (
                        <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 shadow-sm text-center">
                          <p className="text-[10px] text-amber-700 uppercase tracking-wider mb-1">Heures sup. fin d'année</p>
                          <p className="text-2xl font-bold font-mono" style={{ color: colors.warning }}>
                            +{solde.heuresSup.toFixed(1)} h
                          </p>
                          <p className="text-[10px] text-amber-600 mt-1">régularisation due</p>
                        </div>
                      ) : (
                        <div className="bg-red-50 rounded-xl p-5 border border-red-200 shadow-sm text-center">
                          <p className="text-[10px] text-red-600 uppercase tracking-wider mb-1">Déficit à rattraper</p>
                          <p className="text-2xl font-bold font-mono" style={{ color: colors.danger }}>
                            -{solde.heuresDeficit.toFixed(1)} h
                          </p>
                          <p className="text-[10px] text-red-400 mt-1">heures non effectuées</p>
                        </div>
                      )}
                      {/* KPI Progression */}
                      <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm text-center">
                        <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Progression</p>
                        <p className="text-2xl font-bold font-mono" style={{ color: colors.success }}>
                          {(solde.progression * 100).toFixed(1)} %
                        </p>
                        <p className="text-[10px] text-muted mt-1">de la base annuelle</p>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm">
                      <p className="text-xs font-bold text-navy mb-3">Avancement annuel</p>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, solde.progression * 100)}%`,
                            background: solde.progression > 1
                              ? colors.warning
                              : solde.progression >= 0.9
                              ? colors.success
                              : colors.primary,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted mt-1.5">
                        <span>0 h</span>
                        {solde.progression > 1 && (
                          <span style={{ color: colors.warning }} className="font-semibold">
                            ⚡ Seuil {base.heuresDues.toFixed(0)} h dépassé
                          </span>
                        )}
                        <span>{solde.heuresRealisees.toFixed(0)} h réalisées</span>
                      </div>
                      <p className="text-[10px] text-muted mt-3 pt-3 border-t border-black/5">
                        Source : Décret n°2000-815 du 25 août 2000 · Base {HEURES_ANNUELLES} h = 228 j × 7 h + journée solidarité
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* ── Onglet 2 : Suivi mensuel ── */}
                <TabsContent value="mensuel">
                  <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm">
                    <p className="text-sm font-bold text-navy mb-1">Suivi mensuel</p>
                    <p className="text-[11px] text-muted mb-4">
                      Saisir les heures réalisées par mois. Prend le pas sur la saisie globale.
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {MOIS_LABELS.map((label, i) => {
                        const mois = i + 1;
                        const val = moisInputs[mois] ?? '';
                        const rensigne = val !== '' && !isNaN(Number(val));
                        return (
                          <div
                            key={mois}
                            className="rounded-lg p-3 flex flex-col gap-1.5 transition-colors"
                            style={{ background: rensigne ? '#dbeafe' : '#f1f5f9' }}
                          >
                            <span className="text-[10px] font-bold" style={{ color: rensigne ? '#1e40af' : '#94a3b8' }}>
                              {label}
                            </span>
                            <Input
                              type="number"
                              min={0}
                              value={val}
                              onChange={e => onMoisChange(mois, e.target.value)}
                              placeholder="— h"
                              className="text-xs h-7 px-2 border-0 bg-transparent font-mono font-bold"
                              style={{ color: rensigne ? '#1e40af' : '#94a3b8' }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {solde.moisSaisisCount > 0 && (
                      <div className="mt-4 pt-4 border-t border-black/5">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(solde.moisSaisisCount / 12) * 100}%`,
                              background: colors.primary,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-muted mt-1">
                          {solde.moisSaisisCount} mois sur 12 renseignés
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ── Onglet 3 : Alertes légales ── */}
                <TabsContent value="alertes">
                  <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm">
                    <p className="text-sm font-bold text-navy mb-1">Alertes légales</p>
                    <p className="text-[11px] text-muted mb-4">
                      Estimations basées sur les heures saisies. CGFP art. D1332-22 · Décret n°2000-815.
                    </p>
                    <div className="flex flex-col gap-3">
                      {solde.alertesLegales.map(alerte => {
                        const { bg, dot, text } = alerteCouleur(alerte.depasse, alerte.valeurEstimee);
                        return (
                          <div
                            key={alerte.type}
                            className="flex items-start gap-3 rounded-lg px-4 py-3"
                            style={{ background: bg }}
                          >
                            <div
                              className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0"
                              style={{ background: dot }}
                            />
                            <div>
                              <p className="text-xs font-semibold" style={{ color: text }}>
                                {alerte.type === 'SEMAINE_MAX' && 'Durée hebdomadaire max — 48 h/semaine'}
                                {alerte.type === 'SEMAINE_MOYENNE_MAX' && 'Moyenne hebdomadaire — 44 h sur 12 semaines'}
                                {alerte.type === 'JOUR_MAX' && 'Durée journalière max — 10 h/jour'}
                              </p>
                              <p className="text-[11px] mt-0.5" style={{ color: text, opacity: 0.8 }}>
                                {alerte.message}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </PlanGate>
      </main>
    </>
  );
}
```

- [ ] **Step 2 : Vérifier que TypeScript compile**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Attendu : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add apps/web/app/\(dashboard\)/simulations/annualisation/page.tsx
git commit -m "feat(web): add AnnualisationRH page — 3 onglets calcul/mensuel/alertes"
```

---

## Task 6 — Sidebar

**Files:**
- Modify: `apps/web/components/dashboard/Sidebar.tsx`

- [ ] **Step 1 : Ajouter l'import Clock et l'entrée nav dans `Sidebar.tsx`**

Modifier la ligne d'import lucide-react (ligne 2) :

```typescript
import {
  LayoutGrid, Users, CircleDollarSign, Calendar,
  Shield, BarChart3, Settings, Clock,
} from 'lucide-react';
```

Ajouter l'entrée dans le tableau `NAV` après `heures` et avant `conformite` :

```typescript
{ href: '/dashboard/simulations/annualisation', label: 'AnnualisationRH', Icon: Clock },
```

Le tableau `NAV` complet doit ressembler à :

```typescript
const NAV = [
  { href: '/dashboard',                              label: 'Tableau de bord', Icon: LayoutGrid },
  { href: '/dashboard/agents',                       label: 'Agents',           Icon: Users },
  { href: '/dashboard/simulations/arret',            label: 'SimulArrêt',       Icon: CircleDollarSign },
  { href: '/dashboard/simulations/retraite',         label: 'RetireSim',        Icon: BarChart3 },
  { href: '/dashboard/simulations/heures',           label: 'HeuresSup+',       Icon: Calendar },
  { href: '/dashboard/simulations/annualisation',    label: 'AnnualisationRH',  Icon: Clock },
  { href: '/dashboard/conformite',                   label: 'Conformité',        Icon: Shield },
  { href: '/dashboard/settings',                     label: 'Paramètres',        Icon: Settings },
] as const;
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Attendu : aucune erreur.

- [ ] **Step 3 : Commit final**

```bash
git add apps/web/components/dashboard/Sidebar.tsx
git commit -m "feat(web): add AnnualisationRH to sidebar nav"
```

---

## Vérification finale

- [ ] **Lancer tous les tests engine**

```bash
cd packages/engine && pnpm exec jest --coverage
```

Attendu : tous PASS, coverage 100 %.

- [ ] **Vérifier build web complet**

```bash
cd apps/web && pnpm exec tsc --noEmit
```

Attendu : aucune erreur TypeScript.
