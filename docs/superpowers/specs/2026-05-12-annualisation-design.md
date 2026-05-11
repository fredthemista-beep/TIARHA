# AnnualisationRH — Design Spec

**Date :** 2026-05-12  
**Auteur :** Fred + Claude  
**Statut :** Approuvé — prêt pour implémentation  
**Plan requis :** Starter  

---

## Contexte

Module de calcul de l'annualisation du temps de travail pour la Fonction Publique Territoriale. Base légale : Décret n°2000-815 du 25 août 2000. Base annuelle de référence : **1 607 heures** pour un agent à temps complet (228 j × 7 h + journée de solidarité).

S'intègre dans le monorepo `territorialrh-store` comme 4e module de simulation, avec le même pattern que `arret`, `retraite`, `heures` : moteur TypeScript pur dans `packages/engine` + page Next.js dans `apps/web`.

---

## Périmètre (V1)

### Inclus
- Calcul de la base annuelle selon quotité (temps plein ou partiel)
- Proratisation si arrivée ou départ en cours d'année
- Suivi mensuel optionnel (hybride : saisie mois par mois ou total global)
- Calcul du solde annuel (heures sup ou déficit) en fin de période
- Alertes légales : durée hebdo max 48 h, moyenne 44 h/12 semaines, 10 h/jour (informatif)
- Interface 3 onglets : Calcul annuel / Suivi mensuel / Alertes légales

### Exclus
- Persistance Supabase (calcul instantané côté client, comme les autres modules)
- Gestion des absences rémunérées (maladie, congés) — hors périmètre V1
- Export PDF du bilan annuel — hors périmètre V1
- Heures supplémentaires structurelles (accord collectif 39 h) — hors périmètre V1

---

## Architecture engine

### Fichier : `packages/engine/src/annualisation.ts`

Deux fonctions pures exportées, aucune dépendance externe.

#### `calculerBaseAnnuelle(params: ParamsBaseAnnuelle): ResultatBaseAnnuelle`

Calcule les heures annuelles dues selon la quotité et la présence effective.

**Paramètres :**
```typescript
interface ParamsBaseAnnuelle {
  quotite: number;       // 0.0–1.0 (ex: 0.8 pour 80%)
  dateDebut?: string;    // ISO 'YYYY-MM-DD', si arrivée en cours d'année
  dateFin?: string;      // ISO 'YYYY-MM-DD', si départ en cours d'année
  annee?: number;        // année civile de référence (défaut: année courante)
}
```

**Retour :**
```typescript
interface ResultatBaseAnnuelle {
  heuresAnnuellesBase: number;  // 1607 × quotité (sans proratisation)
  heuresDues: number;           // après proratisation si dates fournies
  joursPresence: number;        // jours de présence effective dans l'année
  joursAnnee: number;           // jours calendaires de l'année de référence
  estProratise: boolean;        // true si dateDebut ou dateFin fourni
}
```

**Règle de proratisation :**  
`heuresDues = 1607 × quotite × (joursPresence / joursAnnee)`  
Si ni `dateDebut` ni `dateFin` : `heuresDues = 1607 × quotite`.

#### `calculerSoldeAnnuel(params: ParamsSoldeAnnuel): ResultatSoldeAnnuel`

Calcule le bilan entre heures dues et heures réalisées, et génère les alertes légales.

**Paramètres :**
```typescript
interface SaisieMensuelle {
  mois: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  heures: number;
}

interface ParamsSoldeAnnuel {
  heuresDues: number;                  // sortie de calculerBaseAnnuelle
  moisSaisis?: SaisieMensuelle[];      // tableau optionnel (mode hybride)
  heuresTotalesManuelle?: number;      // alternative si pas de suivi mensuel
}
```

**Retour :**
```typescript
interface AlerteLegale {
  type: 'SEMAINE_MAX' | 'SEMAINE_MOYENNE_MAX' | 'JOUR_MAX';
  seuil: number;
  valeurEstimee: number | null;  // null si données insuffisantes
  depasse: boolean;
  message: string;               // libellé métier en français
}

interface ResultatSoldeAnnuel {
  heuresRealisees: number;    // somme moisSaisis ou heuresTotalesManuelle
  solde: number;              // heuresRealisees - heuresDues
  heuresSup: number;          // max(0, solde)
  heuresDeficit: number;      // max(0, -solde)
  progression: number;        // heuresRealisees / heuresDues (peut dépasser 1.0)
  moisSaisisCount: number;    // nb de mois renseignés (0 si saisie globale)
  alertesLegales: AlerteLegale[];
}
```

**Priorité source :** si `moisSaisis` non vide, il prend le pas sur `heuresTotalesManuelle`.

**Alertes légales calculées :**

| Type | Seuil | Calcul | Fallback si données absentes |
|------|-------|--------|------------------------------|
| `SEMAINE_MAX` | 48 h | `heuresRealisees / (moisSaisisCount × 4.33)` | `depasse: false`, message informatif |
| `SEMAINE_MOYENNE_MAX` | 44 h | `heuresRealisees / 52` | idem |
| `JOUR_MAX` | 10 h | non calculable sans données journalières | `valeurEstimee: null`, message informatif |

### Fichier : `packages/engine/src/types.ts`

