# User Stories — TIARHA

> One story = one shippable slice, written to be executed by an agent.
> Id format: `s<number>-<short-slug>` — reused in every pipeline file and in the branch name.
>
> Source : `docs/prd.md` (validé le 30/09/2026). Pas de SaaS cible : le PRD est la spec.
> Ordre = ordre des dépendances. Phase pilote : aucune offre payante (hors périmètre).
>
> Déjà livré hors pipeline, donc absent de cette liste : les simulateurs et le moteur (règles 2026,
> PR #2), et la démo sans clic mort sur données fictives (lot 2).

---

## Bloc A — Assistant IA statutaire (v1 sur données fictives)

## Story s01-assistant-reponse-sourcee — Poser une question statutaire et obtenir une réponse sourcée
**As an** assistante RH **I want** poser une question sur le statut de la FPT et recevoir une réponse
qui cite ses textes **so that** j'applique la bonne règle sans juriste et je peux vérifier la source.

### Complexity
4 — deux systèmes externes (modèle de langage, API Légifrance PISTE). Risque principal :
l'hallucination de références juridiques.

### Acceptance criteria
- [ ] Une page « Assistant » accessible depuis le menu permet de saisir une question et d'afficher la réponse en flux.
- [ ] Chaque réponse contient au moins une citation (texte, article, lien Légifrance). Chaque citation a été retrouvée par un appel à l'API Légifrance pendant la réponse.
- [ ] Une citation que l'API Légifrance ne retrouve pas n'est jamais affichée. Si aucune source n'est trouvée, l'assistant répond qu'il ne peut pas répondre de façon sourcée.
- [ ] Une question hors du statut FPT (ex. « recette de crêpes ») reçoit un refus poli.
- [ ] Aucune donnée d'agent n'est transmise au modèle : l'assistant n'a accès qu'aux outils Légifrance.
- [ ] La clé du modèle et la clé PISTE ne sont lues que côté serveur, jamais exposées au navigateur.
- [ ] Un jeu d'évaluation versionné de 30 questions de référence s'exécute par une commande, avec un rapport : taux de réponses sourcées et citations introuvables. Seuil : 100 % sourcées, 0 citation introuvable.

### Dependencies
Clé PISTE valide (prérequis bloquant, à tester par Fred). Décision d'architecture sur le
fournisseur du modèle (`/ks-architect`).

### Agentic notes
- Route serveur Next.js (`app/api/assistant/...`), jamais d'appel au modèle depuis le client.
- Les outils exposés au modèle sont une recherche Légifrance et une lecture d'article. La vérification des citations est faite par le code, pas par le modèle.
- Le skill `legal-hallucination-checker` décrit une méthode de contrôle des références ; il peut inspirer le jeu d'évaluation.
- RGPD : la v1 ne voit aucune donnée nominative (décision du PRD).
- Piège : le middleware protège toutes les routes. La route API doit exiger un utilisateur connecté, sauf en mode démo.

---

## Story s02-assistant-profils — Adapter la réponse au profil de l'utilisateur
**As a** DRH, gestionnaire ou assistante RH **I want** que l'assistant réponde dans le registre de mon
métier **so that** j'obtiens directement ce qui m'est utile (réponse simple, texte applicable ou synthèse
de décision).

### Complexity
2

### Acceptance criteria
- [ ] L'utilisateur choisit son profil (Assistante RH, Gestionnaire RH, DRH). Le choix est mémorisé et modifiable depuis la page Assistant.
- [ ] Pour une même question, la réponse « Assistante » tient en 5 phrases maximum en langage clair.
- [ ] La réponse « Gestionnaire » liste les conditions d'application et les textes.
- [ ] La réponse « DRH » présente enjeux, risques et options.
- [ ] Les règles de citation de s01 s'appliquent aux trois profils (le jeu d'évaluation tourne pour chacun).

### Dependencies
s01-assistant-reponse-sourcee

### Agentic notes
- Un seul assistant avec trois consignes de profil, pas trois pipelines.
- Tant qu'il n'y a qu'un utilisateur par collectivité (voir s04), le profil est stocké côté client.

---

