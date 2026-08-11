# Définition du MVP

## Objectif

Valider qu'un groupe local peut publier un match, remplir ses places et coordonner les participants de façon fiable. Le MVP doit être exploitable dans une zone pilote et instrumenté, sans chercher à reproduire immédiatement les 52 fonctionnalités recensées.

## Fonctionnalités incluses

### Application mobile

- OTP par **un canal de lancement** (email recommandé pour simplifier l'exploitation), session et déconnexion ;
- onboarding : nom, ville et consentement aux notifications ; avatar facultatif avec upload sécurisé ;
- profil minimal et suppression de compte ;
- liste des matchs à venir et exploration par ville/distance ;
- création, modification et annulation d'un match par son hôte ;
- terrain, format, date/heure, prix/devise et visibilité publique ou privée par lien ;
- détail du match avec participants et places restantes ;
- rejoindre, quitter, inviter par lien et liste d'attente atomique ;
- ajout/retrait d'un invité sans compte ;
- chat texte par match avec historique, envoi, accusé et reconnexion ;
- notifications essentielles : invitation, inscription, désistement, place libérée, modification et annulation.

### Dashboard

- connexion administrateur et contrôle du rôle côté serveur ;
- statistiques opérationnelles simples ;
- recherche, bannissement/débannissement et révocation des sessions utilisateur ;
- liste/détail des matchs, annulation et gestion des participants ;
- CRUD des formats ;
- création/modification des villes et clubs ;
- lecture des événements d'administration essentiels.

### Backend et données

- BetterAuth, procédures publiques/protégées/admin et validation Zod ;
- services utilisateurs, matchs, adhésion, invités, référentiels et notifications ;
- contrôle d'audience centralisé sur toute lecture de match ;
- transaction atomique pour capacité/liste d'attente ;
- Durable Object par match pour le chat ;
- stockage R2 limité aux images validées ;
- journal d'audit pour les actions administratives et sensibles ;
- observabilité, sauvegarde, restauration et alertes de base.

## Critères de sortie du MVP

- les parcours inscription, création, découverte, adhésion, attente, désistement et annulation passent en tests de bout en bout ;
- aucun scénario concurrent ne dépasse la capacité d'un match ;
- les matrices public/privé, hôte/participant/non-participant et admin sont testées ;
- les uploads refusent taille, extension et contenu non autorisés ;
- les secrets et OTP sont protégés, limités en débit et jamais journalisés ;
- le chat se reconnecte sans perdre ni dupliquer un message accepté ;
- les notifications critiques sont vérifiées sur iOS et Android ;
- sauvegarde et restauration de la base ont été répétées ;
- aucun défaut critique ou élevé de sécurité n'est ouvert.

## Fonctionnalités reportées en version 1

- OTP téléphone/WhatsApp si l'email est retenu au lancement ;
- amis et demandes de connexion ;
- cercles simples, rôles et matchs de cercle ;
- confirmation manuelle d'un match et transfert d'hôte, après clarification des règles ;
- réactions, présence et statuts système du chat ;
- boîte de notifications complète ;
- badges de base et calcul idempotent ;
- dashboard de cercles et badges complété ;
- deep links et landing publique industrialisés.

## Améliorations futures

- édition de messages ;
- météo ;
- badges avancés, progression sociale et nouveaux classements ;
- découverte enrichie et recommandations ;
- gestion avancée des cercles et modération communautaire ;
- contrôle automatique des versions stores ;
- paiements, réservation de terrains et réputation, après étude juridique et antifraude.

## Éléments du README incomplets, risqués ou trop complexes pour le MVP

| Élément | Constat | Décision MVP |
|---|---|---|
| Détails/joueurs/invités d'un match | Contrôle d'audience incomplet | Bloquant sécurité, à corriger avant pilote |
| Invitation de joueur | Autorisation trop large | Définir puis imposer hôte/participant |
| Retrait d'une demande d'ami | Suppression possible sans contrôle du demandeur | Amis reportés ; corriger avant activation |
| Transfert d'hôte | `game_players.isHost` et `games.hostId` divergent | Reporté jusqu'à transaction cohérente |
| Uploads | Pas de limite de taille/MIME | Bloquant sécurité pour avatar et cercle |
| Écriture des clubs | Procédures non-admin trop permissives | Réserver à l'admin ou supprimer |
| Chat : édition | Client inachevé | Hors MVP |
| Confirmation/refus d'invitation | API sans interface mobile localisée | Clarifier et terminer en V1 |
| Push et alarmes | Dépendent des plateformes, fuseaux et états hors ligne | Limiter aux événements critiques et tester sur appareils |
| Cercles complets | Nombreux rôles et transitions | Hors MVP, puis livraison incrémentale |
| Badges/cron | Idempotence et cohérence temporelle à certifier | Hors MVP |
| Météo | Endpoint public consommant un quota tiers | Hors MVP |
| Versions stores | Parsing distant et cache non durable | Hors MVP |
| OTP multicanal | Coût, délivrabilité et différences d'environnement | Un seul canal au lancement |
