# Roadmap

La roadmap est ordonnée par réduction de risque puis valeur utilisateur. Les dates seront fixées après estimation de l'équipe ; les phases sont des jalons de sortie, pas des engagements calendaires.

## Phase 0 — Cadrage et fondations

**But :** rendre le périmètre testable et fermer les failles connues avant d'ajouter des fonctions.

- valider règles de statuts, audience, invitation, hôte et conservation ;
- choisir le canal OTP et la zone pilote ;
- corriger les autorisations signalées dans le README ;
- unifier la source de vérité de l'hôte ;
- sécuriser uploads, endpoints publics, secrets et limites de débit ;
- ajouter clé étrangère ville, contraintes et stratégie de migration ;
- mettre en place CI, environnements, observabilité, sauvegarde et restauration ;
- bâtir les matrices de tests d'autorisation et de concurrence.

**Jalon :** revue sécurité validée et socle déployable en staging.

## Phase 1 — MVP pilote

**But :** permettre à une communauté locale de remplir et coordonner des matchs.

- OTP monocanal, onboarding et profil minimal ;
- référentiels villes, clubs et formats ;
- création, édition, annulation, découverte et détail de match ;
- adhésion, départ, invitation par lien, invités et liste d'attente atomique ;
- chat texte essentiel ;
- notifications critiques ;
- dashboard utilisateurs/matchs/référentiels ;
- tests E2E mobile/dashboard, tests sur appareils et instrumentation produit.

**Jalon :** pilote fermé sans défaut critique, capacité exacte et restauration testée.

## Phase 2 — Version 1

**But :** renforcer la rétention et l'exploitation.

- second canal OTP si justifié ;
- amis et demandes de connexion sécurisées ;
- cercles simples, rôles et matchs privés de cercle ;
- confirmation/refus d'invitation et transfert d'hôte cohérent ;
- réactions et présence chat ;
- boîte de notifications complète et rappels temporels ;
- deep links et landing d'invitation ;
- badges simples et jobs idempotents ;
- administration des cercles, restauration utilisateur et cycle complet des badges.

**Jalon :** lancement public sur la zone cible avec support opérationnel documenté.

## Phase 3 — Améliorations futures

**But :** améliorer engagement, découverte et expansion.

- recommandations et exploration avancée ;
- édition de messages et outils de modération ;
- météo mise en cache ;
- gamification et statistiques enrichies ;
- gestion avancée des communautés ;
- contrôle durable des versions stores ;
- nouvelles villes, langues et devises ;
- étude paiements, réservation de terrains, réputation et antifraude.

## Chantiers continus

- sécurité, confidentialité et conformité ;
- accessibilité et localisation FR/EN ;
- performance mobile et maîtrise des quotas ;
- qualité des données et migrations ;
- tests de non-régression et exercices d'incident ;
- suivi des métriques produit et arbitrage fondé sur l'usage.

## Dépendances majeures

- les matchs privés dépendent d'une politique d'audience validée ;
- le chat et les notifications dépendent d'une adhésion fiable ;
- les cercles dépendent des contrôles de rôles et de visibilité ;
- les badges dépendent d'un cycle de match et de jobs idempotents ;
- l'ouverture à grande échelle dépend du rate limiting, des quotas tiers, de la modération et du support.