Ajout des 6 interfaces ci-dessus (`ParamsBaseAnnuelle`, `ResultatBaseAnnuelle`, `SaisieMensuelle`, `ParamsSoldeAnnuel`, `AlerteLegale`, `ResultatSoldeAnnuel`).

### Fichier : `packages/engine/src/index.ts`

Ajout de `export * from './annualisation'`.

### Fichier : `packages/engine/tests/annualisation.test.ts`

8 cas de test :

1. Temps plein, année complète → `heuresDues = 1607`
2. Temps partiel 80%, année complète → `heuresDues ≈ 1285.6`
3. Proratisation 6 mois (01/07–31/12), temps plein → `heuresDues ≈ 803.5`
4. Proratisation 6 mois + quotité 80% → `heuresDues ≈ 642.8`
5. Solde sans mois saisis et sans total → `heuresRealisees = 0`, `heuresDeficit = heuresDues`
6. Solde avec mois saisis, sous la base → `heuresDeficit > 0`, `heuresSup = 0`
7. Solde avec heures sup → `heuresSup > 0`, `progression > 1.0`
8. Alertes légales : vérification `SEMAINE_MAX` et `SEMAINE_MOYENNE_MAX` avec données suffisantes

---

## Architecture UI

### Fichier : `apps/web/app/(dashboard)/simulations/annualisation/page.tsx`

Composant client (`'use client'`), pattern identique aux pages existantes.

**Structure :**
```
<Topbar title="AnnualisationRH" subtitle="Annualisation du temps de travail — base 1 607 h (FPT)" plan="starter" />
<PlanGate required={['starter', 'pro', 'enterprise']} currentPlan="starter">
  <formulaire paramètres>          ← quotité, année, dateDebut?, dateFin?,
                                      heuresTotalesManuelle? (total global optionnel)
                                      + bouton Calculer
  <Tabs> (shadcn/ui)
    <TabsContent "calcul">         ← 4 KPIs + barre de progression
    <TabsContent "mensuel">        ← grille 3×4 saisie mois par mois
    <TabsContent "alertes">        ← 3 indicateurs légaux vert/orange/gris
  </Tabs>
</PlanGate>
```

**État local React :**
```typescript
// Formulaire
{ quotite, annee, dateDebut, dateFin, heuresTotalesManuelle }

// Résultats calculerBaseAnnuelle
ResultatBaseAnnuelle | null

// Saisie mensuelle (onglet 2)
SaisieMensuelle[]   // mis à jour cellule par cellule

// Résultats calculerSoldeAnnuel
ResultatSoldeAnnuel | null
```

**Logique de calcul :**  
- `calculerBaseAnnuelle` s'exécute au clic "Calculer" (paramètres agent).  
- `calculerSoldeAnnuel` se recalcule à chaque modification d'une cellule mensuelle (réactif).

**Grille mensuelle (onglet 2) :**  
- Disposition 4 colonnes × 3 lignes (Jan–Déc)  
- Cellule renseignée : fond `#dbeafe` (bleu clair)  
- Cellule vide : fond `#f1f5f9` (gris clair)  
- Saisie inline : `<Input type="number">` à la place de la valeur affichée au clic

**KPIs onglet 1 :**

| KPI | Couleur fond / texte | Condition |
|-----|---------------------|-----------|
| Base annuelle due | blanc / navy | toujours |
| Heures réalisées | blanc / bleu | si > 0 |
| Heures sup. | jaune ambre | si `heuresSup > 0` |
| Déficit | rouge clair | si `heuresDeficit > 0` (remplace heures sup.) |
| Progression % | blanc / vert | toujours |

**Référence réglementaire** (bas de l'onglet 1) :  
`Source : Décret n°2000-815 du 25 août 2000 · Base 1 607 h = 228 j × 7 h + journée solidarité`

---

## Intégration monorepo

### `apps/web/components/dashboard/Sidebar.tsx`

Ajout entre HeuresSup+ et Conformité :
```typescript
import { Clock } from 'lucide-react'; // déjà disponible dans lucide-react

{ href: '/dashboard/simulations/annualisation', label: 'AnnualisationRH', Icon: Clock }
```

### Dépendances nouvelles
Aucune. Tous les composants UI utilisés (`Tabs`, `Input`, `Label`, `Button`, `Card`) sont déjà dans `apps/web/components/ui/`.

---

## Contraintes et invariants

- `quotite` doit être dans `]0.0 ; 1.0]` — valeur 0 non admise (agent absent = hors périmètre)
- `moisSaisis` : un même mois ne peut apparaître qu'une fois (dédupliqué par le moteur, dernier wins)
- `heures` par mois : valeur positive, pas de plafond moteur (les alertes légales signalent les dépassements)
- Proratisation : si `dateDebut` et `dateFin` sont dans des années différentes de `annee`, seule la période dans `annee` est comptée
- `annee` par défaut : `new Date().getFullYear()` — évalué à l'appel, pas à l'import

---

## Hors périmètre V1 (pour référence future)

- Absences rémunérées et leur impact sur le lissage de rémunération
- Accord collectif 39 h (durée hebdo étendue)
- Export PDF du bilan annuel
- Persistance Supabase des simulations
- Calcul des heures sup au taux majoré (croisement avec le module HeuresSup+)
