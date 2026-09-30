# API juridiques PISTE — Légifrance et JUDILIBRE

Référence pour `/ks-architect` et les stories s01 à s03 (assistant IA statutaire).
Les deux fichiers Swagger 2.0 de ce dossier ont été fournis par Fred le 30/09/2026 :

| Fichier | API | Version | Opérations |
|---|---|---|---|
| `legifrance-2.4.2.swagger.json` | Légifrance (DILA) | 2.4.2 | 68 |
| `judilibre-1.0.0.swagger.json` | JUDILIBRE (Cour de cassation) | 1.0.0 | 8 |

**Ces fichiers ne contiennent aucune clé.** Ils décrivent les API, pas un compte. Les
identifiants se créent sur le portail PISTE et ne sont jamais écrits dans le dépôt.

## Environnements

Les deux descriptions pointent vers le **bac à sable** :

| | Bac à sable (dans les fichiers) | Production |
|---|---|---|
| Jeton OAuth | `https://sandbox-oauth.piste.gouv.fr/api/oauth/token` | `https://oauth.piste.gouv.fr/api/oauth/token` |
| Légifrance | `https://sandbox-api.piste.gouv.fr/dila/legifrance/lf-engine-app` | `https://api.piste.gouv.fr/dila/legifrance/lf-engine-app` |
| JUDILIBRE | `https://sandbox-api.piste.gouv.fr/cassation/judilibre/v1.0` | `https://api.piste.gouv.fr/cassation/judilibre/v1.0` |

Le bac à sable et la production ont des identifiants distincts. ⚠️ Vérifier ces adresses
dans la console PISTE avant la mise en production.

## Authentification

- **Légifrance** : OAuth 2.0. Le Swagger déclare les flux `implicit` et `accessCode`. Pour un
  serveur, l'usage PISTE est le flux `client_credentials` (`client_id` + `client_secret`,
  scope `openid`) ; ⚠️ à confirmer avec le test `curl`. Le jeton est ensuite envoyé dans
  l'en-tête `Authorization: Bearer <jeton>`.
- **JUDILIBRE** : OAuth 2.0 (`application`, c'est-à-dire `client_credentials`) **ou** clé
  d'API dans l'en-tête `KeyId`.
- Sur PISTE, l'application doit être **abonnée à chaque API** et leurs **CGU acceptées**,
  sinon l'API répond 403 même avec un jeton valide.

## Où ranger les identifiants

Uniquement côté serveur (Vercel → Settings → Environment Variables), **jamais** avec le
préfixe `NEXT_PUBLIC_` :

```
PISTE_OAUTH_URL=https://oauth.piste.gouv.fr/api/oauth/token
PISTE_CLIENT_ID=…
PISTE_CLIENT_SECRET=…
LEGIFRANCE_API_URL=https://api.piste.gouv.fr/dila/legifrance/lf-engine-app
JUDILIBRE_API_URL=https://api.piste.gouv.fr/cassation/judilibre/v1.0
```

Le jeton OAuth expire (durée donnée par `expires_in`) : le mettre en cache côté serveur et
le renouveler avant expiration.

## Compétences à donner aux assistants (outils)

Chaque outil est une fonction serveur qui appelle l'API. Le modèle ne voit jamais les clés.

| Outil de l'assistant | Endpoint | Usage RH territorial |
|---|---|---|
| `rechercher_textes` | `POST /search` (Légifrance) | Recherche plein texte. Fonds utiles : `LODA_DATE` (lois et décrets en vigueur à une date), `CODE_DATE` (CGFP), `CIRC` (circulaires), `CETAT` (Conseil d'État), `JORF` |
| `lire_article` | `POST /consult/getArticle`, `/consult/getArticleWithIdAndNum` | Texte exact d'un article, pour la citation |
| `lire_texte` | `POST /consult/lawDecree`, `/consult/code`, `/consult/legiPart` | Décret ou loi complet, partie de code |
| `version_a_date` | `POST /search/nearestVersion`, `/chrono/textCid` | Règle applicable à une date donnée (ex. arrêt débuté avant le 01/03/2025) |
| `lire_circulaire` | `POST /consult/circulaire` | Circulaires DGCL / DGAFP |
| `jurisprudence_administrative` | `POST /search` fonds `CETAT`, puis `/consult/juri` | Décisions du Conseil d'État : le juge de la fonction publique |
| `jurisprudence_judiciaire` | `GET /search`, `GET /decision` (JUDILIBRE) | Cour de cassation : utile surtout pour les **contractuels de droit privé** (ex. contrats aidés) |

⚠️ JUDILIBRE ne couvre que les juridictions judiciaires. Le contentieux des fonctionnaires
relève du juge administratif : la source principale est le fonds `CETAT` de Légifrance.

## Veille réglementaire (mise à jour des lois et décrets)

Les API permettent une veille automatique, qui n'est **pas encore une story** :

- `POST /consult/lastNJo` : derniers Journaux officiels parus ;
- `POST /search` sur `JORF` ou `LODA_DATE`, filtré par date de publication et mots-clés
  (« fonction publique territoriale », « CNRACL », « indemnités horaires ») ;
- `POST /chrono/textCid` : détecter une nouvelle version d'un texte suivi (décret 2002-60,
  CGFP art. L822-3…).

Usage possible : prévenir quand un texte dont dépend le moteur (`packages/engine/src/constants.ts`)
change, pour déclencher la revue réglementaire. À proposer comme nouvelle story si Fred valide
l'extension du périmètre.
