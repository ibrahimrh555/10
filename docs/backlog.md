# Backlog produit et technique

Priorités : **P0** bloquant pour la sécurité ou le MVP, **P1** nécessaire au jalon visé, **P2** utile mais différable, **P3** exploration. Statuts initiaux : `À cadrer`, `Prêt`, `Bloqué` ou `Reporté`.

## MVP

| ID | Fonctionnalité | Priorité | Dépendances | Critères d'acceptation | Statut |
|---|---|---|---|---|---|
| MVP-001 | Règles métier et matrice d'accès | P0 | Aucune | Statuts, audiences, droits hôte/participant/admin et accès chat sont validés et documentés | À cadrer |
| MVP-002 | Corriger les autorisations de match | P0 | MVP-001 | Détail, joueurs et invités refusent tout utilisateur hors audience ; tests positifs et négatifs passent | Bloqué |
| MVP-003 | Sécuriser invitations et demandes sociales | P0 | MVP-001 | Seuls acteurs autorisés invitent ou suppriment ; accès par ID inconnu retourne une erreur sûre | Bloqué |
| MVP-004 | Source de vérité de l'hôte | P0 | MVP-001 | `games.hostId` et participant hôte restent cohérents dans une transaction ; invariant testé | Bloqué |
| MVP-005 | Sécuriser les uploads R2 | P0 | Politique média | Taille, MIME réel, dimensions et extension sont validés ; fichiers interdits refusés ; noms opaques | À cadrer |
| MVP-006 | Authentification OTP monocanal | P0 | Choix fournisseur, rate limiting | Envoi, expiration, renvoi, tentative invalide, session et révocation passent en staging sans fuite d'information | À cadrer |
| MVP-007 | Onboarding et profil minimal | P1 | MVP-006, villes, MVP-005 | Un utilisateur renseigne nom et ville, peut modifier son profil et supprimer son compte | Prêt |
| MVP-008 | Référentiels villes, clubs et formats | P1 | Google Places ou saisie secours | L'admin maintient les référentiels ; le mobile peut les lire ; écritures publiques interdites | Prêt |
| MVP-009 | Créer et modifier un match | P0 | MVP-001, MVP-008 | L'hôte crée/modifie date, lieu, format, prix, visibilité et ouverture avec validations serveur | Prêt |
| MVP-010 | Découvrir et consulter un match | P0 | MVP-002, MVP-009 | Liste par ville/distance ; les règles public/privé sont identiques entre liste et détail | Bloqué |
| MVP-011 | Rejoindre/quitter un match | P0 | MVP-009, transaction capacité | Pas de doublon ni dépassement ; résultat stable en concurrence ; départ libère une place | Prêt |
| MVP-012 | Liste d'attente atomique | P0 | MVP-011 | Match plein place en attente ; première personne admissible est promue une seule fois lors d'une libération | Prêt |
| MVP-013 | Invités sans compte | P1 | MVP-011 | Participant accepté ajoute un invité ; sponsor/hôte le retire ; capacité respectée | Prêt |
| MVP-014 | Annulation de match | P1 | MVP-009, notifications | Seul l'hôte/admin annule ; participants informés ; inscriptions et chat passent dans l'état défini | Prêt |
| MVP-015 | Chat texte essentiel | P1 | MVP-002, MVP-011 | Participant autorisé charge l'historique, envoie avec ACK/retry et se reconnecte sans doublon | Prêt |
| MVP-016 | Notifications critiques | P1 | MVP-011 à MVP-015, OneSignal | Invitation, changement, désistement, place et annulation produisent une entrée durable et un push best effort | À cadrer |
| MVP-017 | Dashboard utilisateurs et matchs | P1 | MVP-006, rôles admin | Accès serveur par rôle ; recherche, bannissement, révocation, consultation et annulation sont audités | Prêt |
| MVP-018 | Journal d'audit | P0 | Modèle de données | Actions admin et mutations sensibles enregistrent acteur, cible, action, date et corrélation sans secret | À cadrer |
| MVP-019 | Observabilité, sauvegarde et restauration | P0 | Environnements | Alertes essentielles actives ; secrets masqués ; restauration réussie et chronométrée | À cadrer |
| MVP-020 | Tests E2E et sécurité | P0 | MVP-002 à MVP-019 | Parcours cœur sur iOS/Android/web admin, matrice d'accès et concurrence passent en CI/staging | Bloqué |

## Version 1

| ID | Fonctionnalité | Priorité | Dépendances | Critères d'acceptation | Statut |
|---|---|---|---|---|---|
| V1-001 | Second canal OTP | P2 | MVP-006, contrat fournisseur | Bascule configurée, délivrabilité mesurée et mêmes protections que le canal initial | Reporté |
| V1-002 | Amis et demandes | P1 | MVP-003 | Envoyer, accepter, refuser, annuler et supprimer respecte acteur et unicité des relations | Reporté |
| V1-003 | Cercles simples | P1 | V1-002, politique rôles | Création, adhésion, rôles, archivage et visibilité des matchs sont couverts par tests d'accès | Reporté |
| V1-004 | Confirmation et refus d'invitation | P1 | MVP-001 | Actions visibles dans le mobile ; transitions et notifications sont définies et testées | Reporté |
| V1-005 | Transfert d'hôte | P1 | MVP-004 | Transfert atomique vers un joueur accepté ; ancien hôte perd immédiatement ses droits | Reporté |
| V1-006 | Chat enrichi | P2 | MVP-015 | Réactions, présence et statuts fonctionnent après reconnexion et hibernation | Reporté |
| V1-007 | Boîte de notifications complète | P1 | MVP-016 | Pagination, compteur, lecture et navigation par type sont cohérents | Reporté |
| V1-008 | Deep links et landing publique | P1 | MVP-010, sécurité liens | Liens match/cercle s'ouvrent avec fallback web sans exposer de données privées | Reporté |
| V1-009 | Badges simples | P2 | Cycle match stable, cron | Calcul idempotent, attribution unique et notification vérifiée | Reporté |
| V1-010 | Dashboard étendu | P2 | V1-003, V1-009 | Cercles administrables ; restauration utilisateur et CRUD badges disponibles selon droits | Reporté |

## Améliorations futures

| ID | Fonctionnalité | Priorité | Dépendances | Critères d'acceptation | Statut |
|---|---|---|---|---|---|
| FUT-001 | Édition de messages | P3 | V1-006, politique modération | Auteur édite dans la fenêtre définie ; événement client traité ; historique/audit préservé | Reporté |
| FUT-002 | Météo | P3 | Cache, quota, rate limiting | Endpoint protégé, cache efficace et panne du fournisseur sans impact sur le match | Reporté |
| FUT-003 | Recommandations de matchs | P3 | Données d'usage consenties | Recommandations explicables, désactivables et mesurées face à une baseline | Reporté |
| FUT-004 | Gamification avancée | P3 | V1-009 | Nouveaux badges/statistiques sans recalcul incohérent ni manipulation évidente | Reporté |
| FUT-005 | Modération et signalements | P2 | Audit, règles opérationnelles | Signaler, bloquer, examiner et résoudre avec délais, droits et traçabilité définis | À cadrer |
| FUT-006 | Versions stores durables | P3 | Cache durable | Timeout, cache partagé et comportement hors réseau testés pour les deux stores | Reporté |
| FUT-007 | Expansion internationale | P3 | Localisation, conformité | Nouvelle ville/langue/devise activable par configuration et tests régionaux | Reporté |
| FUT-008 | Paiement et réservation | P3 | Étude juridique, antifraude | Modèle, remboursements, litiges, sécurité et obligations réglementaires validés avant développement | À cadrer |
