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
