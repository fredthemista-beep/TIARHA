# PRD — TIARHA

> Statut : **brouillon à valider**. Les sections marquées ✅ reprennent des réponses validées par
> Fred. Les sections marquées 🟡 sont des propositions à confirmer avant `/ks-stories`.

## Target SaaS ✅
Aucune. TIARHA est un produit original : il n'existe pas de SaaS de référence à répliquer. Le
périmètre ci-dessous sert donc de spec à la place de la cible.

## Kill mode ✅
**Produit concurrent (vendu).** TIARHA est vendu aux collectivités sur abonnement Stripe (grilles
Starter / Pro déjà présentes dans `packages/ui`). Conséquences sur le périmètre :
- Multi-tenant strict : une collectivité ne voit jamais les données d'une autre (RLS Supabase).
- Conformité RGPD dès la conception : les arrêts maladie sont des données de santé (art. 9).
- La fiabilité réglementaire est l'argument de vente. Un chiffre faux fait perdre un client.

## Why kill it 🟡
Il n'y a pas de SaaS à tuer. Le coût évité, pour une petite commune, est le suivant :
- un abonnement à une documentation RH (WEKA, Territorial, La Gazette) ;
- le temps passé à interroger le centre de gestion ;
- les erreurs de calcul faites à la main (IHTS, maintien de traitement, retraite).

## Problem 🟡
Une petite commune n'a ni juriste RH ni DRH. La secrétaire de mairie ou l'assistante RH doit
appliquer seule un statut de la fonction publique territoriale qui change chaque année (CMO à 90 %
en 2025, taux CNRACL relevé chaque année, suspension de la réforme des retraites en 2026). Elle a
besoin d'une réponse juste, sourcée et immédiate, et d'un calcul qu'elle peut montrer à l'agent ou
aux élus.

## Target users ✅
Premiers clients : **petites communes** (moins de 50 agents), sans juriste RH. Trois profils utilisent
le produit, et chacun a son assistant IA :

| Profil | Usage | Ce que l'assistant lui apporte |
|---|---|---|
| Assistante RH / secrétaire de mairie | Tâches courantes, questions des agents | Une réponse statutaire simple et sourcée, en langage clair |
| Gestionnaire RH | Instruction des dossiers | Le texte applicable, les conditions, le calcul correspondant |
| DRH / DGS | Pilotage, arbitrage, élus | Une synthèse argumentée, les risques et les options |

## Perimeter — the 20% that matters
### Replicated (core loop) ✅ (scores 🟡)
| Feature | Complexity (1-5) | Why this score |
|---|---|---|
| Simulateurs réglementaires (arrêts, IHTS/CET, retraite, annualisation) | 3 | Déjà construits. Il reste la maintenance réglementaire annuelle et le branchement aux vrais dossiers |
| Assistant IA statutaire, réponses sourcées Légifrance | 4 | Deux systèmes externes (LLM, API PISTE). Il doit citer ses sources et refuser de répondre sans source. C'est le cœur de valeur, donc on le garde malgré le score |
| Dossiers agents (fiche, carrière, CET, quotité) | 3 | Liste et fiche avec RLS multi-tenant. Fichier de démo déjà en place (lot 2) |
| Suivi des absences et alertes (phases CMO, plafond CET) | 3 | Règles métier sur plusieurs états, réutilise le moteur |
| Import des agents (CSV/XLSX) et export CSV | 2 | Mise en service d'une commune sans ressaisie |
| Auth par lien magique et isolation par collectivité | 3 | Déjà en place (migration `secure_tenant_access`) ; reste à la brancher sur toutes les données |
| Abonnement Stripe (Starter / Pro) | 4 | Paiement, webhooks et droits par plan. Nécessaire pour vendre |

### Explicitly NOT replicated (graveyard) 🟡
- Paie complète, bulletins, DSN, mandatement (complexité 5, métier d'éditeurs spécialisés)
- GED et archivage légal des dossiers agents
- Recrutement, formation, entretiens professionnels
- Portail agent en libre-service
- Multi-collectivités pour les centres de gestion (reporté après les premières communes)
- Intégrations avec les SIRH (BL.RH, Civil RH, Astre) au-delà de l'import CSV/XLSX
- Signature électronique et envoi automatique des actes
- Assistant IA qui agit seul (saisie, envoi) : en v1, il répond et il cite ; un humain agit

### The angle (done differently / better) 🟡
- **Une réponse sourcée ou pas de réponse.** Chaque affirmation de l'assistant cite un article
  vérifiable sur Légifrance. Sans source, il le dit au lieu d'inventer.
- **Le calcul prouve la réponse.** L'assistant s'appuie sur le moteur TIARHA testé (64 tests, règles
  2026), il ne calcule pas lui-même.
- **Trois registres de langage** selon le profil (assistante, gestionnaire, DRH).
- **Conçu pour une commune sans juriste** : prix d'entrée bas, mise en route en une heure.

## Constraints ✅ / 🟡
- **Données** ✅ : l'assistant IA v1 travaille uniquement sur les **données fictives de démo**.
  L'accès aux données nominatives réelles attend une analyse d'impact (AIPD), un contrat de sous-traitance
  RGPD avec le fournisseur du modèle et un traitement hébergé dans l'UE.
- **Stack** : Next.js 14, Supabase (UE, eu-central-1), Vercel, moteur `@tiarh/engine` en TypeScript.
- **Légifrance** : l'API PISTE demande une clé valide. Elle n'est configurée nulle part aujourd'hui ;
  il faut la tester avant de s'engager (voir la procédure donnée le 29/09/2026).
- **Réglementaire** : les taux (CNRACL, IRCANTEC, point d'indice, trimestres) changent chaque année.
  Il faut une revue annuelle du moteur, avec les sources datées dans le code.
- **Équipe** : un fondateur solo, assisté d'agents IA, pipeline killer-saas avec validation humaine
  de chaque plan.

## Success criteria 🟡
- Les 4 simulateurs donnent des résultats identiques aux barèmes officiels 2026 sur un jeu de cas
  de référence (tests du moteur au vert).
- Sur 30 questions statutaires de référence, l'assistant IA :
  - cite au moins une source Légifrance valide dans 100 % des réponses données ;
  - ne cite aucune référence inexistante (contrôle d'hallucination) ;
  - répond « je ne sais pas » plutôt que sans source.
- Une petite commune importe ses agents et obtient son premier calcul en moins d'une heure.
- Zéro fuite de données entre collectivités (tests RLS au vert).
- Un premier abonnement payant signé.