## Story s03-assistant-simulateurs — L'assistant appuie ses chiffres sur les simulateurs
**As a** gestionnaire RH **I want** que l'assistant calcule un montant (coût d'un arrêt, IHTS, pension)
avec le moteur TIARHA **so that** le chiffre annoncé est le même que celui du simulateur, et vérifiable.

### Complexity
3

### Acceptance criteria
- [ ] L'assistant dispose des outils `calculerArret`, `calculerHeures`, `calculerRetraite` et `calculerBaseAnnuelle` du moteur. Tout montant qu'il annonce provient d'un appel d'outil.
- [ ] La réponse contient un lien « Ouvrir dans le simulateur », pré-rempli avec les mêmes paramètres, qui affiche le même résultat.
- [ ] Si un paramètre nécessaire manque (ex. l'indice majoré), l'assistant le demande au lieu de le supposer.
- [ ] Un test vérifie qu'une question de calcul donne le même montant que le moteur appelé directement.

### Dependencies
s01-assistant-reponse-sourcee. Pré-remplissage des simulateurs par paramètres d'URL (lot 2).

### Agentic notes
- Réutiliser `@tiarh/engine` côté serveur. Ne jamais laisser le modèle faire l'arithmétique.
- Les paramètres d'URL des simulateurs viennent du lot 2 (`?im=&trim=&naissance=`…).

---

## Bloc B — Données réelles de la collectivité

## Story s04-equipe-rh — Inviter ses collègues RH dans la collectivité
**As a** DRH **I want** inviter l'assistante RH et le gestionnaire dans l'espace de ma collectivité, avec
leur rôle **so that** toute l'équipe travaille sur les mêmes dossiers.

### Complexity
4 — autorisation et périmètre de tenant. Risque : fuite de données entre collectivités, ou
élévation de rôle.

### Acceptance criteria
- [ ] Le propriétaire invite un collègue par e-mail avec un rôle (DRH, gestionnaire, assistante). L'invité rejoint la collectivité par lien magique.
- [ ] Un membre voit les données de sa collectivité et d'aucune autre (test RLS avec deux collectivités).
- [ ] Seul un DRH peut inviter, changer un rôle ou retirer un membre (test d'autorisation par rôle).
- [ ] Un membre retiré perd l'accès à sa prochaine requête.
- [ ] Le profil de l'assistant (s02) prend par défaut le rôle du membre.

### Dependencies
Aucune pour la mécanique. s02 pour le profil par défaut.

### Agentic notes
- Aujourd'hui, `private.current_collectivite_id()` résout la collectivité par `collectivites.owner_id` : un seul utilisateur par collectivité. Il faut une table de membres, et toutes les politiques RLS doivent la lire.
- La migration relève de la voie `full`, avec un commit de migration séparé.
- Étendre `apps/web/supabase/tests/tenant_rls_test.sql`.

---

## Story s05-agents-reels — Consulter les vrais agents de sa collectivité
**As a** gestionnaire RH **I want** que la liste et la fiche agent affichent les agents de ma collectivité
enregistrés dans TIARHA **so that** je travaille sur mes vrais dossiers et non sur la démo.

### Complexity
3

### Acceptance criteria
- [ ] Connecté, la liste des agents lit la table `agents` de ma collectivité. Recherche et filtres fonctionnent comme en démo.
- [ ] En mode démo (non connecté), les données fictives du lot 2 restent affichées.
- [ ] Un utilisateur d'une autre collectivité n'obtient jamais un agent qui n'est pas le sien, même en forçant l'identifiant dans l'URL (réponse 404).
- [ ] Une collectivité sans agent voit un état vide qui mène à l'import (s06).

### Dependencies
s04-equipe-rh (politiques RLS par membre).

### Agentic notes
- La table `agents` existe (`001_initial.sql`). Il lui manque des colonnes de la fiche démo (grade, service, trimestres, CET, quotité) : c'est une migration, donc la voie `full`.
- Lecture côté serveur avec `lib/supabase/server.ts`.

---

## Story s06-import-agents — Importer ses agents depuis un fichier
**As a** secrétaire de mairie **I want** importer la liste de mes agents depuis un fichier CSV ou Excel
**so that** je démarre sans ressaisie.

### Complexity
3

### Acceptance criteria
- [ ] Je dépose un fichier CSV (séparateur `;` ou `,`) ou XLSX ; un aperçu affiche les lignes reconnues et les erreurs, ligne par ligne.
- [ ] Une ligne invalide (IM absent, catégorie inconnue, date impossible) est signalée et non importée. Les lignes valides le sont.
- [ ] Réimporter le même fichier ne crée pas de doublon (clé : matricule).
- [ ] Un modèle de fichier téléchargeable décrit les colonnes attendues.
- [ ] L'import est rattaché à ma collectivité uniquement.

### Dependencies
s05-agents-reels.

### Agentic notes
- Lire un fichier XLSX demande probablement une nouvelle dépendance : c'est une décision d'architecture et la voie `full`.
- L'export CSV du lot 2 (`lib/csv.ts`) fixe le format de colonnes à réutiliser.

---

## Story s07-fiche-agent-edition — Créer et modifier un agent
**As a** gestionnaire RH **I want** créer un agent et corriger sa fiche **so that** le dossier reste à
jour sans réimporter.

### Complexity
2

### Acceptance criteria
- [ ] « Nouvel agent » ouvre un formulaire. Une saisie valide crée l'agent et ouvre sa fiche ; une saisie invalide affiche les erreurs par champ et ne crée rien.
- [ ] « Modifier » sur la fiche enregistre les changements.
- [ ] Le traitement brut est recalculé depuis l'indice majoré avec le point d'indice du moteur.
- [ ] Une assistante RH peut consulter mais pas modifier (règle de rôle de s04).

### Dependencies
s05-agents-reels, s04-equipe-rh.

### Agentic notes
- Valider côté serveur ; ne jamais faire confiance au client pour `collectivite_id`.

---

## Story s08-saisie-arret — Saisir un arrêt et voir son coût
**As a** gestionnaire RH **I want** saisir un arrêt (type, dates) sur la fiche d'un agent et voir
immédiatement la phase de rémunération et le coût **so that** je sais ce que l'arrêt coûte et quand
l'agent passe à demi-traitement.

### Complexity
3

### Acceptance criteria
- [ ] « Saisir un arrêt » enregistre type, dates de début et de fin (fin facultative) pour un agent de ma collectivité.
- [ ] La fiche et la page Absences affichent l'arrêt avec sa phase (90 % / demi-traitement…) et son coût, calculés par `calculerArret` avec le statut de l'agent.
- [ ] Les jours déjà pris sur les 12 derniers mois sont comptés pour déterminer la phase d'un nouveau CMO.
- [ ] Une date de fin antérieure à la date de début est refusée.
- [ ] Les données de santé ne sont lisibles que par les membres de la collectivité (test RLS).

### Dependencies
s05-agents-reels.

### Agentic notes
- Nouvelle table d'absences : migration, voie `full`. Ne stocker ni diagnostic ni motif médical, seulement le type de congé.
- Piège : la règle des 12 mois glissants pour le CMO.

---

## Story s09-alertes-rh — Être alerté des échéances
**As a** DRH **I want** une liste d'alertes (passage à demi-traitement dans les 15 jours, CET proche du
plafond, départ possible à la retraite dans l'année) **so that** j'anticipe au lieu de subir.

### Complexity
3

### Acceptance criteria
- [ ] La cloche de notifications affiche le nombre d'alertes actives et leur liste, chacune menant à la fiche concernée.
- [ ] Un CMO qui atteint 90 jours cumulés dans les 15 prochains jours génère une alerte « demi-traitement ».
- [ ] Un CET à 55 jours ou plus génère une alerte « plafond CET ».
- [ ] Un agent qui atteint son âge légal (`ageLegalDepart`) dans l'année génère une alerte « retraite ».
- [ ] Chaque règle d'alerte a un test qui passe au rouge si la règle est supprimée.

### Dependencies
s08-saisie-arret, s05-agents-reels.

### Agentic notes
- Alertes calculées à la lecture (pas de tâche planifiée en v1) avec les fonctions du moteur.
