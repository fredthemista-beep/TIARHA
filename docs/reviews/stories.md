# Stories Review — TIARHA (passe 1)

> Relecture en contexte vierge (sous-agent `stories-reviewer`, lecture seule) de `docs/stories.md`
> contre `docs/prd.md`, le 30/09/2026.

## Couverture du périmètre
| Fonctionnalité PRD | Couverte par | OK ? |
|---|---|---|
| Simulateurs réglementaires | Moteur livré (PR #2). Branchement aux vrais dossiers : seulement s08 (arrêts) | ⚠️ partiel |
| Assistant IA statutaire sourcé | s01, s02, s03 | ✅ |
| Dossiers agents (carrière, CET, quotité) | s05, s07 ; aucun critère n'exige ces champs | ⚠️ partiel |
| Suivi des absences et alertes | s08, s09 | ✅ |
| Import agents **et export CSV** | Import s06 ; **export : aucune story** | ❌ |
| Auth et isolation par collectivité | Existant, plus s04, s05, s07, s08 | ✅ |

## Constats
- **critical** — l'export CSV n'est livré par aucune story.
- **critical** — le « lot 2 », présenté comme déjà livré, n'est commité sur aucune branche. s03, s05, s06, s08 et s09 en dépendent.
- **major** — les simulateurs IHTS, retraite et annualisation ne sont pré-remplis depuis aucun dossier réel.
- **major** — aucun critère n'exige les champs carrière, CET et quotité, dont s09 dépend.
- **major** — s05 renvoie vers s06, qui vient après elle (référence en avant).
- **major** — contradiction de rôles : dans s06, l'assistante importe des agents ; dans s07, elle n'a qu'un accès en lecture.
- **minor** — s02 : deux critères sont subjectifs (« langage clair », « enjeux, risques, options »).
- **minor** — s05 : « comme en démo » n'est pas précis.
- **minor** — s04 : le libellé hésite entre « propriétaire » et « DRH ».
- **minor** — s07 : il faut la voie `full` (règle d'autorisation), non précisé.
- **minor** — s08 : rôles et accès aux données de santé non définis.
- **minor** — s08 et s09 : le calcul des 12 mois glissants doit être partagé.
- **minor** — s06 et s07 : le matricule est facultatif, alors que c'est la clé de déduplication.
- **minor** — la maintenance réglementaire annuelle n'est pas tracée.

Remarque de processus : les documents de cadrage sont commités sur la branche de travail et
atteindront `main` par PR (la session n'a pas le droit de pousser directement sur `main`).

Max severity: critical
Stories ready: no

---

# Stories Review — TIARHA (passe 2)

> Nouvelle relecture en contexte vierge, après correction. Les 14 constats de la passe 1 sont résolus.
> Le lot 2 est tracé comme prérequis bloquant, avant s01 : l'ordre est exécutable, à condition que
> sa PR soit fusionnée d'abord.

## Constats (tous mineurs, corrigés dans la foulée)
1. Prérequis lot 2 : ajout d'une commande de contrôle (`git cat-file -e origin/main:…`).
2. s04 : le critère sur le profil par défaut devient conditionnel, pour que le bloc B n'attende pas la clé PISTE.
3. s04 : la migration reprend les propriétaires existants comme membres DRH.
4. s05 : le matricule devient `NOT NULL` et unique par collectivité.
5. s08 : un arrêt sans date de fin est chiffré jusqu'au jour.
6. s09 : alerte retraite sur les 12 prochains mois ; seuil CET lié à `CET_PLAFOND_JOURS` ; piège de l'âge fractionnaire.
7. s01 : route de l'assistant réservée aux utilisateurs connectés, avec une limite quotidienne.
8. PRD : le lot 2 est décrit comme « prérequis à fusionner ».

Max severity: minor
Stories ready: yes
